import { Logger, Injectable } from '@nestjs/common';
import { AIProvider } from './ai.provider.js';
import {
  GeneratedDay,
  GeneratedItinerary,
  GroundedQARequest,
  GroundedAnswer,
  ItineraryRequest,
  RefineRequest,
  generatedItinerarySchema,
  generatedDaySchema,
} from '@travel-companion/contracts';
import { GoogleGenAI } from '@google/genai';
import type { AiConfig } from '../config/configuration.js';
import { AIParseError, AIUnavailableError } from './ai.errors.js';
import { ZodType } from 'zod';
import { generateRichMockItinerary } from './mock.provider.js';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenAI;
  constructor(private readonly config: AiConfig) {
    this.client = new GoogleGenAI({
      apiKey: this.config.geminiApiKey,
    });
  }

  private async generateText(
    prompt: string,
    jsonMode: boolean,
  ): Promise<string> {
    try {
      const generatePromise = this.client.models.generateContent({
        model: this.config.model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : {},
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('AI request timed out after 30s'));
        }, 30_000);
        timer.unref?.();
      });
      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text;
      if (!text) {
        throw new AIParseError('Empty response from AI');
      }
      return text;
    } catch (error) {
      if (error instanceof AIParseError) {
        throw error;
      }
      this.logger.error(
        'Gemini request failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new AIUnavailableError();
    }
  }

  private async parseWithRepair<T>(
    rawText: string,
    schema: ZodType<T>,
    repairPrompt: string,
  ): Promise<T> {
    const tryParse = (text: string): T | null => {
      try {
        const json: unknown = JSON.parse(stripCodeFences(text));
        const result = schema.safeParse(json);
        return result.success ? result.data : null;
      } catch {
        return null;
      }
    };

    const first = tryParse(rawText);
    if (first) {
      return first;
    }

    this.logger.warn('AI output failed validation; attempting one repair...');
    const repaired = await this.generateText(
      `${repairPrompt}\n\nThe previous response was invalid. return ONLY valid JSON.\nPrevious response:\n${rawText}`,
      true,
    );
    const second = tryParse(repaired);
    if (second) {
      return second;
    }
    throw new AIParseError();
  }

  async generateItinerary(
    input: ItineraryRequest,
  ): Promise<GeneratedItinerary> {
    const prompt = buildItineraryPrompt(input);
    try {
      const raw = await this.generateText(prompt, true);
      return await this.parseWithRepair(
        raw,
        generatedItinerarySchema,
        prompt,
      );
    } catch (error) {
      this.logger.error(
        `Gemini generateItinerary failed: ${error instanceof Error ? error.message : String(error)}. Falling back to rich generator.`,
      );
      return generateRichMockItinerary(input);
    }
  }
  async refineItineraryPart(input: RefineRequest): Promise<GeneratedDay> {
    const prompt = buildRefinePrompt(input);
    try {
      const raw = await this.generateText(prompt, true);
      return await this.parseWithRepair(raw, generatedDaySchema, prompt);
    } catch (error) {
      this.logger.error(
        `Gemini refineItineraryPart failed: ${error instanceof Error ? error.message : String(error)}. Returning default refined day.`,
      );
      return {
        dayNumber: input.dayNumber,
        summary: `Refined day ${input.dayNumber}: ${input.instruction}`,
        activities: [
          {
            timeSlot: 'MORNING',
            title: `Morning activity tailored to: ${input.instruction}`,
            locationName: `${input.destination} City Center`,
            notes: `Adjusted based on preference: ${input.instruction}`,
            estimatedCost: 25,
          },
          {
            timeSlot: 'AFTERNOON',
            title: `Recommended afternoon local highlight`,
            locationName: `${input.destination} Cultural Quarter`,
            notes: `Explore nearby eateries and shops.`,
            estimatedCost: 35,
          },
          {
            timeSlot: 'EVENING',
            title: `Dinner at top-rated local dining venue`,
            locationName: `${input.destination} Dining District`,
            notes: `Local regional specialty dishes.`,
            estimatedCost: 50,
          },
        ],
      };
    }
  }
  async answer(input: GroundedQARequest): Promise<GroundedAnswer> {
    const raw = await this.generateText(
      `You are a helpful travel assistant. Answer concisely.\n\nQuestion: ${input.question}`,
      false,
    );
    return { answer: raw.trim(), grounded: false, sources: [] };
  }

  async generateAnswer(
    question: string,
    contextChunks: string[],
  ): Promise<string> {
    const prompt =
      contextChunks.length > 0
        ? [
            'You are a travel assistant. Answer the question using ONLY the context below.',
            'If the context does not contain the answer, say you are not sure based on the available stories.',
            'Keep the answer concise and practical.',
            '',
            'Context:',
            ...contextChunks.map((c, i) => `[${i + 1}] ${c}`),
            '',
            `Question: ${question}`,
          ].join('\n')
        : `You are a helpful travel assistant. Answer this concisely:\n\n${question}`;
    const raw = await this.generateText(prompt, false);
    return raw.trim();
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.models.embedContent({
        model: this.config.embeddingModel,
        contents: texts,
        config: {
          outputDimensionality: this.config.embeddingDimensions,
        },
      });
      const embeddings = response.embeddings ?? [];
      return embeddings.map((e) => e.values ?? []);
    } catch (error) {
      this.logger.error(
        'Gemini embed failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new AIUnavailableError();
    }
  }
}

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function buildItineraryPrompt(input: ItineraryRequest): string {
  const interests =
    input.interests.length > 0
      ? input.interests.join(', ')
      : 'sightseeing, local food, culture, hidden gems';
  const budget = input.budgetLevel ? `Budget Level: ${input.budgetLevel}` : 'Mid-range';
  const notes = input.notes ? `Additional traveler notes: ${input.notes}` : '';

  return [
    `You are an expert travel concierge. Create a complete, detailed, realistic day-by-day travel itinerary for a ${input.durationDays}-day trip to ${input.destination}.`,
    `Traveler interests: ${interests}.`,
    `Budget: ${budget}.`,
    notes ? `${notes}` : '',
    '',
    'Important Planning Requirements:',
    '1. Focus on the most iconic cultural hubs and MUST-SEE landmarks for this destination (e.g., for Italy or Rome: Colosseum, Roman Forum, Vatican City with St. Peter\'s Basilica & Sistine Chapel, Trevi Fountain, Pantheon, Trastevere; for France or Paris: Eiffel Tower, Louvre, Montmartre; for Japan: Meiji Shrine, Shibuya, Asakusa, Fushimi Inari).',
    '2. Ensure EACH day has a completely unique, non-repeating theme and distinct activities covering morning, afternoon, and evening across different lively neighborhoods.',
    '3. For EACH day, provide a summary that includes recommended hotel/accommodation areas and lodging suggestions (e.g. boutique hotel, central guesthouse, luxury resort).',
    '4. Specifically recommend top places/landmarks with their real names in "locationName", must-try restaurants/bistros for lunch and dinner, and practical tips in "notes" (dishes to try, booking tips).',
    '5. Set realistic estimatedCost in USD as an integer (e.g. 15, 40, 100) or null if free.',
    '6. Return ONLY a valid JSON object matching the exact schema below, with no markdown code fences or conversational text.',
    '',
    'JSON Schema:',
    '{',
    '  "title": string,',
    '  "destination": string,',
    '  "days": [',
    '    {',
    '      "dayNumber": number,',
    '      "summary": string,',
    '      "activities": [',
    '        {',
    '          "timeSlot": "MORNING" | "AFTERNOON" | "EVENING" | null,',
    '          "title": string,',
    '          "locationName": string | null,',
    '          "notes": string | null,',
    '          "estimatedCost": number | null',
    '        }',
    '      ]',
    '    }',
    '  ]',
    '}',
    `Ensure there are exactly ${input.durationDays} days in "days", numbered sequentially from 1 to ${input.durationDays}.`,
  ].filter(Boolean).join('\n');
}

function buildRefinePrompt(input: RefineRequest): string {
  const current =
    input.currentActivities.map((a) => `- ${a.title}`).join('\n') || '(none)';

  return [
    `Refine day ${input.dayNumber} of a trip to ${input.destination}.`,
    `Instruction: ${input.instruction}`,
    `Current activities:\n${current}`,
    `Return ONLY JSON matching this shape:`,
    '{ "dayNumber": number, summary: string, "activities": [{"timeSlot": "MORNING"|"AFTERNOON"|"EVENING"|null,"title": string, "notes": string|null, "locationName": string|null, "estimatedCost": number|null}]}',
    `Keep dayNumber = ${input.dayNumber}.`,
  ].join('\n');
}

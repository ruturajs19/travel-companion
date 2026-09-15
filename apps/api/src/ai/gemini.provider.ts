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
      const response = await this.client.models.generateContent({
        model: this.config.model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : {},
      });
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
    const raw = await this.generateText(prompt, true);
    return this.parseWithRepair(raw, generatedItinerarySchema, prompt);
  }
  async refineItineraryPart(input: RefineRequest): Promise<GeneratedDay> {
    const prompt = buildRefinePrompt(input);
    const raw = await this.generateText(prompt, true);
    return this.parseWithRepair(raw, generatedDaySchema, prompt);
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
      : 'general sightseeing';
  const budget = input.budgetLevel ? `Budget Level: ${input.budgetLevel}.` : '';
  const notes = input.notes ? `Additional notes: ${input.notes}.` : '';

  return [
    `Create a ${input.durationDays}-day travel itinerary for ${input.destination}.`,
    `Traveler interests: ${interests}. ${budget} ${notes}.`.trim(),
    'Return ONLY JSON matching this shape:',
    '{ "title": string, "destination": string, "days": [ {"dayNumber": number, summary: string, "activities": [{"timeSlot": "MORNING"|"AFTERNOON"|"EVENING"|null,"title": string, "notes": string|null, "locationName": string|null, "estimatedCost": number|null}]}]}',
    `Provide exactly ${input.durationDays} days, each with at least one activity.`,
  ].join('\n');
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

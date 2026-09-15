import { Injectable } from '@nestjs/common';
import type { AIProvider } from './ai.provider.js';
import type {
  GeneratedDay,
  GeneratedItinerary,
  GroundedAnswer,
  GroundedQARequest,
  ItineraryRequest,
  RefineRequest,
} from '@travel-companion/contracts';

@Injectable()
export class MockProvider implements AIProvider {
  generateItinerary(input: ItineraryRequest): Promise<GeneratedItinerary> {
    const interests =
      input.interests.length > 0 ? input.interests : ['sightseeing'];
    const days: GeneratedDay[] = Array.from(
      { length: input.durationDays },
      (_, i) => {
        const dayNumber = i + 1;
        const interest = interests[i % interests.length];
        return {
          dayNumber,
          summary: `Day ${dayNumber} in ${input.destination}: ${interest}`,
          activities: [
            {
              timeSlot: 'MORNING',
              title: `Explore ${interest} in ${input.destination}`,
            },
            {
              timeSlot: 'AFTERNOON',
              title: `Local lunch and a walk`,
            },
            {
              timeSlot: 'EVENING',
              title: `Dinner and relax`,
            },
          ],
        };
      },
    );
    return Promise.resolve({
      title: `${input.durationDays}-day trip to ${input.destination}`,
      destination: input.destination,
      days,
    });
  }

  refineItineraryPart(input: RefineRequest): Promise<GeneratedDay> {
    return Promise.resolve({
      dayNumber: input.dayNumber,
      summary: `Refined day ${input.dayNumber}: ${input.instruction}`,
      activities: [
        {
          timeSlot: 'MORNING',
          title: `Adjusted morning for: ${input.instruction}`,
        },
        {
          timeSlot: 'AFTERNOON',
          title: `Adjusted afternoon`,
        },
      ],
    });
  }

  answer(input: GroundedQARequest): Promise<GroundedAnswer> {
    return Promise.resolve({
      answer: `This is a mock answer to: ${input.question}`,
      grounded: false,
      sources: [],
    });
  }

  generateAnswer(question: string, contextChunks: string[]): Promise<string> {
    if (contextChunks.length > 0) {
      return Promise.resolve(
        `Based on ${contextChunks.length} traveller story chunk(s), here is a mock grounded answer to: "${question}".`,
      );
    }
    return Promise.resolve(`Mock general-knowledge answer to: "${question}".`);
  }

  embed(texts: string[]): Promise<number[][]> {
    const dims = 768;
    return Promise.resolve(
      texts.map((text) => {
        const vec = new Array<number>(dims).fill(0);
        for (let i = 0; i < text.length; i++) {
          vec[i % dims] += text.charCodeAt(i) / 255;
        }
        return vec;
      }),
    );
  }
}

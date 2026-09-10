import {
  GeneratedDay,
  GeneratedItinerary,
  GroundedQARequest,
  GroundedAnswer,
  ItineraryRequest,
  RefineRequest,
} from '@travel-companion/contracts';

export interface AIProvider {
  generateItinerary(input: ItineraryRequest): Promise<GeneratedItinerary>;
  refineItineraryPart(input: RefineRequest): Promise<GeneratedDay>;
  answer(input: GroundedQARequest): Promise<GroundedAnswer>;
  generateAnswer(question: string, contextChunks: string[]): Promise<string>;
  embed(text: string[]): Promise<number[][]>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');

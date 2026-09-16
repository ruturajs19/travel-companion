import { Inject, Injectable } from '@nestjs/common';
import {
  GeneratedDay,
  GeneratedItinerary,
  GroundedAnswer,
  GroundedQARequest,
  ItineraryRequest,
  RefineRequest,
} from '@travel-companion/contracts';
import { AI_PROVIDER, type AIProvider } from './ai.provider.js';
import { CacheService } from './cache.service.js';
import { RateLimitService } from './rate-limit.service.js';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration.js';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    private readonly cache: CacheService,
    private readonly rateLimit: RateLimitService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private get ttl(): number {
    return this.config.get('ai', { infer: true }).cacheTtlSeconds;
  }

  generateItinerary(input: ItineraryRequest): Promise<GeneratedItinerary> {
    const key = this.cache.buildKey('generateItinerary', input);
    return this.cache.wrap(key, this.ttl, () => {
      this.rateLimit.consume();
      return this.provider.generateItinerary(input);
    });
  }

  refineItineraryPart(input: RefineRequest): Promise<GeneratedDay> {
    const key = this.cache.buildKey('refineItineraryPart', input);
    return this.cache.wrap(key, this.ttl, () => {
      this.rateLimit.consume();
      return this.provider.refineItineraryPart(input);
    });
  }

  answer(input: GroundedQARequest): Promise<GroundedAnswer> {
    this.rateLimit.consume();
    return this.provider.answer(input);
  }

  generateAnswer(question: string, contextChunks: string[]): Promise<string> {
    this.rateLimit.consume();
    return this.provider.generateAnswer(question, contextChunks);
  }

  embed(texts: string[]): Promise<number[][]> {
    this.rateLimit.consume();
    return this.provider.embed(texts);
  }
}

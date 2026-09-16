import { Module } from '@nestjs/common';
import { CacheService } from './cache.service.js';
import { RateLimitService } from './rate-limit.service.js';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration.js';
import { AiService } from './ai.service.js';
import { AI_PROVIDER, AIProvider } from './ai.provider.js';
import { GeminiProvider } from './gemini.provider.js';
import { MockProvider } from './mock.provider.js';

@Module({
  providers: [
    CacheService,
    {
      provide: RateLimitService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const ai = config.get('ai', { infer: true });
        return new RateLimitService({
          perMinute: ai.perMinute,
          perDay: ai.perDay,
        });
      },
    },
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): AIProvider => {
        const ai = config.get('ai', { infer: true });
        return ai.provider === 'gemini'
          ? new GeminiProvider(ai)
          : new MockProvider();
      },
    },
    AiService,
  ],
  exports: [AiService, AI_PROVIDER],
})
export class AiModule {}

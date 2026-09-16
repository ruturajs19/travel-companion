import { Injectable, Logger } from '@nestjs/common';
import { AIQuotaExceededError } from './ai.errors.js';

export interface RateLimitConfig {
  perMinute: number;
  perDay: number;
}

interface Window {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private minute: Window = { count: 0, resetAt: 0 };
  private day: Window = { count: 0, resetAt: 0 };
  constructor(private readonly config: RateLimitConfig) {}

  private roll(window: Window, windowMs: number, now: number): Window {
    if (now >= window.resetAt) {
      return { count: 1, resetAt: now + windowMs };
    }
    return window;
  }

  consume(now: number = Date.now()) {
    this.minute = this.roll(this.minute, 60_1000, now);
    this.day = this.roll(this.day, 86_400_000, now);

    if (this.minute.count >= this.config.perMinute) {
      this.logger.warn('AI per-minute rate limit reached');
      throw new AIQuotaExceededError(
        'AI request limit reached. Please try again in a minute',
      );
    }
    if (this.day.count >= this.config.perDay) {
      this.logger.warn('AI per-day rate limit reached');
      throw new AIQuotaExceededError(
        'AI request limit reached. Please try again tomorrow',
      );
    }

    this.minute.count += 1;
    this.day.count += 1;
  }

  snapshot(): { minute: number; day: number } {
    return { minute: this.minute.count, day: this.day.count };
  }
}

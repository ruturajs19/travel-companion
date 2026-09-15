import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createHash } from 'node:crypto';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  buildKey(operation: string, input: unknown): string {
    const normalized = JSON.stringify(
      input,
      Object.keys(input as object).sort(),
    );
    return createHash('sha256')
      .update(`${operation}:${normalized}`)
      .digest('hex');
  }

  async get<T>(key: string): Promise<T | null> {
    const row = await this.prisma.aiCache.findUnique({ where: { key: key } });

    if (!row) {
      return null;
    }

    if (row.expiresAt.getTime() < Date.now()) {
      await this.prisma.aiCache
        .delete({ where: { key } })
        .catch(() => undefined);
      return null;
    }
    return row.response as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const response = value as object;
    await this.prisma.aiCache.upsert({
      where: { key },
      update: { response, expiresAt },
      create: { key, response, expiresAt },
    });
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    producer: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      this.logger.debug(`AI cache hit: ${key.slice(0, 12)}`);
      return cached;
    }
    const value = await producer();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

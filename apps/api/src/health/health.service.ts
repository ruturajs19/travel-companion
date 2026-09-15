import { Injectable, Logger } from '@nestjs/common';
import { HealthResponse, ReadinessResponse } from '@travel-companion/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

export type HealthStatus = HealthResponse;
export type ReadinessStatus = ReadinessResponse;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  check(): HealthStatus {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async ready(): Promise<ReadinessStatus> {
    let database: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch (error) {
      this.logger.warn(
        `Readiness check failed: Database unreachable (${
          error instanceof Error ? error.message : 'unknown error'
        })`,
      );
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database,
      },
    };
  }
}

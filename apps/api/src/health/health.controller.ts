import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { HealthService, type HealthStatus } from './health.service.js';
import { type Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('check')
  check(): HealthStatus {
    return this.healthService.check();
  }

  @Get('ready')
  async ready(@Res() res: Response): Promise<void> {
    const result = await this.healthService.ready();
    const statusCode =
      result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(result);
  }
}

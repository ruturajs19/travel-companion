import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  AIParseError,
  AIQuotaExceededError,
  AIUnavailableError,
} from './ai.errors.js';
import { Response } from 'express';
import { buildErrorBody } from '../common/filters/all-exceptions.filter.js';

@Catch(AIUnavailableError, AIQuotaExceededError, AIParseError)
export class AiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AiExceptionFilter.name);
  catch(
    exception: AIUnavailableError | AIQuotaExceededError | AIParseError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();

    let status = HttpStatus.SERVICE_UNAVAILABLE;
    if (exception instanceof AIQuotaExceededError) {
      status = HttpStatus.TOO_MANY_REQUESTS;
    } else if (exception instanceof AIParseError) {
      status = HttpStatus.BAD_GATEWAY;
    }

    this.logger.warn(`${exception.name}: ${exception.message}`);

    response.status(status).json(
      buildErrorBody({
        statusCode: status,
        message: exception.message,
        path: request.url,
        error: exception.name,
      }),
    );
  }
}

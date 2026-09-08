import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export function buildErrorBody(params: {
  message: string | string[];
  statusCode: number;
  error: string;
  path: string;
}): ErrorResponseBody {
  return {
    message: params.message,
    statusCode: params.statusCode,
    error: params.error,
    path: params.path,
    timestamp: new Date().toISOString(),
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, error } = this.extractMessage(exception, status);

    const isServerError = status >= Number(HttpStatus.INTERNAL_SERVER_ERROR);

    if (isServerError) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${status}: ${JSON.stringify(message)}`,
      );
    }

    const body = buildErrorBody({
      message,
      error,
      statusCode: status,
      path: request.url,
    });

    response.status(status).json(body);
  }

  private extractMessage(
    exception: unknown,
    status: number,
  ): {
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { message: res, error: exception.name };
      }
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        const message = (obj.message as string | string[]) ?? exception.message;
        const error = (obj.error as string) ?? exception.name;
        return { message, error };
      }
      return { message: exception.message, error: exception.name };
    }

    const isServerError = status >= Number(HttpStatus.INTERNAL_SERVER_ERROR);

    return {
      message: isServerError ? 'Internal server error' : 'Error',
      error: 'InternalServerError',
    };
  }
}

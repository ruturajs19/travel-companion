import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  assertProductionConfig,
  loadConfiguration,
} from './config/configuration.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {
  AllExceptionsFilter,
  buildErrorBody,
} from './common/filters/all-exceptions.filter.js';

async function bootstrap(): Promise<void> {
  const config = loadConfiguration();
  assertProductionConfig(config);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix(config.apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: Request, res: Response) => {
    res.status(404).json(
      buildErrorBody({
        statusCode: 404,
        message: `Cannot ${req.method} ${req.originalUrl}`,
        path: req.originalUrl,
        error: 'Not Found',
      }),
    );
  });

  await app.listen(config.port);
}
void bootstrap();

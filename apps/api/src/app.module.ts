import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { loadConfiguration } from './config/configuration.js';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerConfig } from './config/logger.config.js';
import { UsersModule } from './users/users.module.js';
import { AiModule } from './ai/ai.module.js';
import { PostsModule } from './posts/posts.module.js';
import { TripsModule } from './trips/trips.module.js';
import { DiscoveryModule } from './discovery/discovery.module.js';
import { AssistantModule } from './assistant/assistant.module.js';
import { SocialModule } from './social/social.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', '../.env'],
      load: [loadConfiguration],
    }),
    LoggerModule.forRoot(
      buildLoggerConfig(process.env.NODE_ENV ?? 'development'),
    ),
    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    TripsModule,
    PostsModule,
    DiscoveryModule,
    AssistantModule,
    SocialModule,
    HealthModule,
  ],
})
export class AppModule {}

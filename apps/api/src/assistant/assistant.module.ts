import { Module } from '@nestjs/common';
import { RagService } from './rag.service.js';
import { AssistantController } from './assistant.controller.js';
import { AiModule } from '../ai/ai.module.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [AiModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AssistantController],
  providers: [RagService],
  exports: [RagService],
})
export class AssistantModule {}

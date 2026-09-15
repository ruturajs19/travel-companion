import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RagService } from './rag.service.js';
import { AiExceptionFilter } from '../ai/ai.exception.filter.js';
import {
  type GroundedAnswer,
  type GroundedQARequest,
  groundedQArequestSchema,
} from '@travel-companion/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ path: 'assistant', version: '1' })
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(private readonly rag: RagService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @UseFilters(AiExceptionFilter)
  ask(
    @Body(new ZodValidationPipe(groundedQArequestSchema))
    body: GroundedQARequest,
  ): Promise<GroundedAnswer> {
    return this.rag.answer(body);
  }
}

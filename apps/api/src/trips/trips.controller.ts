import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AiExceptionFilter } from '../ai/ai.exception.filter.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import {
  type GenerateItineraryRequest,
  generateItineraryRequestSchema,
  type Trip,
  TripSummary,
} from '@travel-companion/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ path: 'trips', version: '1' })
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('generate')
  @UseFilters(AiExceptionFilter)
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(generateItineraryRequestSchema))
    body: GenerateItineraryRequest,
  ): Promise<Trip> {
    return this.tripsService.generateAndSave(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<TripSummary[]> {
    return this.tripsService.listMyTrips(user.id);
  }

  @Get(':id')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Trip> {
    return this.tripsService.getTrip(user.id, id);
  }

  @Post(':id/remix')
  remix(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Trip> {
    return this.tripsService.remixTrip(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.tripsService.deleteTrip(user.id, id);
  }
}

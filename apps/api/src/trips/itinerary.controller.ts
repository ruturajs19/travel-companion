import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ItineraryService } from './itinerary.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { Param } from '@nestjs/common';
import {
  type ActivityInput,
  activityInputSchema,
  type DayInput,
  dayInputSchema,
  type RefineDayRequest,
  refineDayRequestSchema,
  type ReorderRequest,
  reorderSchema,
  type UpdateActivityRequest,
  updateActivitySchema,
} from '@travel-companion/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ version: '1' })
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itinerary: ItineraryService) {}

  @Post('trips/:tripId/days')
  async addDay(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
    @Body(new ZodValidationPipe(dayInputSchema)) body: DayInput,
  ): Promise<{ id: string }> {
    return this.itinerary.addDay(user.id, tripId, body);
  }

  @Post('trips/:tripId/days/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderDays(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderRequest,
  ): Promise<void> {
    await this.itinerary.reorderDays(user.id, tripId, body.orderedIds);
  }

  @Patch('days/:dayId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateDay(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dayId') dayId: string,
    @Body(new ZodValidationPipe(dayInputSchema)) body: DayInput,
  ): Promise<void> {
    await this.itinerary.updateDay(user.id, dayId, body);
  }

  @Delete('days/:dayId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDay(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dayId') dayId: string,
  ): Promise<void> {
    await this.itinerary.deleteDay(user.id, dayId);
  }

  @Post('days/:dayId/refine')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refineDay(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dayId') dayId: string,
    @Body(new ZodValidationPipe(refineDayRequestSchema)) body: RefineDayRequest,
  ): Promise<void> {
    await this.itinerary.refineDay(user.id, dayId, body.instruction);
  }

  @Post('days/:dayId/activities')
  addActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dayId') dayId: string,
    @Body(new ZodValidationPipe(activityInputSchema))
    body: ActivityInput,
  ): Promise<{ id: string }> {
    return this.itinerary.addActivity(user.id, dayId, body);
  }

  @Post('days/:dayId/activities/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderActivities(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dayId') dayId: string,
    @Body(new ZodValidationPipe(reorderSchema))
    body: ReorderRequest,
  ): Promise<void> {
    await this.itinerary.reorderActivities(user.id, dayId, body.orderedIds);
  }

  @Patch('activities/:activityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(updateActivitySchema))
    body: UpdateActivityRequest,
  ): Promise<void> {
    await this.itinerary.updateActivity(user.id, activityId, body);
  }

  @Delete('activities/:activityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId') activityId: string,
  ): Promise<void> {
    await this.itinerary.deleteActivity(user.id, activityId);
  }
}

import { Controller, Delete, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Body, HttpCode, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import {
  inviteCollaboratorRequestSchema,
  type InviteCollaboratorRequest,
  type TripCollaborator,
} from '@travel-companion/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ path: 'trips/:tripId/collaborators', version: '1' })
@UseGuards(JwtAuthGuard)
export class CollaboratorsController {
  constructor(private readonly collaborators: CollaboratorsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
  ): Promise<TripCollaborator[]> {
    return this.collaborators.list(user.id, tripId);
  }

  @Post()
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
    @Body(new ZodValidationPipe(inviteCollaboratorRequestSchema))
    body: InviteCollaboratorRequest,
  ): Promise<TripCollaborator> {
    return this.collaborators.invite(user.id, tripId, body.email, body.role);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.collaborators.remove(user.id, tripId, userId);
  }
}

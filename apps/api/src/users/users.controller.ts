import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import {
  updateProfileRequestSchema,
  type UpdateProfileRequest,
  type UserProfile,
} from '@travel-companion/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateProfileRequestSchema))
    body: UpdateProfileRequest,
  ): Promise<UserProfile> {
    return this.usersService.updateProfile(user.id, body);
  }
}

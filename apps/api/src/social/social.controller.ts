import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { SocialService } from './social.service.js';
import type { User } from '@prisma/client';
import {
  createCommentRequestSchema,
  FollowStatus,
  type Comment,
  type CreateCommentRequest,
  type LikeStatus,
  type PostStats,
} from '@travel-companion/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ version: '1' })
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('posts/:id/like')
  likeStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') postId: string,
  ): Promise<LikeStatus> {
    return this.social.likeStatus(user.id, postId);
  }

  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  toggleLike(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') postId: string,
  ): Promise<LikeStatus> {
    return this.social.toggleLike(user.id, postId);
  }

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') postId: string,
    @Body(new ZodValidationPipe(createCommentRequestSchema))
    input: CreateCommentRequest,
  ): Promise<Comment> {
    return this.social.addComment(user.id, postId, input);
  }

  @Get('users/:id/follow')
  followStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') targetId: string,
  ): Promise<FollowStatus> {
    return this.social.followStatus(user.id, targetId);
  }

  @Post('users/:id/follow')
  @HttpCode(HttpStatus.OK)
  toggleFollow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') targetId: string,
  ): Promise<FollowStatus> {
    return this.social.toggleFollow(user.id, targetId);
  }
}

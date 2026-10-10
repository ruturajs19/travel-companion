import { Controller, Get, Param } from '@nestjs/common';
import { SocialService } from './social.service.js';
import type { Comment, PostStats } from '@travel-companion/contracts';

@Controller({ version: '1' })
export class PublicSocialController {
  constructor(private readonly social: SocialService) {}

  @Get('posts/:id/comments')
  listComments(@Param('id') postId: string): Promise<Comment[]> {
    return this.social.listComments(postId);
  }

  @Get('posts/:id/stats')
  stats(@Param('id') postId: string): Promise<PostStats> {
    return this.social.postStats(postId);
  }
}

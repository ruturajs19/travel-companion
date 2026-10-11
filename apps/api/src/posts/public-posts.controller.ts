import { Controller, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import type { Post as PostDto } from '@travel-companion/contracts';

@Controller({ path: 'posts', version: '1' })
export class PublicPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string): Promise<PostDto> {
    return this.posts.getPublishedBySlug(slug);
  }
}

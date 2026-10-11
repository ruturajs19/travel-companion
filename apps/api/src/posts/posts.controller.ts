import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PostsService } from './posts.service.js';
import { MediaService } from './media.service.js';
import {
  type CreatePostRequest,
  type Post as PostDto,
  createPostRequestSchema,
  type UploadSignature,
  type PostSummary,
  updatePostRequestSchema,
  type UpdatePostRequest,
} from '@travel-companion/contracts';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller({ path: 'posts', version: '1' })
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly media: MediaService,
  ) {}

  @Get('/upload-signature')
  uploadSignature(): UploadSignature {
    return this.media.createUploadSignature();
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createPostRequestSchema))
    body: CreatePostRequest,
  ): Promise<PostDto> {
    return this.posts.create(user.id, body);
  }

  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser): Promise<PostSummary[]> {
    return this.posts.listMine(user.id);
  }

  @Get(':id')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PostDto> {
    return this.posts.getById(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePostRequestSchema))
    body: UpdatePostRequest,
  ): Promise<PostDto> {
    return this.posts.update(user.id, id, body);
  }

  @Patch(':id/publish')
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PostDto> {
    return this.posts.publish(user.id, id);
  }

  @Patch(':id/unpublish')
  unpublish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PostDto> {
    return this.posts.unpublish(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.posts.delete(user.id, id);
  }
}

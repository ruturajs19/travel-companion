import { Module } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { ContentEmbeddingService } from './content-embedding.service.js';
import { MediaService } from './media.service.js';
import { PostsController } from './posts.controller.js';
import { PublicPostsController } from './public-posts.controller.js';
import { PassportModule } from '@nestjs/passport';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  providers: [PostsService, ContentEmbeddingService, MediaService],
  controllers: [PostsController, PublicPostsController],
  exports: [PostsService],
})
export class PostsModule {}

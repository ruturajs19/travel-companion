import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Post as PrismaPost, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentEmbeddingService } from './content-embedding.service.js';
import {
  buildExcerpt,
  CreatePostRequest,
  estimateReadingTime,
  UpdatePostRequest,
  type Post,
  type PostSummary,
} from '@travel-companion/contracts';
import { randomBytes } from 'node:crypto';

type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        name: true;
      };
    };
  };
}>;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: ContentEmbeddingService,
  ) {}

  private markdownOf(contentJson: Prisma.JsonValue): string {
    if (
      contentJson &&
      typeof contentJson === 'object' &&
      !Array.isArray(contentJson) &&
      'markdown' in contentJson &&
      typeof contentJson.markdown === 'string'
    ) {
      return contentJson.markdown;
    }
    return '';
  }

  private toPost(post: PostWithAuthor): Post {
    const markdown = this.markdownOf(post.contentJson);
    return {
      id: post.id,
      authorId: post.authorId,
      authorName: post.author.name,
      title: post.title,
      slug: post.slug,
      contentJson: {
        format: 'markdown',
        markdown,
      },
      coverImage: post.coverImage,
      tags: post.tags,
      status: post.status,
      linkedTripId: post.linkedTripId,
      readingTimeMinutes: estimateReadingTime(markdown),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private toSummary(post: PostWithAuthor): PostSummary {
    const markdown = this.markdownOf(post.contentJson);
    return {
      id: post.id,
      authorId: post.authorId,
      authorName: post.author.name,
      title: post.title,
      slug: post.slug,
      excerpt: buildExcerpt(markdown),
      coverImage: post.coverImage,
      tags: post.tags,
      status: post.status,
      readingTimeMinutes: estimateReadingTime(markdown),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private slugify(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60)
      .replace(/^-+|-+$/g, '');
    const suffix = randomBytes(3).toString('hex');
    return `${base || 'post'}-${suffix}`;
  }

  async create(authorId: string, input: CreatePostRequest): Promise<Post> {
    const content = input.contentJson;
    const post = await this.prisma.post.create({
      data: {
        authorId,
        title: input.title,
        slug: this.slugify(input.title),
        contentJson: content,
        coverImage: input.coverImage ?? null,
        tags: input.tags,
        status: 'DRAFT',
        linkedTripId: input.linkedTripId ?? null,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return this.toPost(post);
  }

  private async loadOwned(
    authorId: string,
    postId: string,
  ): Promise<PrismaPost> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException(
        'You do not have permission to modify this post',
      );
    }

    return post;
  }

  async update(
    authorId: string,
    postId: string,
    input: UpdatePostRequest,
  ): Promise<Post> {
    await this.loadOwned(authorId, postId);
    const data: Prisma.PostUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.contentJson !== undefined) data.contentJson = input.contentJson;
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.linkedTripId !== undefined)
      data.linkedTripId = input.linkedTripId;

    const post = await this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    if (post.status === 'PUBLISHED') {
      await this.embeddings.embedPost(
        post.id,
        post.title,
        this.markdownOf(post.contentJson),
      );
    }
    return this.toPost(post);
  }

  async publish(authorId: string, postId: string): Promise<Post> {
    const existing = await this.loadOwned(authorId, postId);
    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: existing.publishedAt ?? new Date(),
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    await this.embeddings.embedPost(
      post.id,
      post.title,
      this.markdownOf(post.contentJson),
    );
    return this.toPost(post);
  }

  async unpublish(authorId: string, postId: string): Promise<Post> {
    await this.loadOwned(authorId, postId);
    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    await this.embeddings.removePost(post.id);
    return this.toPost(post);
  }

  async getById(userId: string | null, postId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.status === 'DRAFT' && (!userId || post.authorId !== userId)) {
      throw new NotFoundException('Post not found');
    }

    return this.toPost(post);
  }

  async getPublishedBySlug(slug: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException('Post not found');
    }
    return this.toPost(post);
  }

  async listMine(authorId: string): Promise<PostSummary[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return posts.map((p) => this.toSummary(p));
  }

  async delete(authorId: string, postId: string): Promise<void> {
    await this.loadOwned(authorId, postId);
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
    await this.embeddings.removePost(postId);
  }
}

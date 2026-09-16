import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { VectorService } from '../prisma/vector.service.js';
import type { Prisma } from '@prisma/client';
import {
  buildExcerpt,
  type DiscoveryQuery,
  estimateReadingTime,
  type PaginatedPosts,
  type PostSummary,
} from '@travel-companion/contracts';

type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: { name: true };
    };
  };
}>;

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly vectors: VectorService,
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
      readingTimeMinutes: estimateReadingTime(markdown),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async listPublished(query: DiscoveryQuery): Promise<PaginatedPosts> {
    const where: Prisma.PostWhereInput = {
      status: 'PUBLISHED',
      ...(query.tag ? { tags: { has: query.tag } } : {}),
    };

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        include: { author: { select: { name: true } } },
        take: query.pageSize,
        skip: (query.page - 1) * query.pageSize,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    return {
      items: posts.map((p) => this.toSummary(p)),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }

  async semanticSearch(q: string, limit: number): Promise<PostSummary[]> {
    const [queryVector] = await this.ai.embed([q]);
    if (!queryVector) return [];

    const hits = await this.vectors.search(queryVector, limit * 3);
    const orderedPostIds: string[] = [];
    for (const hit of hits) {
      if (hit.sourceType === 'post' && !orderedPostIds.includes(hit.sourceId)) {
        orderedPostIds.push(hit.sourceId);
      }
      if (orderedPostIds.length >= limit) break;
    }
    if (orderedPostIds.length === 0) return [];

    const posts = await this.prisma.post.findMany({
      where: {
        id: { in: orderedPostIds },
        status: 'PUBLISHED',
      },
      include: { author: { select: { name: true } } },
    });

    const byId = new Map(posts.map((p) => [p.id, p]));
    return orderedPostIds
      .map((id) => byId.get(id))
      .filter((p): p is PostWithAuthor => p !== undefined)
      .map((p) => this.toSummary(p));
  }
}

import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VectorSearchResult, VectorService } from '../prisma/vector.service.js';
import type {
  GroundedAnswer,
  GroundedQARequest,
  GroundedSource,
} from '@travel-companion/contracts';

Injectable();
export class RagService {
  private static readonly RELEVANCE_THRESHOLD = 0.6;
  private static readonly TOP_K = 4;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly vectors: VectorService,
  ) {}

  async answer(input: GroundedQARequest): Promise<GroundedAnswer> {
    const [queryVector] = await this.ai.embed([input.question]);

    let relevant: VectorSearchResult[] = [];
    if (queryVector) {
      const hits = await this.vectors.search(queryVector, RagService.TOP_K);
      relevant = hits.filter(
        (h) =>
          h.sourceType === 'post' &&
          h.distance <= RagService.RELEVANCE_THRESHOLD,
      );
    }

    if (relevant.length === 0) {
      const answer = await this.ai.generateAnswer(input.question, []);
      return {
        answer: `${answer}\n\n(This answer isn't based on any traveler stories on TravelCompanion.)`,
        grounded: false,
        sources: [],
      };
    }

    const contextChunks = relevant.map((h) => h.content);
    const answer = await this.ai.generateAnswer(input.question, contextChunks);
    const sources = await this.buildSources(relevant);

    return {
      answer,
      grounded: true,
      sources,
    };
  }

  private async buildSources(
    hits: VectorSearchResult[],
  ): Promise<GroundedSource[]> {
    const postIds = [...new Set(hits.map((h) => h.sourceId))];
    const posts = await this.prisma.post.findMany({
      where: { id: { in: postIds }, status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true },
    });
    const byId = new Map(posts.map((p) => [p.id, p]));

    const seen = new Set<string>();
    const sources: GroundedSource[] = [];

    for (const hit of hits) {
      if (seen.has(hit.sourceId)) continue;
      const post = byId.get(hit.sourceId);
      if (!post) continue;
      seen.add(hit.sourceId);
      sources.push({
        sourceType: 'post',
        snippet: hit.content.slice(0, 200),
        sourceId: post.slug,
      });
    }

    return sources;
  }
}

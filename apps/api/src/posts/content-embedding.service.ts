import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service.js';
import { VectorService } from '../prisma/vector.service.js';

@Injectable()
export class ContentEmbeddingService {
  private readonly logger = new Logger(ContentEmbeddingService.name);
  constructor(
    private readonly ai: AiService,
    private readonly vectors: VectorService,
  ) {}

  chunk(title: string, markdown: string, maxChars = 800): string[] {
    const paragraphs = `${title}\n\n${markdown}`
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let current = '';

    for (const para of paragraphs) {
      if (current.length + para.length + 2 > maxChars && current.length > 0) {
        chunks.push(current);
        current = '';
      }
      current = current ? `${current}\n\n${para}` : para;
      if (current.length >= maxChars) {
        chunks.push(current);
        current = '';
      }
    }

    if (current) chunks.push(current);

    return chunks;
  }

  async embedPost(
    postId: string,
    title: string,
    markdown: string,
  ): Promise<void> {
    try {
      await this.vectors.deleteBySource('post', postId);
      const chunks = this.chunk(title, markdown);
      if (chunks.length === 0) return;
      const vectors = await this.ai.embed(chunks);
      await Promise.all(
        chunks.map((content, index) =>
          this.vectors.upsertEmbedding({
            id: `${postId}:${index}`,
            sourceType: 'post',
            sourceId: postId,
            chunkIndex: index,
            content,
            embedding: vectors[index] ?? [],
          }),
        ),
      );
      this.logger.log(`Embedded post ${postId} into ${chunks.length} chunks`);
    } catch (error) {
      this.logger.error(
        `Failed to embed post ${postId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async removePost(postId: string): Promise<void> {
    try {
      await this.vectors.deleteBySource('post', postId);
    } catch (error) {
      this.logger.error(
        `Failed to remove embeddings for post ${postId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

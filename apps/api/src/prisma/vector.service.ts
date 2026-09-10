import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { Prisma } from '../generated/client.js';

export interface VectorSearchResult {
  id: string;
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  distance: number;
}

@Injectable()
export class VectorService {
  constructor(private readonly prisma: PrismaService) {}

  private toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  async upsertEmbedding(params: {
    id: string;
    sourceType: 'post' | 'trip';
    sourceId: string;
    chunkIndex: number;
    content: string;
    embedding: number[];
  }): Promise<void> {
    const vector = this.toVectorLiteral(params.embedding);
    await this.prisma.$executeRaw`
    INSERT INTO content_embedding (id, source_id, source_type, chunk_index, content, embedding)
    VALUES (${params.id}, ${params.sourceId}, ${params.sourceType}, ${params.chunkIndex}, ${params.content}, ${vector}::vector)
    ON CONFLICT (id) DO UPDATE SET
    chunk_index = EXCLUDED.chunk_index,
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding;
    `;
  }

  async deleteBySource(
    sourceType: 'post' | 'trip',
    sourceId: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
    DELETE FROM content_embedding
    WHERE source_id = ${sourceId}
    AND source_type = ${sourceType}`;
  }

  async search(
    queryEmbedding: number[],
    limit = 5,
  ): Promise<VectorSearchResult[]> {
    const vector = this.toVectorLiteral(queryEmbedding);
    const rows = await this.prisma.$queryRaw<
      {
        id: string;
        source_id: string;
        source_type: string;
        chunk_index: number;
        content: string;
        distance: number;
      }[]
    >(Prisma.sql`
    SELECT id, source_id, source_type, chunk_index, content, 
        embedding <=> ${vector}::vector AS distance
    FROM content_embedding
    ORDER BY distance ASC
    LIMIT ${limit};
    `);

    return rows.map((row) => ({
      id: row.id,
      sourceType: row.source_type,
      sourceId: row.source_id,
      chunkIndex: row.chunk_index,
      content: row.content,
      distance: Number(row.distance),
    }));
  }
}

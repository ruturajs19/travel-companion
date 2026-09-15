import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  discoveryQuerySchema,
  PaginatedPosts,
  PostSummary,
  searchQuerySchema,
} from '@travel-companion/contracts';

@Controller({ path: 'discover', version: '1' })
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get()
  feed(
    @Query(new ZodValidationPipe(discoveryQuerySchema))
    query: {
      tag?: string;
      page: number;
      pageSize: number;
    },
  ): Promise<PaginatedPosts> {
    return this.discovery.listPublished(query);
  }

  @Get('search')
  search(
    @Query(new ZodValidationPipe(searchQuerySchema))
    query: {
      q: string;
      limit: number;
    },
  ): Promise<PostSummary[]> {
    return this.discovery.semanticSearch(query.q, query.limit);
  }
}

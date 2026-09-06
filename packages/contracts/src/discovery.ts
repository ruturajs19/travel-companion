import { z } from 'zod'
import { type Paginated, paginatedSchema } from './common'
import { postSummarySchema, type PostSummary } from './posts'

export const discoveryQuerySchema = z.object({
    tag: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export type DiscoveryQuery = z.infer<typeof discoveryQuerySchema>

export const searchQuerySchema = z.object({
    q: z.string().min(1).max(200),
    limit: z.coerce.number().int().min(1).max(20).default(10),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

export const paginatedPostsSchema = paginatedSchema(postSummarySchema);
export type PaginatedPosts = Paginated<PostSummary>;
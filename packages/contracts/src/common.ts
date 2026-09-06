import { z } from 'zod';

export const errorResponseSchema = z.object({
    statusCode: z.number().int(),
    message: z.union([z.string(), z.array(z.string())]),
    error: z.string(),
    path: z.string(),
    timestamp: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export interface Paginated<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        items: z.array(itemSchema),
        page: z.number().int(),
        pageSize: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
    });
}

export const healthResponseSchema = z.object({
    status: z.literal('ok'),
    uptime: z.number(),
    timestamp: z.string(),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>

export const readinessResponseSchema = z.object({
    status: z.enum(['ok', 'degraded']),
    timestamp: z.string(),
    checks: z.object({
        database: z.enum(['up', 'down'])
    }),
})

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>
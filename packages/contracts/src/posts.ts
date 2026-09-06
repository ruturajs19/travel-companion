import { z } from 'zod'
import { postStatusSchema } from './enums';

export const richTextSchema = z.object({
    format: z.literal('markdown'),
    markdown: z.string(),
});

export type RichText = z.infer<typeof richTextSchema>

export const postSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    authorName: z.string().nullable(),
    title: z.string(),
    slug: z.string(),
    contentJson: richTextSchema,
    coverImage: z.string().url().nullable(),
    tags: z.array(z.string()),
    status: postStatusSchema,
    linkedTripId: z.string().nullable(),
    readingTimeMinutes: z.number().int(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type Post = z.infer<typeof postSchema>

export const postSummarySchema = z.object({
    id: z.string(),
    authorId: z.string(),
    authorName: z.string().nullable(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    coverImage: z.string().url().nullable(),
    tags: z.array(z.string()),
    readingTimeMinutes: z.number().int(),
    publishedAt: z.string().nullable(),
    updatedAt: z.string(),
})
export type PostSummary = z.infer<typeof postSummarySchema>;

export const createPostRequestSchema = z.object({
    title: z.string().min(1).max(200),
    contentJson: richTextSchema,
    coverImage: z.string().url().optional(),
    tags: z.array(z.string().min(1)).max(20).default([]),
    linkedTripId: z.string().optional(),
})

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>

export const updatePostRequestSchema = createPostRequestSchema.partial();
export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>

export const commentSchema = z.object({
    id: z.string(),
    postId: z.string(),
    authorId: z.string(),
    authorName: z.string().nullable(),
    body: z.string(),
    createdAt: z.string(),
})
export type Comment = z.infer<typeof commentSchema>

export const createCommentRequestSchema = z.object({
    body: z.string().min(1).max(2000),
})
export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>

export const uploadSignatureSchema = z.object({
    cloudName: z.string(),
    apiKey: z.string(),
    timestamp: z.number().int(),
    signature: z.string(),
    folder: z.string()
})
export type UploadSignature = z.infer<typeof uploadSignatureSchema>

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(markdown: string): number {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function buildExcerpt(markdown: string, maxLength = 200): string {
    const plain = markdown
        .replace(/```[\s\S]*?```/g, ' ') //code blocks
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') //images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') //links -> text
        .replace(/[#>*_`~-]/g, ' ') //markdown punctuation
        .replace(/\s+/g, ' ').trim();
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trimEnd()}...`;
}
import { z } from 'zod';

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be at most 128 characters long')

export const registerRequestSchema = z.object({
    email: z.email(),
    password: passwordSchema,
    name: z.string().min(1).max(80).optional(),
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const loginRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const refreshRequestSchema = z.object({
    refreshToken: z.string().min(1),
})

export type RefreshRequest = z.infer<typeof refreshRequestSchema>

export const authTokensSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int()
})

export type AuthTokens = z.infer<typeof authTokensSchema>

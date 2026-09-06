import { z } from 'zod'

export const userProfileSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    bio: z.string().nullable(),
    image: z.string().url().nullable(),
    homeLocation: z.string().nullable(),
    createdAt: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const updateProfileRequestSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional(),
    image: z.string().url().optional(),
    homeLocation: z.string().max(120).optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

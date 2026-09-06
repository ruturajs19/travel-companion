import { z } from 'zod';
import { userProfileSchema } from './users';

export const likeStatusSchema = z.object({
    liked: z.boolean(),
    count: z.number().int().nonnegative(),
});

export type LikeStatus = z.infer<typeof likeStatusSchema>;


export const followStatusSchema = z.object({
    following: z.boolean(),
    followerCount: z.number().int().nonnegative(),
    followingCount: z.number().int().nonnegative(),
});

export type FollowStatus = z.infer<typeof followStatusSchema>;

export const postStatsSchema = z.object({
    likeCount: z.number().int().nonnegative(),
    commentCount: z.number().int().nonnegative()
});

export type PostStats = z.infer<typeof postStatsSchema>

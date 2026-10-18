'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import { getAccessToken } from '@/lib/session';
import {
  addCommentRequest,
  remixTripRequest,
  toggleFollowRequest,
  toggleLikeRequest,
} from '@/lib/social-api';
import {
  createCommentRequestSchema,
  type Comment,
  type FollowStatus,
  type LikeStatus,
} from '@travel-companion/contracts';

export interface LikeActionResult {
  status?: LikeStatus;
  error?: string;
}

export interface FollowActionResult {
  status?: FollowStatus;
  error?: string;
}

export interface CommentActionResult {
  comment?: Comment;
  error?: string;
}

export interface RemixActionResult {
  tripId?: string;
  error?: string;
}

const SIGNED_OUT = 'Please sign in to do that.';

function friendlyError(error: unknown, fallback: string): string {
  if (error instanceof ApiUnreachableError) {
    return 'The server is waking up. Please try again in a few seconds.';
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return SIGNED_OUT;
    if (error.status === 404) return 'That content is no longer available.';
    if (error.status === 400) return error.message;
  }
  return fallback;
}

export async function toggleLikeAction(
  postId: string,
): Promise<LikeActionResult> {
  const token = await getAccessToken();
  if (!token) return { error: SIGNED_OUT };
  try {
    return { status: await toggleLikeRequest(token, postId) };
  } catch (error) {
    return {
      error: friendlyError(
        error,
        'Could not update your like. Please try again.',
      ),
    };
  }
}

export async function addCommentAction(
  postId: string,
  body: string,
): Promise<CommentActionResult> {
  const parsed = createCommentRequestSchema.safeParse({ body });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Please enter a comment.',
    };
  }
  const token = await getAccessToken();
  if (!token) return { error: SIGNED_OUT };
  try {
    return { comment: await addCommentRequest(token, postId, parsed.data) };
  } catch (error) {
    return {
      error: friendlyError(error, 'Could not add comment. Please try again.'),
    };
  }
}

export async function toggleFollowAction(
  userId: string,
): Promise<FollowActionResult> {
  const token = await getAccessToken();
  if (!token) return { error: SIGNED_OUT };
  try {
    return { status: await toggleFollowRequest(token, userId) };
  } catch (error) {
    return {
      error: friendlyError(error, 'Could not update follow. Please try again.'),
    };
  }
}

export async function remixTripAction(
  tripId: string,
): Promise<RemixActionResult> {
  const token = await getAccessToken();
  if (!token) return { error: SIGNED_OUT };
  try {
    const trip = await remixTripRequest(token, tripId);
    return { tripId: trip.id };
  } catch (error) {
    return {
      error: friendlyError(
        error,
        'Could not remix this itinerary. Please try again.',
      ),
    };
  }
}

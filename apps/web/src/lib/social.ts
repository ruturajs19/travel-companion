import type {
  Comment,
  FollowStatus,
  LikeStatus,
  PostStats,
} from '@travel-companion/contracts';
import {
  followStatusRequest,
  likeStatusRequest,
  listCommentsRequest,
  postStatsRequest,
} from './social-api';
import { getAccessToken } from './session';

export async function getLikeState(postId: string): Promise<LikeStatus> {
  const token = await getAccessToken();
  if (token) {
    try {
      return await likeStatusRequest(token, postId);
    } catch {}
  }
  try {
    const stats = await postStatsRequest(postId);
    return { liked: false, count: stats.likeCount };
  } catch {
    return { liked: false, count: 0 };
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    return await listCommentsRequest(postId);
  } catch {
    return [];
  }
}

export async function getPostStats(postId: string): Promise<PostStats> {
  try {
    return await postStatsRequest(postId);
  } catch {
    return { likeCount: 0, commentCount: 0 };
  }
}

export async function getFollowState(
  userId: string,
): Promise<FollowStatus | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await followStatusRequest(token, userId);
  } catch {
    return null;
  }
}

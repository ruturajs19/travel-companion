import type {
  Comment,
  CreateCommentRequest,
  FollowStatus,
  LikeStatus,
  PostStats,
  Trip,
} from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function likeStatusRequest(
  token: string,
  postId: string,
): Promise<LikeStatus> {
  return apiFetch<LikeStatus>(`/posts/${postId}/like`, {
    token,
    cache: 'no-store',
  });
}

export function toggleLikeRequest(
  token: string,
  postId: string,
): Promise<LikeStatus> {
  return apiFetch<LikeStatus>(`/posts/${postId}/like`, {
    token,
    method: 'POST',
    cache: 'no-store',
  });
}

export function listCommentsRequest(postId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`, {
    cache: 'no-store',
  });
}

export function addCommentRequest(
  token: string,
  postId: string,
  input: CreateCommentRequest,
): Promise<Comment> {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    token,
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function postStatsRequest(postId: string): Promise<PostStats> {
  return apiFetch<PostStats>(`/posts/${postId}/stats`, {
    cache: 'no-store',
  });
}

export function followStatusRequest(
  token: string,
  userId: string,
): Promise<FollowStatus> {
  return apiFetch<FollowStatus>(`/users/${userId}/follow`, {
    token,
    cache: 'no-store',
  });
}

export function toggleFollowRequest(
  token: string,
  userId: string,
): Promise<FollowStatus> {
  return apiFetch<FollowStatus>(`/users/${userId}/follow`, {
    token,
    method: 'POST',
    cache: 'no-store',
  });
}

export function remixTripRequest(token: string, tripId: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${tripId}/remix`, {
    token,
    method: 'POST',
    cache: 'no-store',
  });
}

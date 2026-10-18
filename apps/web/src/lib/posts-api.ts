import type {
  CreatePostRequest,
  Post,
  PostSummary,
  UpdatePostRequest,
} from '@travel-companion/contracts';

import { apiFetch } from './api-client';

export function createPostRequest(
  token: string,
  input: CreatePostRequest,
): Promise<Post> {
  return apiFetch<Post>(`/posts`, {
    token,
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function updatePostRequest(
  token: string,
  id: string,
  input: UpdatePostRequest,
): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, {
    token,
    method: 'PATCH',
    body: input,
    cache: 'no-store',
  });
}

export function getMyPostRequest(token: string, id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, {
    token,
    cache: 'no-store',
  });
}

export function listMyPostsRequest(token: string): Promise<PostSummary[]> {
  return apiFetch<PostSummary[]>(`/posts/mine`, {
    token,
    cache: 'no-store',
  });
}

export function publishPostRequest(token: string, id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}/publish`, {
    token,
    method: 'PATCH',
    cache: 'no-store',
  });
}

export function unpublishPostRequest(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/unpublish`, {
    token,
    method: 'PATCH',
    cache: 'no-store',
  });
}

export function deletePostRequest(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}`, {
    token,
    method: 'DELETE',
    cache: 'no-store',
  });
}

export function getPublishedPostRequest(slug: string): Promise<Post> {
  return apiFetch<Post>(`/posts/by-slug/${slug}`, {
    cache: 'no-store',
  });
}

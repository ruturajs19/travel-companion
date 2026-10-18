import type { Post, PostSummary } from '@travel-companion/contracts';

import { getCurrentUser } from './current-user';
import {
  getMyPostRequest,
  getPublishedPostRequest,
  listMyPostsRequest,
} from './posts-api';
import { getAccessToken } from './session';
import { ApiError } from './api-client';

export async function listMyPosts(): Promise<PostSummary[] | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }
  try {
    return await listMyPostsRequest(token);
  } catch {
    return null;
  }
}

export async function getMyPost(id: string): Promise<Post | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }
  try {
    return await getMyPostRequest(token, id);
  } catch {
    return null;
  }
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  try {
    return await getPublishedPostRequest(slug);
  } catch {
    return null;
  }
}

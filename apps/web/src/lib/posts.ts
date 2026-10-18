import type { Post, PostSummary } from '@travel-companion/contracts';

import {
  getMyPostRequest,
  getPublishedPostRequest,
  listMyPostsRequest,
} from './posts-api';
import { executeWithAuth } from './session';

export async function listMyPosts(): Promise<PostSummary[] | null> {
  try {
    return await executeWithAuth((token) => listMyPostsRequest(token));
  } catch {
    return null;
  }
}

export async function getMyPost(id: string): Promise<Post | null> {
  try {
    return await executeWithAuth((token) => getMyPostRequest(token, id));
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

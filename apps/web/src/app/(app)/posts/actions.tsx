'use server';

import { ApiError } from '@/lib/api-client';
import {
  createPostRequest,
  deletePostRequest,
  publishPostRequest,
  updatePostRequest,
} from '@/lib/posts-api';
import { getAccessToken } from '@/lib/session';
import { createPostRequestSchema } from '@travel-companion/contracts';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface PostFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';

function parseForm(formData: FormData) {
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const coverImage = String(formData.get('coverImage') ?? '').trim();
  const linkedTripId = String(formData.get('linkedTripId') ?? '').trim();

  return createPostRequestSchema.safeParse({
    title: formData.get('title'),
    content: {
      format: 'markdown',
      markdown: String(formData.get('markdown') ?? ''),
    },
    tags,
    coverImage: coverImage || undefined,
    linkedTripId: linkedTripId || undefined,
  });
}

function toFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
): { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const first = issue.path[0];
    const key = typeof first === 'string' ? first : '';
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { fieldErrors };
}

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return toFieldErrors(parsed.error.issues);
  }
  const token = await getAccessToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }
  let postId: string;

  try {
    const post = await createPostRequest(token, parsed.data);
    postId = post.id;
    if (formData.get('intent') === 'publish') {
      await publishPostRequest(token, postId);
    }
  } catch (error) {
    return { error: 'Could not save your post. Please try again.' };
  }

  revalidatePath('/posts');
  redirect('/posts');
}

export async function updatePostAction(
  postId: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return toFieldErrors(parsed.error.issues);
  }
  const token = await getAccessToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  try {
    await updatePostRequest(token, postId, parsed.data);
    if (formData.get('intent') === 'publish') {
      await publishPostRequest(token, postId);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { error: 'You are not authorized to update this post.' };
    }
    return { error: 'Could not save your changes. Please try again.' };
  }

  revalidatePath('/posts');
  revalidatePath(`/posts/${postId}/edit`);
  redirect('/posts');
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const token = await getAccessToken();
  const id = String(formData.get('id') ?? '');
  if (token && id) {
    await deletePostRequest(token, id).catch(() => undefined);
  }

  revalidatePath('/posts');
  redirect('/posts');
}

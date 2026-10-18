'use server';

import { ApiError } from '@/lib/api-client';
import {
  createPostRequest,
  deletePostRequest,
  publishPostRequest,
  updatePostRequest,
} from '@/lib/posts-api';
import { executeWithAuth } from '@/lib/session';
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
    contentJson: {
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
    const fullKey = issue.path.map(String).join('.');
    const first = typeof issue.path[0] === 'string' ? issue.path[0] : '';
    const last =
      typeof issue.path[issue.path.length - 1] === 'string'
        ? String(issue.path[issue.path.length - 1])
        : '';

    if (fullKey && !fieldErrors[fullKey]) {
      fieldErrors[fullKey] = issue.message;
    }
    if (first && !fieldErrors[first]) {
      fieldErrors[first] = issue.message;
    }
    if (last && !fieldErrors[last]) {
      fieldErrors[last] = issue.message;
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

  try {
    const isPublish = formData.get('intent') === 'publish';
    await executeWithAuth(async (token) => {
      const post = await createPostRequest(token, parsed.data);
      if (isPublish) {
        await publishPostRequest(token, post.id);
      }
      return post;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { error: SESSION_EXPIRED };
      }
      const apiMsg = Array.isArray(error.body?.message)
        ? error.body.message.join(', ')
        : error.body?.message;
      if (apiMsg) {
        return { error: apiMsg };
      }
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Could not save your post. Please try again.',
    };
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

  try {
    const isPublish = formData.get('intent') === 'publish';
    await executeWithAuth(async (token) => {
      await updatePostRequest(token, postId, parsed.data);
      if (isPublish) {
        await publishPostRequest(token, postId);
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { error: SESSION_EXPIRED };
      }
      if (error.status === 403) {
        return { error: 'You are not authorized to update this post.' };
      }
      const apiMsg = Array.isArray(error.body?.message)
        ? error.body.message.join(', ')
        : error.body?.message;
      if (apiMsg) {
        return { error: apiMsg };
      }
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Could not save your changes. Please try again.',
    };
  }

  revalidatePath('/posts');
  revalidatePath(`/posts/${postId}/edit`);
  redirect('/posts');
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (id) {
    try {
      await executeWithAuth((token) => deletePostRequest(token, id));
    } catch {
      // ignore
    }
  }

  revalidatePath('/posts');
  redirect('/posts');
}


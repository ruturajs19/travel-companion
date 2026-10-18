'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import { executeWithAuth } from '@/lib/session';
import { updateProfileRequest } from '@/lib/users-api';
import { updateProfileRequestSchema } from '@travel-companion/contracts';
import { revalidatePath } from 'next/cache';

export interface ProfileFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const raw = {
    name: (formData.get('name') as string) || undefined,
    bio: (formData.get('bio') as string) || undefined,
    homeLocation: (formData.get('homeLocation') as string) || undefined,
    image: (formData.get('image') as string) || undefined,
  };

  const parsed = updateProfileRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const first = issue.path[0];
      const key = typeof first === 'string' ? first : '';
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  try {
    await executeWithAuth((token) => updateProfileRequest(token, parsed.data));
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return {
        error: 'The server is waking up. Please try again in a few seconds.',
      };
    }
    if (error instanceof ApiError && error.status === 401) {
      return { error: 'Your session has expired. Please sign in again.' };
    }
    return { error: 'Could not save your changes. Please try again.' };
  }

  revalidatePath('/profile');
  return { success: true };
}

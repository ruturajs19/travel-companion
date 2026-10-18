'use server';

import { ApiError } from '@/lib/api-client';
import {
  inviteCollaboratorRequest,
  removeCollaboratorRequest,
} from '@/lib/collaborators-api';
import { executeWithAuth } from '@/lib/session';
import { inviteCollaboratorRequestSchema } from '@travel-companion/contracts';
import { revalidatePath } from 'next/cache';

export interface CollaboratorFormState {
  error?: string;
  success?: boolean;
}

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';

export async function inviteCollaboratorAction(
  tripId: string,
  _prev: CollaboratorFormState,
  formData: FormData,
): Promise<CollaboratorFormState> {
  const parsed = inviteCollaboratorRequestSchema.safeParse({
    email: formData.get('email'),
    role: 'EDITOR',
  });

  if (!parsed.success) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    await executeWithAuth((token) =>
      inviteCollaboratorRequest(
        token,
        tripId,
        parsed.data.email,
        parsed.data.role,
      ),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { error: SESSION_EXPIRED };
      }
      if (error.status === 404) {
        return { error: 'No TravelCompanion user found for the email.' };
      }
      if (error.status === 400) {
        return {
          error: 'That person already has access to this trip.',
        };
      }
      if (error.status === 403) {
        return {
          error: "You don't have permission to perform this action.",
        };
      }
    }
    return { error: 'Could not send the invite. Please try again.' };
  }

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}

export async function removeCollaboratorAction(
  formData: FormData,
): Promise<void> {
  const tripId = formData.get('tripId') as string;
  const userId = formData.get('userId') as string;

  if (tripId && userId) {
    try {
      await executeWithAuth((token) =>
        removeCollaboratorRequest(token, tripId, userId),
      );
    } catch {
      // ignore
    }
  }

  revalidatePath(`/trips/${tripId}`);
}


'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import { executeWithAuth } from '@/lib/session';
import { deleteTripRequest, generateTripRequest } from '@/lib/trips-api';
import {
  budgetLevelSchema,
  generateItineraryRequestSchema,
} from '@travel-companion/contracts';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface GenerateFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function generateTripAction(
  _prev: GenerateFormState,
  formData: FormData,
): Promise<GenerateFormState> {
  const interestsRaw = (formData.get('interests') as string) || '';
  const interests = interestsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = generateItineraryRequestSchema.safeParse({
    destination: formData.get('destination') as string,
    durationDays: Number(formData.get('durationDays')),
    interests,
    budgetLevel: budgetLevelSchema.safeParse(formData.get('budgetLevel'))
      .success
      ? formData.get('budgetLevel')
      : undefined,
    notes: (formData.get('notes') as string) || undefined,
  });

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

  let tripId: string;
  try {
    const trip = await executeWithAuth((token) =>
      generateTripRequest(token, parsed.data),
    );
    tripId = trip.id;
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return {
        error: 'The server is waking up. Please try again in a few seconds.',
      };
    }
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { error: 'Your session has expired. Please sign in again.' };
      }
      if (error.status === 429) {
        return { error: 'AI request limit reached. Please try again shortly.' };
      }
      if (error.status === 503) {
        return {
          error: 'The AI service is temporarily unavailable. Please try again.',
        };
      }
      if (error.status === 502) {
        return {
          error: 'The AI response could not be understood. Please try again.',
        };
      }
    }
    return { error: 'Could not generate your itinerary. Please try again.' };
  }

  revalidatePath('/trips');
  redirect(`/trips/${tripId}`);
}

export async function deleteTripAction(formData: FormData): Promise<void> {
  const id = formData.get('id') as string;
  if (id) {
    try {
      await executeWithAuth((token) => deleteTripRequest(token, id));
    } catch {
      // ignore
    }
  }
  revalidatePath('/trips');
  redirect('/trips');
}

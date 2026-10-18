'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import {
  addActivityRequest,
  addDayRequest,
  deleteActivityRequest,
  deleteDayRequest,
  refineDayRequest,
  reorderActivitiesRequest,
  reorderDaysRequest,
  updateActivityRequest,
} from '@/lib/itinerary-api';
import { getValidAccessToken } from '@/lib/session';
import {
  activityInputSchema,
  TimeSlot,
  updateActivitySchema,
} from '@travel-companion/contracts';
import { revalidatePath } from 'next/cache';

export interface ItineraryActionState {
  error?: string;
}

const SESSION_EXPIRED = 'Session expired. Please sign in again.';

async function token(): Promise<string | null> {
  return (await getValidAccessToken()) ?? null;
}

function refresh(tripId: string): void {
  revalidatePath(`/trips/${tripId}`);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length > 0 ? s : null;
}

export async function addDayAction(
  tripId: string,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) {
    return { error: SESSION_EXPIRED };
  }

  try {
    await addDayRequest(t, tripId, {});
  } catch {
    return { error: 'Failed to add day. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function deleteDayAction(
  tripId: string,
  dayId: string,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };

  try {
    await deleteDayRequest(t, dayId);
  } catch {
    return { error: 'Failed to delete day. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function reorderDaysAction(
  tripId: string,
  orderedIds: string[],
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };

  try {
    await reorderDaysRequest(t, tripId, orderedIds);
  } catch {
    return { error: 'Failed to reorder days. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function addActivityAction(
  tripId: string,
  dayId: string,
  formData: FormData,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };

  const timeSlotRaw = formData.get('timeSlot');
  const parsed = activityInputSchema.safeParse({
    title: formData.get('title'),
    timeSlot: timeSlotRaw ? (timeSlotRaw as TimeSlot) : null,
    locationName: emptyToNull(formData.get('locationName')),
    notes: emptyToNull(formData.get('notes')),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid activity' };
  }

  try {
    await addActivityRequest(t, dayId, parsed.data);
  } catch {
    return { error: 'Could not add the activity. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function updateActivityAction(
  tripId: string,
  activityId: string,
  formData: FormData,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };

  const timeSlotRaw = formData.get('timeSlot');
  const parsed = updateActivitySchema.safeParse({
    title: formData.get('title'),
    timeSlot: timeSlotRaw ? (timeSlotRaw as TimeSlot) : null,
    locationName: emptyToNull(formData.get('locationName')),
    notes: emptyToNull(formData.get('notes')),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid activity' };
  }

  try {
    await updateActivityRequest(t, activityId, parsed.data);
  } catch {
    return { error: 'Could not update the activity. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function deleteActivityAction(
  tripId: string,
  activityId: string,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };

  try {
    await deleteActivityRequest(t, activityId);
  } catch {
    return { error: 'Failed to delete activity. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function refineDayAction(
  tripId: string,
  dayId: string,
  instruction: string,
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };
  if (!instruction.trim())
    return { error: 'Please describe how to refine this day' };
  try {
    await refineDayRequest(t, dayId, instruction.trim());
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return {
        error: 'The server is waking up. Please try again in a few seconds.',
      };
    }
    if (error instanceof ApiError) {
      if (error.status === 429)
        return { error: 'AI request limit reached. Please try again shortly.' };
      if (error.status === 503)
        return {
          error: 'AI service is temporarily unavailable. Please try again.',
        };
      if (error.status === 502)
        return {
          error: 'AI response could not be understood. Please try again.',
        };
    }
    return { error: 'Failed to refine this day. Please try again.' };
  }

  refresh(tripId);
  return {};
}

export async function reorderActivitiesAction(
  tripId: string,
  dayId: string,
  orderedIds: string[],
): Promise<ItineraryActionState> {
  const t = await token();
  if (!t) return { error: SESSION_EXPIRED };
  try {
    await reorderActivitiesRequest(t, dayId, orderedIds);
  } catch {
    return { error: 'Failed to reorder activities. Please try again.' };
  }
  refresh(tripId);
  return {};
}

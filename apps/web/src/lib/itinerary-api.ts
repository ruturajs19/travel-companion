import type {
  ActivityInput,
  DayInput,
  UpdateActivityRequest,
} from '@travel-companion/contracts';

import { apiFetch } from './api-client';

export function addDayRequest(
  token: string,
  tripId: string,
  input: DayInput,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/trips/${tripId}/days`, {
    token,
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function updateDayRequest(
  token: string,
  dayId: string,
  input: DayInput,
): Promise<void> {
  return apiFetch<void>(`/days/${dayId}`, {
    token,
    method: 'PATCH',
    body: input,
    cache: 'no-store',
  });
}

export function deleteDayRequest(token: string, dayId: string): Promise<void> {
  return apiFetch<void>(`/days/${dayId}`, {
    token,
    method: 'DELETE',
    cache: 'no-store',
  });
}

export function reorderDaysRequest(
  token: string,
  tripId: string,
  orderedIds: string[],
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/days/reorder`, {
    token,
    method: 'POST',
    body: { orderedIds },
    cache: 'no-store',
  });
}

export function addActivityRequest(
  token: string,
  dayId: string,
  input: ActivityInput,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/days/${dayId}/activities`, {
    token,
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function updateActivityRequest(
  token: string,
  activityId: string,
  input: UpdateActivityRequest,
): Promise<void> {
  return apiFetch<void>(`/activities/${activityId}`, {
    token,
    method: 'PATCH',
    body: input,
    cache: 'no-store',
  });
}

export function deleteActivityRequest(
  token: string,
  activityId: string,
): Promise<void> {
  return apiFetch<void>(`/activities/${activityId}`, {
    token,
    method: 'DELETE',
    cache: 'no-store',
  });
}

export function reorderActivitiesRequest(
  token: string,
  dayId: string,
  orderedIds: string[],
): Promise<void> {
  return apiFetch<void>(`/days/${dayId}/activities/reorder`, {
    token,
    method: 'POST',
    body: { orderedIds },
    cache: 'no-store',
  });
}

export function refineDayRequest(
  token: string,
  dayId: string,
  instruction: string,
): Promise<void> {
  return apiFetch<void>(`/days/${dayId}/refine`, {
    token,
    method: 'POST',
    body: { instruction },
    cache: 'no-store',
  });
}

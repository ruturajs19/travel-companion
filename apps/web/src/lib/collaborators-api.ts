import {
  CollaboratorRole,
  TripCollaborator,
} from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function listCollaboratorsRequest(
  token: string,
  tripId: string,
): Promise<TripCollaborator[]> {
  return apiFetch<TripCollaborator[]>(`/trips/${tripId}/collaborators`, {
    token,
    cache: 'no-store',
  });
}

export function inviteCollaboratorRequest(
  token: string,
  tripId: string,
  email: string,
  role: CollaboratorRole,
): Promise<TripCollaborator> {
  return apiFetch<TripCollaborator>(`/trips/${tripId}/collaborators`, {
    method: 'POST',
    body: { email, role },
    token,
    cache: 'no-store',
  });
}

export function removeCollaboratorRequest(
  token: string,
  tripId: string,
  userId: string,
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/collaborators/${userId}`, {
    method: 'DELETE',
    token,
    cache: 'no-store',
  });
}

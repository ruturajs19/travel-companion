import type {
  GenerateItineraryRequest,
  Trip,
  TripSummary,
} from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function generateTripRequest(
  accessToken: string,
  input: GenerateItineraryRequest,
): Promise<Trip> {
  return apiFetch<Trip>(`/trips/generate`, {
    token: accessToken,
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function listTripsRequest(accessToken: string): Promise<TripSummary[]> {
  return apiFetch<TripSummary[]>(`/trips`, {
    token: accessToken,
    cache: 'no-store',
  });
}

export function getTripRequest(accessToken: string, id: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}`, {
    token: accessToken,
    cache: 'no-store',
  });
}

export function deleteTripRequest(
  accessToken: string,
  id: string,
): Promise<void> {
  return apiFetch<void>(`/trips/${id}`, {
    token: accessToken,
    method: 'DELETE',
    cache: 'no-store',
  });
}

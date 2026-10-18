import { executeWithAuth } from './session';
import {
  Trip,
  TripCollaborator,
  TripSummary,
} from '@travel-companion/contracts';
import { listTripsRequest, getTripRequest } from './trips-api';
import { listCollaboratorsRequest } from './collaborators-api';

async function withAuth<T>(
  call: (token: string) => Promise<T>,
): Promise<T | null> {
  try {
    return await executeWithAuth(call);
  } catch {
    return null;
  }
}

export function listTrips(): Promise<TripSummary[] | null> {
  return withAuth((token) => listTripsRequest(token));
}

export async function listCollaborators(
  tripId: string,
): Promise<TripCollaborator[]> {
  try {
    return await executeWithAuth((token) => listCollaboratorsRequest(token, tripId));
  } catch {
    return [];
  }
}

export function getTrip(id: string): Promise<Trip | null> {
  return withAuth((token) => getTripRequest(token, id));
}


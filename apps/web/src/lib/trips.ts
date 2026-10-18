import { ApiError } from './api-client';
import { getAccessToken, getRefreshToken, setSession } from './session';
import { refreshRequest } from './auth-api';
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
  const accessToken = await getAccessToken();
  if (accessToken) {
    try {
      return await call(accessToken);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        return null;
      }
    }
  }
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  try {
    const tokens = await refreshRequest(refreshToken);
    await setSession(tokens);
    return await call(tokens.accessToken);
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
  const accessToken = await getAccessToken();
  if (!accessToken) return [];
  try {
    return await listCollaboratorsRequest(accessToken, tripId);
  } catch {
    return [];
  }
}

export async function getTrip(id: string): Promise<Trip | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  try {
    return await getTripRequest(accessToken, id);
  } catch {
    return null;
  }
}

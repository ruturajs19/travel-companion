import type { UserProfile } from '@travel-companion/contracts';

import { getAccessToken, getRefreshToken, setSession } from './session';
import { ApiError } from './api-client';
import { refreshRequest } from './auth-api';
import { getProfileRequest } from './users-api';

export async function getProfile(): Promise<UserProfile | null> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      return await getProfileRequest(accessToken);
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
    return await getProfileRequest(tokens.accessToken);
  } catch {
    return null;
  }
}

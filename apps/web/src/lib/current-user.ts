import { ApiError, apiFetch } from './api-client';
import { meRequest, refreshRequest } from './auth-api';
import { getAccessToken, getRefreshToken, setSession } from './session';

export interface CurrentUser {
  id: string;
  email: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      return await meRequest(accessToken);
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
    return await meRequest(tokens.accessToken);
  } catch {
    return null;
  }
}

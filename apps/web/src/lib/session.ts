import 'server-only';
import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'tc_access';
const REFRESH_COOKIE = 'tc_refresh';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const isProduction = process.env.NODE_ENV === 'production';

export async function setSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  const common = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };

  store.set(ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: tokens.expiresIn,
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

import { refreshRequest } from './auth-api';
import { ApiError } from './api-client';

export async function getValidAccessToken(): Promise<string | undefined> {
  const accessToken = await getAccessToken();
  if (accessToken) {
    return accessToken;
  }
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return undefined;
  }
  try {
    const tokens = await refreshRequest(refreshToken);
    try {
      await setSession(tokens);
    } catch {
      // In read-only Server Component render contexts, setting cookies may throw.
    }
    return tokens.accessToken;
  } catch {
    return undefined;
  }
}

export async function executeWithAuth<T>(
  action: (accessToken: string) => Promise<T>,
): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new ApiError(401, undefined, 'Unauthorized');
  }
  try {
    return await action(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const tokens = await refreshRequest(refreshToken);
          try {
            await setSession(tokens);
          } catch {
            // ignore if cookie store immutable
          }
          return await action(tokens.accessToken);
        } catch {
          // refresh failed
        }
      }
    }
    throw error;
  }
}

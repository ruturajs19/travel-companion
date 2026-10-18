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
    } catch {
      // Fall through to the refresh path for any error:
      // - 401 (token expired) — refresh is the intended recovery
      // - Network/unreachable errors — avoid falsely signing the user out
    }
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshRequest(refreshToken);
    try {
      await setSession(tokens);
    } catch {
      // Cookies can only be set in Server Actions or Route Handlers in Next.js App Router.
      // If called during Server Component render, setSession may throw; still proceed with fresh token.
    }
    return await meRequest(tokens.accessToken);
  } catch {
    return null;
  }
}

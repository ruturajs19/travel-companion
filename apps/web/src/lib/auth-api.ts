import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export interface AuthResult {
  user: UserProfile;
  tokens: AuthTokens;
}

export function registerRequest(input: RegisterRequest): Promise<AuthResult> {
  return apiFetch<AuthResult>('/auth/register', {
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function loginRequest(input: LoginRequest): Promise<AuthResult> {
  return apiFetch<AuthResult>('/auth/login', {
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}

export function refreshRequest(refreshToken: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    cache: 'no-store',
  });
}

export function logoutRequest(refreshToken: string): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    cache: 'no-store',
  });
}

export function meRequest(
  accessToken: string,
): Promise<{ id: string; email: string }> {
  return apiFetch<{ id: string; email: string }>('/auth/me', {
    token: accessToken,
    cache: 'no-store',
  });
}

/** Exchange a short-lived OAuth one-time code for auth tokens. */
export function exchangeCodeRequest(code: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>(`/auth/exchange/${encodeURIComponent(code)}`, {
    cache: 'no-store',
  });
}

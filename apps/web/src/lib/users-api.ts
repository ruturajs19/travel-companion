import type {
  UpdateProfileRequest,
  UserProfile,
} from '@travel-companion/contracts';
import { apiFetch } from './api-client';

export function getProfileRequest(accessToken: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', {
    token: accessToken,
    cache: 'no-store',
  });
}

export function updateProfileRequest(
  accessToken: string,
  input: UpdateProfileRequest,
): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', {
    method: 'PATCH',
    body: input,
    token: accessToken,
    cache: 'no-store',
  });
}

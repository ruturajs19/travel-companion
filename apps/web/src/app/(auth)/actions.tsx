'use server';

import { ApiError, ApiUnreachableError } from '@/lib/api-client';
import { loginRequest, logoutRequest, registerRequest } from '@/lib/auth-api';
import { clearSession, getRefreshToken, setSession } from '@/lib/session';
import {
  loginRequestSchema,
  registerRequestSchema,
} from '@travel-companion/contracts';
import { redirect } from 'next/navigation';

const WAKING_MESSAGE =
  'The server is waking up (free hosting sleeps when idle). Please try again in a few seconds.';

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function toFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
): { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const first = issue.path[0];
    const key =
      typeof first === 'string' ? first : first != null ? String(first) : '';
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { fieldErrors };
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerRequestSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined,
  });

  if (!parsed.success) {
    return toFieldErrors(parsed.error.issues);
  }

  try {
    const result = await registerRequest(parsed.data);
    await setSession(result.tokens);
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return { error: WAKING_MESSAGE };
    }
    if (error instanceof ApiError && error.status === 409) {
      return {
        fieldErrors: { email: 'An account with this email already exists.' },
      };
    }
    return { error: 'Unexpected error. Please try again or contact support.' };
  }

  redirect('/dashboard');
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginRequestSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return toFieldErrors(parsed.error.issues);
  }

  try {
    const result = await loginRequest(parsed.data);
    await setSession(result.tokens);
  } catch (error) {
    if (error instanceof ApiUnreachableError) {
      return { error: WAKING_MESSAGE };
    }
    if (error instanceof ApiError && error.status === 401) {
      const message =
        error.message && error.message !== 'Invalid credentials'
          ? error.message
          : 'Invalid email or password.';
      return {
        fieldErrors: { email: message },
      };
    }
    return { error: 'Unexpected error. Please try again or contact support.' };
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await logoutRequest(refreshToken).catch(() => undefined);
  }
  await clearSession();
  redirect('/sign-in');
}

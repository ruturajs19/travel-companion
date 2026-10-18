import { exchangeCodeRequest } from '@/lib/auth-api';
import { setSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<never> {
  const params = await searchParams;

  const code =
    typeof params.code === 'string' ? params.code : undefined;

  if (!code) {
    redirect('/sign-in?error=oauth');
  }

  let tokens;
  try {
    tokens = await exchangeCodeRequest(code);
  } catch {
    redirect('/sign-in?error=oauth');
  }

  await setSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  });
  redirect('/dashboard');
}

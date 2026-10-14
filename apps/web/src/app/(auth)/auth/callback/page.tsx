import { setSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<never> {
  const params = await searchParams;

  const accessToken =
    typeof params.accessToken === 'string' ? params.accessToken : undefined;
  const refreshToken =
    typeof params.refreshToken === 'string' ? params.refreshToken : undefined;
  const expiresInRaw =
    typeof params.expiresIn === 'string' ? params.expiresIn : undefined;

  if (!accessToken || !refreshToken) {
    redirect('/sign-in?error=oauth');
  }

  const expiresIn = Number.parseInt(expiresInRaw ?? '900', 10);
  await setSession({
    accessToken,
    refreshToken,
    expiresIn: Number.isNaN(expiresIn) ? 900 : expiresIn,
  });
  redirect('/dashboard');
}

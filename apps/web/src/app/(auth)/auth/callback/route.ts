import { exchangeCodeRequest } from '@/lib/auth-api';
import { setSession } from '@/lib/session';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/sign-in?error=oauth', request.url));
  }

  try {
    const tokens = await exchangeCodeRequest(code);
    await setSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch {
    return NextResponse.redirect(new URL('/sign-in?error=oauth', request.url));
  }
}

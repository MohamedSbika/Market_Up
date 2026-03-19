/**
 * MARKET-UP — Next.js middleware
 * Protects /dashboard/* and /admin/* via NextAuth v5 auth() export.
 * Unauthenticated requests are redirected to /signin.
 */
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow if authenticated
  if (req.auth) return NextResponse.next();

  // Redirect to sign-in with callbackUrl
  const signInUrl = new URL('/signin', req.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};

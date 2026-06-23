import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): Response {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // Pre-auth flows that must work without a session cookie.
    // The session cookie is only required for routes inside the
    // (protected) group (admin shell), enforced by the layout guard.
    if (
      pathname === '/admin/login' ||
      pathname === '/admin/forgot-password' ||
      pathname === '/admin/reset-password'
    ) {
      return NextResponse.next();
    }
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ??
      request.cookies.get('__Secure-better-auth.session_token');
    if (sessionCookie === undefined) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/admin/:path*', '/admin'],
};

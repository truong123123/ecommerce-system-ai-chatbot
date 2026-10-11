import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route Guard protecting private routes (/account)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/account'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, string[]> = {
  '/customer': ['CUSTOMER', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/counter': ['COUNTER', 'ADMIN'],
  '/land-owner': ['LAND_OWNER', 'ADMIN'],
  '/washer': ['WASHER', 'ADMIN'],
};

// Public routes that don't require authentication
const publicRoutes = ['/', '/sign-in', '/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if it's a public route
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    // No token - redirect to sign-in
    if (!token) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Token exists - let the client-side AuthProvider handle role validation
    // The token is verified in the API routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

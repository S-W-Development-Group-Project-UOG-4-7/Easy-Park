import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes: { path: string; roles: string[] }[] = [
  { path: '/customer', roles: ['CUSTOMER', 'ADMIN'] },
  { path: '/admin', roles: ['ADMIN'] },
  { path: '/counter', roles: ['COUNTER', 'ADMIN'] },
  { path: '/land-owner', roles: ['LAND_OWNER', 'ADMIN'] },
  { path: '/washer', roles: ['WASHER', 'ADMIN'] },
];

// Public routes that don't require authentication
const publicRoutes = ['/', '/sign-in', '/sign-up', '/api/auth/sign-in', '/api/auth/sign-up', '/api/auth/sign-out'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth/'))) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // Check if the route is protected
  const protectedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));

  if (protectedRoute) {
    // No token - redirect to sign-in
    if (!token) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Verify token and check role
    try {
      // Decode JWT payload (without verification - verification happens in API routes)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userRole = payload.role;

      // Check if user has required role for this route
      if (!protectedRoute.roles.includes(userRole)) {
        // Redirect to appropriate page based on their role
        const roleRedirects: Record<string, string> = {
          ADMIN: '/admin',
          CUSTOMER: '/customer',
          COUNTER: '/counter',
          LAND_OWNER: '/land-owner',
          WASHER: '/washer',
        };
        const redirectPath = roleRedirects[userRole] || '/';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch (error) {
      // Invalid token - redirect to sign-in
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      // Clear the invalid token
      response.cookies.set('token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

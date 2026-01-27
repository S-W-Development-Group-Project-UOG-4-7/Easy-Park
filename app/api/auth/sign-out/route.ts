import { NextRequest } from 'next/server';
import { successResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * POST /api/auth/sign-out
 * Clears the authentication token from cookies to end the session.
 */
export async function POST(request: NextRequest) {
  try {
    const response = successResponse(null, 'Signed out successfully');

    // Clear the 'token' cookie by setting its expiration to the past
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Immediate expiration
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return serverErrorResponse('Failed to sign out');
  }
}
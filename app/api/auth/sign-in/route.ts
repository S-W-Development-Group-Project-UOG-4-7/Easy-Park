import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * POST /api/auth/sign-in
 * Authenticates credentials and establishes a session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // 2. Database Lookup
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // 3. Password Verification (using bcryptjs via lib/auth.ts)
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // 4. Token Generation
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'CUSTOMER',
    });

    // 5. Prepare Response
    const response = successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        token,
      },
      'Signed in successfully'
    );

    // 6. Set HTTP-Only Cookie for session persistence
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return serverErrorResponse('Failed to sign in');
  }
}
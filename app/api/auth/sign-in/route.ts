import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';
import { mapUserForClient } from '@/lib/user-roles';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const password = String(body?.password ?? '');

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    const emailLower = email.toLowerCase();

    // Find user in database
    const user = await prisma.users.findUnique({
      where: { email: emailLower },
      include: {
        roles: { include: { role: true } },
        vehicles: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const clientUser = mapUserForClient(user);
    const token = generateToken({
      userId: clientUser.id,
      email: clientUser.email,
      role: clientUser.role,
    });

    const response = successResponse(
      {
        user: clientUser,
        token,
      },
      'Signed in successfully'
    );

    // Set cookie
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

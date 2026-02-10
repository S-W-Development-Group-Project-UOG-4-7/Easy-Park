import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Allow a hardcoded demo customer login
    if (email === 'customer@gmail.com' && password === '123456') {
      const demoUser = {
        id: 'hardcoded-customer',
        email: 'customer@gmail.com',
        fullName: 'Demo Customer',
        contactNo: '0000000000',
        vehicleNumber: 'ABC-1234',
        role: 'CUSTOMER',
      } as any;

      const token = generateToken({
        userId: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
      });

      const response = successResponse(
        {
          user: demoUser,
          token,
        },
        'Signed in successfully (demo)'
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    const emailLower = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

    // Find user in database
    let user = await prisma.users.findUnique({
      where: { email: emailLower },
    });

    // If admin is trying to log in and isn't found, retry after seeding.
    if (!user && adminEmail && emailLower === adminEmail) {
      await ensureAdminSeeded();
      user = await prisma.users.findUnique({ where: { email: emailLower } });
    }

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          contactNo: user.contactNo,
          vehicleNumber: user.vehicleNumber,
          role: user.role,
        },
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

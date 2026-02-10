import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto'; 
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';

/**
 * POST /api/auth/sign-up
 * Handles new user registration, hashes passwords, and sets an auth cookie.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const { email, password, fullName, contactNo, vehicleNumber, nic } = body;

    // 1. Basic Validation
    if (!email || !password || !fullName) {
      return errorResponse('Email, password, and full name are required');
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    // 2. Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          ...(nic ? [{ nic }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return errorResponse('Email already registered');
      }
      if (nic && existingUser.nic === nic) {
        return errorResponse('NIC already registered');
      }
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 5. Create user
    // Added updatedAt: new Date() to satisfy the Prisma validation
    const user = await prisma.users.create({
      data: {
        id: randomUUID(), 
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        contactNo,
        vehicleNumber,
        nic,
        role: 'CUSTOMER',
        updatedAt: new Date(), // Manually providing current timestamp
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        contactNo: true,
        vehicleNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // 6. Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'CUSTOMER',
    });

    const response = successResponse(
      {
        user,
        token,
      },
      'Account created successfully'
    );

    // 7. Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    return serverErrorResponse('Failed to create account');
  }
}

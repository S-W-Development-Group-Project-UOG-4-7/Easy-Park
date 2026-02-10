import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto'; 
import { Prisma } from '@prisma/client';
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
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    const fullName = String(body?.fullName ?? '').trim();
    const contactNoRaw = String(body?.contactNo ?? '').trim();
    const vehicleNumberRaw = String(body?.vehicleNumber ?? '').trim();
    const nicRaw = String(body?.nic ?? '').trim();
    const contactNo = contactNoRaw || null;
    const vehicleNumber = vehicleNumberRaw || null;
    const nic = nicRaw || null;

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
          { email },
          ...(nic ? [{ nic }] : []),
          ...(contactNo ? [{ contactNo }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        nic: true,
        contactNo: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse('Email already registered');
      }
      if (nic && existingUser.nic === nic) {
        return errorResponse('NIC already registered');
      }
      if (contactNo && existingUser.contactNo === contactNo) {
        return errorResponse('Contact number already registered');
      }
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 5. Create user
    // Added updatedAt: new Date() to satisfy the Prisma validation
    const user = await prisma.users.create({
      data: {
        id: randomUUID(), 
        email,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('Email, NIC, or contact number already registered');
    }
    console.error('Sign up error:', error);
    return serverErrorResponse('Failed to create account');
  }
}

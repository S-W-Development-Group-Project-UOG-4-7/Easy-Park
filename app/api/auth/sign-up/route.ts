import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';
import { assignRoleToUser, mapUserForClient } from '@/lib/user-roles';

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
          ...(contactNo ? [{ phone: contactNo }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        nic: true,
        phone: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse('Email already registered');
      }
      if (nic && existingUser.nic === nic) {
        return errorResponse('NIC already registered');
      }
      if (contactNo && existingUser.phone === contactNo) {
        return errorResponse('Contact number already registered');
      }
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 5. Create user
    // Added updatedAt: new Date() to satisfy the Prisma validation
    const createdUser = await prisma.users.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        phone: contactNo,
        nic,
      },
      include: { roles: { include: { role: true } }, vehicles: true },
    });

    await assignRoleToUser(createdUser.id, 'CUSTOMER');

    if (vehicleNumber) {
      await prisma.vehicles.create({
        data: {
          userId: createdUser.id,
          vehicleNumber,
        },
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: createdUser.id },
      include: {
        roles: { include: { role: true } },
        vehicles: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!user) {
      return serverErrorResponse('Failed to create account');
    }

    // 6. Generate JWT token
    const clientUser = mapUserForClient(user);
    const token = generateToken({
      userId: clientUser.id,
      email: clientUser.email,
      role: clientUser.role || 'CUSTOMER',
    });

    const response = successResponse(
      {
        user: clientUser,
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

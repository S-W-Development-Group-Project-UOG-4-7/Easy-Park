import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// Valid roles
const VALID_ROLES = ['ADMIN', 'CUSTOMER', 'COUNTER', 'LAND_OWNER', 'WASHER'] as const;
type Role = typeof VALID_ROLES[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, contactNo, vehicleNumber, nic, role } = body;

    // Validation
    if (!email || !password || !fullName) {
      return errorResponse('Email, password, and full name are required');
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    // Validate role if provided
    const userRole: Role = role && VALID_ROLES.includes(role) ? role : 'CUSTOMER';

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        contactNo,
        vehicleNumber,
        nic,
        role: userRole,
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

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = successResponse(
      {
        user,
        token,
      },
      'Account created successfully'
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
    console.error('Sign up error:', error);
    return serverErrorResponse('Failed to create account');
  }
}

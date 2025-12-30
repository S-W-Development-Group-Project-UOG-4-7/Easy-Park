import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
<<<<<<< HEAD
    const { email, password, fullName, contactNo, vehicleNumber, nic, role } = body;

=======
<<<<<<< HEAD
    const { email, password, fullName, contactNo, vehicleNumber, nic, role } = body;

    // Validate role
    const validRoles = ['ADMIN', 'CUSTOMER', 'COUNTER', 'LAND_OWNER', 'WASHER'];
    const userRole = validRoles.includes(role) ? role : 'CUSTOMER';
=======
    const { email, password, fullName, contactNo, vehicleNumber, nic } = body;
>>>>>>> e199644a47d9c5dcf8e7365e241b056f4998bf09

>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
    // Validation
    if (!email || !password || !fullName) {
      return errorResponse('Email, password, and full name are required');
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

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

<<<<<<< HEAD
    // Validate role
    const validRoles = ['ADMIN', 'CUSTOMER', 'COUNTER', 'LAND_OWNER', 'WASHER'];
    const userRole = role && validRoles.includes(role) ? role : 'CUSTOMER';

=======
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        contactNo,
        vehicleNumber,
        nic,
<<<<<<< HEAD
        role: userRole,
=======
<<<<<<< HEAD
        role: userRole,
=======
>>>>>>> e199644a47d9c5dcf8e7365e241b056f4998bf09
>>>>>>> 7804710b074a678f7a53c3e46fee4da1ef830302
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

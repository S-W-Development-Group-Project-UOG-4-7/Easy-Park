import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        contactNo: true,
        vehicleNumber: true,
        nic: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return serverErrorResponse('Failed to fetch profile');
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { fullName, contactNo, vehicleNumber } = body;

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(fullName && { fullName }),
        ...(contactNo && { contactNo }),
        ...(vehicleNumber && { vehicleNumber }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        contactNo: true,
        vehicleNumber: true,
        nic: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}

// PUT change password
export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters');
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { password: hashedPassword },
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse('Failed to change password');
  }
}

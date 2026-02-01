import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET: Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request); // Added await
    
    if (!authUser || !authUser.email) {
      return unauthorizedResponse();
    }

    const user = await prisma.users.findUnique({
      where: { email: authUser.email }, // Fixed: Added where clause
      select: {
        id: true,
        email: true,
        fullName: true,
        contactNo: true,
        nic: true,
        address: true,
        vehicleNumber: true,
        vehicleType: true,
        vehicleModel: true,
        vehicleColor: true,
        // Exclude password
      }
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

// PUT: Update User Profile (Matches your Frontend 'PUT' call)
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request); // Added await
    
    if (!authUser || !authUser.email) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    
    // Extract all fields sent from the frontend
    const { 
      fullName, 
      contactNo, 
      nic, 
      address, 
      vehicleNumber, 
      vehicleType, 
      vehicleModel, 
      vehicleColor 
    } = body;

    // Determine user ID (using email from token to be safe)
    const existingUser = await prisma.users.findUnique({
        where: { email: authUser.email }
    });

    if (!existingUser) return unauthorizedResponse('User not found');

    // Perform the Update
    const updatedUser = await prisma.users.update({
      where: { id: existingUser.id },
      data: {
        fullName,
        contactNo,
        nic,
        address,
        vehicleNumber,
        vehicleType,
        vehicleModel,
        vehicleColor,
        updatedAt: new Date(),
      },
    });

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}

// PATCH: Change Password (Optional - moved here to avoid conflict)
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request); // Added await
    
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
    const user = await prisma.users.findUnique({
      where: { email: authUser.email },
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
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse('Failed to change password');
  }
}
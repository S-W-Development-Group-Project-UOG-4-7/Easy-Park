import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const user = await prisma.users.findUnique({
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
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return serverErrorResponse('Failed to get user');
  }
}

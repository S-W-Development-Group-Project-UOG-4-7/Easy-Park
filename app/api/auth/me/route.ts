import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';
import { mapUserForClient } from '@/lib/user-roles';

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile information.
 */
export async function GET(request: NextRequest) {
  try {
    await ensureAdminSeeded();
    // 1. Get authenticated user payload from the request (Cookies/Header)
    const authUser = getAuthUser(request);
    
    // 2. If no valid token is found, return 401
    if (!authUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // 3. Fetch fresh user data from the database using the ID from the token
    const user = await prisma.users.findUnique({
      where: { id: authUser.userId },
      include: {
        roles: { include: { role: true } },
        vehicles: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    // 4. Handle case where user exists in token but not in database
    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // 5. Return success with user data
    return successResponse(mapUserForClient(user));
  } catch (error) {
    console.error('Get current user error:', error);
    return serverErrorResponse('Failed to get user details');
  }
}

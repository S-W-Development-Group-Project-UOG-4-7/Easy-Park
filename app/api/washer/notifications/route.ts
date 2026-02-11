import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, unauthorizedResponse, serverErrorResponse, successResponse } from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notifications.findMany({
      where: {
        userId: auth.userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const payload = notifications.map((note) => ({
      id: note.id,
      type: note.isRead ? 'info' : 'new_booking',
      message: note.message || note.title,
      createdAt: note.createdAt,
      read: note.isRead,
      bookingId: null,
    }));

    return successResponse(
      {
        notifications: payload,
        unreadCount: payload.filter((item) => !item.read).length,
      },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    console.error('Notification API Error:', error);
    return serverErrorResponse('Failed to fetch notifications');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const result = await prisma.notifications.updateMany({
      where: { userId: auth.userId, isRead: false },
      data: { isRead: true },
    });

    return successResponse({ updated: result.count }, 'All notifications marked as read');
  } catch (error) {
    console.error('Notification PATCH Error:', error);
    return serverErrorResponse('Failed to update notifications');
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const notification = await prisma.notifications.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!notification) return notFoundResponse('Notification not found');
    return successResponse(notification, 'Notification retrieved successfully');
  } catch (error) {
    console.error('Error fetching notification:', error);
    return serverErrorResponse('Failed to fetch notification');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const read = body?.read;
    if (typeof read !== 'boolean') {
      return errorResponse('Missing or invalid required field: read (must be boolean)');
    }

    const notification = await prisma.notifications.findFirst({
      where: { id, userId: auth.userId },
      select: { id: true },
    });
    if (!notification) return notFoundResponse('Notification not found');

    const updated = await prisma.notifications.update({
      where: { id },
      data: { isRead: read },
    });

    return successResponse(updated, `Notification marked as ${read ? 'read' : 'unread'}`);
  } catch (error) {
    console.error('Error updating notification:', error);
    return serverErrorResponse('Failed to update notification');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (auth.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete notifications.', 403);
    }

    const { id } = await params;
    const notification = await prisma.notifications.findUnique({ where: { id }, select: { id: true } });
    if (!notification) return notFoundResponse('Notification not found');

    await prisma.notifications.delete({ where: { id } });
    return successResponse({ id }, 'Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return serverErrorResponse('Failed to delete notification');
  }
}

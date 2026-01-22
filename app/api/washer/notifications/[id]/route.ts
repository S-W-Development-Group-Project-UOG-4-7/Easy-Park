import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/notifications/:id
 * Fetch a single notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access notifications
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;

    const notification = await prisma.washerNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    return successResponse(notification, 'Notification retrieved successfully');
  } catch (error) {
    console.error('Error fetching notification:', error);
    return serverErrorResponse('Failed to fetch notification');
  }
}

/**
 * PATCH /api/washer/notifications/:id
 * Mark a single notification as read/unread
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can update notifications
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { read } = body;

    if (typeof read !== 'boolean') {
      return errorResponse('Missing or invalid required field: read (must be boolean)');
    }

    const notification = await prisma.washerNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    const updatedNotification = await prisma.washerNotification.update({
      where: { id },
      data: { read },
    });

    return successResponse(
      updatedNotification,
      `Notification marked as ${read ? 'read' : 'unread'}`
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return serverErrorResponse('Failed to update notification');
  }
}

/**
 * DELETE /api/washer/notifications/:id
 * Delete a single notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only ADMIN can delete notifications
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete notifications.', 403);
    }

    const { id } = await params;

    const notification = await prisma.washerNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    await prisma.washerNotification.delete({
      where: { id },
    });

    return successResponse({ id }, 'Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return serverErrorResponse('Failed to delete notification');
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/notifications
 * Fetch all notifications for the washer dashboard
 * 
 * Query Parameters:
 * - unreadOnly: Set to 'true' to fetch only unread notifications
 * - limit: Number of notifications to fetch (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access notifications
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build where clause
    const whereClause: any = {};

    if (unreadOnly) {
      whereClause.read = false;
    }

    const notifications = await prisma.washerNotification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.washerNotification.count({
      where: { read: false },
    });

    return successResponse(
      {
        notifications,
        unreadCount,
      },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return serverErrorResponse('Failed to fetch notifications');
  }
}

/**
 * POST /api/washer/notifications
 * Create a new notification (internal use or admin)
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only ADMIN can create notifications manually
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can create notifications.', 403);
    }

    const body = await request.json();
    const { type, message, bookingId } = body;

    // Validate required fields
    if (!type || !message) {
      return errorResponse('Missing required fields: type, message');
    }

    // Validate notification type
    const validTypes = ['new_booking', 'urgent_reminder', 'upcoming_slot'];
    if (!validTypes.includes(type)) {
      return errorResponse(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    }

    const notification = await prisma.washerNotification.create({
      data: {
        type,
        message,
        bookingId: bookingId || null,
        read: false,
      },
    });

    return createdResponse(notification, 'Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
    return serverErrorResponse('Failed to create notification');
  }
}

/**
 * PATCH /api/washer/notifications
 * Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can mark notifications as read
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    // Mark all unread notifications as read
    const result = await prisma.washerNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    return successResponse(
      { updatedCount: result.count },
      `${result.count} notifications marked as read`
    );
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return serverErrorResponse('Failed to mark notifications as read');
  }
}

/**
 * DELETE /api/washer/notifications
 * Clear all read notifications (cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only ADMIN can delete notifications
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete notifications.', 403);
    }

    // Delete all read notifications
    const result = await prisma.washerNotification.deleteMany({
      where: { read: true },
    });

    return successResponse(
      { deletedCount: result.count },
      `${result.count} read notifications deleted`
    );
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return serverErrorResponse('Failed to delete notifications');
  }
}

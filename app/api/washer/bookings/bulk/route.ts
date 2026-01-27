import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type BulkAction = 'accept' | 'confirm' | 'cancel';

interface BulkUpdateResult {
  success: Array<{ id: string; status: string }>;
  failed: Array<{ id: string; reason: string }>;
}

/**
 * PATCH /api/washer/bookings/bulk
 * Accept, confirm, or cancel multiple bookings at once
 * 
 * Request body:
 * {
 *   "ids": ["booking-id-1", "booking-id-2"],
 *   "action": "accept" | "confirm" | "cancel"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can bulk update bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const body = await request.json();
    const { ids, action } = body;

    // Validate required fields
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Missing or invalid required field: ids (must be a non-empty array)');
    }

    if (!action || !['accept', 'confirm', 'cancel'].includes(action)) {
      return errorResponse('Missing or invalid required field: action (must be "accept", "confirm", or "cancel")');
    }

    const result: BulkUpdateResult = {
      success: [],
      failed: [],
    };

    // Process each booking
    for (const id of ids) {
      try {
        const booking = await prisma.washer_bookings.findUnique({
          where: { id },
        });

        if (!booking) {
          result.failed.push({ id, reason: 'Booking not found' });
          continue;
        }

        let newStatus: string;
        let isValidTransition = false;

        switch (action as BulkAction) {
          case 'accept':
            // PENDING → ACCEPTED
            if (booking.status === 'PENDING') {
              newStatus = 'ACCEPTED';
              isValidTransition = true;
            } else {
              result.failed.push({
                id,
                reason: `Cannot accept booking with status "${booking.status}". Only PENDING bookings can be accepted.`,
              });
            }
            break;

          case 'confirm':
            // ACCEPTED → COMPLETED
            if (booking.status === 'ACCEPTED') {
              newStatus = 'COMPLETED';
              isValidTransition = true;
            } else {
              result.failed.push({
                id,
                reason: `Cannot complete booking with status "${booking.status}". Only ACCEPTED bookings can be completed.`,
              });
            }
            break;

          case 'cancel':
            // Any (except COMPLETED/CANCELLED) → CANCELLED
            if (booking.status === 'COMPLETED') {
              result.failed.push({
                id,
                reason: 'Cannot cancel a booking that has already been completed.',
              });
            } else if (booking.status === 'CANCELLED') {
              result.failed.push({
                id,
                reason: 'This booking is already cancelled.',
              });
            } else {
              newStatus = 'CANCELLED';
              isValidTransition = true;
            }
            break;
        }

        if (isValidTransition && newStatus!) {
          const updatedBooking = await prisma.washer_bookings.update({
            where: { id },
            data: { status: newStatus as any },
          });
          result.success.push({ id: updatedBooking.id, status: updatedBooking.status });
        }
      } catch (err) {
        result.failed.push({ id, reason: 'Database error occurred' });
      }
    }

    const message = `Bulk ${action} completed. ${result.success.length} succeeded, ${result.failed.length} failed.`;
    return successResponse(result, message);
  } catch (error) {
    console.error('Error in bulk booking update:', error);
    return serverErrorResponse('Failed to perform bulk booking update');
  }
}

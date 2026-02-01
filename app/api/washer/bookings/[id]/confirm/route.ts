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
 * PATCH /api/washer/bookings/:id/confirm
 * Update booking status to "COMPLETED"
 * Valid transition: ACCEPTED → COMPLETED
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

    // Only WASHER, ADMIN, and COUNTER roles can confirm/complete bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;

    // Find the booking
    const booking = await prisma.washerBooking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Validate status transition: Only ACCEPTED can be marked COMPLETED
    if (booking.status !== 'ACCEPTED') {
      return errorResponse(
        `Invalid status transition. Cannot complete a booking with status "${booking.status}". Only ACCEPTED bookings can be completed.`,
        400
      );
    }

    // Update the booking status to COMPLETED
    const updatedBooking = await prisma.washerBooking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            vehicleDetails: true,
          },
        },
      },
    });

    return successResponse(updatedBooking, 'Booking completed successfully');
  } catch (error) {
    console.error('Error completing washer booking:', error);
    return serverErrorResponse('Failed to complete washer booking');
  }
}

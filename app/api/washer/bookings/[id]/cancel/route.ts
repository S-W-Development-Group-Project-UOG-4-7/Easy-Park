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
 * PATCH /api/washer/bookings/:id/cancel
 * Update booking status to "CANCELLED"
 * Valid transition: Any status → CANCELLED
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

    // Only WASHER, ADMIN, and COUNTER roles can cancel bookings
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

    // Cannot cancel an already completed or cancelled booking
    if (booking.status === 'COMPLETED') {
      return errorResponse(
        'Cannot cancel a booking that has already been completed.',
        400
      );
    }

    if (booking.status === 'CANCELLED') {
      return errorResponse(
        'This booking is already cancelled.',
        400
      );
    }

    // Update the booking status to CANCELLED
    const updatedBooking = await prisma.washerBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
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

    return successResponse(updatedBooking, 'Booking cancelled successfully');
  } catch (error) {
    console.error('Error cancelling washer booking:', error);
    return serverErrorResponse('Failed to cancel washer booking');
  }
}

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
 * PATCH /api/washer/bookings/:id/accept
 * Update booking status to "ACCEPTED"
 * Valid transition: PENDING → ACCEPTED
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

    // Only WASHER, ADMIN, and COUNTER roles can accept bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;

    // Find the booking
    const booking = await prisma.washer_bookings.findUnique({
      where: { id },
      include: { washer_customers: true },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Validate status transition: Only PENDING can be ACCEPTED
    if (booking.status !== 'PENDING') {
      return errorResponse(
        `Invalid status transition. Cannot accept a booking with status "${booking.status}". Only PENDING bookings can be accepted.`,
        400
      );
    }

    // Update the booking status to ACCEPTED
    const updatedBooking = await prisma.washer_bookings.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
      },
      include: {
        washer_customers: {
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

    return successResponse(updatedBooking, 'Booking accepted successfully');
  } catch (error) {
    console.error('Error accepting washer booking:', error);
    return serverErrorResponse('Failed to accept washer booking');
  }
}

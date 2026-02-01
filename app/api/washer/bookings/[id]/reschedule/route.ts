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
 * PATCH /api/washer/bookings/:id/reschedule
 * Update the slotTime for a booking
 * Only PENDING or ACCEPTED bookings can be rescheduled
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

    // Only WASHER, ADMIN, and COUNTER roles can reschedule bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { slotTime } = body;

    // Validate required field
    if (!slotTime) {
      return errorResponse('Missing required field: slotTime');
    }

    // Validate the new slot time is a valid date
    const newSlotTime = new Date(slotTime);
    if (isNaN(newSlotTime.getTime())) {
      return errorResponse('Invalid slotTime format. Please provide a valid date/time.');
    }

    // Ensure the new slot time is in the future
    if (newSlotTime <= new Date()) {
      return errorResponse('Cannot reschedule to a past date/time.');
    }

    // Find the booking
    const booking = await prisma.washerBooking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Only PENDING or ACCEPTED bookings can be rescheduled
    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return errorResponse(
        `Cannot reschedule a booking with status "${booking.status}". Only PENDING or ACCEPTED bookings can be rescheduled.`,
        400
      );
    }

    // Update the booking's slot time
    const updatedBooking = await prisma.washerBooking.update({
      where: { id },
      data: {
        slotTime: newSlotTime,
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

    return successResponse(updatedBooking, 'Booking rescheduled successfully');
  } catch (error) {
    console.error('Error rescheduling washer booking:', error);
    return serverErrorResponse('Failed to reschedule washer booking');
  }
}

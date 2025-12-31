import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET a single booking by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
      include: {
        slots: {
          include: {
            slot: {
              include: {
                location: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    return successResponse(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return serverErrorResponse('Failed to fetch booking');
  }
}

// PATCH update a booking (e.g., cancel)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Find the booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!existingBooking) {
      return notFoundResponse('Booking not found');
    }

    // Validate status transition
    const validStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse('Invalid status');
    }

    // Cannot modify completed or cancelled bookings
    if (existingBooking.status === 'COMPLETED' || existingBooking.status === 'CANCELLED') {
      return errorResponse('Cannot modify a completed or cancelled booking');
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        slots: {
          include: {
            slot: true,
          },
        },
        payment: true,
      },
    });

    return successResponse(booking, 'Booking updated successfully');
  } catch (error) {
    console.error('Update booking error:', error);
    return serverErrorResponse('Failed to update booking');
  }
}

// DELETE a booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!existingBooking) {
      return notFoundResponse('Booking not found');
    }

    // Only allow deletion of pending bookings
    if (existingBooking.status !== 'PENDING') {
      return errorResponse('Only pending bookings can be deleted');
    }

    await prisma.booking.delete({
      where: { id },
    });

    return successResponse(null, 'Booking deleted successfully');
  } catch (error) {
    console.error('Delete booking error:', error);
    return serverErrorResponse('Failed to delete booking');
  }
}

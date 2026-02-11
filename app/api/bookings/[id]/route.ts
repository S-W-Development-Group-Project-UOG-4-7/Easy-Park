import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';
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

async function resolveUserId(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) return authUser.userId;
  if (!authUser.email) return null;
  const user = await prisma.users.findUnique({
    where: { email: authUser.email.toLowerCase() },
    select: { id: true },
  });
  return user?.id || null;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const userId = await resolveUserId(authUser);
    if (!userId) return unauthorizedResponse('User not found');

    const { id } = await params;
    const booking = await prisma.bookings.findFirst({
      where: { id, customerId: userId },
      include: {
        property: true,
        bookingSlots: {
          include: {
            slot: true,
            washJob: true,
          },
        },
        paymentSummary: true,
        payments: true,
      },
    });
    if (!booking) return notFoundResponse('Booking not found');

    return successResponse(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return serverErrorResponse('Failed to fetch booking');
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const userId = await resolveUserId(authUser);
    if (!userId) return unauthorizedResponse('User not found');

    const { id } = await params;
    const body = await request.json();
    const status = String(body?.status || '').toUpperCase();

    const existingBooking = await prisma.bookings.findFirst({
      where: { id, customerId: userId },
      select: { id: true, status: true },
    });
    if (!existingBooking) return notFoundResponse('Booking not found');

    if (status && !['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      return errorResponse('Invalid status');
    }
    if (existingBooking.status === 'CANCELLED') {
      return errorResponse('Cannot modify a cancelled booking');
    }

    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.bookings.update({
        where: { id },
        data: { status: (status || existingBooking.status) as BookingStatus },
      });

      if (status && status !== existingBooking.status) {
        await tx.booking_status_history.create({
          data: {
            bookingId: id,
            oldStatus: existingBooking.status,
            newStatus: status,
            changedBy: userId,
            note: 'Updated by customer',
          },
        });
      }

      return updated;
    });

    return successResponse(booking, 'Booking updated successfully');
  } catch (error) {
    console.error('Update booking error:', error);
    return serverErrorResponse('Failed to update booking');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const userId = await resolveUserId(authUser);
    if (!userId) return unauthorizedResponse('User not found');

    const { id } = await params;
    const existingBooking = await prisma.bookings.findFirst({
      where: { id, customerId: userId },
      select: { id: true, status: true },
    });
    if (!existingBooking) return notFoundResponse('Booking not found');
    if (existingBooking.status !== 'PENDING') {
      return errorResponse('Only pending bookings can be deleted');
    }

    await prisma.bookings.delete({ where: { id } });
    return successResponse(null, 'Booking deleted successfully');
  } catch (error) {
    console.error('Delete booking error:', error);
    return serverErrorResponse('Failed to delete booking');
  }
}

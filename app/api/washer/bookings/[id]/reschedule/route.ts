import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, mapWashJobToWasherBooking, resolveWasherUser } from '@/app/api/washer/utils';

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
    const slotTime = String(body?.slotTime || '').trim();
    if (!slotTime) return errorResponse('Missing required field: slotTime');

    const newStart = new Date(slotTime);
    if (Number.isNaN(newStart.getTime())) return errorResponse('Invalid slotTime format.');
    if (newStart <= new Date()) return errorResponse('Cannot reschedule to a past date/time.');

    const existing = await prisma.wash_jobs.findUnique({
      where: { id },
      include: {
        bookingSlot: {
          include: {
            booking: { select: { id: true, status: true, endTime: true, startTime: true } },
          },
        },
      },
    });
    if (!existing) return notFoundResponse('Booking not found');
    if (existing.bookingSlot.booking.status === 'CANCELLED') {
      return errorResponse('Cannot reschedule a cancelled booking.', 400);
    }
    if (!['PENDING', 'ACCEPTED'].includes(existing.status)) {
      return errorResponse(`Cannot reschedule a booking with status "${existing.status}".`, 400);
    }

    const durationMs =
      existing.bookingSlot.booking.endTime.getTime() - existing.bookingSlot.booking.startTime.getTime();
    const newEnd = new Date(newStart.getTime() + Math.max(durationMs, 60 * 60 * 1000));

    await prisma.bookings.update({
      where: { id: existing.bookingSlot.booking.id },
      data: {
        startTime: newStart,
        endTime: newEnd,
      },
    });

    const updated = await prisma.wash_jobs.findUnique({
      where: { id },
      include: {
        bookingSlot: {
          include: {
            slot: { select: { slotType: true } },
            booking: {
              include: {
                customer: { select: { id: true, fullName: true, email: true, phone: true } },
                vehicle: { select: { vehicleNumber: true } },
              },
            },
          },
        },
      },
    });

    if (!updated) return notFoundResponse('Booking not found');
    return successResponse(mapWashJobToWasherBooking(updated), 'Booking rescheduled successfully');
  } catch (error) {
    console.error('Error rescheduling washer booking:', error);
    return serverErrorResponse('Failed to reschedule washer booking');
  }
}

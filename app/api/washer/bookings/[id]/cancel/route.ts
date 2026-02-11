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
    const existing = await prisma.wash_jobs.findUnique({
      where: { id },
      include: {
        bookingSlot: {
          include: {
            booking: { select: { id: true, status: true, customerId: true } },
          },
        },
      },
    });
    if (!existing) return notFoundResponse('Booking not found');
    if (existing.bookingSlot.booking.status === 'CANCELLED') {
      return errorResponse('This booking is already cancelled.', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.bookings.update({
        where: { id: existing.bookingSlot.booking.id },
        data: { status: 'CANCELLED' },
      });
      await tx.booking_status_history.create({
        data: {
          bookingId: existing.bookingSlot.booking.id,
          oldStatus: existing.bookingSlot.booking.status,
          newStatus: 'CANCELLED',
          changedBy: auth.userId,
          note: 'Cancelled from washer dashboard',
        },
      });
      await tx.notifications.create({
        data: {
          userId: existing.bookingSlot.booking.customerId,
          title: 'Car Wash Booking Cancelled',
          message: `Your wash booking BK-${existing.bookingSlot.booking.id.slice(-6).toUpperCase()} was cancelled by washer operations.`,
        },
      });
      return tx.wash_jobs.update({
        where: { id: existing.id },
        data: {
          note: existing.note ? `${existing.note}\nCancelled by washer.` : 'Cancelled by washer.',
        },
        include: {
          bookingSlot: {
            include: {
              slot: { select: { slotType: true } },
              booking: {
                include: {
                  customer: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                      vehicles: {
                        select: {
                          vehicleNumber: true,
                          type: true,
                          createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                  vehicle: {
                    select: {
                      vehicleNumber: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    return successResponse(mapWashJobToWasherBooking(updated), 'Booking cancelled successfully');
  } catch (error) {
    console.error('Error cancelling washer booking:', error);
    return serverErrorResponse('Failed to cancel washer booking');
  }
}

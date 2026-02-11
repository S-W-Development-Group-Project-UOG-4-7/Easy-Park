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
            booking: { select: { status: true } },
          },
        },
      },
    });
    if (!existing) return notFoundResponse('Booking not found');
    if (existing.bookingSlot.booking.status === 'CANCELLED') {
      return errorResponse('Cannot complete a cancelled booking.', 400);
    }
    if (existing.status !== 'ACCEPTED') {
      return errorResponse(
        `Cannot complete a booking with status "${existing.status}". Only ACCEPTED bookings can be completed.`,
        400
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.wash_jobs.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          washerId: auth.userId,
          completedAt: new Date(),
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

      await tx.notifications.create({
        data: {
          userId: next.bookingSlot.booking.customer.id,
          title: 'Car Wash Completed',
          message: `Your wash job is completed for booking BK-${next.bookingSlot.booking.id.slice(-6).toUpperCase()}.`,
        },
      });

      return next;
    });

    return successResponse(mapWashJobToWasherBooking(updated), 'Booking completed successfully');
  } catch (error) {
    console.error('Error completing washer booking:', error);
    return serverErrorResponse('Failed to complete washer booking');
  }
}

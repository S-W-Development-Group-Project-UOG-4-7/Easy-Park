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

export async function GET(
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
    const job = await prisma.wash_jobs.findUnique({
      where: { id },
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
                  },
                },
                vehicle: { select: { vehicleNumber: true } },
              },
            },
          },
        },
      },
    });

    if (!job) return notFoundResponse('Booking not found');
    return successResponse(mapWashJobToWasherBooking(job), 'Booking retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer booking:', error);
    return serverErrorResponse('Failed to fetch washer booking');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (auth.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete bookings.', 403);
    }

    const { id } = await params;
    const job = await prisma.wash_jobs.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!job) return notFoundResponse('Booking not found');

    await prisma.wash_jobs.delete({ where: { id } });
    return successResponse({ id }, 'Booking deleted successfully');
  } catch (error) {
    console.error('Error deleting washer booking:', error);
    return serverErrorResponse('Failed to delete washer booking');
  }
}

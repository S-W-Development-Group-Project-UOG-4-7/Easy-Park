import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('locationId') || searchParams.get('propertyId');
    const start = searchParams.get('start');
    const duration = Number(searchParams.get('duration') || '0');

    if (!propertyId || !start || !Number.isFinite(duration) || duration <= 0) {
      return errorResponse('locationId/propertyId, start, and duration are required', 400);
    }

    const requestedStart = new Date(start);
    if (Number.isNaN(requestedStart.getTime())) {
      return errorResponse('Invalid start datetime', 400);
    }
    const requestedEnd = new Date(requestedStart);
    requestedEnd.setHours(requestedEnd.getHours() + duration);

    const overlapping = await prisma.bookings.findMany({
      where: {
        propertyId,
        status: { not: 'CANCELLED' },
        startTime: { lt: requestedEnd },
        endTime: { gt: requestedStart },
      },
      include: {
        bookingSlots: {
          select: { slotId: true },
        },
      },
    });

    const occupiedSlotIds = new Set<string>();
    for (const booking of overlapping) {
      for (const bookingSlot of booking.bookingSlots) {
        occupiedSlotIds.add(bookingSlot.slotId);
      }
    }

    return NextResponse.json(
      { success: true, occupiedSlotIds: Array.from(occupiedSlotIds) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[SLOT_AVAILABILITY_ERROR]', error);
    return serverErrorResponse('Failed to fetch availability');
  }
}

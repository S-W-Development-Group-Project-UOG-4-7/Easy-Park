import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const start = searchParams.get('start'); // ISO string
    const duration = searchParams.get('duration'); // hours

    if (!locationId || !start || !duration) {
      return errorResponse('locationId, start, and duration are required', 400);
    }

    const requestedStart = new Date(start);
    if (Number.isNaN(requestedStart.getTime())) {
      return errorResponse('Invalid start datetime', 400);
    }

    const requestedEnd = new Date(requestedStart);
    requestedEnd.setHours(requestedEnd.getHours() + Number(duration));
    const now = new Date();

    const overlapping = await prisma.bookings.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lt: requestedEnd },
        endTime: { gt: requestedStart },
        AND: [
          { endTime: { gt: now } }
        ],
        booking_slots: {
          some: {
            parking_slots: {
              locationId: locationId
            }
          }
        }
      },
      include: {
        booking_slots: {
          select: { slotId: true }
        }
      }
    });

    const occupiedSlotIds = new Set<string>();
    overlapping.forEach((b) => {
      b.booking_slots.forEach((bs) => occupiedSlotIds.add(bs.slotId));
    });

    return NextResponse.json(
      { success: true, occupiedSlotIds: Array.from(occupiedSlotIds) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[SLOT_AVAILABILITY_ERROR]', error);
    return serverErrorResponse('Failed to fetch availability');
  }
}

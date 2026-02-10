import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';

// This endpoint depends on query params (locationId/date) so it must remain dynamic.
// We still apply short caching via Cache-Control headers on the response.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD (optional)

    if (!locationId) {
      return errorResponse('Location ID is required', 400);
    }

    // 1. Fetch all slots for this location
    const slots = await prisma.parking_slots.findMany({
      where: { 
        locationId: locationId 
      },
      orderBy: {
        number: 'asc' // Sort by Slot Number (A1, A2...)
      }
    });

    // 2. Check Availability (Active bookings only)
    // A slot is OCCUPIED only if there's an active booking:
    // startTime <= now < endTime AND status != CANCELLED
    const now = new Date();
    const activeBookings = await prisma.bookings.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lte: now },
        endTime: { gt: now },
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

    // Flatten the list of booked slot IDs
    const bookedSlotIds = new Set<string>();
    activeBookings.forEach(booking => {
      booking.booking_slots.forEach(bs => bookedSlotIds.add(bs.slotId));
    });

    // 3. Map Data for Frontend
    const formattedSlots = slots.map(slot => {
      // If the slot is in the "bookedSlotIds" set, we mark it OCCUPIED
      // OR if the slot is physically under MAINTENANCE in the database
      let status = 'AVAILABLE';
      
      if (slot.status === 'MAINTENANCE') {
        status = 'MAINTENANCE';
      } else if (bookedSlotIds.has(slot.id)) {
        status = 'OCCUPIED';
      }

      return {
        id: slot.id,
        number: slot.number,
        type: slot.type, // 'NORMAL', 'EV', 'CAR_WASH'
        status: status,
        pricePerHour: slot.pricePerHour
      };
    });

    return NextResponse.json(
      { success: true, data: formattedSlots, meta: { now: now.toISOString(), date } },
      { headers: { 'Cache-Control': 'no-store' } }
    );

  } catch (error: any) {
    console.error('[SLOTS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

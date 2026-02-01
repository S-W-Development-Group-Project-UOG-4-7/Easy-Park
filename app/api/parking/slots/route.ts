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
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

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

    // 2. Check Availability (Advanced Logic)
    // To make this realistic, we should check if these slots are booked for the specific date.
    // For now, we will check against the "BookingSlots" table.
    
    // Find all booked slot IDs for this specific date (ignoring cancelled ones)
    const bookingsOnDate = await prisma.bookings.findMany({
      where: {
        // We check if the booking date matches the requested date
        date: new Date(date || new Date().toISOString()),
        status: { not: 'CANCELLED' },
        // Ensure we are looking at bookings that actually use these slots
        // (This part requires joining through booking_slots, but for simplicity
        // in this step, we'll fetch the booked slot IDs below)
      },
      include: {
        booking_slots: {
          select: { slotId: true }
        }
      }
    });

    // Flatten the list of booked slot IDs
    const bookedSlotIds = new Set<string>();
    bookingsOnDate.forEach(booking => {
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
      { success: true, data: formattedSlots },
      { headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30' } }
    );

  } catch (error: any) {
    console.error('[SLOTS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

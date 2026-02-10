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

    // 3. Map Data for Frontend
    const formattedSlots = slots.map(slot => {
      // Occupancy is computed via /api/slots/availability for the requested time window.
      // Here we only reflect physical maintenance status.
      let status = 'AVAILABLE';
      if (slot.status === 'MAINTENANCE') status = 'MAINTENANCE';

      return {
        id: slot.id,
        number: slot.number,
        type: slot.type, // 'NORMAL', 'EV', 'CAR_WASH'
        status: status,
        pricePerHour: slot.pricePerHour
      };
    });

    return NextResponse.json(
      { success: true, data: formattedSlots, meta: { date } },
      { headers: { 'Cache-Control': 'no-store' } }
    );

  } catch (error: any) {
    console.error('[SLOTS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

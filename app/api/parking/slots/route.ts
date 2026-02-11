import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('locationId') || searchParams.get('propertyId');
    const date = searchParams.get('date');

    if (!propertyId) {
      return errorResponse('Location ID is required', 400);
    }

    const slots = await prisma.parking_slots.findMany({
      where: { propertyId },
      orderBy: { slotNumber: 'asc' },
    });

    const occupiedSlotIds = new Set<string>();
    if (date) {
      const day = new Date(date);
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const bookings = await prisma.bookings.findMany({
        where: {
          propertyId,
          status: { not: 'CANCELLED' },
          startTime: { lte: endOfDay },
          endTime: { gte: startOfDay },
        },
        include: {
          bookingSlots: {
            select: { slotId: true },
          },
        },
      });

      for (const booking of bookings) {
        for (const bookingSlot of booking.bookingSlots) {
          occupiedSlotIds.add(bookingSlot.slotId);
        }
      }
    }

    const data = slots.map((slot) => ({
      id: slot.id,
      number: slot.slotNumber,
      type: slot.slotType,
      status: !slot.isActive ? 'MAINTENANCE' : occupiedSlotIds.has(slot.id) ? 'OCCUPIED' : 'AVAILABLE',
      pricePerHour: null,
    }));

    return NextResponse.json(
      { success: true, data, meta: { date } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[SLOTS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SlotTypeValue = 'NORMAL' | 'EV' | 'CAR_WASH';

function parseStart(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function slotTypeValue(raw: string): SlotTypeValue {
  if (raw === 'EV') return 'EV';
  if (raw === 'CAR_WASH') return 'CAR_WASH';
  return 'NORMAL';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const duration = Number(searchParams.get('duration') || '1');

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true },
    });
    if (!property || property.status !== 'ACTIVATED') {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const slots = await prisma.parking_slots.findMany({
      where: { propertyId },
      select: {
        id: true,
        slotNumber: true,
        slotType: true,
        isActive: true,
      },
      orderBy: { slotNumber: 'asc' },
    });

    const occupiedSlotIds = new Set<string>();
    if (date && time && Number.isFinite(duration) && duration > 0) {
      const startTime = parseStart(date, time);
      if (!Number.isNaN(startTime.getTime())) {
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + duration);

        const overlapping = await prisma.bookings.findMany({
          where: {
            propertyId,
            status: { not: 'CANCELLED' },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          include: {
            bookingSlots: {
              select: { slotId: true },
            },
          },
        });
        for (const booking of overlapping) {
          for (const bookingSlot of booking.bookingSlots) {
            occupiedSlotIds.add(bookingSlot.slotId);
          }
        }
      }
    }

    const data = slots.map((slot) => {
      const maintenance = !slot.isActive;
      const occupied = occupiedSlotIds.has(slot.id);
      return {
        id: slot.id,
        number: slot.slotNumber,
        type: slotTypeValue(slot.slotType),
        isBooked: occupied,
        status: maintenance ? 'MAINTENANCE' : occupied ? 'OCCUPIED' : 'AVAILABLE',
      };
    });

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('[PUBLIC_PROPERTY_SLOTS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property slots' },
      { status: 500 }
    );
  }
}

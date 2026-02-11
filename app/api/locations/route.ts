import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export const revalidate = 30;

export async function GET() {
  try {
    const locations = await prisma.properties.findMany({
      include: {
        parkingSlots: {
          select: {
            id: true,
            slotNumber: true,
            slotType: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            parkingSlots: true,
          },
        },
      },
      orderBy: { propertyName: 'asc' },
    });

    const now = new Date();
    const activeBookings = await prisma.bookings.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lte: now },
        endTime: { gt: now },
        propertyId: { in: locations.map((location) => location.id) },
      },
      include: { bookingSlots: { select: { slotId: true } } },
    });
    const occupiedSlotIds = new Set<string>();
    for (const booking of activeBookings) {
      for (const bookingSlot of booking.bookingSlots) occupiedSlotIds.add(bookingSlot.slotId);
    }

    const locationsWithStats = locations.map((location) => {
      const availableSlots = location.parkingSlots.filter(
        (slot) => slot.isActive && !occupiedSlotIds.has(slot.id)
      ).length;
      const total = location.parkingSlots.length;
      return {
        id: location.id,
        name: location.propertyName,
        address: location.address,
        description: null,
        totalSlots: total,
        availableSlots,
        parking_slots: location.parkingSlots.map((slot) => ({
          id: slot.id,
          number: slot.slotNumber,
          type: slot.slotType,
          status: !slot.isActive ? 'MAINTENANCE' : occupiedSlotIds.has(slot.id) ? 'OCCUPIED' : 'AVAILABLE',
        })),
        _count: { parking_slots: location._count.parkingSlots },
        occupancyRate: total > 0 ? (((total - availableSlots) / total) * 100).toFixed(1) : 0,
      };
    });

    return successResponse(locationsWithStats, 'Success', 200, {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    });
  } catch (error) {
    console.error('Get locations error:', error);
    return serverErrorResponse('Failed to fetch locations');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const address = String(body?.address || '').trim();
    const description = body?.description ? String(body.description) : null;
    const totalSlots = Number(body?.totalSlots || 0);
    const ownerId = String(body?.ownerId || '').trim();

    if (!name || !address || !ownerId) {
      return errorResponse('name, address, and ownerId are required');
    }

    const location = await prisma.properties.create({
      data: {
        ownerId,
        propertyName: name,
        address,
        pricePerHour: 0,
        pricePerDay: 0,
        status: 'NOT_ACTIVATED',
        totalSlots: Math.max(0, totalSlots),
        totalNormalSlots: Math.max(0, totalSlots),
        totalEvSlots: 0,
        totalCarWashSlots: 0,
      },
    });

    return createdResponse(
      {
        ...location,
        name: location.propertyName,
      },
      'Location created successfully'
    );
  } catch (error) {
    console.error('Create location error:', error);
    return serverErrorResponse('Failed to create location');
  }
}

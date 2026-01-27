import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET all parking slots (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId') || searchParams.get('parkingLotId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    // Build where clause
    const where: any = {};
    if (locationId) where.locationId = locationId;
    if (type) where.type = type;
    if (status) where.status = status;

    const slots = await prisma.parking_slots.findMany({
      where,
      include: {
        parking_locations: true,
        // Include bookings for the specified date/time to check availability
        booking_slots: date ? {
          where: {
            bookings: {
              date: new Date(date),
              status: { notIn: ['CANCELLED'] },
              ...(startTime && endTime ? {
                OR: [
                  {
                    startTime: { lte: new Date(endTime) },
                    endTime: { gte: new Date(startTime) },
                  },
                ],
              } : {}),
            },
          },
          include: {
            bookings: true,
          },
        } : false,
      },
      orderBy: {
        number: 'asc',
      },
    });

    // If checking availability, filter out booked slots
    const availableSlots = date
      ? slots.map((slot) => ({
          ...slot,
          isAvailable: !slot.booking_slots || slot.booking_slots.length === 0,
        }))
      : slots;

    // Land-owner UI expects { slots: [...] } and fields like slotNumber + parkingLotId
    const wantsLandOwnerShape = searchParams.has('parkingLotId');
    if (wantsLandOwnerShape) {
      return successResponse(
        availableSlots.map((s: any) => ({
          id: s.id,
          slotNumber: s.number,
          zone: s.zone,
          status: String(s.status).toLowerCase(),
          pricePerHour: s.pricePerHour,
          parkingLotId: s.locationId,
        }))
      );
    }

    return successResponse(availableSlots);
  } catch (error) {
    console.error('Get slots error:', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

// POST create a new parking slot (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Supports both:
    // 1) Existing API: { number, type, pricePerHour, locationId }
    // 2) Land-owner UI: { parkingLotId, zone, count, pricePerHour }
    const {
      number,
      type,
      pricePerHour,
      locationId,
      parkingLotId,
      zone,
      count,
    } = body;

    const resolvedLocationId = locationId || parkingLotId;

    // Validation
    if (!resolvedLocationId) {
      return errorResponse('locationId (or parkingLotId) is required');
    }

    // Land-owner batch create
    if (!number && count) {
      const createCount = Number(count);
      if (!zone || !Number.isFinite(createCount) || createCount <= 0) {
        return errorResponse('zone and a positive count are required');
      }

      // Find last slot number in this zone to continue numbering
      const existing = await prisma.parking_slots.findMany({
        where: {
          locationId: resolvedLocationId,
          zone,
        },
        select: { number: true },
      });

      let maxNumeric = 0;
      for (const s of existing) {
        const match = String(s.number).match(/(\d+)$/);
        if (match) {
          const n = Number(match[1]);
          if (Number.isFinite(n)) maxNumeric = Math.max(maxNumeric, n);
        }
      }

      const newSlotsData = Array.from({ length: createCount }, (_, i) => {
        const next = maxNumeric + i + 1;
        return {
          number: `${zone}${next}`,
          zone,
          type: 'NORMAL' as const,
          pricePerHour: pricePerHour ?? 300,
          locationId: resolvedLocationId,
        };
      });

      await prisma.parking_slots.createMany({
        data: newSlotsData,
        skipDuplicates: true,
      });

      // Keep ParkingLocation.totalSlots roughly in sync
      const totalSlots = await prisma.parking_slots.count({
        where: { locationId: resolvedLocationId },
      });
      await prisma.parking_locations.update({
        where: { id: resolvedLocationId },
        data: { totalSlots },
      });

      return createdResponse({ created: createCount }, 'Slots created successfully');
    }

    if (!number) {
      return errorResponse('Slot number is required');
    }

    // Check if slot number already exists at this location
    const existingSlot = await prisma.parking_slots.findFirst({
      where: {
        number,
        locationId: resolvedLocationId,
      },
    });

    if (existingSlot) {
      return errorResponse('Slot number already exists at this location');
    }

    const slot = await prisma.parking_slots.create({
      data: {
        number,
        zone: zone || 'A',
        type: type || 'NORMAL',
        pricePerHour: pricePerHour || 300,
        locationId: resolvedLocationId,
      },
      include: {
        parking_locations: true,
      },
    });

    // Keep ParkingLocation.totalSlots roughly in sync
    const totalSlots = await prisma.parking_slots.count({
      where: { locationId: resolvedLocationId },
    });
    await prisma.parking_locations.update({
      where: { id: resolvedLocationId },
      data: { totalSlots },
    });

    return createdResponse(slot, 'Slot created successfully');
  } catch (error) {
    console.error('Create slot error:', error);
    return serverErrorResponse('Failed to create slot');
  }
}

// PATCH update slot status (land-owner UI)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return errorResponse('id and status are required');
    }

    const normalized = String(status).toUpperCase();
    const allowed = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
    if (!allowed.includes(normalized)) {
      return errorResponse('Invalid status');
    }

    const updated = await prisma.parking_slots.update({
      where: { id },
      data: { status: normalized as any },
    });

    return successResponse(updated, 'Slot updated successfully');
  } catch (error) {
    console.error('Update slot error:', error);
    return serverErrorResponse('Failed to update slot');
  }
}

// DELETE remove a slot (land-owner UI)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return errorResponse('id is required');
    }

    const slot = await prisma.parking_slots.findUnique({
      where: { id },
      select: { locationId: true },
    });

    await prisma.parking_slots.delete({ where: { id } });

    if (slot?.locationId) {
      const totalSlots = await prisma.parking_slots.count({
        where: { locationId: slot.locationId },
      });
      await prisma.parking_locations.update({
        where: { id: slot.locationId },
        data: { totalSlots },
      });
    }

    return successResponse({ deleted: true }, 'Slot deleted successfully');
  } catch (error) {
    console.error('Delete slot error:', error);
    return serverErrorResponse('Failed to delete slot');
  }
}

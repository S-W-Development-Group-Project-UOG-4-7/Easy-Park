import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type SlotTypeValue = 'NORMAL' | 'EV' | 'CAR_WASH';

function normalizeSlotType(raw: unknown): SlotTypeValue {
  const normalized = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'EV' || normalized === 'EV_SLOT') return 'EV';
  if (normalized === 'CAR_WASH' || normalized === 'CAR_WASHING' || normalized === 'CARWASH') return 'CAR_WASH';
  return 'NORMAL';
}

function toLegacyStatus(isActive: boolean, occupied: boolean) {
  if (!isActive) return 'MAINTENANCE';
  if (occupied) return 'OCCUPIED';
  return 'AVAILABLE';
}

async function syncPropertyTotals(propertyId: string) {
  const counts = await prisma.parking_slots.groupBy({
    by: ['slotType'],
    where: { propertyId },
    _count: { _all: true },
  });

  let normal = 0;
  let ev = 0;
  let carWash = 0;
  for (const row of counts) {
    if (row.slotType === 'EV') ev = row._count._all;
    else if (row.slotType === 'CAR_WASH') carWash = row._count._all;
    else normal = row._count._all;
  }

  await prisma.properties.update({
    where: { id: propertyId },
    data: {
      totalSlots: normal + ev + carWash,
      totalNormalSlots: normal,
      totalEvSlots: ev,
      totalCarWashSlots: carWash,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId =
      searchParams.get('propertyId') ||
      searchParams.get('locationId') ||
      searchParams.get('parkingLotId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: {
      propertyId?: string;
      slotType?: SlotTypeValue;
      isActive?: boolean;
    } = {};
    if (propertyId) where.propertyId = propertyId;
    if (type) where.slotType = normalizeSlotType(type);
    if (status) {
      const normalized = status.toUpperCase();
      if (normalized === 'MAINTENANCE') where.isActive = false;
      if (normalized === 'AVAILABLE') where.isActive = true;
    }

    const slots = await prisma.parking_slots.findMany({
      where,
      include: {
        property: {
          select: { id: true, propertyName: true, address: true },
        },
      },
      orderBy: { slotNumber: 'asc' },
    });

    const now = new Date();
    const activeBookings = await prisma.bookings.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lte: now },
        endTime: { gt: now },
        ...(propertyId ? { propertyId } : {}),
      },
      include: { bookingSlots: { select: { slotId: true } } },
    });
    const occupiedSlotIds = new Set<string>();
    for (const booking of activeBookings) {
      for (const bookingSlot of booking.bookingSlots) occupiedSlotIds.add(bookingSlot.slotId);
    }

    const mapped = slots.map((slot) => ({
      id: slot.id,
      number: slot.slotNumber,
      slotNumber: slot.slotNumber,
      type: slot.slotType,
      status: toLegacyStatus(slot.isActive, occupiedSlotIds.has(slot.id)),
      isAvailable: slot.isActive && !occupiedSlotIds.has(slot.id),
      parkingLotId: slot.propertyId,
      locationId: slot.propertyId,
      property: slot.property,
    }));

    if (searchParams.has('parkingLotId')) {
      return successResponse(
        mapped.map((slot) => ({
          id: slot.id,
          slotNumber: slot.slotNumber,
          zone: String(slot.slotNumber).replace(/[0-9]+$/, '') || 'A',
          status: String(slot.status).toLowerCase(),
          parkingLotId: slot.parkingLotId,
        }))
      );
    }

    return successResponse(mapped);
  } catch (error) {
    console.error('Get slots error:', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const number = String(body?.number || '').trim();
    const type = body?.type;
    const propertyId = String(body?.propertyId || body?.locationId || body?.parkingLotId || '').trim();
    const zone = String(body?.zone || 'A').trim().toUpperCase();
    const count = Number(body?.count || 0);

    if (!propertyId) {
      return errorResponse('propertyId/locationId/parkingLotId is required');
    }

    if (!number && count > 0) {
      const existing = await prisma.parking_slots.findMany({
        where: { propertyId, slotNumber: { startsWith: zone } },
        select: { slotNumber: true },
      });

      let maxNumber = 0;
      for (const slot of existing) {
        const match = slot.slotNumber.match(/(\d+)$/);
        if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
      }

      const rows = Array.from({ length: count }).map((_, index) => ({
        propertyId,
        slotNumber: `${zone}${maxNumber + index + 1}`,
        slotType: 'NORMAL' as SlotTypeValue,
        isActive: true,
      }));

      await prisma.parking_slots.createMany({ data: rows, skipDuplicates: true });
      await syncPropertyTotals(propertyId);
      return createdResponse({ created: rows.length }, 'Slots created successfully');
    }

    if (!number) return errorResponse('Slot number is required');

    const slot = await prisma.parking_slots.create({
      data: {
        propertyId,
        slotNumber: number,
        slotType: normalizeSlotType(type),
        isActive: true,
      },
      include: {
        property: {
          select: { id: true, propertyName: true, address: true },
        },
      },
    });

    await syncPropertyTotals(propertyId);
    return createdResponse(slot, 'Slot created successfully');
  } catch (error) {
    console.error('Create slot error:', error);
    return serverErrorResponse('Failed to create slot');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const status = String(body?.status || '').toUpperCase();
    if (!id || !status) return errorResponse('id and status are required');

    const isActive = status !== 'MAINTENANCE';
    const updated = await prisma.parking_slots.update({
      where: { id },
      data: { isActive },
    });

    await syncPropertyTotals(updated.propertyId);
    return successResponse(updated, 'Slot updated successfully');
  } catch (error) {
    console.error('Update slot error:', error);
    return serverErrorResponse('Failed to update slot');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('id is required');

    const slot = await prisma.parking_slots.findUnique({
      where: { id },
      select: { propertyId: true },
    });
    if (!slot) return errorResponse('Slot not found', 404);

    await prisma.parking_slots.delete({ where: { id } });
    await syncPropertyTotals(slot.propertyId);

    return successResponse({ deleted: true }, 'Slot deleted successfully');
  } catch (error) {
    console.error('Delete slot error:', error);
    return serverErrorResponse('Failed to delete slot');
  }
}

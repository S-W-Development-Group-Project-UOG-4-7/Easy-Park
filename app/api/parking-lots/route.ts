import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

function toSlotType(raw: unknown): 'NORMAL' | 'EV' | 'CAR_WASH' {
  const value = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (value === 'EV' || value === 'EV_SLOT') return 'EV';
  if (value === 'CAR_WASH' || value === 'CAR_WASHING' || value === 'CARWASH') return 'CAR_WASH';
  return 'NORMAL';
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
    const authUser = getAuthUser(request);
    const isAdmin = authUser?.role === 'ADMIN';
    const showAll = request.nextUrl.searchParams.get('showAll') === 'true';
    const where = isAdmin && showAll ? {} : { status: 'ACTIVATED' as const };

    const properties = await prisma.properties.findMany({
      where,
      include: {
        parkingSlots: {
          select: {
            id: true,
            slotType: true,
            isActive: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const activeBookings = await prisma.bookings.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lte: now },
        endTime: { gt: now },
        propertyId: { in: properties.map((property) => property.id) },
      },
      include: { bookingSlots: { select: { slotId: true } } },
    });
    const occupiedSlotIds = new Set<string>();
    for (const booking of activeBookings) {
      for (const bookingSlot of booking.bookingSlots) occupiedSlotIds.add(bookingSlot.slotId);
    }

    const parkingLots = properties.map((property) => {
      const totalSlots = property.parkingSlots.length;
      const availableSlots = property.parkingSlots.filter(
        (slot) => slot.isActive && !occupiedSlotIds.has(slot.id)
      ).length;
      return {
        id: property.id,
        name: property.propertyName,
        address: property.address,
        description: null,
        ownerId: property.ownerId,
        owner: property.owner
          ? {
              id: property.owner.id,
              name: property.owner.fullName,
              email: property.owner.email,
            }
          : null,
        totalSlots,
        availableSlots,
        normalSlots: property.parkingSlots.filter((slot) => slot.slotType === 'NORMAL').length,
        evSlots: property.parkingSlots.filter((slot) => slot.slotType === 'EV').length,
        carWashSlots: property.parkingSlots.filter((slot) => slot.slotType === 'CAR_WASH').length,
        pricePerHour: Number(property.pricePerHour),
        pricePerDay: Number(property.pricePerDay),
        status: property.status,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    });

    return NextResponse.json(
      { parkingLots },
      {
        headers: {
          'Cache-Control': isAdmin && showAll ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    return NextResponse.json({ error: 'Failed to fetch parking lots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !['ADMIN', 'LANDOWNER', 'LAND_OWNER'].includes(authUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins and land owners can create parking lots' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = String(body?.name || '').trim();
    const address = String(body?.address || '').trim();
    const ownerIdInput = String(body?.ownerId || authUser.userId || '').trim();
    const pricePerHour = Number(body?.pricePerHour ?? 0);
    const pricePerDay = Number(body?.pricePerDay ?? 0);
    const status = String(body?.status || 'NOT_ACTIVATED').toUpperCase().replace(/\s+/g, '_');
    const slots = Array.isArray(body?.slots) ? body.slots : [];

    if (!name || !address || !ownerIdInput) {
      return NextResponse.json({ error: 'Name, address, and ownerId are required' }, { status: 400 });
    }

    const owner = await prisma.users.findUnique({ where: { id: ownerIdInput }, select: { id: true } });
    if (!owner) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

    const created = await prisma.$transaction(async (tx) => {
      const property = await tx.properties.create({
        data: {
          ownerId: owner.id,
          propertyName: name,
          address,
          pricePerHour: Number.isFinite(pricePerHour) ? pricePerHour : 0,
          pricePerDay: Number.isFinite(pricePerDay) ? pricePerDay : 0,
          status: authUser.role === 'ADMIN' && status === 'ACTIVATED' ? 'ACTIVATED' : 'NOT_ACTIVATED',
          totalSlots: 0,
          totalNormalSlots: 0,
          totalEvSlots: 0,
          totalCarWashSlots: 0,
        },
      });

      if (slots.length > 0) {
        const rows: Array<{ propertyId: string; slotNumber: string; slotType: 'NORMAL' | 'EV' | 'CAR_WASH'; isActive: boolean }> = [];
        const counters: Record<'NORMAL' | 'EV' | 'CAR_WASH', number> = { NORMAL: 0, EV: 0, CAR_WASH: 0 };
        for (const slotConfig of slots) {
          const slotType = toSlotType(slotConfig?.type);
          const count = Math.max(0, Number(slotConfig?.count ?? 0));
          const prefix = slotType === 'EV' ? 'EV' : slotType === 'CAR_WASH' ? 'CW' : 'A';
          for (let i = 0; i < count; i += 1) {
            counters[slotType] += 1;
            rows.push({
              propertyId: property.id,
              slotNumber: `${prefix}${counters[slotType]}`,
              slotType,
              isActive: true,
            });
          }
        }
        if (rows.length > 0) await tx.parking_slots.createMany({ data: rows, skipDuplicates: true });
      }
      return property;
    });

    await syncPropertyTotals(created.id);

    const property = await prisma.properties.findUnique({
      where: { id: created.id },
      include: { owner: { select: { id: true, fullName: true, email: true } } },
    });

    return NextResponse.json(
      {
        parkingLot: property
          ? {
              id: property.id,
              name: property.propertyName,
              address: property.address,
              ownerId: property.ownerId,
              pricePerHour: Number(property.pricePerHour),
              pricePerDay: Number(property.pricePerDay),
              status: property.status,
              owner: property.owner
                ? { id: property.owner.id, name: property.owner.fullName, email: property.owner.email }
                : null,
              createdAt: property.createdAt,
              updatedAt: property.updatedAt,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating parking lot:', error);
    return NextResponse.json({ error: 'Failed to create parking lot' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Please login to continue' }, { status: 401 });
    }

    const body = await request.json();
    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'Parking lot ID is required' }, { status: 400 });

    const existing = await prisma.properties.findUnique({ where: { id }, select: { ownerId: true } });
    if (!existing) return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });

    const isAdmin = authUser.role === 'ADMIN';
    const isOwner = authUser.userId === existing.ownerId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data: {
      status?: 'ACTIVATED' | 'NOT_ACTIVATED';
      pricePerHour?: number;
      pricePerDay?: number;
      propertyName?: string;
      address?: string;
    } = {};

    if (body?.status !== undefined) {
      if (!isAdmin) return NextResponse.json({ error: 'Only admins can change status' }, { status: 403 });
      data.status = String(body.status).toUpperCase() === 'ACTIVATED' ? 'ACTIVATED' : 'NOT_ACTIVATED';
    }
    if (body?.pricePerHour !== undefined) {
      if (!isAdmin) return NextResponse.json({ error: 'Only admins can update prices' }, { status: 403 });
      data.pricePerHour = Number(body.pricePerHour);
    }
    if (body?.pricePerDay !== undefined) {
      if (!isAdmin) return NextResponse.json({ error: 'Only admins can update prices' }, { status: 403 });
      data.pricePerDay = Number(body.pricePerDay);
    }
    if (body?.name !== undefined) data.propertyName = String(body.name);
    if (body?.address !== undefined) data.address = String(body.address);

    const parkingLot = await prisma.properties.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        parkingSlots: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Parking lot updated successfully',
      parkingLot,
    });
  } catch (error) {
    console.error('Error updating parking lot:', error);
    return NextResponse.json({ error: 'Failed to update parking lot' }, { status: 500 });
  }
}

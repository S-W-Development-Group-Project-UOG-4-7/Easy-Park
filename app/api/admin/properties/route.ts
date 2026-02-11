import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

type SlotInputType = 'NORMAL' | 'EV' | 'CAR_WASH';

const ALLOWED_ROLES = new Set(['ADMIN', 'LANDOWNER', 'LAND_OWNER']);

function normalizeSlotType(raw: unknown): SlotInputType {
  const value = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (value === 'EV' || value === 'EV_SLOT') return 'EV';
  if (value === 'CAR_WASH' || value === 'CAR_WASHING' || value === 'CARWASH') return 'CAR_WASH';
  return 'NORMAL';
}

function toUiSlotType(value: SlotInputType): 'Normal' | 'EV' | 'Car Washing' {
  if (value === 'EV') return 'EV';
  if (value === 'CAR_WASH') return 'Car Washing';
  return 'Normal';
}

function slotPrefix(slotType: SlotInputType) {
  if (slotType === 'EV') return 'EV';
  if (slotType === 'CAR_WASH') return 'CW';
  return 'A';
}

function canManageProperties(role: string | undefined) {
  return !!role && ALLOWED_ROLES.has(role.toUpperCase());
}

function parseSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    status: searchParams.get('status'),
    search: searchParams.get('search'),
    propertyId: searchParams.get('propertyId') || searchParams.get('id'),
  };
}

function buildSlotsPayload(
  slots: Array<{
    id: string;
    slotNumber: string;
    slotType: SlotInputType;
    isActive: boolean;
  }>,
  occupiedSlotIds: Set<string>
) {
  const mappedSlots = slots.map((slot) => {
    const status = !slot.isActive ? 'maintenance' : occupiedSlotIds.has(slot.id) ? 'occupied' : 'available';
    return {
      id: slot.id,
      number: slot.slotNumber,
      slotNumber: slot.slotNumber,
      type: toUiSlotType(slot.slotType),
      status,
    };
  });

  const normalSlots = slots.filter((slot) => slot.slotType === 'NORMAL').length;
  const evSlots = slots.filter((slot) => slot.slotType === 'EV').length;
  const carWashSlots = slots.filter((slot) => slot.slotType === 'CAR_WASH').length;
  const availableSlots = mappedSlots.filter((slot) => slot.status === 'available').length;

  return {
    mappedSlots,
    normalSlots,
    evSlots,
    carWashSlots,
    availableSlots,
  };
}

async function getPropertyList(request: NextRequest) {
  const { status, search } = parseSearchParams(request);
  const where: {
    status?: 'ACTIVATED' | 'NOT_ACTIVATED';
    OR?: Array<{ propertyName?: { contains: string; mode: 'insensitive' }; address?: { contains: string; mode: 'insensitive' } }>;
  } = {};

  if (status === 'ACTIVATED' || status === 'NOT_ACTIVATED') where.status = status;
  if (search) {
    where.OR = [
      { propertyName: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const properties = await prisma.properties.findMany({
    where,
    include: {
      parkingSlots: {
        select: {
          id: true,
          slotNumber: true,
          slotType: true,
          isActive: true,
        },
        orderBy: { slotNumber: 'asc' },
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
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
    include: {
      bookingSlots: {
        select: { slotId: true },
      },
    },
  });

  const occupiedSlotIds = new Set<string>();
  for (const booking of activeBookings) {
    for (const slot of booking.bookingSlots) {
      occupiedSlotIds.add(slot.slotId);
    }
  }

  return properties.map((property) => {
    const slotSummary = buildSlotsPayload(
      property.parkingSlots.map((slot) => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType as SlotInputType,
        isActive: slot.isActive,
      })),
      occupiedSlotIds
    );

    return {
      id: property.id,
      propertyId: property.id,
      name: property.propertyName,
      propertyName: property.propertyName,
      address: property.address,
      location: property.address,
      description: null,
      pricePerHour: Number(property.pricePerHour),
      pricePerDay: Number(property.pricePerDay),
      status: property.status,
      parkingAreaStatus: property.status,
      totalSlots: property.totalSlots,
      totalParkingSlots: property.totalSlots,
      availableSlots: slotSummary.availableSlots,
      availableParkingSlots: slotSummary.availableSlots,
      normalSlots: slotSummary.normalSlots,
      evSlots: slotSummary.evSlots,
      carWashSlots: slotSummary.carWashSlots,
      createdAt: property.createdAt,
      createdDate: property.createdAt,
      updatedAt: property.updatedAt,
      lastUpdatedDate: property.updatedAt,
      owner: property.owner
        ? {
            id: property.owner.id,
            name: property.owner.fullName,
            email: property.owner.email,
            phone: property.owner.phone,
          }
        : null,
      slots: slotSummary.mappedSlots,
      slotBreakdown: {
        normal: slotSummary.normalSlots,
        ev: slotSummary.evSlots,
        carWash: slotSummary.carWashSlots,
      },
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const properties = await getPropertyList(request);
    return NextResponse.json({
      success: true,
      properties,
      parkingLots: properties,
      total: properties.length,
    });
  } catch (error) {
    console.error('Admin properties GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !canManageProperties(authUser.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const propertyName = String(body?.propertyName || body?.name || '').trim();
    const address = String(body?.location || body?.address || '').trim();
    const pricePerHour = Number(body?.pricePerHour ?? 0);
    const pricePerDay = Number(body?.pricePerDay ?? 0);
    const status = String(body?.parkingAreaStatus || body?.status || 'NOT_ACTIVATED')
      .toUpperCase()
      .replace(/\s+/g, '_');
    const slotConfigRaw = Array.isArray(body?.slots) ? body.slots : Array.isArray(body?.parkingSlots) ? body.parkingSlots : [];

    if (!propertyName || !address) {
      return NextResponse.json({ success: false, error: 'Property name and location are required' }, { status: 400 });
    }
    if (!Number.isFinite(pricePerHour) || pricePerHour < 0 || !Number.isFinite(pricePerDay) || pricePerDay < 0) {
      return NextResponse.json({ success: false, error: 'Prices must be non-negative numbers' }, { status: 400 });
    }

    const owner = await prisma.users.findFirst({
      where: authUser.userId ? { id: authUser.userId } : { email: String(authUser.email || '').toLowerCase() },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ success: false, error: 'Authenticated user not found' }, { status: 404 });
    }

    const slotTypeCounts: Record<SlotInputType, number> = { NORMAL: 0, EV: 0, CAR_WASH: 0 };
    const slotRows: Array<{ slotType: SlotInputType; slotNumber: string }> = [];

    for (const raw of slotConfigRaw) {
      const slotType = normalizeSlotType(raw?.type);
      const count = Math.max(0, Number(raw?.count ?? 0));
      if (!Number.isFinite(count) || count <= 0) continue;
      for (let i = 0; i < count; i += 1) {
        slotTypeCounts[slotType] += 1;
        slotRows.push({
          slotType,
          slotNumber: `${slotPrefix(slotType)}${slotTypeCounts[slotType]}`,
        });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const property = await tx.properties.create({
        data: {
          ownerId: owner.id,
          propertyName,
          address,
          pricePerHour,
          pricePerDay,
          currency: 'LKR',
          status: status === 'ACTIVATED' ? 'ACTIVATED' : 'NOT_ACTIVATED',
          totalSlots: slotRows.length,
          totalNormalSlots: slotTypeCounts.NORMAL,
          totalEvSlots: slotTypeCounts.EV,
          totalCarWashSlots: slotTypeCounts.CAR_WASH,
        },
      });

      if (slotRows.length > 0) {
        await tx.parking_slots.createMany({
          data: slotRows.map((slot) => ({
            propertyId: property.id,
            slotNumber: slot.slotNumber,
            slotType: slot.slotType,
            isActive: true,
          })),
          skipDuplicates: true,
        });
      }

      return property.id;
    });

    const refreshed = await getPropertyList(new NextRequest(`${request.nextUrl.origin}/api/admin/properties?propertyId=${created}`));
    const createdProperty = refreshed.find((item) => item.propertyId === created);

    return NextResponse.json(
      {
        success: true,
        message: 'Property created successfully',
        property: createdProperty,
        parkingLot: createdProperty
          ? {
              id: createdProperty.id,
              name: createdProperty.propertyName,
              address: createdProperty.location,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin properties POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create property' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !canManageProperties(authUser.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const propertyId = String(body?.propertyId || body?.id || '').trim();
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

    const data: {
      propertyName?: string;
      address?: string;
      pricePerHour?: number;
      pricePerDay?: number;
      status?: 'ACTIVATED' | 'NOT_ACTIVATED';
    } = {};

    if (body?.propertyName || body?.name) data.propertyName = String(body.propertyName || body.name).trim();
    if (body?.location || body?.address) data.address = String(body.location || body.address).trim();

    if (body?.pricePerHour !== undefined) {
      const value = Number(body.pricePerHour);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json({ success: false, error: 'pricePerHour must be non-negative' }, { status: 400 });
      }
      data.pricePerHour = value;
    }
    if (body?.pricePerDay !== undefined) {
      const value = Number(body.pricePerDay);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json({ success: false, error: 'pricePerDay must be non-negative' }, { status: 400 });
      }
      data.pricePerDay = value;
    }
    if (body?.status || body?.parkingAreaStatus) {
      const raw = String(body.status || body.parkingAreaStatus).toUpperCase().replace(/\s+/g, '_');
      data.status = raw === 'ACTIVATED' ? 'ACTIVATED' : 'NOT_ACTIVATED';
    }

    const updated = await prisma.properties.update({
      where: { id: propertyId },
      data,
      select: { id: true },
    });

    const refreshed = await getPropertyList(new NextRequest(`${request.nextUrl.origin}/api/admin/properties?propertyId=${updated.id}`));
    const property = refreshed.find((item) => item.propertyId === updated.id) || null;

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property,
      parkingLot: property
        ? {
            id: property.id,
            name: property.propertyName,
            address: property.location,
            status: property.status,
          }
        : null,
    });
  } catch (error) {
    console.error('Admin properties PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !canManageProperties(authUser.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { propertyId } = parseSearchParams(request);
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required' }, { status: 400 });
    }

    await prisma.properties.delete({ where: { id: propertyId } });
    return NextResponse.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Admin properties DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete property' }, { status: 500 });
  }
}

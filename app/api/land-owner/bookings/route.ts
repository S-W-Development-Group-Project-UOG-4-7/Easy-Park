import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractRoles, normalizeRole } from '@/lib/user-roles';

type AccessScope = {
  mode: 'ADMIN' | 'LANDOWNER';
  userId: string;
};

function minutesFromHHmm(value: string) {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function computeDurationHours(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
}

function slotZone(slotNumber: string) {
  const prefix = slotNumber.toUpperCase().replace(/[0-9]+$/, '');
  return prefix || 'A';
}

function paymentCollectionStatus(total: number, onlinePaid: number, cashPaid: number) {
  const paid = onlinePaid + cashPaid;
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
}

function isLandOwner(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === 'LANDOWNER';
}

function isAdmin(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === 'ADMIN';
}

async function resolveAccessScope(request: NextRequest): Promise<AccessScope | null> {
  const authUser = getAuthUser(request);
  if (!authUser) return null;

  if (authUser.userId) {
    const byId = await prisma.users.findUnique({
      where: { id: authUser.userId },
      include: { roles: { include: { role: true } } },
    });
    if (byId) {
      const roles = new Set(extractRoles(byId));
      if (roles.has('ADMIN')) return { mode: 'ADMIN', userId: byId.id };
      if (roles.has('LANDOWNER')) return { mode: 'LANDOWNER', userId: byId.id };
    }
  }

  if (authUser.email) {
    const byEmail = await prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (byEmail) {
      const roles = new Set(extractRoles(byEmail));
      if (roles.has('ADMIN')) return { mode: 'ADMIN', userId: byEmail.id };
      if (roles.has('LANDOWNER')) return { mode: 'LANDOWNER', userId: byEmail.id };
    }
  }

  if (isAdmin(authUser.role) && authUser.userId) {
    return { mode: 'ADMIN', userId: authUser.userId };
  }

  if (isLandOwner(authUser.role) && authUser.userId) {
    return { mode: 'LANDOWNER', userId: authUser.userId };
  }

  if ((isAdmin(authUser.role) || isLandOwner(authUser.role)) && authUser.email) {
    const byEmail = await prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true },
    });
    if (byEmail) {
      return {
        mode: isAdmin(authUser.role) ? 'ADMIN' : 'LANDOWNER',
        userId: byEmail.id,
      };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const accessScope = await resolveAccessScope(request);
    if (!accessScope?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Land owner or admin access required' }, { status: 403 });
    }

    const applyOwnerScope =
      accessScope.mode === 'LANDOWNER'
        ? (await prisma.properties.count({ where: { ownerId: accessScope.userId } })) > 0
        : false;

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: {
      propertyId?: string;
      status?: 'PENDING' | 'PAID' | 'CANCELLED';
      startTime?: { gte: Date; lte: Date };
      customer?: {
        OR: Array<{ fullName?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
      };
      property?: { ownerId: string };
    } = {};

    if (applyOwnerScope) {
      where.property = { ownerId: accessScope.userId };
    }

    if (propertyId && propertyId !== 'all') where.propertyId = propertyId;
    if (status) {
      const normalized = status.toUpperCase();
      if (normalized === 'PENDING' || normalized === 'PAID' || normalized === 'CANCELLED') {
        where.status = normalized;
      }
    }
    if (date) {
      const day = new Date(date);
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }
    if (search) {
      where.customer = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            residentialAddress: true,
            nic: true,
            vehicles: {
              select: {
                vehicleNumber: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        vehicle: {
          select: {
            vehicleNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            propertyName: true,
            address: true,
          },
        },
        bookingSlots: {
          include: {
            slot: {
              select: {
                id: true,
                slotNumber: true,
                slotType: true,
              },
            },
          },
        },
        paymentSummary: true,
      },
      orderBy: [{ startTime: 'desc' }, { createdAt: 'desc' }],
    });

    const startMinutes = startTime ? minutesFromHHmm(startTime) : null;
    const endMinutes = endTime ? minutesFromHHmm(endTime) : null;

    const filtered = bookings.filter((booking) => {
      if (startMinutes === null && endMinutes === null) return true;
      const bookingStart = booking.startTime.getHours() * 60 + booking.startTime.getMinutes();
      const bookingEnd = booking.endTime.getHours() * 60 + booking.endTime.getMinutes();
      if (startMinutes !== null && bookingStart < startMinutes) return false;
      if (endMinutes !== null && bookingEnd > endMinutes) return false;
      return true;
    });

    const payload = filtered.map((booking) => {
      const totalAmount = Number(booking.paymentSummary?.totalAmount ?? 0);
      const onlinePaid = Number(booking.paymentSummary?.onlinePaid ?? 0);
      const cashPaid = Number(booking.paymentSummary?.cashPaid ?? 0);
      const paidAmount = onlinePaid + cashPaid;
      const balanceDue = Math.max(0, Number(booking.paymentSummary?.balanceDue ?? totalAmount - paidAmount));
      const duration = computeDurationHours(booking.startTime, booking.endTime);
      const allSlots = booking.bookingSlots.map((bookingSlot) => ({
        id: bookingSlot.slot.id,
        number: bookingSlot.slot.slotNumber,
        zone: slotZone(bookingSlot.slot.slotNumber),
        type: bookingSlot.slot.slotType,
      }));
      const firstSlot = allSlots[0];

      return {
        bookingId: booking.id,
        bookingNumber: `BK-${booking.id.slice(-6).toUpperCase()}`,
        propertyId: booking.property.id,
        propertyName: booking.property.propertyName,
        propertyAddress: booking.property.address,
        bookingDate: booking.startTime,
        startTime: booking.startTime,
        endTime: booking.endTime,
        slotNumber: firstSlot?.number || 'N/A',
        slotZone: firstSlot?.zone || 'A',
        customerId: booking.customer.id,
        userId: booking.customer.id,
        customerName: booking.customer.fullName,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        customerAddress: booking.customer.residentialAddress,
        customerNic: booking.customer.nic,
        vehicleNumber: booking.vehicle?.vehicleNumber || booking.customer.vehicles[0]?.vehicleNumber || 'N/A',
        bookingStatus: booking.status,
        status: booking.status,
        duration,
        bookingType: booking.bookingType,
        extrasCost: 0,
        extras: null,
        checkInTime: booking.startTime,
        checkOutTime: booking.endTime,
        totalAmount,
        paidAmount,
        onlinePaid,
        balanceDue,
        paymentStatus: paymentCollectionStatus(totalAmount, onlinePaid, cashPaid),
        paymentMethod: onlinePaid > 0 && cashPaid > 0 ? 'CARD,CASH' : onlinePaid > 0 ? 'CARD' : cashPaid > 0 ? 'CASH' : 'N/A',
        allSlots,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      bookings: payload,
      total: payload.length,
    });
  } catch (error) {
    console.error('Land owner bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

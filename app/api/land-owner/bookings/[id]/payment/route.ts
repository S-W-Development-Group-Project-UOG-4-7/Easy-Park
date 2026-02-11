import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractRoles, normalizeRole } from '@/lib/user-roles';

type AccessScope = {
  mode: 'ADMIN' | 'LANDOWNER';
  userId: string;
};

type CollectionStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

function collectionStatus(total: number, paid: number): CollectionStatus {
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
}

function toParkingType(raw: string) {
  if (raw === 'EV') return 'EV Slot';
  if (raw === 'CAR_WASH') return 'Car Washing';
  return 'Normal';
}

function toBookingType(raw: string) {
  const normalized = String(raw || 'NORMAL').toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'EV' || normalized === 'EV_SLOT') return 'EV_SLOT';
  if (normalized === 'CAR_WASH' || normalized === 'CAR_WASHING') return 'CAR_WASHING';
  return 'NORMAL';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessScope = await resolveAccessScope(request);
    if (!accessScope?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Land owner or admin access required' },
        { status: 403 }
      );
    }

    const applyOwnerScope =
      accessScope.mode === 'LANDOWNER'
        ? (await prisma.properties.count({ where: { ownerId: accessScope.userId } })) > 0
        : false;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const bookingWhere: {
      id: string;
      property?: { ownerId: string };
    } = { id };
    if (applyOwnerScope) {
      bookingWhere.property = { ownerId: accessScope.userId };
    }

    const booking = await prisma.bookings.findFirst({
      where: bookingWhere,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            propertyName: true,
            address: true,
          },
        },
        paymentSummary: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const summary = booking.paymentSummary;
    const totalAmount = Number(summary?.totalAmount ?? 0);
    const onlinePaid = Number(summary?.onlinePaid ?? 0);
    const cashPaid = Number(summary?.cashPaid ?? 0);
    const paid = onlinePaid + cashPaid;
    const balanceDue = Math.max(0, Number(summary?.balanceDue ?? totalAmount - paid));
    const latest = booking.payments[0];

    return NextResponse.json({
      success: true,
      data: {
        paymentId: latest?.id || null,
        bookingId: booking.id,
        customer: {
          id: booking.customer.id,
          fullName: booking.customer.fullName,
          email: booking.customer.email,
        },
        property: {
          id: booking.property.id,
          name: booking.property.propertyName,
          address: booking.property.address,
        },
        totalAmount,
        onlinePaid,
        balanceDue,
        currency: summary?.currency || latest?.currency || 'LKR',
        paymentMethod: latest?.method || 'N/A',
        paymentGatewayStatus: latest?.gatewayStatus || 'PENDING',
        paymentStatus: collectionStatus(totalAmount, paid),
        transactionId: latest?.transactionId || null,
        bookingDate: booking.startTime,
        bookingTime: booking.startTime,
        hoursSelected: Math.max(
          1,
          Math.ceil((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60))
        ),
        checkInTime: booking.startTime,
        checkOutTime: booking.endTime,
        parkingType: toParkingType(booking.parkingType),
        bookingType: toBookingType(booking.bookingType),
        extras: null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error('[LAND_OWNER_BOOKING_PAYMENT_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractRoles, normalizeRole } from '@/lib/user-roles';

type AccessScope = {
  mode: 'ADMIN' | 'LANDOWNER';
  userId: string;
};

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
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const accessScope = await resolveAccessScope(request);
    if (!accessScope?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const applyOwnerScope =
      accessScope.mode === 'LANDOWNER'
        ? (await prisma.properties.count({ where: { ownerId: accessScope.userId } })) > 0
        : false;

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer id is required' }, { status: 400 });
    }

    const bookingCountWhere: {
      customerId: string;
      property?: { ownerId: string };
    } = { customerId };
    if (applyOwnerScope) {
      bookingCountWhere.property = { ownerId: accessScope.userId };
    }

    const ownerLinkedBookingCount = await prisma.bookings.count({ where: bookingCountWhere });

    if (ownerLinkedBookingCount <= 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const customer = await prisma.users.findUnique({
      where: { id: customerId },
      include: {
        roles: { include: { role: true } },
        vehicles: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    const roles = new Set(extractRoles(customer));
    if (!roles.has('CUSTOMER')) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const vehicle = customer.vehicles[0];
    const payload = {
      id: customer.id,
      fullName: customer.fullName ?? null,
      email: customer.email ?? null,
      nic: customer.nic ?? null,
      phone: customer.phone ?? null,
      address: customer.residentialAddress ?? null,
      role: 'CUSTOMER',
      createdAt: customer.createdAt?.toISOString?.() ?? null,
      updatedAt: customer.updatedAt?.toISOString?.() ?? null,
      vehicle: {
        registrationNumber: vehicle?.vehicleNumber ?? null,
        type: vehicle?.type ?? null,
        model: vehicle?.model ?? null,
        color: vehicle?.color ?? null,
      },
      meta: {
        totalBookings: ownerLinkedBookingCount,
      },
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('Land owner get customer error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractRoles } from '@/lib/user-roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { customerId } = await params;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer id is required' }, { status: 400 });
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

    const bookingCount = await prisma.bookings.count({
      where: { customerId: customer.id },
    });

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
        totalBookings: bookingCount,
      },
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('Admin get customer error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

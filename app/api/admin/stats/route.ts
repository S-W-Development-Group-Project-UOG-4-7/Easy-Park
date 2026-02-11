import { NextRequest, NextResponse } from 'next/server';
import {
  BookingStatus,
  GatewayStatus,
  PaymentMethod,
  PaymentStatus,
  RoleName,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function isAdminUser(userId?: string | null) {
  if (!userId) return false;

  const role = await prisma.user_roles.findFirst({
    where: {
      userId,
      role: { name: RoleName.ADMIN },
    },
    select: { userId: true },
  });

  return Boolean(role);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await isAdminUser(authUser.userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();

    const [totalCustomers, activeBookings, revenueAgg] = await Promise.all([
      prisma.user_roles.count({
        where: {
          role: { name: RoleName.CUSTOMER },
        },
      }),
      prisma.bookings.count({
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.PAID] },
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),
      prisma.payments.aggregate({
        _sum: { amount: true },
        where: {
          method: PaymentMethod.CARD,
          paymentStatus: PaymentStatus.PAID,
          gatewayStatus: GatewayStatus.COMPLETED,
        },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.amount ?? 0);

    return NextResponse.json({
      totalRevenue,
      totalCustomers,
      activeBookings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

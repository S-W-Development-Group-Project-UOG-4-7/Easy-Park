import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function mapSlotType(slotType: 'NORMAL' | 'EV' | 'CAR_WASH') {
  if (slotType === 'EV') return 'ev';
  if (slotType === 'CAR_WASH') return 'car-wash';
  return 'normal';
}

async function resolveUser(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) {
    const byId = await prisma.users.findUnique({ where: { id: authUser.userId }, select: { id: true, email: true } });
    if (byId) return byId;
  }
  if (authUser.email) {
    return prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true, email: true },
    });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await resolveUser(authUser);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const bookings = await prisma.bookings.findMany({
      where: { customerId: user.id },
      include: {
        property: {
          select: { propertyName: true, address: true },
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
            washJob: {
              select: {
                status: true,
              },
            },
          },
        },
        paymentSummary: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = bookings.map((booking) => {
      const slots = booking.bookingSlots.map((bookingSlot) => ({
        id: bookingSlot.slot.id,
        bookingSlotId: bookingSlot.id,
        number: bookingSlot.slot.slotNumber,
        type: mapSlotType(bookingSlot.slot.slotType),
        washStatus: bookingSlot.washJob?.status || null,
      }));
      const summary = booking.paymentSummary;
      const totalAmount = Number(summary?.totalAmount ?? 0);
      const paidAmount = Number(summary?.onlinePaid ?? 0) + Number(summary?.cashPaid ?? 0);

      return {
        bookingId: booking.id,
        date: booking.startTime.toISOString(),
        location: booking.property.propertyName || booking.property.address || 'Unknown Location',
        time: booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: Math.max(
          1,
          Math.ceil((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60))
        ),
        slots,
        slotType: slots[0]?.type || 'normal',
        status: booking.status.toLowerCase(),
        createdAt: booking.createdAt.toISOString(),
        totalAmount,
        paidAmount,
        paymentId: booking.id,
        paymentSummary: summary
          ? {
              totalAmount: Number(summary.totalAmount),
              onlinePaid: Number(summary.onlinePaid),
              cashPaid: Number(summary.cashPaid),
              balanceDue: Number(summary.balanceDue),
              currency: summary.currency,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[BOOKING_LIST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

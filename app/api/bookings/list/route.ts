import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({ where: { email: authUser.email } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const bookings = await prisma.bookings.findMany({
      where: { userId: user.id },
      include: {
        booking_slots: {
          include: {
            parking_slots: {
              include: { parking_locations: true }
            }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = bookings.map((b) => {
      const firstSlot = b.booking_slots[0]?.parking_slots;
      const locationName = firstSlot?.parking_locations?.name || 'Unknown Location';

      const slots = b.booking_slots.map((bs) => ({
        id: bs.parking_slots.id,
        number: bs.parking_slots.number,
        type: bs.parking_slots.type.toLowerCase(),
      }));

      // Calculate totals if not stored
      const calculatedTotal = b.totalAmount > 0 ? b.totalAmount : (b.duration * 300 * slots.length); 

      return {
        bookingId: b.id,
        date: b.date.toISOString(),
        location: locationName,
        time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: b.duration,
        slots: slots,
        slotType: 'normal', // Simplified for list view
        status: b.status.toLowerCase(),
        createdAt: b.createdAt.toISOString(),
        totalAmount: calculatedTotal,
        paidAmount: b.paidAmount,
        paymentId: b.payments?.id
      };
    });

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('[BOOKING_LIST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
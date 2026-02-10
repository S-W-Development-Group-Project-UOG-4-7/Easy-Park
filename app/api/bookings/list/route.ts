import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const AUTH_USER_SELECT = {
  id: true,
  email: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || (!authUser.email && !authUser.userId)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let user = authUser.userId
      ? await prisma.users.findUnique({ where: { id: authUser.userId }, select: AUTH_USER_SELECT })
      : null;
    if (!user && authUser.email) {
      user = await prisma.users.findUnique({
        where: { email: authUser.email.toLowerCase() },
        select: AUTH_USER_SELECT,
      });
    }
    if (!user) {
      // Allow demo user sessions to return empty data instead of error.
      if (authUser.email === 'customer@gmail.com' && authUser.role === 'CUSTOMER') {
        return NextResponse.json({ success: true, data: [] });
      }
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

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
        payments: true // Important: Fetch related payment records
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

      // --- DYNAMIC STATUS LOGIC ---

      // 1. Calculate Real Paid Amount based on existing payment record
      const realPaidAmount = b.payments?.amount || 0;

      // 2. Determine Status
      let dynamicStatus = b.status.toLowerCase();

      // Priority Rule: If DB explicitly says 'cancelled', respect it.
      if (dynamicStatus === 'cancelled') {
         // Do nothing, keep it as 'cancelled'
      } 
      // Revert Rule: If DB says 'paid' but money is missing (manual deletion), revert to 'pending'
      else if (realPaidAmount <= 0 && (dynamicStatus === 'paid' || dynamicStatus === 'confirmed')) {
        dynamicStatus = 'pending';
      }

      // --- END LOGIC ---

      // Calculate total bill if not stored
      const calculatedTotal = b.totalAmount > 0 ? b.totalAmount : (b.duration * 300 * slots.length); 

      return {
        bookingId: b.id,
        date: b.date.toISOString(),
        location: locationName,
        time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: b.duration,
        slots: slots,
        slotType: 'normal',
        status: dynamicStatus, // Use the robust status
        createdAt: b.createdAt.toISOString(),
        totalAmount: calculatedTotal,
        paidAmount: realPaidAmount,
        paymentId: b.payments?.id || null
      };
    });

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('[BOOKING_LIST_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

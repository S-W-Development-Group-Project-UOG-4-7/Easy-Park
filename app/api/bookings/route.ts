import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth'; // Assuming you have this helper from previous steps

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate (Get User ID)
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve User ID from DB
    const user = await prisma.users.findUnique({ where: { email: authUser.email } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // 3. Fetch Bookings with Relations
    const bookings = await prisma.bookings.findMany({
      where: { userId: user.id },
      include: {
        booking_slots: {
          include: {
            parking_slots: {
              include: {
                parking_locations: true // To get Location Name
              }
            }
          }
        },
        payments: true // Include payment info if needed
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Transform Data for Frontend
    const data = bookings.map((b) => {
      // Extract location name from the first slot (assuming all slots in a booking are in same hub)
      const firstSlot = b.booking_slots[0]?.parking_slots;
      const locationName = firstSlot?.parking_locations?.name || 'Unknown Location';

      // Map slots
      const slots = b.booking_slots.map((bs) => ({
        id: bs.parking_slots.id,
        number: bs.parking_slots.number,
        type: bs.parking_slots.type.toLowerCase(), // ENUM -> lowercase string
      }));

      // Determine overall type (EV, Normal, etc)
      const uniqueTypes = new Set(slots.map(s => s.type));
      let slotType = 'normal';
      if (uniqueTypes.has('ev')) slotType = 'ev';
      else if (uniqueTypes.has('car_wash')) slotType = 'car-wash';

      return {
        bookingId: b.id,
        date: b.date.toISOString(),
        location: locationName,
        time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: b.duration,
        slots: slots,
        slotType: slotType,
        status: b.status.toLowerCase(), // 'PENDING' -> 'pending'
        createdAt: b.createdAt.toISOString(),
        totalAmount: b.totalAmount,
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
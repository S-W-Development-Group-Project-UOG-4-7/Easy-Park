import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    // Verify Ownership via Email lookup
    const user = await prisma.users.findUnique({ where: { email: authUser.email } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Update Status
    await prisma.bookings.update({
      where: { 
        id: bookingId,
        userId: user.id // Security: ensure user owns it
      },
      data: { status: 'CANCELLED' } // Matches Enum: BookingStatus.CANCELLED
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled' });

  } catch (error) {
    console.error('[CANCEL_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Cancellation failed' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function resolveUserId(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) return authUser.userId;
  if (!authUser.email) return null;
  const user = await prisma.users.findUnique({
    where: { email: authUser.email.toLowerCase() },
    select: { id: true },
  });
  return user?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { bookingId } = await request.json();
    if (!bookingId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const userId = await resolveUserId(authUser);
    if (!userId) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const existing = await prisma.bookings.findFirst({
      where: { id: String(bookingId), customerId: userId },
      select: { id: true, status: true },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.bookings.update({
        where: { id: existing.id },
        data: { status: 'CANCELLED' },
      });
      await tx.booking_status_history.create({
        data: {
          bookingId: existing.id,
          oldStatus: existing.status,
          newStatus: 'CANCELLED',
          changedBy: userId,
          note: 'Cancelled by customer',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('[CANCEL_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Cancellation failed' }, { status: 500 });
  }
}

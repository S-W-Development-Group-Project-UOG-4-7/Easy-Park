import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || (!authUser.email && !authUser.userId)) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Get the user
    let user = authUser.userId
      ? await prisma.users.findUnique({ where: { id: authUser.userId } })
      : null;
    if (!user && authUser.email) {
      user = await prisma.users.findUnique({
        where: { email: authUser.email.toLowerCase() },
      });
    }

    if (!user) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Fetch user's bookings
    const bookings = await prisma.bookings.findMany({
      where: { userId: user.id },
      include: {
        booking_slots: {
          include: {
            parking_slots: {
              include: { parking_locations: true },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const notifications: any[] = [];

    // Generate notifications based on user's bookings
    const now = new Date();

    // 1. Pending payments reminder - ONE notification PER booking with pending payment
    const pendingPaymentBookings = bookings.filter((b) => {
      if (b.status === 'CANCELLED') return false;
      if (b.payments?.method === 'CASH' && b.payments?.status === 'COMPLETED') return false;
      const total = b.totalAmount ?? 0;
      const paid = b.paidAmount ?? 0;
      return total > 0 && paid < total;
    });
    
    pendingPaymentBookings.forEach((booking, index) => {
      const remainingAmount = Math.max(0, (booking.totalAmount ?? 0) - (booking.paidAmount ?? 0));
      const locationName = booking.booking_slots[0]?.parking_slots?.parking_locations?.name || 'Parking location';
      notifications.push({
        id: `pending-payment-${booking.id}-${index}`,
        type: 'WARNING',
        message: `Rs.${remainingAmount.toFixed(0)} remaining for ${locationName}. Pay at the counter on your visit.`,
        read: false,
        createdAt: (booking.updatedAt ?? booking.createdAt ?? now).toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    });

    // 1b. Counter payment confirmation
    const counterPayments = bookings.filter(
      (b) => b.payments?.method === 'CASH' && b.payments?.status === 'COMPLETED'
    );
    counterPayments.forEach((booking, index) => {
      const locationName = booking.booking_slots[0]?.parking_slots?.parking_locations?.name || 'Parking location';
      notifications.push({
        id: `counter-payment-${booking.id}-${index}`,
        type: 'SUCCESS',
        message: `Payment received at the counter for ${locationName}. Thank you!`,
        read: false,
        createdAt: (booking.payments?.paidAt ?? booking.payments?.updatedAt ?? booking.updatedAt ?? now).toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    });

    // 1c. Booking cancellations
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
    cancelledBookings.forEach((booking, index) => {
      const locationName = booking.booking_slots[0]?.parking_slots?.parking_locations?.name || 'Parking location';
      notifications.push({
        id: `booking-cancelled-${booking.id}-${index}`,
        type: 'ALERT',
        message: `Your booking at ${locationName} was cancelled.`,
        read: false,
        createdAt: (booking.updatedAt ?? booking.createdAt ?? now).toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    });

    // 2. Upcoming bookings reminder
    const upcomingBookings = bookings.filter(b => {
      const bookingTime = new Date(b.startTime);
      const timeDiff = bookingTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);
      return hoursUntil > 0 && hoursUntil <= 24 && b.status !== 'CANCELLED';
    });
    if (upcomingBookings.length > 0) {
      const locationName = upcomingBookings[0]?.booking_slots[0]?.parking_slots?.parking_locations?.name || 'Your parking location';
      notifications.push({
        id: `upcoming-booking-${user.id}`,
        type: 'INFO',
        message: `Reminder: Your parking slot at ${locationName} is coming up in the next 24 hours.`,
        read: false,
        createdAt: new Date(upcomingBookings[0].startTime).toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    }

    // 3. Completed bookings
    const recentlyCompletedBookings = bookings.filter(b => {
      const bookingTime = new Date(b.endTime);
      const timeDiff = now.getTime() - bookingTime.getTime();
      const minsAgo = timeDiff / (1000 * 60);
      return minsAgo >= 0 && minsAgo <= 1440 && b.status === 'COMPLETED'; // Last 24 hours
    });
    if (recentlyCompletedBookings.length > 0) {
      notifications.push({
        id: `recent-completed-${user.id}`,
        type: 'SUCCESS',
        message: `Thank you for using EasyPark! Your recent booking has been completed. We hope you had a great experience.`,
        read: false,
        createdAt: new Date(recentlyCompletedBookings[0].endTime).toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    }

    // 4. Total pending bookings count
    const totalPendingBookings = bookings.filter(
      b => b.status === 'PENDING' && new Date(b.startTime) > now
    ).length;
    if (totalPendingBookings > 0) {
      notifications.push({
        id: `total-pending-${user.id}`,
        type: 'ALERT',
        message: `You have ${totalPendingBookings} pending booking(s) for today! Please complete the payment to secure your slot.`,
        read: false,
        createdAt: now.toISOString(),
        metadata: {
          actionUrl: '/customer/my-bookings',
        },
      });
    }

    // If no notifications, show a general message
    if (notifications.length === 0) {
      notifications.push({
        id: `no-notifications-${user.id}`,
        type: 'INFO',
        message: 'No new notifications. You are all set!',
        read: false,
        createdAt: now.toISOString(),
      });
    }

    // 5. Washer notifications for this customer (match by email if washer customer exists)
    if (user.email) {
      const washerCustomer = await prisma.washer_customers.findUnique({
        where: { email: user.email.toLowerCase() },
      });
      if (washerCustomer) {
        const washerBookings = await prisma.washer_bookings.findMany({
          where: { customerId: washerCustomer.id },
          select: { id: true },
        });
        const washerBookingIds = washerBookings.map((b) => b.id);
        if (washerBookingIds.length > 0) {
          const washerNotes = await prisma.washer_notifications.findMany({
            where: { bookingId: { in: washerBookingIds } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          });
          washerNotes.forEach((note, index) => {
            notifications.push({
              id: `washer-note-${note.id}-${index}`,
              type: 'INFO',
              message: note.message,
              read: note.read ?? false,
              createdAt: note.createdAt?.toISOString?.() || now.toISOString(),
              metadata: {
                actionUrl: '/customer/notifications',
              },
            });
          });
        }
      }
    }

    const sorted = notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const limited = sorted.slice(0, 50);
    const unreadCount = limited.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      data: limited,
      unreadCount,
    });
  } catch (error) {
    console.error('Customer notifications API error:', error);
    return NextResponse.json(
      { success: true, data: [] },
      { status: 200 }
    );
  }
}

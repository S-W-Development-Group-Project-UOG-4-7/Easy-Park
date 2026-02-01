import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser?.email) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Get the user
    const user = await prisma.users.findUnique({
      where: { email: authUser.email },
    });

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
      },
      orderBy: { createdAt: 'desc' },
    });

    const notifications: any[] = [];

    // Generate notifications based on user's bookings
    const now = new Date();

    // 1. Pending payments reminder - ONE notification PER booking with pending payment
    const pendingPaymentBookings = bookings.filter(
      b => b.status !== 'CANCELLED' && b.paidAmount < b.totalAmount
    );
    
    pendingPaymentBookings.forEach((booking, index) => {
      const remainingAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
      const locationName = booking.booking_slots[0]?.parking_slots?.parking_locations?.name || 'Parking location';
      notifications.push({
        id: `pending-payment-${booking.id}-${index}`,
        type: 'WARNING',
        message: `Rs.${remainingAmount.toFixed(0)} remaining for ${locationName}. Pay at the counter on your visit.`,
        read: false,
        createdAt: now.toISOString(),
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
        createdAt: now.toISOString(),
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
        createdAt: now.toISOString(),
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

    // 5. Check for washer-relevant notifications (car wash service)
    const washerServices = bookings.filter(b => 
      b.booking_slots.some(bs => bs.parking_slots.type === 'car-wash')
    );
    
    washerServices.forEach((booking, index) => {
      const locationName = booking.booking_slots[0]?.parking_slots?.parking_locations?.name || 'location';
      notifications.push({
        id: `washer-service-${booking.id}-${index}`,
        type: 'INFO',
        message: `Car wash service available at ${locationName}. Book now for premium cleaning.`,
        read: false,
        createdAt: now.toISOString(),
        metadata: {
          actionUrl: '/customer/view-bookings',
        },
      });
    });

    return NextResponse.json({ 
      success: true, 
      data: notifications.slice(0, 10), // Limit to 10 most recent
    });
  } catch (error) {
    console.error('Customer notifications API error:', error);
    return NextResponse.json(
      { success: true, data: [] },
      { status: 200 }
    );
  }
}

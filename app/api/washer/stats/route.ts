import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const filterDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(filterDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filterDate);
    endOfDay.setHours(23, 59, 59, 999);

    const baseWhere = auth.role === 'WASHER' ? { washerId: auth.userId } : {};

    const todayJobs = await prisma.wash_jobs.findMany({
      where: {
        ...baseWhere,
        bookingSlot: {
          booking: {
            startTime: { gte: startOfDay, lte: endOfDay },
          },
        },
      },
      include: {
        bookingSlot: {
          include: {
            booking: {
              select: { status: true, startTime: true, customerId: true },
            },
          },
        },
      },
    });

    const today = {
      totalBookingsToday: todayJobs.length,
      pendingBookings: 0,
      acceptedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };
    for (const job of todayJobs) {
      if (job.bookingSlot.booking.status === 'CANCELLED') today.cancelledBookings += 1;
      else if (job.status === 'PENDING') today.pendingBookings += 1;
      else if (job.status === 'ACCEPTED') today.acceptedBookings += 1;
      else today.completedBookings += 1;
    }

    const allJobs = await prisma.wash_jobs.findMany({
      where: baseWhere,
      include: {
        bookingSlot: {
          include: {
            booking: {
              select: { status: true, startTime: true, customerId: true },
            },
          },
        },
      },
    });

    const allTime = {
      total: allJobs.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };
    const customerIds = new Set<string>();
    for (const job of allJobs) {
      customerIds.add(job.bookingSlot.booking.customerId);
      if (job.bookingSlot.booking.status === 'CANCELLED') allTime.cancelled += 1;
      else if (job.status === 'PENDING') allTime.pending += 1;
      else if (job.status === 'ACCEPTED') allTime.accepted += 1;
      else allTime.completed += 1;
    }

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const upcomingRaw = allJobs
      .filter((job) => {
        const time = job.bookingSlot.booking.startTime;
        return time >= now && time <= twoHoursLater;
      })
      .slice(0, 5);

    const upcomingBookings = upcomingRaw.map((job) => ({
      id: job.id,
      slotTime: job.bookingSlot.booking.startTime,
      status: job.bookingSlot.booking.status === 'CANCELLED' ? 'CANCELLED' : job.status,
    }));

    return successResponse(
      {
        today,
        allTime,
        upcomingBookings,
        totalCustomers: customerIds.size,
        date: filterDate.toISOString().split('T')[0],
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return serverErrorResponse('Failed to fetch dashboard stats');
  }
}

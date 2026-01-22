import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/stats
 * Get dashboard statistics for washer dashboard
 * 
 * Returns:
 * - Total bookings for the current day
 * - Total pending bookings
 * - Total accepted bookings
 * - Total completed bookings
 * - Total cancelled bookings
 * - Upcoming bookings count
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access dashboard stats
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Get the date to filter by (default to today)
    const filterDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(filterDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filterDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get total bookings for the day
    const todayBookings = await prisma.washerBooking.count({
      where: {
        slotTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get status breakdown for the day
    const statusBreakdown = await prisma.washerBooking.groupBy({
      by: ['status'],
      where: {
        slotTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: { status: true },
    });

    // Initialize counters
    const stats = {
      totalBookingsToday: todayBookings,
      pendingBookings: 0,
      acceptedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };

    // Populate status counts
    statusBreakdown.forEach((stat) => {
      switch (stat.status) {
        case 'PENDING':
          stats.pendingBookings = stat._count.status;
          break;
        case 'ACCEPTED':
          stats.acceptedBookings = stat._count.status;
          break;
        case 'COMPLETED':
          stats.completedBookings = stat._count.status;
          break;
        case 'CANCELLED':
          stats.cancelledBookings = stat._count.status;
          break;
      }
    });

    // Get upcoming bookings (next 2 hours)
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const upcomingBookings = await prisma.washerBooking.findMany({
      where: {
        slotTime: {
          gte: now,
          lte: twoHoursLater,
        },
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { slotTime: 'asc' },
      take: 5,
    });

    // Get all-time statistics
    const allTimeStats = await prisma.washerBooking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const allTime = {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    allTimeStats.forEach((stat) => {
      allTime.total += stat._count.status;
      switch (stat.status) {
        case 'PENDING':
          allTime.pending = stat._count.status;
          break;
        case 'ACCEPTED':
          allTime.accepted = stat._count.status;
          break;
        case 'COMPLETED':
          allTime.completed = stat._count.status;
          break;
        case 'CANCELLED':
          allTime.cancelled = stat._count.status;
          break;
      }
    });

    // Get total customers count
    const totalCustomers = await prisma.washerCustomer.count();

    return successResponse(
      {
        today: stats,
        allTime,
        upcomingBookings,
        totalCustomers,
        date: filterDate.toISOString().split('T')[0],
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return serverErrorResponse('Failed to fetch dashboard stats');
  }
}

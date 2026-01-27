import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/bookings
 * Fetch all washer bookings with filtering, searching, and sorting
 * 
 * Query Parameters:
 * - status: Filter by status (PENDING, ACCEPTED, COMPLETED, CANCELLED)
 * - date: Filter by date (YYYY-MM-DD)
 * - search: Search by customer name or vehicle
 * - sortBy: Sort by 'earliest', 'latest', 'vehicle', 'status'
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access washer bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFilter = searchParams.get('date');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'earliest';

    // Build where clause
    const whereClause: any = {};

    // Status filter
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.slotTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Search filter (customer name or vehicle)
    if (search) {
      whereClause.OR = [
        {
          washer_customers: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          vehicle: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build order by clause
    let orderByClause: any = {};
    switch (sortBy) {
      case 'earliest':
        orderByClause = { slotTime: 'asc' };
        break;
      case 'latest':
        orderByClause = { slotTime: 'desc' };
        break;
      case 'vehicle':
        orderByClause = { vehicle: 'asc' };
        break;
      case 'status':
        orderByClause = { status: 'asc' };
        break;
      default:
        orderByClause = { slotTime: 'asc' };
    }

    const bookings = await prisma.washer_bookings.findMany({
      where: whereClause,
      include: {
        washer_customers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            vehicleDetails: true,
          },
        },
      },
      orderBy: orderByClause,
    });

    return successResponse(bookings, 'Washer bookings retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer bookings:', error);
    return serverErrorResponse('Failed to fetch washer bookings');
  }
}

/**
 * POST /api/washer/bookings
 * Create a new washer booking
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { customerId, slotTime, vehicle, serviceType, notes } = body;

    // Validate required fields
    if (!customerId || !slotTime || !vehicle || !serviceType) {
      return errorResponse('Missing required fields: customerId, slotTime, vehicle, serviceType');
    }

    // Check if customer exists
    const customer = await prisma.washer_customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return notFoundResponse('Customer not found');
    }

    // Create the booking with default PENDING status
    const booking = await prisma.washer_bookings.create({
      data: {
        customerId,
        slotTime: new Date(slotTime),
        vehicle,
        serviceType,
        notes,
        status: 'PENDING',
      },
      include: {
        washer_customers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            vehicleDetails: true,
          },
        },
      },
    });

    // Create notification for new booking
    await prisma.washer_notifications.create({
      data: {
        type: 'new_booking',
        message: `New booking from ${customer.name} for ${serviceType}`,
        bookingId: booking.id,
        read: false,
      },
    });

    return createdResponse(booking, 'Booking created successfully');
  } catch (error) {
    console.error('Error creating washer booking:', error);
    return serverErrorResponse('Failed to create washer booking');
  }
}

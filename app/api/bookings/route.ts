import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET all bookings for the authenticated user (or all for land owners/admins)
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const all = searchParams.get('all'); // For land owners to get all bookings
    const propertyId = searchParams.get('propertyId'); // Filter by property/location
    const dateFilter = searchParams.get('date'); // Filter by date
    const timeFilter = searchParams.get('time'); // Filter by time

    // Build where clause based on role
    let whereClause: any = {};
    
    if (authUser.role === 'LAND_OWNER') {
      // Land owners can see all bookings for slots in their locations
      const ownedLocations = await prisma.parkingLocation.findMany({
        where: { ownerId: authUser.userId },
        select: { id: true },
      });
      const locationIds = ownedLocations.map(l => l.id);
      
      if (locationIds.length > 0) {
        whereClause = {
          slots: {
            some: {
              slot: {
                locationId: { in: locationIds },
              },
            },
          },
        };
      }
    } else if (authUser.role === 'ADMIN' || authUser.role === 'COUNTER') {
      // Admins and counter staff can see all bookings
      whereClause = {};
    } else {
      // Regular customers only see their own bookings
      whereClause = { userId: authUser.userId };
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status as any;
    }

    // Add property/location filter if provided
    if (propertyId) {
      whereClause.slots = {
        ...whereClause.slots,
        some: {
          slot: {
            locationId: propertyId,
          },
        },
      };
    }

    // Add date filter if provided
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            contactNo: true,
            vehicleNumber: true,
          },
        },
        slots: {
          include: {
            slot: {
              include: {
                location: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by time if provided (do this after fetching since we need to compare time strings)
    let filteredBookings = bookings;
    if (timeFilter) {
      const [filterHour, filterMinute] = timeFilter.split(':').map(Number);
      filteredBookings = bookings.filter((booking) => {
        const bookingStartTime = new Date(booking.startTime);
        const bookingEndTime = new Date(booking.endTime);
        const filterTimeInMinutes = filterHour * 60 + filterMinute;
        const startInMinutes = bookingStartTime.getHours() * 60 + bookingStartTime.getMinutes();
        const endInMinutes = bookingEndTime.getHours() * 60 + bookingEndTime.getMinutes();
        // Check if the filter time falls within the booking time range
        return filterTimeInMinutes >= startInMinutes && filterTimeInMinutes <= endInMinutes;
      });
    }

    // Transform bookings for the frontend
    const transformedBookings = filteredBookings.map((booking) => {
      const firstSlot = booking.slots[0]?.slot;
      return {
        id: booking.id,
        bookingNumber: `BK-${booking.id.slice(-6).toUpperCase()}`,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: `${booking.duration}h`,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        amount: booking.totalAmount,
        status: booking.status.toLowerCase(),
        vehicleNumber: booking.user.vehicleNumber || 'N/A',
        createdAt: booking.createdAt,
        user: {
          id: booking.user.id,
          name: booking.user.fullName,
          email: booking.user.email,
          phone: booking.user.contactNo,
        },
        slot: {
          slotNumber: firstSlot?.number || 'N/A',
          zone: firstSlot?.zone || 'A',
          parkingLot: {
            id: firstSlot?.location?.id || '',
            name: firstSlot?.location?.name || 'Unknown',
            address: firstSlot?.location?.address || '',
          },
        },
        slots: booking.slots.map((bs) => ({
          id: bs.slot.id,
          number: bs.slot.number,
          zone: bs.slot.zone,
          location: bs.slot.location?.name,
        })),
        payment: booking.payment,
      };
    });

    return successResponse(transformedBookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return serverErrorResponse('Failed to fetch bookings');
  }
}

// POST create a new booking
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { date, startTime, endTime, duration, slotIds } = body;

    // Validation
    if (!date || !startTime || !endTime || !duration || !slotIds || slotIds.length === 0) {
      return errorResponse('Missing required fields');
    }

    // Check if slots are available
    const slots = await prisma.parkingSlot.findMany({
      where: {
        id: { in: slotIds },
        status: 'AVAILABLE',
      },
    });

    if (slots.length !== slotIds.length) {
      return errorResponse('One or more selected slots are not available');
    }

    // Calculate total amount
    const PRICE_PER_SLOT_PER_HOUR = 300;
    const totalAmount = PRICE_PER_SLOT_PER_HOUR * duration * slots.length;

    // Create booking with slots
    const booking = await prisma.booking.create({
      data: {
        userId: authUser.userId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        totalAmount,
        status: 'PENDING',
        slots: {
          create: slotIds.map((slotId: string) => ({
            slotId,
          })),
        },
      },
      include: {
        slots: {
          include: {
            slot: true,
          },
        },
      },
    });

    return createdResponse(booking, 'Booking created successfully');
  } catch (error) {
    console.error('Create booking error:', error);
    return serverErrorResponse('Failed to create booking');
  }
}

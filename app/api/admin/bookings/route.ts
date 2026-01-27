import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * Admin Bookings API
 * Uses the unified Booking table - same table used by frontend
 * 
 * This ensures:
 * - All bookings created from frontend are visible in admin
 * - Admin can view, filter, and search bookings
 * - Bookings are grouped by property as needed
 * 
 * View Booking Details Table Fields:
 * - Booking ID = Booking.id
 * - Property ID = via BookingSlot -> ParkingSlot -> ParkingLocation
 * - Property Name = ParkingLocation.name
 * - Booking Date = Booking.date
 * - Start Time = Booking.startTime
 * - End Time = Booking.endTime
 * - Slot Number = ParkingSlot.number
 * - User ID / Customer Name = User.id / User.fullName
 * - Booking Status = Booking.status
 */

// GET all bookings for admin with filters
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId'); // Filter by property
    const date = searchParams.get('date'); // Filter by date (YYYY-MM-DD)
    const startTime = searchParams.get('startTime'); // Filter by start time
    const endTime = searchParams.get('endTime'); // Filter by end time
    const status = searchParams.get('status'); // Filter by status
    const search = searchParams.get('search'); // Search by customer name/email
    const groupByProperty = searchParams.get('groupByProperty') === 'true';

    // Build where clause
    const whereClause: any = {};

    // Filter by status
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    // Filter by date
    if (date) {
      const filterDate = new Date(date);
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter by property
    if (propertyId) {
      whereClause.slots = {
        some: {
          slot: {
            locationId: propertyId,
          },
        },
      };
    }

    // Search by customer name or email
    if (search) {
      whereClause.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const bookings = await prisma.bookings.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            contactNo: true,
            vehicleNumber: true,
          },
        },
        booking_slots: {
          include: {
            parking_slots: {
              include: {
                parking_locations: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    });

    // Filter by time range if provided (post-fetch filtering for complex time logic)
    let filteredBookings = bookings;
    
    if (startTime || endTime) {
      filteredBookings = bookings.filter((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        if (startTime) {
          const [filterHour, filterMin] = startTime.split(':').map(Number);
          const filterStartMinutes = filterHour * 60 + filterMin;
          const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes();
          if (bookingStartMinutes < filterStartMinutes) return false;
        }
        
        if (endTime) {
          const [filterHour, filterMin] = endTime.split(':').map(Number);
          const filterEndMinutes = filterHour * 60 + filterMin;
          const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();
          if (bookingEndMinutes > filterEndMinutes) return false;
        }
        
        return true;
      });
    }

    // Transform to Admin Booking Details format
    const adminBookings = filteredBookings.map((booking) => {
      const firstSlot = booking.slots[0]?.slot;
      const property = firstSlot?.location;

      return {
        // View Booking Details Table Fields
        bookingId: booking.id,
        bookingNumber: `BK-${booking.id.slice(-6).toUpperCase()}`,
        propertyId: property?.id || null,
        propertyName: property?.name || 'Unknown',
        propertyAddress: property?.address || '',
        bookingDate: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        slotNumber: firstSlot?.number || 'N/A',
        slotZone: firstSlot?.zone || 'A',
        userId: booking.user.id,
        customerName: booking.user.fullName,
        customerEmail: booking.user.email,
        customerPhone: booking.user.contactNo,
        vehicleNumber: booking.user.vehicleNumber,
        bookingStatus: booking.status,
        // Additional useful fields
        duration: booking.duration,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        paymentStatus: booking.payment?.status || 'PENDING',
        paymentMethod: booking.payment?.method || null,
        allSlots: booking.slots.map(bs => ({
          id: bs.slot.id,
          number: bs.slot.number,
          zone: bs.slot.zone,
          type: bs.slot.type,
        })),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    // Group by property if requested
    if (groupByProperty) {
      const grouped: Record<string, any> = {};
      
      adminBookings.forEach((booking) => {
        const propId = booking.propertyId || 'unknown';
        if (!grouped[propId]) {
          grouped[propId] = {
            propertyId: propId,
            propertyName: booking.propertyName,
            propertyAddress: booking.propertyAddress,
            bookings: [],
            totalBookings: 0,
            totalRevenue: 0,
          };
        }
        grouped[propId].bookings.push(booking);
        grouped[propId].totalBookings++;
        grouped[propId].totalRevenue += booking.totalAmount;
      });

      return NextResponse.json({
        success: true,
        groupedByProperty: Object.values(grouped),
        total: adminBookings.length,
      });
    }

    return NextResponse.json({
      success: true,
      bookings: adminBookings,
      total: adminBookings.length,
    });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// PATCH update booking status
export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id: bookingId },
      data: { status: status.toUpperCase() },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        booking_slots: {
          include: {
            parking_slots: {
              include: {
                parking_locations: true,
              },
            },
          },
        },
      },
    });

    // If booking is cancelled, release the slots
    if (status.toUpperCase() === 'CANCELLED') {
      const slotIds = updatedBooking.booking_slots.map(bs => bs.slotId);
      await prisma.parking_slots.updateMany({
        where: { id: { in: slotIds } },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: {
        bookingId: updatedBooking.id,
        bookingStatus: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

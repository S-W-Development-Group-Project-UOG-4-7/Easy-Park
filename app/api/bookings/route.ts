import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const slotId = searchParams.get('slotId');

    const where: {
      status?: string;
      userId?: string;
      slotId?: string;
    } = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (slotId) {
      where.slotId = slotId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        slot: {
          include: {
            parkingLot: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleNumber, startTime, duration, amount, userId, slotId } = body;

    if (!vehicleNumber || !startTime || !duration || !userId || !slotId) {
      return NextResponse.json(
        { error: 'vehicleNumber, startTime, duration, userId, and slotId are required' },
        { status: 400 }
      );
    }

    // Check if slot is available
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Slot is not available' },
        { status: 400 }
      );
    }

    // Create booking and update slot status
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          vehicleNumber,
          startTime: new Date(startTime),
          duration,
          amount: amount || slot.pricePerHour,
          userId,
          slotId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          slot: {
            include: {
              parkingLot: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
      }),
      prisma.slot.update({
        where: { id: slotId },
        data: { status: 'occupied' },
      }),
    ]);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH update booking status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, completed, or cancelled' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking and release slot if completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      const [updatedBooking] = await prisma.$transaction([
        prisma.booking.update({
          where: { id },
          data: {
            status,
            endTime: status === 'completed' ? new Date() : undefined,
          },
        }),
        prisma.slot.update({
          where: { id: booking.slotId },
          data: { status: 'available' },
        }),
      ]);

      return NextResponse.json({ booking: updatedBooking });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

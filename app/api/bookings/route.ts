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

// GET all bookings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const bookings = await prisma.booking.findMany({
      where: {
        userId: authUser.userId,
        ...(status && { status: status as any }),
      },
      include: {
        slots: {
          include: {
            slot: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(bookings);
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

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET all parking slots (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    // Build where clause
    const where: any = {};
    if (locationId) where.locationId = locationId;
    if (type) where.type = type;
    if (status) where.status = status;

    const slots = await prisma.parkingSlot.findMany({
      where,
      include: {
        location: true,
        // Include bookings for the specified date/time to check availability
        bookings: date ? {
          where: {
            booking: {
              date: new Date(date),
              status: { notIn: ['CANCELLED'] },
              ...(startTime && endTime ? {
                OR: [
                  {
                    startTime: { lte: new Date(endTime) },
                    endTime: { gte: new Date(startTime) },
                  },
                ],
              } : {}),
            },
          },
          include: {
            booking: true,
          },
        } : false,
      },
      orderBy: {
        number: 'asc',
      },
    });

    // If checking availability, filter out booked slots
    const availableSlots = date
      ? slots.map((slot) => ({
          ...slot,
          isAvailable: !slot.bookings || slot.bookings.length === 0,
        }))
      : slots;

    return successResponse(availableSlots);
  } catch (error) {
    console.error('Get slots error:', error);
    return serverErrorResponse('Failed to fetch slots');
  }
}

// POST create a new parking slot (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, type, pricePerHour, locationId } = body;

    // Validation
    if (!number || !locationId) {
      return errorResponse('Slot number and location are required');
    }

    // Check if slot number already exists at this location
    const existingSlot = await prisma.parkingSlot.findFirst({
      where: {
        number,
        locationId,
      },
    });

    if (existingSlot) {
      return errorResponse('Slot number already exists at this location');
    }

    const slot = await prisma.parkingSlot.create({
      data: {
        number,
        type: type || 'NORMAL',
        pricePerHour: pricePerHour || 300,
        locationId,
      },
      include: {
        location: true,
      },
    });

    return createdResponse(slot, 'Slot created successfully');
  } catch (error) {
    console.error('Create slot error:', error);
    return serverErrorResponse('Failed to create slot');
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET all parking locations
export async function GET() {
  try {
    const locations = await prisma.parkingLocation.findMany({
      include: {
        slots: {
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            pricePerHour: true,
          },
        },
        _count: {
          select: {
            slots: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add availability stats
    const locationsWithStats = locations.map((location) => {
      const availableSlots = location.slots.filter((s) => s.status === 'AVAILABLE').length;
      return {
        ...location,
        availableSlots,
        occupancyRate: location.slots.length > 0 
          ? ((location.slots.length - availableSlots) / location.slots.length * 100).toFixed(1)
          : 0,
      };
    });

    return successResponse(locationsWithStats);
  } catch (error) {
    console.error('Get locations error:', error);
    return serverErrorResponse('Failed to fetch locations');
  }
}

// POST create a new parking location (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, description, totalSlots } = body;

    // Validation
    if (!name || !address) {
      return errorResponse('Name and address are required');
    }

    const location = await prisma.parkingLocation.create({
      data: {
        name,
        address,
        description,
        totalSlots: totalSlots || 0,
      },
    });

    return createdResponse(location, 'Location created successfully');
  } catch (error) {
    console.error('Create location error:', error);
    return serverErrorResponse('Failed to create location');
  }
}

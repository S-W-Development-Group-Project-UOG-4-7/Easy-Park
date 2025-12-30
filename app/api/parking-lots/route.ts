import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all parking lots
export async function GET() {
  try {
    const parkingLots = await prisma.parkingLot.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slots: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to include slot counts
    const transformedParkingLots = parkingLots.map((lot) => ({
      id: lot.id,
      name: lot.name,
      address: lot.address,
      ownerId: lot.ownerId,
      owner: lot.owner,
      totalSlots: lot.slots.length,
      availableSlots: lot.slots.filter((s) => s.status === 'available').length,
      createdAt: lot.createdAt,
      updatedAt: lot.updatedAt,
    }));

    return NextResponse.json({ parkingLots: transformedParkingLots });
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parking lots' },
      { status: 500 }
    );
  }
}

// POST create a new parking lot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, ownerId } = body;

    if (!name || !address || !ownerId) {
      return NextResponse.json(
        { error: 'Name, address, and ownerId are required' },
        { status: 400 }
      );
    }

    const parkingLot = await prisma.parkingLot.create({
      data: {
        name,
        address,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ parkingLot }, { status: 201 });
  } catch (error) {
    console.error('Error creating parking lot:', error);
    return NextResponse.json(
      { error: 'Failed to create parking lot' },
      { status: 500 }
    );
  }
}

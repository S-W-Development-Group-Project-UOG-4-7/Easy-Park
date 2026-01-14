import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all parking lots
export async function GET() {
  try {
    const parkingLots = await prisma.parkingLocation.findMany({
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
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
      owner: lot.owner
        ? {
            id: lot.owner.id,
            name: lot.owner.fullName,
            email: lot.owner.email,
          }
        : null,
      totalSlots: lot.slots.length,
      availableSlots: lot.slots.filter((s) => s.status === 'AVAILABLE').length,
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

    const parkingLot = await prisma.parkingLocation.create({
      data: {
        name,
        address,
        ownerId,
        totalSlots: 0,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        parkingLot: {
          id: parkingLot.id,
          name: parkingLot.name,
          address: parkingLot.address,
          ownerId: parkingLot.ownerId,
          owner: parkingLot.owner
            ? {
                id: parkingLot.owner.id,
                name: parkingLot.owner.fullName,
                email: parkingLot.owner.email,
              }
            : null,
          createdAt: parkingLot.createdAt,
          updatedAt: parkingLot.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating parking lot:', error);
    return NextResponse.json(
      { error: 'Failed to create parking lot' },
      { status: 500 }
    );
  }
}

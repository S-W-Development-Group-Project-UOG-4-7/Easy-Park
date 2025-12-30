import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all cars (for washer dashboard)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const cars = await prisma.car.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ cars });
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

// POST add a new car for washing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, location, time, type } = body;

    if (!vehicleId || !location || !time || !type) {
      return NextResponse.json(
        { error: 'vehicleId, location, time, and type are required' },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        vehicleId,
        location,
        time,
        type,
        status: 'waiting',
      },
    });

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to add car' },
      { status: 500 }
    );
  }
}

// PATCH update car status (for washer actions)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, washerId } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['waiting', 'accepted', 'washing', 'finished'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: waiting, accepted, washing, or finished' },
        { status: 400 }
      );
    }

    const car = await prisma.car.update({
      where: { id },
      data: {
        status,
        ...(washerId && { washerId }),
      },
    });

    return NextResponse.json({ car });
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all slots (optionally filtered by parkingLotId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parkingLotId = searchParams.get('parkingLotId');

    const slots = await prisma.slot.findMany({
      where: parkingLotId ? { parkingLotId } : undefined,
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: [
        { zone: 'asc' },
        { slotNumber: 'asc' },
      ],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

// POST create new slots
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parkingLotId, zone, count, pricePerHour } = body;

    if (!parkingLotId || !zone || !count) {
      return NextResponse.json(
        { error: 'parkingLotId, zone, and count are required' },
        { status: 400 }
      );
    }

    // Get the highest slot number for this zone in this parking lot
    const existingSlots = await prisma.slot.findMany({
      where: {
        parkingLotId,
        zone,
      },
      orderBy: {
        slotNumber: 'desc',
      },
      take: 1,
    });

    let startNumber = 1;
    if (existingSlots.length > 0) {
      const lastSlotNumber = existingSlots[0].slotNumber;
      const numberMatch = lastSlotNumber.match(/\d+$/);
      if (numberMatch) {
        startNumber = parseInt(numberMatch[0], 10) + 1;
      }
    }

    // Create multiple slots
    const slotsToCreate = [];
    for (let i = 0; i < count; i++) {
      const slotNumber = `${zone}-${String(startNumber + i).padStart(2, '0')}`;
      slotsToCreate.push({
        slotNumber,
        zone,
        status: 'available',
        pricePerHour: pricePerHour || 15,
        parkingLotId,
      });
    }

    const createdSlots = await prisma.slot.createMany({
      data: slotsToCreate,
    });

    return NextResponse.json(
      { message: `${createdSlots.count} slots created successfully` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating slots:', error);
    return NextResponse.json(
      { error: 'Failed to create slots' },
      { status: 500 }
    );
  }
}

// DELETE a slot
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Slot ID is required' },
        { status: 400 }
      );
    }

    await prisma.slot.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}

// PATCH update a slot's status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    console.log('PATCH /api/slots - Received:', { id, status });

    if (!id || !status) {
      console.log('PATCH /api/slots - Missing id or status');
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'occupied', 'maintenance'];
    if (!validStatuses.includes(status)) {
      console.log('PATCH /api/slots - Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status. Must be: available, occupied, or maintenance' },
        { status: 400 }
      );
    }

    const slot = await prisma.slot.update({
      where: { id },
      data: { status },
    });

    console.log('PATCH /api/slots - Updated slot:', slot);

    return NextResponse.json({ slot });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

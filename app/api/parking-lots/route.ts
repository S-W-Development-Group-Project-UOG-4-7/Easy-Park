import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

const getActivatedParkingLots = unstable_cache(
  async () => {
    return prisma.parking_locations.findMany({
      where: { status: 'ACTIVATED' as const },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        parking_slots: {
          select: {
            id: true,
            status: true,
            type: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  ['parking-lots:activated'],
  { revalidate: 60 }
);

// GET all parking lots
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const isAdmin = user?.role === 'ADMIN';
    const showAll = request.nextUrl.searchParams.get('showAll') === 'true';
    
    // Build where clause based on user role
    // Only admins can see non-activated parking lots (when showAll=true)
    // Regular users and washers only see ACTIVATED parking lots
    const whereClause = (isAdmin && showAll) ? {} : { status: 'ACTIVATED' as const };

    const useCache = !isAdmin && !showAll;
    const parkingLots = useCache
      ? await getActivatedParkingLots()
      : await prisma.parking_locations.findMany({
          where: whereClause,
          include: {
            users: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            parking_slots: {
              select: {
                id: true,
                status: true,
                type: true,
                pricePerHour: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

    // Transform the data to include slot counts and pricing
    const transformedParkingLots = parkingLots.map((lot) => ({
      id: lot.id,
      name: lot.name,
      address: lot.address,
      description: lot.description,
      ownerId: lot.ownerId,
      owner: lot.users
        ? {
            id: lot.users.id,
            name: lot.users.fullName,
            email: lot.users.email,
          }
        : null,
      totalSlots: lot.parking_slots.length,
      availableSlots: lot.parking_slots.filter((s) => s.status === 'AVAILABLE').length,
      normalSlots: lot.parking_slots.filter((s) => s.type === 'NORMAL').length,
      evSlots: lot.parking_slots.filter((s) => s.type === 'EV').length,
      carWashSlots: lot.parking_slots.filter((s) => s.type === 'CAR_WASH').length,
      pricePerHour: lot.pricePerHour,
      pricePerDay: lot.pricePerDay,
      status: lot.status,
      createdAt: lot.createdAt,
      updatedAt: lot.updatedAt,
    }));

    return NextResponse.json(
      { parkingLots: transformedParkingLots },
      {
        headers: {
          'Cache-Control': useCache
            ? 'public, s-maxage=60, stale-while-revalidate=300'
            : 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parking lots' },
      { status: 500 }
    );
  }
}

// POST create a new parking lot
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    // Only ADMIN and LAND_OWNER can create parking lots
    if (!user || !['ADMIN', 'LAND_OWNER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins and land owners can create parking lots' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, ownerId, pricePerHour, pricePerDay, status, slots } = body;

    // Validation
    if (!name || !address || !ownerId) {
      return NextResponse.json(
        { error: 'Name, address, and ownerId are required' },
        { status: 400 }
      );
    }

    // Validate slots if provided
    if (slots && slots.length > 0) {
      const totalSlotCount = slots.reduce((sum: number, slot: { count?: number }) => sum + (slot.count || 0), 0);
      if (totalSlotCount <= 0) {
        return NextResponse.json(
          { error: 'Total parking slots must be greater than 0' },
          { status: 400 }
        );
      }
    }

    // Validate prices
    if (pricePerHour !== undefined && pricePerHour <= 0) {
      return NextResponse.json(
        { error: 'Price per hour must be greater than 0' },
        { status: 400 }
      );
    }

    if (pricePerDay !== undefined && pricePerDay <= 0) {
      return NextResponse.json(
        { error: 'Price per day must be greater than 0' },
        { status: 400 }
      );
    }

    // Only admin can set status to ACTIVATED directly
    const locationStatus = user.role === 'ADMIN' && status === 'ACTIVATED' ? 'ACTIVATED' : 'NOT_ACTIVATED';

    const parkingLot = await prisma.parking_locations.create({
      data: {
        id: crypto.randomUUID(),
        name,
        address,
        ownerId,
        totalSlots: 0,
        pricePerHour: pricePerHour || 300,
        pricePerDay: pricePerDay || 2000,
        status: locationStatus,
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Create parking slots if provided
    if (slots && slots.length > 0) {
      let slotNumber = 1;
      for (const slotConfig of slots) {
        const slotType = slotConfig.type === 'Normal' ? 'NORMAL' : 
                        slotConfig.type === 'EV' ? 'EV' : 'CAR_WASH';
        const count = slotConfig.count || 1;
        
        for (let i = 0; i < count; i++) {
          const zone = slotType === 'EV' ? 'K' : slotType === 'CAR_WASH' ? 'CW' : 
                      String.fromCharCode(65 + Math.floor((slotNumber - 1) / 9));
          const num = slotType === 'EV' || slotType === 'CAR_WASH' ? i + 1 : ((slotNumber - 1) % 9) + 1;
          
          await prisma.parking_slots.create({
            data: {
              id: crypto.randomUUID(),
              number: `${zone}${num}`,
              zone: zone,
              type: slotType,
              status: 'AVAILABLE',
              pricePerHour: pricePerHour || (slotType === 'EV' ? 400 : slotType === 'CAR_WASH' ? 500 : 300),
              locationId: parkingLot.id,
              updatedAt: new Date(),
            },
          });
          slotNumber++;
        }
      }

      // Update total slots count
      const totalSlots = await prisma.parking_slots.count({ where: { locationId: parkingLot.id } });
      await prisma.parking_locations.update({
        where: { id: parkingLot.id },
        data: { totalSlots, updatedAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        parkingLot: {
          id: parkingLot.id,
          name: parkingLot.name,
          address: parkingLot.address,
          ownerId: parkingLot.ownerId,
          pricePerHour: parkingLot.pricePerHour,
          pricePerDay: parkingLot.pricePerDay,
        status: parkingLot.status,
        owner: parkingLot.users
          ? {
              id: parkingLot.users.id,
              name: parkingLot.users.fullName,
              email: parkingLot.users.email,
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

// PATCH update parking lot (admin only for status, prices, and slots)
export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login to continue' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, pricePerHour, pricePerDay, name, address, description, totalSlots } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Parking lot ID is required' },
        { status: 400 }
      );
    }

    // Get existing parking lot
    const existingLot = await prisma.parking_locations.findUnique({
      where: { id },
    });

    if (!existingLot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    // Check permissions for different operations
    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingLot.ownerId === user.userId;

    // Only admin can change status
    if (status !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can change parking lot status' },
        { status: 403 }
      );
    }

    // Only admin can update prices
    if ((pricePerHour !== undefined || pricePerDay !== undefined) && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can update parking prices' },
        { status: 403 }
      );
    }

    // Only admin can update total slots
    if (totalSlots !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can update available slots' },
        { status: 403 }
      );
    }

    // Only admin or owner can update name, address, description
    if ((name !== undefined || address !== undefined || description !== undefined) && !isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins or owners can update parking lot details' },
        { status: 403 }
      );
    }

    // Validate prices
    if (pricePerHour !== undefined && pricePerHour <= 0) {
      return NextResponse.json(
        { error: 'Price per hour must be greater than 0' },
        { status: 400 }
      );
    }

    if (pricePerDay !== undefined && pricePerDay <= 0) {
      return NextResponse.json(
        { error: 'Price per day must be greater than 0' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
    if (pricePerDay !== undefined) updateData.pricePerDay = pricePerDay;
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (totalSlots !== undefined) updateData.totalSlots = totalSlots;
    updateData.updatedAt = new Date();

    const updatedLot = await prisma.parking_locations.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        parking_slots: true,
      },
    });

    // If price updated, update all slot prices for this location
    if (pricePerHour !== undefined) {
      await prisma.parking_slots.updateMany({
        where: { 
          locationId: id,
          type: 'NORMAL',
        },
        data: { pricePerHour },
      });
      
      // EV slots get 33% more
      await prisma.parking_slots.updateMany({
        where: { 
          locationId: id,
          type: 'EV',
        },
        data: { pricePerHour: Math.round(pricePerHour * 1.33) },
      });
      
      // Car wash slots get 67% more
      await prisma.parking_slots.updateMany({
        where: { 
          locationId: id,
          type: 'CAR_WASH',
        },
        data: { pricePerHour: Math.round(pricePerHour * 1.67) },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Parking lot updated successfully',
      parkingLot: updatedLot,
    });
  } catch (error) {
    console.error('Error updating parking lot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update parking lot';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

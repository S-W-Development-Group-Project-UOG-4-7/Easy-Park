import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * Admin Properties API
 * Uses the admin_properties table - THE main table for all property data
 * 
 * This ensures:
 * - Admin panel displays properties from admin_properties table
 * - Frontend property creation saves to admin_properties table
 * - Single source of truth for all property data
 */

// GET all properties for admin
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    // Log for debugging
    console.log('Admin Properties GET - User:', user);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const search = searchParams.get('search'); // Search by name or location

    // Build where clause
    const whereClause: any = {};
    
    if (status && (status === 'ACTIVATED' || status === 'DEACTIVATED')) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { propertyName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch from admin_properties table (using snake_case model name from DB)
    const properties = await prisma.admin_properties.findMany({
      where: whereClause,
      include: {
        admin_parking_slots: {
          select: {
            id: true,
            slotNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match expected format
    const adminProperties = properties.map((property) => {
      const slots = property.admin_parking_slots || [];
      const totalSlots = slots.length || property.totalSlots;
      const availableSlots = slots.filter(s => s.status === 'AVAILABLE').length;

      return {
        // Admin Property Table Fields
        id: property.id,
        propertyId: property.id,
        name: property.propertyName,
        propertyName: property.propertyName,
        address: property.location,
        location: property.location,
        description: property.description,
        pricePerHour: property.pricePerHour,
        pricePerDay: property.pricePerHour * 8, // Calculated
        status: property.status,
        parkingAreaStatus: property.status,
        totalSlots: totalSlots,
        totalParkingSlots: totalSlots,
        availableSlots: availableSlots,
        availableParkingSlots: availableSlots,
        normalSlots: totalSlots, // Since no slotType in DB, assume all are normal
        evSlots: 0,
        carWashSlots: 0,
        createdAt: property.createdAt,
        createdDate: property.createdAt,
        updatedAt: property.updatedAt,
        lastUpdatedDate: property.updatedAt,
        slots: slots.map(slot => ({
          id: slot.id,
          number: slot.slotNumber,
          slotNumber: slot.slotNumber,
          type: 'Normal',
          status: slot.status.toLowerCase(),
        })),
        slotBreakdown: {
          normal: totalSlots,
          ev: 0,
          carWash: 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      properties: adminProperties,
      // Also return as parkingLots for compatibility with existing frontend
      parkingLots: adminProperties,
      total: adminProperties.length,
    });
  } catch (error) {
    console.error('Admin get properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST create a new property (saves to admin_properties table)
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user || !['ADMIN', 'LAND_OWNER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      propertyName, 
      name, // Alternative field name
      location,
      address, // Alternative field name 
      description,
      pricePerHour = 300, 
      status = 'ACTIVATED',
      parkingAreaStatus,
      slots = [],
      parkingSlots = [] // Alternative field name
    } = body;

    const finalName = propertyName || name;
    const finalLocation = location || address;
    const finalStatus = parkingAreaStatus || status;
    const finalSlots = slots.length > 0 ? slots : parkingSlots;

    // Validation
    if (!finalName || !finalLocation) {
      return NextResponse.json(
        { error: 'Property name and location are required' },
        { status: 400 }
      );
    }

    // Calculate total slots
    const totalSlotCount = finalSlots.reduce((sum: number, slot: any) => sum + (slot.count || 1), 0);

    // Generate a unique ID
    const propertyId = `cm${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;

    // Create property in admin_properties table (using snake_case model)
    const property = await prisma.admin_properties.create({
      data: {
        id: propertyId,
        propertyName: finalName,
        location: finalLocation,
        description,
        pricePerHour,
        status: finalStatus === 'ACTIVATED' ? 'ACTIVATED' : 'DEACTIVATED',
        totalSlots: totalSlotCount,
        updatedAt: new Date(),
      },
    });

    // Create parking slots if provided
    if (finalSlots && finalSlots.length > 0) {
      let slotNumber = 1;
      for (const slotConfig of finalSlots) {
        const slotType = slotConfig.type || 'Normal';
        const count = slotConfig.count || 1;
        
        for (let i = 0; i < count; i++) {
          const prefix = slotType === 'EV' || slotType === 'EV Slot' ? 'EV' : 
                        slotType === 'Car Washing' ? 'CW' : 
                        String.fromCharCode(65 + Math.floor((slotNumber - 1) / 9));
          const num = slotType === 'EV' || slotType === 'EV Slot' || slotType === 'Car Washing' 
                      ? i + 1 
                      : ((slotNumber - 1) % 9) + 1;
          
          const slotId = `cm${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
          await prisma.admin_parking_slots.create({
            data: {
              id: slotId,
              slotNumber: `${prefix}${num}`,
              status: 'AVAILABLE',
              propertyId: property.id,
              updatedAt: new Date(),
            },
          });
          slotNumber++;
        }
      }
    }

    // Fetch the created property with slots
    const createdProperty = await prisma.admin_properties.findUnique({
      where: { id: property.id },
      include: {
        admin_parking_slots: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: {
        id: createdProperty?.id,
        propertyId: createdProperty?.id,
        name: createdProperty?.propertyName,
        propertyName: createdProperty?.propertyName,
        address: createdProperty?.location,
        location: createdProperty?.location,
        pricePerHour: createdProperty?.pricePerHour,
        status: createdProperty?.status,
        totalSlots: createdProperty?.admin_parking_slots?.length || createdProperty?.totalSlots || 0,
        availableSlots: createdProperty?.admin_parking_slots?.filter(s => s.status === 'AVAILABLE').length || 0,
        createdAt: createdProperty?.createdAt,
        updatedAt: createdProperty?.updatedAt,
      },
      // For compatibility with frontend
      parkingLot: {
        id: createdProperty?.id,
        name: createdProperty?.propertyName,
        address: createdProperty?.location,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin create property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

// PATCH update property status or details
export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user || !['ADMIN', 'LAND_OWNER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      id,
      propertyId, 
      propertyName,
      name,
      location,
      address,
      description,
      pricePerHour, 
      pricePerDay,
      status,
      parkingAreaStatus,
      totalSlots
    } = body;

    const finalId = propertyId || id;

    if (!finalId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Build update data for admin_properties table
    const updateData: any = { updatedAt: new Date() };
    if (propertyName || name) updateData.propertyName = propertyName || name;
    if (location || address) updateData.location = location || address;
    if (description !== undefined) updateData.description = description;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
    if (totalSlots !== undefined) updateData.totalSlots = totalSlots;
    if (parkingAreaStatus || status) {
      const newStatus = parkingAreaStatus || status;
      updateData.status = newStatus === 'ACTIVATED' ? 'ACTIVATED' : 'DEACTIVATED';
    }

    const updatedProperty = await prisma.admin_properties.update({
      where: { id: finalId },
      data: updateData,
      include: {
        admin_parking_slots: true,
      },
    });

    const slots = updatedProperty.admin_parking_slots || [];

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: {
        id: updatedProperty.id,
        propertyId: updatedProperty.id,
        name: updatedProperty.propertyName,
        propertyName: updatedProperty.propertyName,
        address: updatedProperty.location,
        location: updatedProperty.location,
        pricePerHour: updatedProperty.pricePerHour,
        status: updatedProperty.status,
        totalSlots: slots.length || updatedProperty.totalSlots,
        availableSlots: slots.filter(s => s.status === 'AVAILABLE').length,
        updatedAt: updatedProperty.updatedAt,
      },
      // For compatibility
      parkingLot: {
        id: updatedProperty.id,
        name: updatedProperty.propertyName,
        address: updatedProperty.location,
        status: updatedProperty.status,
      },
    });
  } catch (error) {
    console.error('Admin update property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE a property
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user || !['ADMIN', 'LAND_OWNER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || searchParams.get('id');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Delete property from admin_properties (cascade will delete slots)
    await prisma.admin_properties.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete property error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

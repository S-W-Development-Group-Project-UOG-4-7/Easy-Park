import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serverErrorResponse } from '@/lib/api-response';

// Parking hub list changes infrequently; cache for fast navigation + fewer DB hits.
export const revalidate = 60;

export async function GET() {
  try {
    // Fetch all active parking locations
    const locations = await prisma.parking_locations.findMany({
      where: { 
        status: 'ACTIVATED' // Only show active hubs
      },
      select: {
        id: true,
        name: true,
        pricePerHour: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      { success: true, data: locations },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );

  } catch (error: any) {
    console.error('[LOCATIONS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch locations');
  }
}

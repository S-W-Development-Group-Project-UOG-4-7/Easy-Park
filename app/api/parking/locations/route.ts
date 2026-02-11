import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serverErrorResponse } from '@/lib/api-response';

export const revalidate = 60;

export async function GET() {
  try {
    const locations = await prisma.properties.findMany({
      where: { status: 'ACTIVATED' },
      select: {
        id: true,
        propertyName: true,
        pricePerHour: true,
      },
      orderBy: { propertyName: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: locations.map((location) => ({
          id: location.id,
          name: location.propertyName,
          pricePerHour: Number(location.pricePerHour),
        })),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('[LOCATIONS_API_ERROR]', error);
    return serverErrorResponse('Failed to fetch locations');
  }
}

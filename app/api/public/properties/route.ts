import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const properties = await prisma.properties.findMany({
      where: { status: 'ACTIVATED' },
      select: {
        id: true,
        propertyName: true,
        address: true,
        pricePerHour: true,
        totalSlots: true,
        status: true,
      },
      orderBy: [{ propertyName: 'asc' }, { createdAt: 'asc' }],
    });

    const data = properties.map((property) => ({
      id: property.id,
      propertyName: property.propertyName,
      location: property.address,
      pricePerHour: Number(property.pricePerHour),
      totalSlots: property.totalSlots,
      status: property.status,
    }));

    return NextResponse.json(
      { success: true, data, properties: data },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[PUBLIC_PROPERTIES_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

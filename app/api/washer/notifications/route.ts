import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path to your prisma client instance
import { successResponse, serverErrorResponse } from '@/lib/api-response'; // Adjust if you use a helper

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await prisma.washer_notifications.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to recent 10
    });
    
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}
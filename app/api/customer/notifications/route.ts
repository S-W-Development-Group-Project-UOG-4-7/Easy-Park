import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function resolveUserId(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) return authUser.userId;
  if (!authUser.email) return null;
  const user = await prisma.users.findUnique({
    where: { email: authUser.email.toLowerCase() },
    select: { id: true },
  });
  return user?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: true, data: [], unreadCount: 0 }, { status: 200 });
    }

    const userId = await resolveUserId(authUser);
    if (!userId) {
      return NextResponse.json({ success: true, data: [], unreadCount: 0 }, { status: 200 });
    }

    const rows = await prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const data = rows.map((row) => ({
      id: row.id,
      type: row.isRead ? 'INFO' : 'ALERT',
      title: row.title,
      message: row.message,
      read: row.isRead,
      createdAt: row.createdAt.toISOString(),
      metadata: { actionUrl: '/customer/notifications' },
    }));

    return NextResponse.json({
      success: true,
      data,
      unreadCount: data.filter((item) => !item.read).length,
    });
  } catch (error) {
    console.error('Customer notifications API error:', error);
    return NextResponse.json({ success: true, data: [], unreadCount: 0 }, { status: 200 });
  }
}

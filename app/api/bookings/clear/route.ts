import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function resolveUserId(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) return authUser.userId;
  if (!authUser.email) return null;
  const user = await prisma.users.findUnique({
    where: { email: authUser.email.toLowerCase() },
    select: { id: true },
  });
  return user?.id || null;
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await resolveUserId(authUser);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const result = await prisma.bookings.deleteMany({
      where: { customerId: userId },
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error('[BOOKINGS_CLEAR_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to clear bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser?.email) return NextResponse.json({ success: false }, { status: 401 });

  const user = await prisma.users.findUnique({ where: { email: authUser.email } });
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser?.email) return NextResponse.json({ success: false }, { status: 401 });

  const body = await request.json();
  const updated = await prisma.users.update({
    where: { email: authUser.email },
    data: { ...body }
  });
  return NextResponse.json({ success: true, data: updated });
}
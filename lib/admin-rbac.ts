import { NextRequest, NextResponse } from 'next/server';
import { RoleName } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAdminAccess(request: NextRequest): Promise<AdminAuthResult> {
  const authUser = getAuthUser(request);
  if (!authUser?.userId) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminRole = await prisma.user_roles.findFirst({
    where: {
      userId: authUser.userId,
      role: { name: RoleName.ADMIN },
    },
    select: { userId: true },
  });

  if (!adminRole) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, userId: authUser.userId };
}

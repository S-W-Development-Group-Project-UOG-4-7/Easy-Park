import { NextRequest, NextResponse } from 'next/server';
import { RoleName } from '@prisma/client';
import { requireAdminAccess } from '@/lib/admin-rbac';
import { listUsersByRoleNames } from '@/lib/admin-user-directory';

export async function GET(request: NextRequest) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const users = await listUsersByRoleNames([RoleName.CUSTOMER]);
    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        full_name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: 'CUSTOMER',
        phone: user.phone,
        nic: user.nic,
      })),
    });
  } catch (error) {
    console.error('Admin customers GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
  }
}

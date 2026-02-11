import { NextRequest, NextResponse } from 'next/server';
import { RoleName } from '@prisma/client';
import { requireAdminAccess } from '@/lib/admin-rbac';
import { listUsersByRoleNames } from '@/lib/admin-user-directory';

const STAFF_ROLES: RoleName[] = [
  RoleName.ADMIN,
  RoleName.COUNTER,
  RoleName.WASHER,
  RoleName.LANDOWNER,
];

export async function GET(request: NextRequest) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const users = await listUsersByRoleNames(STAFF_ROLES);
    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nic: user.nic,
      })),
    });
  } catch (error) {
    console.error('Admin staff-members GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch staff members' }, { status: 500 });
  }
}

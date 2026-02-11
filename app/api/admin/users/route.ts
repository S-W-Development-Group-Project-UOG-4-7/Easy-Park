import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { RoleName } from '@prisma/client';
import { assignRoleToUser, extractRoles, getPrimaryRole, toLegacyRole } from '@/lib/user-roles';
import { requireAdminAccess } from '@/lib/admin-rbac';

const ALLOWED_ROLES = new Set<RoleName>([RoleName.COUNTER, RoleName.WASHER, RoleName.LANDOWNER]);

function normalizeRoleInput(value: unknown): RoleName | null {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'LAND_OWNER' || normalized === 'LANDOWNER') return RoleName.LANDOWNER;
  if (normalized === 'COUNTER') return RoleName.COUNTER;
  if (normalized === 'WASHER') return RoleName.WASHER;
  return null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const body = await request.json();
    const fullName = String(body?.fullName || '').trim();
    const address = String(body?.address || '').trim();
    const nic = String(body?.nic || '').trim() || null;
    const mobileNumber = String(body?.mobileNumber || '').trim() || null;
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const passwordConfirm = String(body?.passwordConfirm || '');
    const role = normalizeRoleInput(body?.role);

    if (!fullName || !address || !email || !password || !passwordConfirm || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be COUNTER, WASHER, or LANDOWNER' },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (password !== passwordConfirm) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    const duplicate = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          ...(nic ? [{ nic }] : []),
          ...(mobileNumber ? [{ phone: mobileNumber }] : []),
        ],
      },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Email, NIC, or mobile number already exists' },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const created = await prisma.users.create({
      data: {
        fullName,
        residentialAddress: address,
        nic,
        phone: mobileNumber,
        email,
        passwordHash: hashed,
        isActive: true,
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    await assignRoleToUser(created.id, role);

    const fresh = await prisma.users.findUnique({
      where: { id: created.id },
      include: { roles: { include: { role: true } } },
    });
    if (!fresh) {
      return NextResponse.json({ success: false, error: 'Failed to load created user' }, { status: 500 });
    }
    const roles = extractRoles(fresh);
    const primaryRole = toLegacyRole(getPrimaryRole(roles));

    return NextResponse.json({
      success: true,
      data: {
        id: fresh.id,
        fullName: fresh.fullName,
        address: fresh.residentialAddress,
        nic: fresh.nic,
        contactNo: fresh.phone,
        email: fresh.email,
        role: primaryRole,
        createdAt: fresh.createdAt,
        updatedAt: fresh.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const includeAdminsParam = new URL(request.url).searchParams.get('includeAdmins');
    const includeAdmins = includeAdminsParam === null ? true : includeAdminsParam !== 'false';

    const allowedRoles = includeAdmins
      ? [RoleName.ADMIN, RoleName.COUNTER, RoleName.WASHER, RoleName.LANDOWNER]
      : [RoleName.COUNTER, RoleName.WASHER, RoleName.LANDOWNER];

    const users = await prisma.users.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: { in: allowedRoles },
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        nic: true,
        createdAt: true,
        roles: {
          where: {
            role: {
              name: { in: allowedRoles },
            },
          },
          orderBy: {
            roleId: 'asc',
          },
          take: 1,
          select: {
            role: {
              select: { name: true },
            },
            roleId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = users
      .map((user) => {
        const primaryRole = user.roles[0]?.role?.name;
        if (!primaryRole) return null;
        return {
          id: user.id,
          full_name: user.fullName,
          fullName: user.fullName,
          email: user.email,
          role: primaryRole,
          phone: user.phone,
          contactNo: user.phone,
          nic: user.nic,
          createdAt: user.createdAt,
        };
      })
      .filter((user): user is NonNullable<typeof user> => Boolean(user));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { ensureAdminSeeded } from '@/lib/admin-seed';

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  nic: string | null;
  residential_address: string | null;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
};

type RoleRow = {
  name: string;
};

type RoleName = 'ADMIN' | 'CUSTOMER' | 'COUNTER' | 'LANDOWNER' | 'WASHER';

const ROLE_PRIORITY: RoleName[] = ['ADMIN', 'LANDOWNER', 'COUNTER', 'WASHER', 'CUSTOMER'];

function normalizeRole(value: unknown): RoleName | null {
  const role = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (role === 'LAND_OWNER' || role === 'LANDOWNER') return 'LANDOWNER';
  if (role === 'ADMIN' || role === 'CUSTOMER' || role === 'COUNTER' || role === 'WASHER') {
    return role;
  }
  return null;
}

function getPrimaryRole(roles: RoleName[]): RoleName {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return 'CUSTOMER';
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const password = String(body?.password ?? '');

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    const emailLower = email.toLowerCase();
    console.log('[auth/sign-in] lookup start', { email: emailLower });

    const users = await prisma.$queryRaw<UserRow[]>`
      SELECT *
      FROM public.users
      WHERE lower(email) = lower(${email})
      LIMIT 1;
    `;
    const user = users[0];
    console.log('[auth/sign-in] user found', { email: emailLower, found: Boolean(user) });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.is_active) {
      console.log('[auth/sign-in] account disabled', { userId: user.id, email: user.email });
      return errorResponse('Account disabled', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('[auth/sign-in] bcrypt result', { userId: user.id, isValidPassword });
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    const roleRows = await prisma.$queryRaw<RoleRow[]>`
      SELECT r.name
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = ${user.id}::uuid;
    `;
    const normalizedRoles = roleRows
      .map((roleRow) => normalizeRole(roleRow.name))
      .filter((role): role is RoleName => role !== null);
    const uniqueRoles = [...new Set(normalizedRoles)];
    const roles: RoleName[] = uniqueRoles.length > 0 ? uniqueRoles : ['CUSTOMER'];
    console.log('[auth/sign-in] roles fetched', { userId: user.id, roles });

    const primaryRole = getPrimaryRole(roles);

    const clientUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      contactNo: user.phone,
      phone: user.phone,
      nic: user.nic,
      address: user.residential_address,
      residentialAddress: user.residential_address,
      role: primaryRole,
      roles,
      createdAt: user.created_at,
    };

    const token = generateToken({
      userId: clientUser.id,
      email: clientUser.email,
      role: primaryRole,
      roles,
    });

    const response = successResponse(
      {
        user: clientUser,
        roles,
        token,
      },
      'Signed in successfully'
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return serverErrorResponse('Failed to sign in');
  }
}

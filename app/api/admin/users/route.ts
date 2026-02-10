import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword } from '@/lib/auth';

const ALLOWED_ROLES = new Set(['COUNTER', 'WASHER', 'LAND_OWNER']);

function requireAdmin(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  if (user.role !== 'ADMIN') {
    return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const {
      fullName,
      address,
      nic,
      mobileNumber,
      email,
      password,
      passwordConfirm,
      role,
    } = body ?? {};

    if (!fullName || !address || !nic || !mobileNumber || !email || !password || !passwordConfirm || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
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
    const normalizedRole = String(role).toUpperCase();
    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return NextResponse.json({ success: false, error: 'Role must be COUNTER, WASHER, or LAND_OWNER' }, { status: 400 });
    }

    const emailLower = String(email).toLowerCase();
    const duplicate = await prisma.users.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { nic },
          { contactNo: mobileNumber },
        ],
      },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ success: false, error: 'Email, NIC, or mobile number already exists' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const now = new Date();
    const created = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        fullName,
        address,
        nic,
        contactNo: mobileNumber,
        email: emailLower,
        password: hashed,
        role: normalizedRole as any,
        updatedAt: now,
      },
      select: {
        id: true,
        fullName: true,
        address: true,
        nic: true,
        contactNo: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        contactNo: true,
        nic: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

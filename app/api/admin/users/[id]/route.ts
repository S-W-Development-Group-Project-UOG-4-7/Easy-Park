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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const user = await prisma.users.findUnique({
      where: { id },
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
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const body = await request.json();
    const {
      fullName,
      address,
      nic,
      mobileNumber,
      email,
      role,
      password,
      passwordConfirm,
    } = body ?? {};

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    let normalizedRole: string | undefined;
    if (role !== undefined) {
      normalizedRole = String(role).toUpperCase();
      if (!ALLOWED_ROLES.has(normalizedRole)) {
        return NextResponse.json({ success: false, error: 'Role must be COUNTER, WASHER, or LAND_OWNER' }, { status: 400 });
      }
    }

    if (password || passwordConfirm) {
      if (!password || !passwordConfirm) {
        return NextResponse.json({ success: false, error: 'Password and confirm password are required' }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      if (password !== passwordConfirm) {
        return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
      }
    }

    const existing = await prisma.users.findUnique({ where: { id }, select: { role: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (existing.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin users cannot be updated here' }, { status: 400 });
    }

    const emailLower = email ? String(email).toLowerCase() : undefined;
    if (emailLower || nic || mobileNumber) {
      const duplicate = await prisma.users.findFirst({
        where: {
          OR: [
            emailLower ? { email: emailLower } : undefined,
            nic ? { nic } : undefined,
            mobileNumber ? { contactNo: mobileNumber } : undefined,
          ].filter(Boolean) as any,
          NOT: { id },
        },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Email, NIC, or mobile number already exists' }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (fullName !== undefined) updateData.fullName = fullName;
    if (address !== undefined) updateData.address = address;
    if (nic !== undefined) updateData.nic = nic;
    if (mobileNumber !== undefined) updateData.contactNo = mobileNumber;
    if (emailLower !== undefined) updateData.email = emailLower;
    if (normalizedRole !== undefined) updateData.role = normalizedRole;
    if (password) updateData.password = await hashPassword(password);

    const updated = await prisma.users.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const user = await prisma.users.findUnique({ where: { id }, select: { role: true } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin users cannot be deleted' }, { status: 400 });
    }

    await prisma.users.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}

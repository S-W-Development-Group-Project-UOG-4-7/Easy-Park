import { NextRequest, NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@/lib/prisma';
import { requireAdminAccess } from '@/lib/admin-rbac';
import { getUserByIdWithPrimaryRole } from '@/lib/admin-user-directory';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  try {
    const user = await getUserByIdWithPrimaryRole(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        contactNo: user.phone,
        nic: user.nic,
        residentialAddress: user.residentialAddress,
        address: user.residentialAddress,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin user GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  try {
    const body = await request.json();

    const fullNameRaw = body?.fullName ?? body?.full_name;
    const emailRaw = body?.email;
    const phoneRaw = body?.phone ?? body?.mobileNumber ?? body?.contactNo;
    const nicRaw = body?.nic;
    const residentialAddressRaw = body?.residentialAddress ?? body?.residential_address ?? body?.address;
    const isActiveRaw = body?.isActive ?? body?.is_active;

    const current = await getUserByIdWithPrimaryRole(id);
    if (!current) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updateData: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      nic?: string | null;
      residentialAddress?: string | null;
      isActive?: boolean;
    } = {};

    if (fullNameRaw !== undefined) {
      const value = String(fullNameRaw).trim();
      if (!value) {
        return NextResponse.json({ success: false, error: 'full_name cannot be empty' }, { status: 400 });
      }
      updateData.fullName = value;
    }

    if (emailRaw !== undefined) {
      const value = String(emailRaw).trim().toLowerCase();
      if (!value || !isValidEmail(value)) {
        return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
      }
      updateData.email = value;
    }

    if (phoneRaw !== undefined) {
      const value = String(phoneRaw).trim();
      updateData.phone = value ? value : null;
    }

    if (nicRaw !== undefined) {
      const value = String(nicRaw).trim();
      updateData.nic = value ? value : null;
    }

    if (residentialAddressRaw !== undefined) {
      const value = String(residentialAddressRaw).trim();
      updateData.residentialAddress = value ? value : null;
    }

    if (isActiveRaw !== undefined) {
      updateData.isActive = Boolean(isActiveRaw);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided' }, { status: 400 });
    }

    if (updateData.email || updateData.phone || updateData.nic) {
      const duplicate = await prisma.users.findFirst({
        where: {
          NOT: { id },
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.phone ? [{ phone: updateData.phone }] : []),
            ...(updateData.nic ? [{ nic: updateData.nic }] : []),
          ],
        },
        select: { id: true },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Email, phone, or NIC already exists' },
          { status: 409 }
        );
      }
    }

    await prisma.users.update({
      where: { id },
      data: updateData,
    });

    const updated = await getUserByIdWithPrimaryRole(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found after update' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        full_name: updated.fullName,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        contactNo: updated.phone,
        nic: updated.nic,
        residentialAddress: updated.residentialAddress,
        address: updated.residentialAddress,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin user PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdminAccess(request);
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user_roles.deleteMany({
        where: { userId: id },
      });
      await tx.users.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'User cannot be deleted because related records exist.' },
        { status: 409 }
      );
    }
    console.error('Admin user DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}

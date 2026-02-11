import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractRoles, getPrimaryRole, toLegacyRole } from '@/lib/user-roles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookingCount = await prisma.bookings.count({
      where: { customerId: user.id },
    });
    const role = toLegacyRole(getPrimaryRole(extractRoles(user)));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role,
        createdAt: user.createdAt,
        totalBookings: bookingCount,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = body?.name;
    const email = body?.email;
    const phone = body?.phone;

    const user = await prisma.users.update({
      where: { id },
      data: {
        ...(name !== undefined ? { fullName: String(name) } : {}),
        ...(email !== undefined ? { email: String(email).toLowerCase() } : {}),
        ...(phone !== undefined ? { phone: phone ? String(phone) : null } : {}),
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: toLegacyRole(getPrimaryRole(extractRoles(user))),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

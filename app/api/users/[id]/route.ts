import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET user by ID with booking count
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.contactNo,
        role: user.role,
        createdAt: user.createdAt,
        totalBookings: user._count.bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH update user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    const user = await prisma.users.update({
      where: { id },
      data: {
        ...(name && { fullName: name }),
        ...(email && { email }),
        ...(phone !== undefined && { contactNo: phone }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        role: true,
      },
    });

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.contactNo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

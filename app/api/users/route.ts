import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { ensureAdminSeeded } from '@/lib/admin-seed';

// GET all users
export async function GET(request: Request) {
  try {
    await ensureAdminSeeded();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const normalizedRole = role ? role.toUpperCase() : null;

    const users = await prisma.users.findMany({
      where: normalizedRole ? { role: normalizedRole as any } : undefined,
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        vehicleNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedUsers = users.map((user) => ({
      id: user.id,
      // Keep both keys to avoid breaking older UI code.
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      phone: user.contactNo,
      contactNo: user.contactNo,
      vehicleNumber: user.vehicleNumber,
      role: user.role,
      createdAt: user.createdAt,
      totalBookings: user._count.bookings,
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create a new user
export async function POST(request: Request) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const { fullName, email, password, contactNo, vehicleNumber } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'fullName, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        contactNo,
        vehicleNumber,
        role: 'CUSTOMER',
        updatedAt: now,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        vehicleNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

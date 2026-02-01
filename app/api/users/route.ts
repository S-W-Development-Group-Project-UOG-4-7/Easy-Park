import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// GET all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const roles = searchParams.get('roles'); // Support multiple roles like "COUNTER,WASHER,LAND_OWNER"

    let whereClause: any = {};
    
    if (roles) {
      // Filter by multiple roles
      const roleArray = roles.split(',').map(r => r.trim());
      whereClause = { role: { in: roleArray } };
    } else if (role) {
      whereClause = { role };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        nic: true,
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
      fullName: user.fullName,
      email: user.email,
      contactNo: user.contactNo,
      nic: user.nic,
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
    const body = await request.json();
    const { fullName, email, password, contactNo, nic, address, role } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if NIC already exists (if provided)
    if (nic) {
      const existingNic = await prisma.user.findUnique({
        where: { nic },
      });

      if (existingNic) {
        return NextResponse.json(
          { error: 'User with this NIC already exists' },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        contactNo: contactNo || null,
        nic: nic || null,
        role: role || 'CUSTOMER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        contactNo: true,
        nic: true,
        role: true,
        createdAt: true,
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

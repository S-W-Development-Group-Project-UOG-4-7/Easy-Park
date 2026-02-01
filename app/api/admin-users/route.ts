import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// GET all admin users (COUNTER, WASHER, LAND_OWNER)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let whereClause: any = {};
    
    if (role) {
      whereClause = { role };
    }

    const adminUsers = await prisma.adminUser.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        address: true,
        nic: true,
        mobileNumber: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users: adminUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

// POST create a new admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, address, nic, mobileNumber, email, role, password } = body;

    // Validate required fields
    if (!fullName || !nic || !mobileNumber || !email || !role || !password) {
      return NextResponse.json(
        { error: 'All fields are required: fullName, nic, mobileNumber, email, role, password' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['COUNTER', 'WASHER', 'LAND_OWNER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be COUNTER, WASHER, or LAND_OWNER' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if NIC already exists
    const existingNic = await prisma.adminUser.findUnique({
      where: { nic },
    });

    if (existingNic) {
      return NextResponse.json(
        { error: 'User with this NIC already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const adminUser = await prisma.adminUser.create({
      data: {
        fullName,
        address: address || null,
        nic,
        mobileNumber,
        email,
        role,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        address: true,
        nic: true,
        mobileNumber: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: adminUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

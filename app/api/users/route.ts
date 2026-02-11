import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { ensureAdminSeeded } from '@/lib/admin-seed';
import { assignRoleToUser, extractRoles, getPrimaryRole, toLegacyRole } from '@/lib/user-roles';

export async function GET(request: Request) {
  try {
    await ensureAdminSeeded();
    const { searchParams } = new URL(request.url);
    const roleFilter = String(searchParams.get('role') || '').toUpperCase().replace(/[\s-]+/g, '_');

    const users = await prisma.users.findMany({
      include: {
        roles: { include: { role: true } },
        vehicles: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformedUsers = users
      .map((user) => {
        const roles = extractRoles(user);
        const primary = getPrimaryRole(roles);
        const legacyRole = toLegacyRole(primary);
        return {
          id: user.id,
          name: user.fullName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          contactNo: user.phone,
          vehicleNumber: user.vehicles[0]?.vehicleNumber || null,
          role: legacyRole,
          createdAt: user.createdAt,
          totalBookings: 0,
        };
      })
      .filter((user) => !roleFilter || user.role === roleFilter || (roleFilter === 'LANDOWNER' && user.role === 'LAND_OWNER'));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureAdminSeeded();
    const body = await request.json();
    const fullName = String(body?.fullName || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const contactNo = String(body?.contactNo || '').trim() || null;
    const vehicleNumber = String(body?.vehicleNumber || '').trim() || null;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'fullName, email, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.users.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        phone: contactNo,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await assignRoleToUser(user.id, 'CUSTOMER');
    if (vehicleNumber) {
      await prisma.vehicles.create({
        data: {
          userId: user.id,
          vehicleNumber,
        },
      });
    }

    return NextResponse.json(
      {
        user: {
          ...user,
          contactNo: user.phone,
          role: 'CUSTOMER',
          vehicleNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';
import { assignRoleToUser } from '@/lib/user-roles';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get('search') || '').trim().toLowerCase();

    const users = await prisma.users.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'CUSTOMER',
            },
          },
        },
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        vehicles: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
      orderBy: { fullName: 'asc' },
    });

    const washJobs = await prisma.wash_jobs.findMany({
      where: {
        bookingSlot: {
          booking: {
            customerId: { in: users.map((user) => user.id) },
          },
        },
      },
      include: {
        bookingSlot: {
          select: {
            booking: { select: { customerId: true } },
          },
        },
      },
    });

    const bookingCounts = new Map<string, number>();
    for (const job of washJobs) {
      const customerId = job.bookingSlot.booking.customerId;
      bookingCounts.set(customerId, (bookingCounts.get(customerId) || 0) + 1);
    }

    const customers = users.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      vehicleDetails: user.vehicles[0]?.vehicleNumber || '',
      washer_bookings: [],
      _count: { washer_bookings: bookingCounts.get(user.id) || 0 },
    }));

    return successResponse(customers, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer customers:', error);
    return serverErrorResponse('Failed to fetch washer customers');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const phone = String(body?.phone || '').trim() || null;
    const vehicleDetails = String(body?.vehicleDetails || '').trim();
    const otherRelevantInfo = body?.otherRelevantInfo ? String(body.otherRelevantInfo) : '';

    if (!name || !email) {
      return errorResponse('Missing required fields: name, email');
    }

    const existingCustomer = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingCustomer) {
      return errorResponse('A customer with this email already exists', 409);
    }

    const customer = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          fullName: name,
          email,
          phone,
          residentialAddress: otherRelevantInfo || null,
          passwordHash: await hashPassword('TempPass@123'),
        },
      });
      await assignRoleToUser(user.id, 'CUSTOMER');
      if (vehicleDetails) {
        await tx.vehicles.create({
          data: {
            userId: user.id,
            vehicleNumber: vehicleDetails,
          },
        });
      }
      return user;
    });

    return createdResponse(
      {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        vehicleDetails,
      },
      'Customer created successfully'
    );
  } catch (error) {
    console.error('Error creating washer customer:', error);
    return serverErrorResponse('Failed to create washer customer');
  }
}

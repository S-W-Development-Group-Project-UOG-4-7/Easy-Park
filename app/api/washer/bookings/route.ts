import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, mapWashJobToWasherBooking, resolveWasherUser } from '@/app/api/washer/utils';

function dayRange(dateText: string) {
  const date = new Date(dateText);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = String(searchParams.get('status') || '').toUpperCase();
    const dateFilter = searchParams.get('date');
    const search = String(searchParams.get('search') || '').trim().toLowerCase();
    const sortBy = String(searchParams.get('sortBy') || 'earliest');

    const where: {
      bookingSlot: {
        slot: {
          slotType: 'CAR_WASH';
        };
        booking?: {
          startTime?: { gte: Date; lte: Date };
        };
      };
      OR?: Array<{ washerId: string | null }>;
    } = {
      bookingSlot: {
        slot: { slotType: 'CAR_WASH' },
      },
    };

    if (dateFilter) {
      const range = dayRange(dateFilter);
      where.bookingSlot.booking = {
        startTime: {
          gte: range.start,
          lte: range.end,
        },
      };
    }

    if (auth.role === 'WASHER') {
      where.OR = [{ washerId: auth.userId }, { washerId: null }];
    }

    const jobs = await prisma.wash_jobs.findMany({
      where,
      include: {
        bookingSlot: {
          include: {
            slot: {
              select: { slotType: true },
            },
            booking: {
              include: {
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
                vehicle: {
                  select: { vehicleNumber: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let bookings = jobs.map(mapWashJobToWasherBooking);

    if (status && status !== 'ALL') {
      bookings = bookings.filter((booking) => booking.status === status);
    }
    if (search) {
      bookings = bookings.filter((booking) => {
        return (
          booking.customer.name.toLowerCase().includes(search) ||
          booking.customer.email.toLowerCase().includes(search) ||
          booking.vehicle.toLowerCase().includes(search)
        );
      });
    }

    bookings.sort((a, b) => {
      if (sortBy === 'latest') return b.slotTime.getTime() - a.slotTime.getTime();
      if (sortBy === 'vehicle') return a.vehicle.localeCompare(b.vehicle);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.slotTime.getTime() - b.slotTime.getTime();
    });

    return successResponse(bookings, 'Washer bookings retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer bookings:', error);
    return serverErrorResponse('Failed to fetch washer bookings');
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
    const customerId = String(body?.customerId || '').trim();
    const slotTimeRaw = String(body?.slotTime || '').trim();
    const vehicleNumber = String(body?.vehicle || '').trim();
    const serviceType = String(body?.serviceType || 'Car Wash').trim();
    const notes = body?.notes ? String(body.notes) : null;

    if (!customerId || !slotTimeRaw || !vehicleNumber) {
      return errorResponse('Missing required fields: customerId, slotTime, vehicle');
    }

    const slotStart = new Date(slotTimeRaw);
    if (Number.isNaN(slotStart.getTime())) {
      return errorResponse('Invalid slotTime');
    }
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);

    const customer = await prisma.users.findUnique({
      where: { id: customerId },
      select: { id: true, fullName: true, email: true, phone: true },
    });
    if (!customer) return notFoundResponse('Customer not found');

    let vehicle = await prisma.vehicles.findFirst({
      where: { userId: customer.id, vehicleNumber },
      select: { id: true },
    });
    if (!vehicle) {
      vehicle = await prisma.vehicles.create({
        data: {
          userId: customer.id,
          vehicleNumber,
        },
        select: { id: true },
      });
    }

    const availableCarWashSlot = await prisma.parking_slots.findFirst({
      where: {
        slotType: 'CAR_WASH',
        isActive: true,
        bookingSlots: {
          none: {
            booking: {
              status: { not: 'CANCELLED' },
              startTime: { lt: slotEnd },
              endTime: { gt: slotStart },
            },
          },
        },
      },
      select: {
        id: true,
        propertyId: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!availableCarWashSlot) {
      return errorResponse('No available car wash slots for the requested time', 409);
    }

    const payload = await prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.create({
        data: {
          customerId: customer.id,
          propertyId: availableCarWashSlot.propertyId,
          vehicleId: vehicle.id,
          startTime: slotStart,
          endTime: slotEnd,
          status: 'PENDING',
          parkingType: 'CAR_WASH',
          bookingType: 'CAR_WASH',
          createdBy: auth.userId,
        },
      });

      const bookingSlot = await tx.booking_slots.create({
        data: {
          bookingId: booking.id,
          slotId: availableCarWashSlot.id,
        },
      });

      const washJob = await tx.wash_jobs.create({
        data: {
          bookingSlotId: bookingSlot.id,
          status: 'PENDING',
          note: notes || `${serviceType} requested`,
        },
        include: {
          bookingSlot: {
            include: {
              slot: { select: { slotType: true } },
              booking: {
                include: {
                  customer: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                  vehicle: { select: { vehicleNumber: true } },
                },
              },
            },
          },
        },
      });

      await tx.notifications.create({
        data: {
          userId: customer.id,
          title: 'Wash Job Created',
          message: `Your wash job was created for ${slotStart.toLocaleString()}.`,
        },
      });

      return mapWashJobToWasherBooking(washJob);
    });

    return createdResponse(payload, 'Booking created successfully');
  } catch (error) {
    console.error('Error creating washer booking:', error);
    return serverErrorResponse('Failed to create washer booking');
  }
}

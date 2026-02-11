import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';

async function getCustomerWithVehicle(id: string) {
  return prisma.users.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: 'asc' }, take: 1 },
      roles: { include: { role: true } },
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const customer = await getCustomerWithVehicle(id);
    if (!customer) return notFoundResponse('Customer not found');

    const isCustomer = customer.roles.some((role) => role.role.name === 'CUSTOMER');
    if (!isCustomer) return notFoundResponse('Customer not found');

    const washJobs = await prisma.wash_jobs.findMany({
      where: {
        bookingSlot: {
          booking: {
            customerId: id,
          },
        },
      },
      include: {
        bookingSlot: {
          include: {
            booking: {
              select: {
                id: true,
                startTime: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: washJobs.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const job of washJobs) {
      if (job.bookingSlot.booking.status === 'CANCELLED') stats.cancelled += 1;
      else if (job.status === 'PENDING') stats.pending += 1;
      else if (job.status === 'ACCEPTED') stats.accepted += 1;
      else stats.completed += 1;
    }

    return successResponse(
      {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        vehicleDetails: customer.vehicles[0]?.vehicleNumber || '',
        washer_bookings: washJobs.map((job) => ({
          id: job.id,
          status: job.bookingSlot.booking.status === 'CANCELLED' ? 'CANCELLED' : job.status,
          slotTime: job.bookingSlot.booking.startTime,
          note: job.note,
        })),
        stats,
      },
      'Customer details retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching washer customer:', error);
    return serverErrorResponse('Failed to fetch washer customer');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const name = body?.name;
    const email = body?.email ? String(body.email).toLowerCase() : undefined;
    const phone = body?.phone;
    const vehicleDetails = body?.vehicleDetails;
    const otherRelevantInfo = body?.otherRelevantInfo;

    const existingCustomer = await getCustomerWithVehicle(id);
    if (!existingCustomer) return notFoundResponse('Customer not found');

    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email },
        select: { id: true },
      });
      if (emailExists) return errorResponse('A customer with this email already exists', 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id },
        data: {
          ...(name !== undefined ? { fullName: String(name) } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(phone !== undefined ? { phone: phone ? String(phone) : null } : {}),
          ...(otherRelevantInfo !== undefined
            ? { residentialAddress: otherRelevantInfo ? String(otherRelevantInfo) : null }
            : {}),
        },
      });

      const currentVehicle = await tx.vehicles.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'asc' },
      });

      if (vehicleDetails !== undefined) {
        if (vehicleDetails) {
          if (currentVehicle) {
            await tx.vehicles.update({
              where: { id: currentVehicle.id },
              data: { vehicleNumber: String(vehicleDetails) },
            });
          } else {
            await tx.vehicles.create({
              data: {
                userId: id,
                vehicleNumber: String(vehicleDetails),
              },
            });
          }
        } else if (currentVehicle) {
          await tx.vehicles.delete({ where: { id: currentVehicle.id } });
        }
      }
    });

    const updatedCustomer = await getCustomerWithVehicle(id);
    return successResponse(
      {
        id: updatedCustomer?.id,
        name: updatedCustomer?.fullName,
        email: updatedCustomer?.email,
        phone: updatedCustomer?.phone,
        vehicleDetails: updatedCustomer?.vehicles[0]?.vehicleNumber || '',
      },
      'Customer updated successfully'
    );
  } catch (error) {
    console.error('Error updating washer customer:', error);
    return serverErrorResponse('Failed to update washer customer');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (auth.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete customers.', 403);
    }

    const { id } = await params;
    const customer = await getCustomerWithVehicle(id);
    if (!customer) return notFoundResponse('Customer not found');

    const washJobCount = await prisma.wash_jobs.count({
      where: {
        bookingSlot: {
          booking: {
            customerId: id,
          },
        },
      },
    });
    if (washJobCount > 0) {
      return errorResponse(
        'Cannot delete customer with existing bookings. Delete all bookings first.',
        400
      );
    }

    await prisma.users.delete({ where: { id } });
    return successResponse({ id }, 'Customer deleted successfully');
  } catch (error) {
    console.error('Error deleting washer customer:', error);
    return serverErrorResponse('Failed to delete washer customer');
  }
}

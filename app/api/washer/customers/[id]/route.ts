import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/customers/:id
 * Fetch full customer details with all their bookings
 * Used for popup or new tab in washer dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access customer data
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;

    const customer = await prisma.washer_customers.findUnique({
      where: { id },
      include: {
        washer_bookings: {
          orderBy: { slotTime: 'desc' },
        },
        _count: {
          select: { washer_bookings: true },
        },
      },
    });

    if (!customer) {
      return notFoundResponse('Customer not found');
    }

    // Calculate customer statistics
    const bookingStats = await prisma.washer_bookings.groupBy({
      by: ['status'],
      where: { customerId: id },
      _count: { status: true },
    });

    const stats = {
      total: customer.washer_bookings.length,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    bookingStats.forEach((stat) => {
      const key = stat.status.toLowerCase() as keyof typeof stats;
      if (key in stats) {
        stats[key] = stat._count.status;
      }
    });

    return successResponse(
      {
        ...customer,
        stats,
      },
      'Customer details retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching washer customer:', error);
    return serverErrorResponse('Failed to fetch washer customer');
  }
}

/**
 * PATCH /api/washer/customers/:id
 * Update customer details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can update customer data
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, vehicleDetails, otherRelevantInfo } = body;

    // Check if customer exists
    const existingCustomer = await prisma.washer_customers.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return notFoundResponse('Customer not found');
    }

    // If email is being changed, check for duplicates
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.washer_customers.findUnique({
        where: { email },
      });

      if (emailExists) {
        return errorResponse('A customer with this email already exists', 409);
      }
    }

    // Update only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (vehicleDetails !== undefined) updateData.vehicleDetails = vehicleDetails;
    if (otherRelevantInfo !== undefined) updateData.otherRelevantInfo = otherRelevantInfo;
    updateData.updatedAt = new Date();

    const updatedCustomer = await prisma.washer_customers.update({
      where: { id },
      data: updateData,
      include: {
        washer_bookings: {
          orderBy: { slotTime: 'desc' },
          take: 5,
        },
      },
    });

    return successResponse(updatedCustomer, 'Customer updated successfully');
  } catch (error) {
    console.error('Error updating washer customer:', error);
    return serverErrorResponse('Failed to update washer customer');
  }
}

/**
 * DELETE /api/washer/customers/:id
 * Delete a customer (only if they have no bookings)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only ADMIN can delete customers
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete customers.', 403);
    }

    const { id } = await params;

    const customer = await prisma.washer_customers.findUnique({
      where: { id },
      include: {
        _count: {
          select: { washer_bookings: true },
        },
      },
    });

    if (!customer) {
      return notFoundResponse('Customer not found');
    }

    // Check if customer has any bookings
    if (customer._count.washer_bookings > 0) {
      return errorResponse(
        'Cannot delete customer with existing bookings. Delete all bookings first.',
        400
      );
    }

    await prisma.washer_customers.delete({
      where: { id },
    });

    return successResponse({ id }, 'Customer deleted successfully');
  } catch (error) {
    console.error('Error deleting washer customer:', error);
    return serverErrorResponse('Failed to delete washer customer');
  }
}

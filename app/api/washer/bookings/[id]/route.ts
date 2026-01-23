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
 * GET /api/washer/bookings/:id
 * Fetch a single washer booking by ID
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

    // Only WASHER, ADMIN, and COUNTER roles can access washer bookings
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { id } = await params;

    const booking = await prisma.washer_bookings.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    return successResponse(booking, 'Booking retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer booking:', error);
    return serverErrorResponse('Failed to fetch washer booking');
  }
}

/**
 * DELETE /api/washer/bookings/:id
 * Delete a washer booking
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

    // Only ADMIN can delete bookings
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Access denied. Only admins can delete bookings.', 403);
    }

    const { id } = await params;

    const booking = await prisma.washer_bookings.findUnique({
      where: { id },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    await prisma.washer_bookings.delete({
      where: { id },
    });

    return successResponse({ id }, 'Booking deleted successfully');
  } catch (error) {
    console.error('Error deleting washer booking:', error);
    return serverErrorResponse('Failed to delete washer booking');
  }
}

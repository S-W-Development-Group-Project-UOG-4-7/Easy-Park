import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET all payments for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const payments = await prisma.payments.findMany({
      where: {
        bookings: {
          userId: authUser.userId,
        },
      },
      include: {
        bookings: {
          include: {
            booking_slots: {
              include: {
                parking_slots: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return serverErrorResponse('Failed to fetch payments');
  }
}

// POST process a payment
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { bookingId, amount, method, cardDetails } = body;

    // Validation
    if (!bookingId || !amount) {
      return errorResponse('Booking ID and amount are required');
    }

    // Find the booking
    const booking = await prisma.bookings.findFirst({
      where: {
        id: bookingId,
        userId: authUser.userId,
      },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    if (booking.payments) {
      return errorResponse('Payment already exists for this booking');
    }

    if (booking.status === 'CANCELLED') {
      return errorResponse('Cannot pay for a cancelled booking');
    }

    // Simulate payment processing
    // In production, integrate with a real payment gateway like Stripe
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment and update booking status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payments.create({
        data: {
          bookingId,
          amount,
          method: method || 'CARD',
          status: 'COMPLETED',
          transactionId,
          paidAt: new Date(),
        },
      });

      await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: 'PAID',
          paidAmount: amount,
        },
      });

      return payment;
    });

    return createdResponse(
      {
        payment: result,
        transactionId,
      },
      'Payment processed successfully'
    );
  } catch (error) {
    console.error('Process payment error:', error);
    return serverErrorResponse('Failed to process payment');
  }
}

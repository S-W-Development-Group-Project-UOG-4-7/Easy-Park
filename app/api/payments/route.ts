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
import { refreshPaymentSummary } from '@/lib/payment-summary';

async function resolveUserId(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) return authUser.userId;
  if (!authUser.email) return null;
  const user = await prisma.users.findUnique({
    where: { email: authUser.email.toLowerCase() },
    select: { id: true },
  });
  return user?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const userId = await resolveUserId(authUser);
    if (!userId) return unauthorizedResponse('User not found');

    const payments = await prisma.payments.findMany({
      where: {
        booking: {
          customerId: userId,
        },
      },
      include: {
        booking: {
          include: {
            bookingSlots: {
              include: { slot: true },
            },
            property: true,
            paymentSummary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return serverErrorResponse('Failed to fetch payments');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const userId = await resolveUserId(authUser);
    if (!userId) return unauthorizedResponse('User not found');

    const body = await request.json();
    const bookingId = String(body?.bookingId || '').trim();
    const amount = Number(body?.amount);
    const method = String(body?.method || 'CARD').toUpperCase() === 'CASH' ? 'CASH' : 'CARD';

    if (!bookingId || !Number.isFinite(amount) || amount <= 0) {
      return errorResponse('Booking ID and valid amount are required');
    }

    const booking = await prisma.bookings.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
      },
      include: { paymentSummary: true },
    });
    if (!booking) return notFoundResponse('Booking not found');
    if (booking.status === 'CANCELLED') return errorResponse('Cannot pay for a cancelled booking');

    const summary = booking.paymentSummary;
    const total = Number(summary?.totalAmount ?? 0);
    const paid = Number(summary?.onlinePaid ?? 0) + Number(summary?.cashPaid ?? 0);
    const balanceDue = Math.max(0, Number(summary?.balanceDue ?? total - paid));
    if (amount > balanceDue) {
      return errorResponse('Payment amount exceeds balance due');
    }

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payments.create({
        data: {
          bookingId,
          payerId: userId,
          amount,
          currency: summary?.currency || 'LKR',
          method,
          paymentStatus: 'PAID',
          gatewayStatus: method === 'CARD' ? 'COMPLETED' : 'PENDING',
          gatewayProvider: method === 'CARD' ? 'DEMO_GATEWAY' : null,
          transactionId: method === 'CARD' ? `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` : null,
          paidAt: new Date(),
          createdBy: userId,
        },
      });

      const updatedSummary = await refreshPaymentSummary(tx, bookingId);
      if (updatedSummary && Number(updatedSummary.balanceDue) <= 0) {
        await tx.bookings.update({ where: { id: bookingId }, data: { status: 'PAID' } });
      }
      return created;
    });

    return createdResponse(
      {
        payment,
        transactionId: payment.transactionId,
      },
      'Payment processed successfully'
    );
  } catch (error) {
    console.error('Process payment error:', error);
    return serverErrorResponse('Failed to process payment');
  }
}

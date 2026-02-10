import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { processDemoPayment } from '@/lib/mock-gateway';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.email) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Parse Body
    const body = await request.json();
    const { bookingId, amount } = body;

    if (!bookingId || amount == null) {
      return errorResponse('Missing booking ID or amount', 400);
    }
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return errorResponse('Invalid payment amount', 400);
    }

    // 3. Verify User & Booking
    const dbUser = await prisma.users.findUnique({ 
      where: { email: authUser.email },
      select: { id: true }
    });

    if (!dbUser) return errorResponse('User not found', 404);

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.userId !== dbUser.id) return errorResponse('Unauthorized booking access', 403);

    // 4. Check if fully paid (Prevent double charge)
    if (booking.status === 'CANCELLED') {
      return errorResponse('Booking is cancelled', 409);
    }
    const totalAmount = booking.totalAmount || 0;
    const currentPaid = booking.paidAmount || 0;
    const balanceDue = Math.max(0, totalAmount - currentPaid);
    const fullyPaid = currentPaid >= totalAmount || balanceDue === 0;
    if (fullyPaid) {
      return errorResponse('Booking is already paid', 409);
    }
    if (amountValue > balanceDue) {
      return errorResponse('Payment amount exceeds balance due', 400);
    }

    const existingPayment = await prisma.payments.findUnique({
      where: { bookingId: bookingId }
    });

    // --- 5. PROCESS PAYMENT (Mock Gateway) ---
    // In a real app, this is where you call Stripe/PayPal
    const gatewayResult = await processDemoPayment(amountValue);

    // --- 6. DATABASE TRANSACTION ---
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Insert into 'payments' table
      const newPayment = existingPayment
        ? await tx.payments.update({
            where: { bookingId: bookingId },
            data: {
              amount: existingPayment.amount + amountValue,
              method: 'CARD',
              status: 'COMPLETED',
              transactionId: gatewayResult.transactionId,
              paidAt: gatewayResult.timestamp,
              updatedAt: gatewayResult.timestamp,
            }
          })
        : await tx.payments.create({
            data: {
              id: crypto.randomUUID(),
              bookingId: bookingId,
              amount: amountValue,
              method: 'CARD',       // Enum: PaymentMethod
              status: 'COMPLETED',  // Enum: PaymentStatus
              transactionId: gatewayResult.transactionId,
              paidAt: gatewayResult.timestamp,
              createdAt: gatewayResult.timestamp,
              updatedAt: gatewayResult.timestamp,
            }
          });

      // B. Update 'bookings' table
      // Update paidAmount and set status based on remaining balance
      const newPaidAmount = Math.min(totalAmount, currentPaid + amountValue);
      const newRemaining = Math.max(0, totalAmount - newPaidAmount);
      const newStatus = newRemaining === 0 ? 'PAID' : 'PENDING';
      const updatedBooking = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: newStatus, // Enum: BookingStatus
          paidAmount: newPaidAmount,
          updatedAt: new Date()
        }
      });

      return { payment: newPayment, booking: updatedBooking };
    });

    const responseBooking = {
      bookingId: result.booking.id,
      status: result.booking.status.toLowerCase(),
      totalAmount: result.booking.totalAmount,
      paidAmount: result.booking.paidAmount,
      paymentId: result.payment.id
    };
    console.log(`✅ [PAYMENT] Record created/updated: ${result.payment.id}`);
    return successResponse({ payment: result.payment, booking: responseBooking }, 'Payment successful');

  } catch (error: any) {
    console.error('[PAYMENT_API_ERROR]', error);
    return serverErrorResponse(error.message || 'Payment processing failed');
  }
}

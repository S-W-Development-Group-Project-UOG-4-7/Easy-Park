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

    if (!bookingId || !amount) {
      return errorResponse('Missing booking ID or amount', 400);
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

    // 4. Check if already paid (Prevent double charge)
    const existingPayment = await prisma.payments.findUnique({
      where: { bookingId: bookingId }
    });

    if (existingPayment) {
      return errorResponse('Booking is already paid', 409);
    }

    // --- 5. PROCESS PAYMENT (Mock Gateway) ---
    // In a real app, this is where you call Stripe/PayPal
    const gatewayResult = await processDemoPayment(parseFloat(amount));

    // --- 6. DATABASE TRANSACTION ---
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Insert into 'payments' table
      const newPayment = await tx.payments.create({
        data: {
          id: crypto.randomUUID(),
          bookingId: bookingId,
          amount: parseFloat(amount),
          method: 'CARD',       // Enum: PaymentMethod
          status: 'COMPLETED',  // Enum: PaymentStatus
          transactionId: gatewayResult.transactionId,
          paidAt: gatewayResult.timestamp,
          createdAt: gatewayResult.timestamp,
          updatedAt: gatewayResult.timestamp,
        }
      });

      // B. Update 'bookings' table
      // Update paidAmount and set status to 'PAID' or 'CONFIRMED'
      const currentPaid = booking.paidAmount || 0;
      await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: 'PAID', // Enum: BookingStatus
          paidAmount: currentPaid + parseFloat(amount),
          updatedAt: new Date()
        }
      });

      return newPayment;
    });

    console.log(`✅ [PAYMENT] Record created: ${result.id}`);
    return successResponse(result, 'Payment successful');

  } catch (error: any) {
    console.error('[PAYMENT_API_ERROR]', error);
    return serverErrorResponse(error.message || 'Payment processing failed');
  }
}
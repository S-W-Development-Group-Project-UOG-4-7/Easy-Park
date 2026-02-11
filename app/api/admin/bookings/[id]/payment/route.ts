import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { refreshPaymentSummary } from '@/lib/payment-summary';

type CollectionStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

function collectionStatus(total: number, paid: number): CollectionStatus {
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
}

function toParkingType(raw: string) {
  if (raw === 'EV') return 'EV Slot';
  if (raw === 'CAR_WASH') return 'Car Washing';
  return 'Normal';
}

function toBookingType(raw: string) {
  const normalized = String(raw || 'NORMAL').toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'EV' || normalized === 'EV_SLOT') return 'EV_SLOT';
  if (normalized === 'CAR_WASH' || normalized === 'CAR_WASHING') return 'CAR_WASHING';
  return 'NORMAL';
}

function isAdmin(role?: string) {
  return role === 'ADMIN';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            propertyName: true,
            address: true,
          },
        },
        paymentSummary: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const summary = booking.paymentSummary;
    const totalAmount = Number(summary?.totalAmount ?? 0);
    const onlinePaid = Number(summary?.onlinePaid ?? 0);
    const cashPaid = Number(summary?.cashPaid ?? 0);
    const paid = onlinePaid + cashPaid;
    const balanceDue = Math.max(0, Number(summary?.balanceDue ?? totalAmount - paid));
    const latest = booking.payments[0];

    return NextResponse.json({
      success: true,
      data: {
        paymentId: latest?.id || null,
        bookingId: booking.id,
        customer: {
          id: booking.customer.id,
          fullName: booking.customer.fullName,
          email: booking.customer.email,
        },
        property: {
          id: booking.property.id,
          name: booking.property.propertyName,
          address: booking.property.address,
        },
        totalAmount,
        onlinePaid,
        balanceDue,
        currency: summary?.currency || latest?.currency || 'LKR',
        paymentMethod: latest?.method || 'N/A',
        paymentGatewayStatus: latest?.gatewayStatus || 'PENDING',
        paymentStatus: collectionStatus(totalAmount, paid),
        transactionId: latest?.transactionId || null,
        bookingDate: booking.startTime,
        bookingTime: booking.startTime,
        hoursSelected: Math.max(
          1,
          Math.ceil((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60))
        ),
        checkInTime: booking.startTime,
        checkOutTime: booking.endTime,
        parkingType: toParkingType(booking.parkingType),
        bookingType: toBookingType(booking.bookingType),
        extras: null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error('[ADMIN_BOOKING_PAYMENT_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const desiredPaidAmount = Number(body?.onlinePaid);
    const methodRaw = String(body?.paymentMethod || 'CARD').toUpperCase();
    const method = methodRaw === 'CASH' ? 'CASH' : 'CARD';
    const currency = String(body?.currency || 'LKR').toUpperCase();
    const transactionIdInput = body?.transactionId ? String(body.transactionId) : null;

    if (!Number.isFinite(desiredPaidAmount) || desiredPaidAmount < 0) {
      return NextResponse.json(
        { success: false, error: 'onlinePaid is required and must be a non-negative number' },
        { status: 400 }
      );
    }

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: { paymentSummary: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const currentOnlinePaid = Number(booking.paymentSummary?.onlinePaid ?? 0);
    const delta = desiredPaidAmount - currentOnlinePaid;
    if (delta < 0) {
      return NextResponse.json(
        { success: false, error: 'Reducing paid amount is not supported from this endpoint' },
        { status: 400 }
      );
    }

    const paymentUpdate = await prisma.$transaction(async (tx) => {
      if (delta > 0) {
        await tx.payments.create({
          data: {
            bookingId: booking.id,
            payerId: booking.customerId,
            amount: delta,
            currency,
            method,
            paymentStatus: 'PAID',
            gatewayStatus: method === 'CARD' ? 'COMPLETED' : 'PENDING',
            gatewayProvider: method === 'CARD' ? 'MANUAL_ADMIN_UPDATE' : null,
            transactionId:
              transactionIdInput ||
              (method === 'CARD' ? `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : null),
            paidAt: new Date(),
            createdBy: authUser.userId || null,
          },
        });
      }

      const summary = await refreshPaymentSummary(tx, booking.id);
      if (!summary) return null;

      await tx.bookings.update({
        where: { id: booking.id },
        data: { status: summary.balanceDue <= 0 ? 'PAID' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING' },
      });

      const latestPayment = await tx.payments.findFirst({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'desc' },
      });
      return { summary, latestPayment };
    });

    if (!paymentUpdate) {
      return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        totalAmount: paymentUpdate.summary.totalAmount,
        onlinePaid: paymentUpdate.summary.onlinePaid,
        balanceDue: paymentUpdate.summary.balanceDue,
        paymentStatus: collectionStatus(
          Number(paymentUpdate.summary.totalAmount),
          Number(paymentUpdate.summary.onlinePaid) + Number(paymentUpdate.summary.cashPaid)
        ),
        paymentMethod: paymentUpdate.latestPayment?.method || method,
        transactionId: paymentUpdate.latestPayment?.transactionId || transactionIdInput,
      },
    });
  } catch (error) {
    console.error('[ADMIN_BOOKING_PAYMENT_POST_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment details' },
      { status: 500 }
    );
  }
}

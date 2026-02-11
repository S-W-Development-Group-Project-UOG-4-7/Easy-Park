import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { refreshPaymentSummary } from '@/lib/payment-summary';
import { resolveCounterAccess } from '@/app/api/counter/_shared';

type BookingStatusValue = 'PENDING' | 'PAID' | 'CANCELLED';

function normalizeStatus(value: unknown): BookingStatusValue | null {
  const status = String(value || '').trim().toUpperCase();
  if (status === 'PENDING' || status === 'PAID' || status === 'CANCELLED') {
    return status;
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await resolveCounterAccess(request);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized: Counter or admin access required' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const requestedStatus = normalizeStatus(body?.status);
    const collectCashAmount = Number(body?.collectCashAmount || 0);
    const note = String(body?.note || '').trim();

    if (!requestedStatus && (!Number.isFinite(collectCashAmount) || collectCashAmount <= 0)) {
      return NextResponse.json(
        { error: 'Provide either a valid status or a positive collectCashAmount' },
        { status: 400 }
      );
    }

    const existing = await prisma.bookings.findUnique({
      where: { id },
      include: { paymentSummary: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (existing.status === 'CANCELLED' && collectCashAmount > 0) {
      return NextResponse.json({ error: 'Cannot collect payment for a cancelled booking' }, { status: 400 });
    }

    const totalAmount = Number(existing.paymentSummary?.totalAmount ?? 0);
    const paidAmount =
      Number(existing.paymentSummary?.onlinePaid ?? 0) + Number(existing.paymentSummary?.cashPaid ?? 0);
    const balanceDue = Math.max(0, Number(existing.paymentSummary?.balanceDue ?? totalAmount - paidAmount));
    if (collectCashAmount > balanceDue) {
      return NextResponse.json({ error: 'Cash collection amount exceeds balance due' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (collectCashAmount > 0) {
        await tx.payments.create({
          data: {
            bookingId: id,
            payerId: existing.customerId,
            amount: collectCashAmount,
            currency: existing.paymentSummary?.currency || 'LKR',
            method: 'CASH',
            paymentStatus: 'PAID',
            gatewayStatus: 'PENDING',
            gatewayProvider: 'COUNTER_CASH',
            paidAt: new Date(),
            createdBy: access.userId,
          },
        });
      }

      const summary = await refreshPaymentSummary(tx, id);
      const hasPaidInFull = summary ? Number(summary.balanceDue) <= 0.0001 : false;

      const nextStatus =
        requestedStatus === 'CANCELLED'
          ? 'CANCELLED'
          : requestedStatus === 'PENDING'
            ? 'PENDING'
            : requestedStatus === 'PAID' || hasPaidInFull
              ? 'PAID'
              : existing.status;

      if (nextStatus !== existing.status) {
        await tx.bookings.update({
          where: { id },
          data: { status: nextStatus },
        });
        await tx.booking_status_history.create({
          data: {
            bookingId: id,
            oldStatus: existing.status,
            newStatus: nextStatus,
            changedBy: access.userId,
            note: note || 'Updated by counter',
          },
        });
      }

      await tx.counter_transactions.create({
        data: {
          counterUserId: access.userId,
          bookingId: id,
          action: 'BOOKING_UPDATED',
          note:
            note ||
            (collectCashAmount > 0
              ? `Collected cash payment: ${collectCashAmount.toFixed(2)}`
              : `Status updated to ${nextStatus}`),
        },
      });

      return tx.bookings.findUnique({
        where: { id },
        include: {
          paymentSummary: true,
        },
      });
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        bookingId: updated.id,
        status: updated.status,
        totalAmount: Number(updated.paymentSummary?.totalAmount ?? 0),
        onlinePaid: Number(updated.paymentSummary?.onlinePaid ?? 0),
        cashPaid: Number(updated.paymentSummary?.cashPaid ?? 0),
        balanceDue: Number(updated.paymentSummary?.balanceDue ?? 0),
      },
    });
  } catch (error) {
    console.error('[COUNTER_BOOKING_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

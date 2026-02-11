import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import { refreshPaymentSummary } from '@/lib/payment-summary';

function parseDateTime(date: string, time: string): Date {
  const trimmed = String(time || '').trim();
  const withMeridiem = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (withMeridiem) {
    let hour = Number(withMeridiem[1]);
    const minute = Number(withMeridiem[2]);
    const meridiem = withMeridiem[3].toUpperCase();
    if (hour === 12) hour = 0;
    if (meridiem === 'PM') hour += 12;
    return new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  }
  return new Date(`${date}T${trimmed}:00`);
}

async function resolveUser(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) {
    const byId = await prisma.users.findUnique({ where: { id: authUser.userId }, select: { id: true } });
    if (byId) return byId;
  }
  if (authUser.email) {
    return prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true },
    });
  }
  return null;
}

async function chargeCreditCard(amount: number) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${Math.round(amount * 100)}`;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const dbUser = await resolveUser(authUser);
    if (!dbUser) return errorResponse('User not found', 404);

    const body = await request.json();
    const date = String(body?.date || '').trim();
    const startTimeRaw = String(body?.startTime || '').trim();
    const durationHours = Number(body?.duration);
    const slotIds = Array.isArray(body?.slotIds) ? body.slotIds.map(String) : [];
    const propertyId = String(body?.propertyId || body?.locationId || '').trim();
    const advanceAmount = Number(body?.advanceAmount || 0);
    const requestedTotalAmount = Number(body?.totalAmount || 0);

    if (!date || !startTimeRaw || !Number.isFinite(durationHours) || durationHours <= 0 || slotIds.length === 0 || !propertyId) {
      return errorResponse('Missing required fields', 400);
    }
    if (!Number.isFinite(advanceAmount) || advanceAmount < 0) {
      return errorResponse('advanceAmount must be a non-negative number', 400);
    }

    const startTime = parseDateTime(date, startTimeRaw);
    if (Number.isNaN(startTime.getTime())) return errorResponse('Invalid date/time', 400);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + durationHours);

    const selectedSlots = await prisma.parking_slots.findMany({
      where: {
        id: { in: slotIds },
        propertyId,
      },
      select: {
        id: true,
        slotType: true,
        isActive: true,
        property: {
          select: {
            pricePerHour: true,
            pricePerDay: true,
          },
        },
      },
    });

    if (selectedSlots.length !== slotIds.length) {
      return errorResponse('One or more selected slots are invalid for this property', 400);
    }
    if (selectedSlots.some((slot) => !slot.isActive)) {
      return errorResponse('One or more selected slots are not active', 400);
    }

    const overlapping = await prisma.bookings.findFirst({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        bookingSlots: {
          some: {
            slotId: { in: slotIds },
          },
        },
      },
      select: { id: true },
    });
    if (overlapping) {
      return errorResponse('Selected slot(s) are already booked for that time', 409);
    }

    const property = selectedSlots[0]?.property;
    const useDaily = durationHours >= 24 && Number(property?.pricePerDay || 0) > 0;
    const calculatedTotal =
      (useDaily ? Number(property?.pricePerDay || 0) : Number(property?.pricePerHour || 0) * durationHours) *
      selectedSlots.length;
    const totalAmount = Number.isFinite(requestedTotalAmount) && requestedTotalAmount > 0 ? requestedTotalAmount : calculatedTotal;
    const parkingType = selectedSlots.some((slot) => slot.slotType === 'CAR_WASH')
      ? 'CAR_WASH'
      : selectedSlots.some((slot) => slot.slotType === 'EV')
        ? 'EV'
        : 'NORMAL';

    const transactionId = advanceAmount > 0 ? await chargeCreditCard(advanceAmount) : null;

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.bookings.create({
        data: {
          customerId: dbUser.id,
          propertyId,
          startTime,
          endTime,
          status: 'PENDING',
          parkingType,
          bookingType: parkingType,
          createdBy: dbUser.id,
        },
      });

      await tx.booking_status_history.create({
        data: {
          bookingId: createdBooking.id,
          oldStatus: null,
          newStatus: 'PENDING',
          changedBy: dbUser.id,
          note: 'Booking created',
        },
      });

      const bookingSlots = await Promise.all(
        slotIds.map((slotId: string) =>
          tx.booking_slots.create({
            data: {
              bookingId: createdBooking.id,
              slotId,
            },
            select: {
              id: true,
              slot: {
                select: { slotType: true },
              },
            },
          })
        )
      );

      await Promise.all(
        bookingSlots
          .filter((slot) => slot.slot.slotType === 'CAR_WASH')
          .map((slot) =>
            tx.wash_jobs.create({
              data: {
                bookingSlotId: slot.id,
                status: 'PENDING',
              },
            })
          )
      );

      await tx.payment_summary.create({
        data: {
          bookingId: createdBooking.id,
          totalAmount,
          onlinePaid: 0,
          cashPaid: 0,
          balanceDue: totalAmount,
          currency: 'LKR',
        },
      });

      if (advanceAmount > 0) {
        await tx.payments.create({
          data: {
            bookingId: createdBooking.id,
            payerId: dbUser.id,
            amount: advanceAmount,
            currency: 'LKR',
            method: 'CARD',
            paymentStatus: 'PAID',
            gatewayStatus: 'COMPLETED',
            gatewayProvider: 'MOCK_GATEWAY',
            transactionId,
            paidAt: new Date(),
            createdBy: dbUser.id,
          },
        });
      }

      const summary = await refreshPaymentSummary(tx, createdBooking.id);
      if (summary && Number(summary.balanceDue) <= 0) {
        await tx.bookings.update({
          where: { id: createdBooking.id },
          data: { status: 'PAID' },
        });
        await tx.booking_status_history.create({
          data: {
            bookingId: createdBooking.id,
            oldStatus: 'PENDING',
            newStatus: 'PAID',
            changedBy: dbUser.id,
            note: 'Fully paid on create',
          },
        });
      }

      return createdBooking;
    });

    return successResponse({ bookingId: booking.id }, 'Booking and payment successful', 201);
  } catch (error) {
    console.error('[CREATE_BOOKING_ERROR]', error);
    return serverErrorResponse('Booking failed');
  }
}

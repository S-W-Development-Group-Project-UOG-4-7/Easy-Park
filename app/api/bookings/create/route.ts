import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

// --- Helper: Date Parsing ---
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
  return new Date(`${dateStr}T${hours}:${minutes}:00`);
}

// --- Helper: Mock Payment Gateway ---
async function chargeCreditCard(amount: number) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return fake transaction ID
  return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authUser = await getAuthUser(request);
    if (!authUser || !authUser.email) return errorResponse('Unauthorized', 401);

    // 2. Get Real User ID
    const dbUser = await prisma.users.findUnique({
      where: { email: authUser.email },
      select: { id: true }
    });

    if (!dbUser) return errorResponse('User not found', 404);

    const body = await request.json();
    const { date, startTime, duration, slotIds, totalAmount, advanceAmount, locationId } = body;

    // 3. Validation
    if (!slotIds?.length || !date || !startTime || !locationId) {
      return errorResponse('Missing required fields', 400);
    }

    // 4. Time Calculation
    const bookingDate = new Date(date);
    const startDateTime = parseDateTime(date, startTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + Number(duration));
    const now = new Date();

    // 5. Overlap Check (Active bookings only)
    const overlapping = await prisma.bookings.findFirst({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
        booking_slots: {
          some: {
            slotId: { in: slotIds },
            parking_slots: {
              locationId: locationId
            }
          }
        }
      },
      select: { id: true }
    });

    if (overlapping) {
      return errorResponse('Selected slot(s) are already booked for that time', 409);
    }

    // 6. Process Payment (Mock Gateway)
    // We do this BEFORE the DB transaction to ensure we don't book if payment fails
    const transactionId = await chargeCreditCard(advanceAmount);

    // 7. Database Transaction (Atomic Write)
    const result = await prisma.$transaction(async (tx) => {
      const newBookingId = crypto.randomUUID();

      // A. Create Booking (Status: PAID because advance is done)
      const booking = await tx.bookings.create({
        data: {
          id: newBookingId,
          userId: dbUser.id,
          date: bookingDate,
          startTime: startDateTime,
          endTime: endDateTime,
          duration: Number(duration),
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(advanceAmount), 
          status: 'PAID', // Initial status is PAID (Advance received)
          createdAt: now,
          updatedAt: now,
        },
      });

      // B. Link Slots
      await tx.booking_slots.createMany({
        data: slotIds.map((slotId: string) => ({
          id: crypto.randomUUID(),
          bookingId: newBookingId,
          slotId: slotId,
        })),
      });

      // C. Insert Payment Record
      await tx.payments.create({
        data: {
          id: crypto.randomUUID(),
          bookingId: newBookingId,
          amount: parseFloat(advanceAmount),
          method: 'CARD',
          status: 'COMPLETED',
          transactionId: transactionId,
          paidAt: now,
          createdAt: now,
          updatedAt: now,
        }
      });

      return booking;
    });

    return successResponse({ bookingId: result.id }, 'Booking and payment successful', 201);

  } catch (error: any) {
    console.error('[CREATE_BOOKING_ERROR]', error);
    return serverErrorResponse(`Booking failed: ${error.message}`);
  }
}

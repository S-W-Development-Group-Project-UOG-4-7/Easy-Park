import prisma from '@/lib/prisma';

const toNumber = (value: unknown) => Number(value || 0);

export async function refreshPaymentSummary(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  bookingId: string
) {
  const booking = await tx.bookings.findUnique({
    where: { id: bookingId },
    include: {
      payments: true,
      bookingSlots: {
        include: {
          slot: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  if (!booking) return null;

  const durationMs = booking.endTime.getTime() - booking.startTime.getTime();
  const hours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
  const property = booking.bookingSlots[0]?.slot?.property;
  const hourlyRate = toNumber(property?.pricePerHour);
  const dailyRate = toNumber(property?.pricePerDay);
  const useDaily = hours >= 24 && dailyRate > 0;
  const totalAmount = useDaily ? dailyRate : hourlyRate * hours * Math.max(1, booking.bookingSlots.length);

  const onlinePaid = booking.payments
    .filter((payment) => payment.method === 'CARD' && payment.paymentStatus === 'PAID')
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const cashPaid = booking.payments
    .filter((payment) => payment.method === 'CASH' && payment.paymentStatus === 'PAID')
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const balanceDue = Math.max(0, totalAmount - (onlinePaid + cashPaid));

  await tx.payment_summary.upsert({
    where: { bookingId },
    update: {
      totalAmount,
      onlinePaid,
      cashPaid,
      balanceDue,
      currency: property?.currency || 'LKR',
      updatedAt: new Date(),
    },
    create: {
      bookingId,
      totalAmount,
      onlinePaid,
      cashPaid,
      balanceDue,
      currency: property?.currency || 'LKR',
    },
  });

  return {
    totalAmount,
    onlinePaid,
    cashPaid,
    balanceDue,
    currency: property?.currency || 'LKR',
  };
}

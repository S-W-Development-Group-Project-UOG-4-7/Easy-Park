export type BookingTypeValue = 'NORMAL' | 'EV_SLOT' | 'CAR_WASHING';
export type PaymentCollectionStatusValue = 'PAID' | 'PARTIAL' | 'UNPAID';

export const BOOKING_BASE_RATES: Record<BookingTypeValue, number> = {
  NORMAL: 300,
  EV_SLOT: 400,
  CAR_WASHING: 500,
};

export function normalizeBookingType(rawType: unknown): BookingTypeValue {
  const normalized = String(rawType || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (normalized === 'EV' || normalized === 'EV_SLOT' || normalized === 'EV_CHARGING') {
    return 'EV_SLOT';
  }
  if (
    normalized === 'CAR_WASH' ||
    normalized === 'CAR_WASHING' ||
    normalized === 'CARWASH'
  ) {
    return 'CAR_WASHING';
  }
  return 'NORMAL';
}

export function calculateBookingPricing(params: {
  bookingType: BookingTypeValue;
  hoursSelected: number;
  slotCount?: number;
  extrasCost?: number;
  baseRateOverride?: number;
}) {
  const {
    bookingType,
    hoursSelected,
    slotCount = 1,
    extrasCost = 0,
    baseRateOverride,
  } = params;

  const baseRate = baseRateOverride ?? BOOKING_BASE_RATES[bookingType];
  const totalAmount = Math.max(0, baseRate * Math.max(1, hoursSelected) * Math.max(1, slotCount) + Math.max(0, extrasCost));

  return {
    bookingType,
    baseRate,
    hoursSelected: Math.max(1, hoursSelected),
    slotCount: Math.max(1, slotCount),
    extrasCost: Math.max(0, extrasCost),
    totalAmount,
  };
}

export function toPaymentCollectionStatus(
  totalAmount: number,
  onlinePaid: number
): PaymentCollectionStatusValue {
  if (totalAmount <= 0) return 'UNPAID';
  if (onlinePaid >= totalAmount) return 'PAID';
  if (onlinePaid > 0) return 'PARTIAL';
  return 'UNPAID';
}

export function clampOnlinePaid(totalAmount: number, onlinePaid: number) {
  if (onlinePaid < 0) {
    throw new Error('onlinePaid cannot be negative');
  }
  if (onlinePaid > totalAmount) {
    throw new Error('onlinePaid cannot exceed totalAmount');
  }
  return onlinePaid;
}

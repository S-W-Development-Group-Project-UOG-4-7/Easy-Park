import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BOOKABLE_STATUSES = ['PENDING', 'PAID'] as const;

type TimeOption = {
  time: string;
  label: string;
  isPeak: boolean;
};

const TIME_OPTIONS: TimeOption[] = [
  { time: '06:00', label: '06:00 AM', isPeak: false },
  { time: '07:00', label: '07:00 AM', isPeak: true },
  { time: '08:00', label: '08:00 AM', isPeak: true },
  { time: '09:00', label: '09:00 AM', isPeak: true },
  { time: '10:00', label: '10:00 AM', isPeak: true },
  { time: '11:00', label: '11:00 AM', isPeak: false },
  { time: '12:00', label: '12:00 PM', isPeak: false },
  { time: '13:00', label: '01:00 PM', isPeak: false },
  { time: '14:00', label: '02:00 PM', isPeak: false },
  { time: '15:00', label: '03:00 PM', isPeak: false },
  { time: '16:00', label: '04:00 PM', isPeak: true },
  { time: '17:00', label: '05:00 PM', isPeak: true },
  { time: '18:00', label: '06:00 PM', isPeak: true },
  { time: '19:00', label: '07:00 PM', isPeak: true },
  { time: '20:00', label: '08:00 PM', isPeak: false },
];

type BookingWindow = {
  startTime: Date;
  endTime: Date;
  slotIds: string[];
};

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTimeMinutes(time: string) {
  const [hourPart, minutePart] = time.split(':');
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

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

function buildEndTime(start: Date, durationHours: number) {
  return new Date(start.getTime() + durationHours * 60 * 60 * 1000);
}

function getRoundedNowMinutes(now: Date, intervalMinutes: number) {
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const remainder = totalMinutes % intervalMinutes;
  if (remainder === 0) return totalMinutes;
  return totalMinutes + (intervalMinutes - remainder);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function occupiedSlotIdsForWindow(
  bookingWindows: BookingWindow[],
  requestedStart: Date,
  requestedEnd: Date
) {
  const occupiedSlotIds = new Set<string>();
  for (const window of bookingWindows) {
    if (!overlaps(window.startTime, window.endTime, requestedStart, requestedEnd)) continue;
    for (const slotId of window.slotIds) occupiedSlotIds.add(slotId);
  }
  return occupiedSlotIds;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || searchParams.get('locationId');
    const date = String(searchParams.get('date') || '').trim();
    const startTime = String(searchParams.get('startTime') || '').trim();
    const duration = Number(searchParams.get('duration') || '1');

    if (!propertyId) return errorResponse('propertyId is required', 400);
    if (!date) return errorResponse('date is required', 400);
    if (!Number.isFinite(duration) || duration <= 0) return errorResponse('duration must be a positive number', 400);

    const selectedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) return errorResponse('Invalid date', 400);

    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true },
    });
    if (!property || property.status !== 'ACTIVATED') {
      return errorResponse('Property not found', 404);
    }

    const [slots, dayBookings] = await Promise.all([
      prisma.parking_slots.findMany({
        where: { propertyId },
        select: {
          id: true,
          slotNumber: true,
          slotType: true,
          isActive: true,
        },
        orderBy: { slotNumber: 'asc' },
      }),
      prisma.bookings.findMany({
        where: {
          propertyId,
          status: { in: [...BOOKABLE_STATUSES] },
          startTime: { lt: new Date(`${date}T23:59:59.999`) },
          endTime: { gt: new Date(`${date}T00:00:00.000`) },
        },
        select: {
          startTime: true,
          endTime: true,
          bookingSlots: { select: { slotId: true } },
        },
      }),
    ]);

    const bookingWindows: BookingWindow[] = dayBookings.map((booking) => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      slotIds: booking.bookingSlots.map((bookingSlot) => bookingSlot.slotId),
    }));

    let requestedStart: Date | null = null;
    let requestedEnd: Date | null = null;
    let occupiedForRequested = new Set<string>();

    if (startTime) {
      requestedStart = parseDateTime(date, startTime);
      if (Number.isNaN(requestedStart.getTime())) {
        return errorResponse('Invalid startTime', 400);
      }
      requestedEnd = buildEndTime(requestedStart, duration);
      const overlappingRequestedBookingSlots = await prisma.booking_slots.findMany({
        where: {
          slot: { propertyId },
          booking: {
            status: { in: [...BOOKABLE_STATUSES] },
            startTime: { lt: requestedEnd },
            endTime: { gt: requestedStart },
          },
        },
        select: { slotId: true },
      });
      occupiedForRequested = new Set(overlappingRequestedBookingSlots.map((bookingSlot) => bookingSlot.slotId));
    }

    const activeSlotIds = new Set(slots.filter((slot) => slot.isActive).map((slot) => slot.id));
    const intervalMinutes = 60;
    const now = new Date();
    const todayKey = toLocalDateKey(now);
    const isPastDate = date < todayKey;
    const isToday = date === todayKey;
    const roundedNowMinutes = isToday ? getRoundedNowMinutes(now, intervalMinutes) : 0;

    const timeOptions = TIME_OPTIONS.map((option) => {
      const optionMinutes = parseTimeMinutes(option.time);
      const disabledByPastDate = isPastDate;
      const disabledByTodayTime = isToday && optionMinutes !== null && optionMinutes < roundedNowMinutes;

      const optionStart = parseDateTime(date, option.time);
      const optionEnd = buildEndTime(optionStart, duration);
      const occupiedForOption = occupiedSlotIdsForWindow(bookingWindows, optionStart, optionEnd);
      const hasAnySlotAvailable = Array.from(activeSlotIds).some((slotId) => !occupiedForOption.has(slotId));

      return {
        ...option,
        isEnabled: !disabledByPastDate && !disabledByTodayTime && hasAnySlotAvailable,
      };
    });

    const slotsWithAvailability = slots.map((slot) => {
      const isAvailable = slot.isActive && (startTime ? !occupiedForRequested.has(slot.id) : true);
      return {
        id: slot.id,
        number: slot.slotNumber,
        type: slot.slotType,
        isAvailable,
        status: !slot.isActive ? 'MAINTENANCE' : isAvailable ? 'AVAILABLE' : 'OCCUPIED',
      };
    });

    return successResponse(
      {
        slots: slotsWithAvailability,
        timeOptions,
        requestedStart: requestedStart ? requestedStart.toISOString() : null,
        requestedEnd: requestedEnd ? requestedEnd.toISOString() : null,
      },
      'Availability fetched',
      200,
      { 'Cache-Control': 'no-store, max-age=0' }
    );
  } catch (error) {
    console.error('[CUSTOMER_AVAILABILITY_ERROR]', error);
    return serverErrorResponse('Failed to fetch availability');
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export type AllowedWasherRole = 'WASHER' | 'ADMIN' | 'COUNTER';

export async function resolveWasherUser(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return null;

  let userId = authUser.userId || null;
  if (!userId && authUser.email) {
    const user = await prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true },
    });
    userId = user?.id || null;
  }
  if (!userId) return null;
  return {
    userId,
    role: String(authUser.role || '').toUpperCase() as AllowedWasherRole | string,
  };
}

export function canAccessWasherRoutes(role: string) {
  return role === 'WASHER' || role === 'ADMIN' || role === 'COUNTER';
}

export type WasherBookingPayload = {
  id: string;
  customerId: string;
  slotTime: Date;
  vehicle: string;
  serviceType: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

export function mapWashJobToWasherBooking(job: {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  note: string | null;
  createdAt: Date;
  bookingSlot: {
    booking: {
      id: string;
      status: 'PENDING' | 'PAID' | 'CANCELLED';
      startTime: Date;
      customer: {
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
      };
      vehicle: {
        vehicleNumber: string;
      } | null;
    };
    slot: {
      slotType: 'NORMAL' | 'EV' | 'CAR_WASH';
    };
  };
}): WasherBookingPayload {
  const booking = job.bookingSlot.booking;
  return {
    id: job.id,
    customerId: booking.customer.id,
    slotTime: booking.startTime,
    vehicle: booking.vehicle?.vehicleNumber || 'N/A',
    serviceType: job.bookingSlot.slot.slotType === 'CAR_WASH' ? 'Car Wash' : 'Wash Job',
    status: booking.status === 'CANCELLED' ? 'CANCELLED' : job.status,
    notes: job.note || '',
    createdAt: job.createdAt,
    customer: {
      id: booking.customer.id,
      name: booking.customer.fullName,
      email: booking.customer.email,
      phone: booking.customer.phone,
    },
  };
}

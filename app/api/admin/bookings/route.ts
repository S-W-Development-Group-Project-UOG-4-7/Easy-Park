import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

function minutesFromHHmm(value: string) {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function computeDurationHours(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
}

function slotZone(slotNumber: string) {
  const prefix = slotNumber.toUpperCase().replace(/[0-9]+$/, '');
  return prefix || 'A';
}

function paymentCollectionStatus(total: number, onlinePaid: number, cashPaid: number) {
  const paid = onlinePaid + cashPaid;
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
}

function isAdmin(role?: string) {
  return role === 'ADMIN';
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const groupByProperty = searchParams.get('groupByProperty') === 'true';

    const where: {
      propertyId?: string;
      status?: 'PENDING' | 'PAID' | 'CANCELLED';
      startTime?: { gte: Date; lte: Date };
      customer?: {
        OR: Array<{ fullName?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
      };
    } = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) {
      const normalized = status.toUpperCase();
      if (normalized === 'PENDING' || normalized === 'PAID' || normalized === 'CANCELLED') {
        where.status = normalized;
      }
    }
    if (date) {
      const day = new Date(date);
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }
    if (search) {
      where.customer = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            residentialAddress: true,
            nic: true,
            vehicles: {
              select: {
                vehicleNumber: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        vehicle: {
          select: {
            vehicleNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            propertyName: true,
            address: true,
          },
        },
        bookingSlots: {
          include: {
            slot: {
              select: {
                id: true,
                slotNumber: true,
                slotType: true,
              },
            },
          },
        },
        paymentSummary: true,
      },
      orderBy: [{ startTime: 'desc' }, { createdAt: 'desc' }],
    });

    const startMinutes = startTime ? minutesFromHHmm(startTime) : null;
    const endMinutes = endTime ? minutesFromHHmm(endTime) : null;

    const filtered = bookings.filter((booking) => {
      if (startMinutes === null && endMinutes === null) return true;
      const bookingStart = booking.startTime.getHours() * 60 + booking.startTime.getMinutes();
      const bookingEnd = booking.endTime.getHours() * 60 + booking.endTime.getMinutes();
      if (startMinutes !== null && bookingStart < startMinutes) return false;
      if (endMinutes !== null && bookingEnd > endMinutes) return false;
      return true;
    });

    const payload = filtered.map((booking) => {
      const totalAmount = Number(booking.paymentSummary?.totalAmount ?? 0);
      const onlinePaid = Number(booking.paymentSummary?.onlinePaid ?? 0);
      const cashPaid = Number(booking.paymentSummary?.cashPaid ?? 0);
      const paidAmount = onlinePaid + cashPaid;
      const balanceDue = Math.max(0, Number(booking.paymentSummary?.balanceDue ?? totalAmount - paidAmount));
      const duration = computeDurationHours(booking.startTime, booking.endTime);
      const allSlots = booking.bookingSlots.map((bookingSlot) => ({
        id: bookingSlot.slot.id,
        number: bookingSlot.slot.slotNumber,
        zone: slotZone(bookingSlot.slot.slotNumber),
        type: bookingSlot.slot.slotType,
      }));
      const firstSlot = allSlots[0];

      return {
        bookingId: booking.id,
        bookingNumber: `BK-${booking.id.slice(-6).toUpperCase()}`,
        propertyId: booking.property.id,
        propertyName: booking.property.propertyName,
        propertyAddress: booking.property.address,
        bookingDate: booking.startTime,
        startTime: booking.startTime,
        endTime: booking.endTime,
        slotNumber: firstSlot?.number || 'N/A',
        slotZone: firstSlot?.zone || 'A',
        customerId: booking.customer.id,
        userId: booking.customer.id,
        customerName: booking.customer.fullName,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        customerAddress: booking.customer.residentialAddress,
        customerNic: booking.customer.nic,
        vehicleNumber: booking.vehicle?.vehicleNumber || booking.customer.vehicles[0]?.vehicleNumber || null,
        bookingStatus: booking.status,
        status: booking.status,
        duration,
        bookingType: booking.bookingType,
        extrasCost: 0,
        extras: null,
        checkInTime: booking.startTime,
        checkOutTime: booking.endTime,
        totalAmount,
        paidAmount,
        onlinePaid,
        balanceDue,
        paymentStatus: paymentCollectionStatus(totalAmount, onlinePaid, cashPaid),
        paymentMethod: onlinePaid > 0 && cashPaid > 0 ? 'CARD,CASH' : onlinePaid > 0 ? 'CARD' : cashPaid > 0 ? 'CASH' : 'N/A',
        allSlots,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    if (groupByProperty) {
      const grouped = new Map<
        string,
        {
          propertyId: string;
          propertyName: string;
          propertyAddress: string;
          bookings: typeof payload;
          totalBookings: number;
          totalRevenue: number;
        }
      >();

      for (const booking of payload) {
        if (!grouped.has(booking.propertyId)) {
          grouped.set(booking.propertyId, {
            propertyId: booking.propertyId,
            propertyName: booking.propertyName,
            propertyAddress: booking.propertyAddress,
            bookings: [],
            totalBookings: 0,
            totalRevenue: 0,
          });
        }
        const bucket = grouped.get(booking.propertyId)!;
        bucket.bookings.push(booking);
        bucket.totalBookings += 1;
        bucket.totalRevenue += Number(booking.totalAmount || 0);
      }

      return NextResponse.json({
        success: true,
        groupedByProperty: Array.from(grouped.values()),
        total: payload.length,
      });
    }

    return NextResponse.json({
      success: true,
      bookings: payload,
      total: payload.length,
    });
  } catch (error) {
    console.error('Admin bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const bookingId = String(body?.bookingId || '').trim();
    const status = String(body?.status || '').toUpperCase();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Booking ID and status are required' }, { status: 400 });
    }
    if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await prisma.bookings.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.update({
        where: { id: bookingId },
        data: { status: status as BookingStatus },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });

      await tx.booking_status_history.create({
        data: {
          bookingId,
          oldStatus: existing.status,
          newStatus: status,
          changedBy: authUser.userId || null,
          note: 'Status updated by admin endpoint',
        },
      });
      return booking;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: {
        bookingId: updated.id,
        bookingStatus: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin bookings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

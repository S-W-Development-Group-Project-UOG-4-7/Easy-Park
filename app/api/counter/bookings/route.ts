import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { refreshPaymentSummary } from '@/lib/payment-summary';
import { resolveCounterAccess } from '@/app/api/counter/_shared';

type BookingStatusValue = 'PENDING' | 'PAID' | 'CANCELLED';
type PaymentMethodValue = 'CARD' | 'CASH';

type CustomerInput = {
  customerId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nic?: string;
  address?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleColor?: string;
};

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
  const epsilon = 0.0001;
  if (paid <= epsilon) return 'UNPAID';
  if (paid + epsilon >= total) return 'PAID';
  return 'PARTIAL';
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

function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return email || null;
}

function normalizeMaybe(value: unknown) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function createWalkInEmail() {
  const entropy = Math.random().toString(36).slice(2, 8);
  return `walkin.${Date.now()}.${entropy}@easypark.local`;
}

async function ensureCustomerRole(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  userId: string
) {
  const roleRecord = await tx.roles.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER' },
    select: { id: true },
  });

  await tx.user_roles.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: roleRecord.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: roleRecord.id,
    },
  });
}

async function resolveOrCreateCustomer(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  rawInput: CustomerInput
) {
  const customerId = normalizeMaybe(rawInput.customerId);
  const fullName = normalizeMaybe(rawInput.fullName);
  const email = normalizeEmail(rawInput.email);
  const phone = normalizeMaybe(rawInput.phone);
  const nic = normalizeMaybe(rawInput.nic);
  const address = normalizeMaybe(rawInput.address);
  const vehicleNumber = normalizeMaybe(rawInput.vehicleNumber);
  const vehicleType = normalizeMaybe(rawInput.vehicleType);
  const vehicleModel = normalizeMaybe(rawInput.vehicleModel);
  const vehicleColor = normalizeMaybe(rawInput.vehicleColor);

  let customer =
    customerId
      ? await tx.users.findUnique({ where: { id: customerId } })
      : email
        ? await tx.users.findUnique({ where: { email } })
        : phone
          ? await tx.users.findFirst({ where: { phone } })
          : nic
            ? await tx.users.findFirst({ where: { nic } })
            : vehicleNumber
              ? (await tx.vehicles.findUnique({
                  where: { vehicleNumber },
                  include: { user: true },
                }))?.user || null
              : null;

  if (!customer) {
    const randomPassword = `Counter#${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await hashPassword(randomPassword);
    customer = await tx.users.create({
      data: {
        fullName: fullName || 'Walk-in Customer',
        email: email || createWalkInEmail(),
        phone,
        nic,
        residentialAddress: address,
        passwordHash,
      },
    });
  } else {
    const updates: {
      fullName?: string;
      phone?: string;
      nic?: string;
      residentialAddress?: string;
      email?: string;
    } = {};
    if (fullName && fullName !== customer.fullName) updates.fullName = fullName;
    if (phone && !customer.phone) updates.phone = phone;
    if (nic && !customer.nic) updates.nic = nic;
    if (address && !customer.residentialAddress) updates.residentialAddress = address;
    if (email && customer.email.endsWith('@easypark.local')) {
      const existingEmail = await tx.users.findUnique({ where: { email } });
      if (!existingEmail || existingEmail.id === customer.id) {
        updates.email = email;
      }
    }
    if (Object.keys(updates).length > 0) {
      customer = await tx.users.update({
        where: { id: customer.id },
        data: updates,
      });
    }
  }

  await ensureCustomerRole(tx, customer.id);

  let vehicleId: string | null = null;
  if (vehicleNumber) {
    const existingVehicle = await tx.vehicles.findUnique({
      where: { vehicleNumber },
    });
    if (existingVehicle && existingVehicle.userId !== customer.id) {
      throw new Error('Vehicle number is already assigned to another customer');
    }
    if (existingVehicle) {
      vehicleId = existingVehicle.id;
      if (vehicleType || vehicleModel || vehicleColor) {
        await tx.vehicles.update({
          where: { id: existingVehicle.id },
          data: {
            type: vehicleType ?? existingVehicle.type,
            model: vehicleModel ?? existingVehicle.model,
            color: vehicleColor ?? existingVehicle.color,
          },
        });
      }
    } else {
      const createdVehicle = await tx.vehicles.create({
        data: {
          userId: customer.id,
          vehicleNumber,
          type: vehicleType,
          model: vehicleModel,
          color: vehicleColor,
        },
      });
      vehicleId = createdVehicle.id;
    }
  } else {
    const latestVehicle = await tx.vehicles.findFirst({
      where: { userId: customer.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    vehicleId = latestVehicle?.id || null;
  }

  return { customer, vehicleId };
}

export async function GET(request: NextRequest) {
  try {
    const access = await resolveCounterAccess(request);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized: Counter or admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: {
      propertyId?: string;
      status?: BookingStatusValue;
      startTime?: { gte: Date; lte: Date };
      OR?: Array<{
        customer?: {
          fullName?: { contains: string; mode: 'insensitive' };
          email?: { contains: string; mode: 'insensitive' };
          phone?: { contains: string; mode: 'insensitive' };
        };
        vehicle?: {
          vehicleNumber?: { contains: string; mode: 'insensitive' };
        };
      }>;
    } = {};

    if (propertyId && propertyId !== 'all') where.propertyId = propertyId;
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
      where.OR = [
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        { vehicle: { vehicleNumber: { contains: search, mode: 'insensitive' } } },
      ];
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
          },
        },
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            type: true,
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
        counterLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            counterUser: {
              select: { fullName: true },
            },
          },
        },
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
      const latestCounterAction = booking.counterLogs[0] || null;

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
        customerName: booking.customer.fullName,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        vehicleId: booking.vehicle?.id || null,
        vehicleNumber: booking.vehicle?.vehicleNumber || 'N/A',
        vehicleType: booking.vehicle?.type || null,
        bookingStatus: booking.status,
        status: booking.status,
        duration,
        bookingType: booking.bookingType,
        totalAmount,
        paidAmount,
        onlinePaid,
        cashPaid,
        balanceDue,
        paymentStatus: paymentCollectionStatus(totalAmount, onlinePaid, cashPaid),
        paymentMethod: onlinePaid > 0 && cashPaid > 0 ? 'CARD,CASH' : onlinePaid > 0 ? 'CARD' : cashPaid > 0 ? 'CASH' : 'N/A',
        allSlots,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        latestCounterAction: latestCounterAction
          ? {
              action: latestCounterAction.action,
              note: latestCounterAction.note,
              createdAt: latestCounterAction.createdAt,
              counterName: latestCounterAction.counterUser.fullName,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        bookings: payload,
        total: payload.length,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Counter bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch counter bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await resolveCounterAccess(request);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized: Counter or admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const date = String(body?.date || '').trim();
    const startTimeRaw = String(body?.startTime || '').trim();
    const durationHours = Number(body?.duration);
    const slotIds = Array.isArray(body?.slotIds) ? body.slotIds.map(String) : [];
    const propertyId = String(body?.propertyId || body?.locationId || '').trim();
    const advanceAmount = Number(body?.advanceAmount || 0);
    const paymentMethodRaw = String(body?.paymentMethod || 'CASH').toUpperCase();
    const paymentMethod: PaymentMethodValue = paymentMethodRaw === 'CARD' ? 'CARD' : 'CASH';
    const note = normalizeMaybe(body?.note);

    if (!date || !startTimeRaw || !Number.isFinite(durationHours) || durationHours <= 0 || slotIds.length === 0 || !propertyId) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }
    if (!Number.isFinite(advanceAmount) || advanceAmount < 0) {
      return NextResponse.json({ error: 'advanceAmount must be a non-negative number' }, { status: 400 });
    }

    const customerInput: CustomerInput = {
      customerId: body?.customerId,
      ...(typeof body?.customer === 'object' && body?.customer ? body.customer : {}),
      fullName:
        normalizeMaybe(body?.customer?.fullName) ||
        normalizeMaybe(body?.customerName) ||
        normalizeMaybe(body?.fullName) ||
        undefined,
      email:
        normalizeEmail(body?.customer?.email) ||
        normalizeEmail(body?.customerEmail) ||
        normalizeEmail(body?.email) ||
        undefined,
      phone:
        normalizeMaybe(body?.customer?.phone) ||
        normalizeMaybe(body?.customerPhone) ||
        normalizeMaybe(body?.phone) ||
        undefined,
      nic:
        normalizeMaybe(body?.customer?.nic) ||
        normalizeMaybe(body?.customerNic) ||
        normalizeMaybe(body?.nic) ||
        undefined,
      address:
        normalizeMaybe(body?.customer?.address) ||
        normalizeMaybe(body?.customerAddress) ||
        normalizeMaybe(body?.address) ||
        undefined,
      vehicleNumber:
        normalizeMaybe(body?.customer?.vehicleNumber) ||
        normalizeMaybe(body?.vehicleNumber) ||
        undefined,
      vehicleType:
        normalizeMaybe(body?.customer?.vehicleType) ||
        normalizeMaybe(body?.vehicleType) ||
        undefined,
      vehicleModel:
        normalizeMaybe(body?.customer?.vehicleModel) ||
        normalizeMaybe(body?.vehicleModel) ||
        undefined,
      vehicleColor:
        normalizeMaybe(body?.customer?.vehicleColor) ||
        normalizeMaybe(body?.vehicleColor) ||
        undefined,
    };

    if (!customerInput.customerId && !normalizeMaybe(customerInput.fullName)) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const startTime = parseDateTime(date, startTimeRaw);
    if (Number.isNaN(startTime.getTime())) return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 });
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
        slotNumber: true,
        isActive: true,
        property: {
          select: {
            id: true,
            propertyName: true,
            pricePerHour: true,
            pricePerDay: true,
            status: true,
          },
        },
      },
    });

    if (selectedSlots.length !== slotIds.length) {
      return NextResponse.json({ error: 'One or more selected slots are invalid for this property' }, { status: 400 });
    }
    if (selectedSlots.some((slot) => !slot.isActive)) {
      return NextResponse.json({ error: 'One or more selected slots are in maintenance mode' }, { status: 400 });
    }
    if (selectedSlots.some((slot) => slot.property.status !== 'ACTIVATED')) {
      return NextResponse.json({ error: 'Cannot create booking for a non-activated property' }, { status: 400 });
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
      return NextResponse.json({ error: 'Selected slot(s) are already booked for that time' }, { status: 409 });
    }

    const property = selectedSlots[0]?.property;
    const useDaily = durationHours >= 24 && Number(property?.pricePerDay || 0) > 0;
    const totalAmount =
      (useDaily ? Number(property?.pricePerDay || 0) : Number(property?.pricePerHour || 0) * durationHours) *
      selectedSlots.length;
    const parkingType = selectedSlots.some((slot) => slot.slotType === 'CAR_WASH')
      ? 'CAR_WASH'
      : selectedSlots.some((slot) => slot.slotType === 'EV')
        ? 'EV'
        : 'NORMAL';

    const booking = await prisma.$transaction(async (tx) => {
      const { customer, vehicleId } = await resolveOrCreateCustomer(tx, customerInput);

      const createdBooking = await tx.bookings.create({
        data: {
          customerId: customer.id,
          propertyId,
          vehicleId,
          startTime,
          endTime,
          status: 'PENDING',
          parkingType,
          bookingType: parkingType,
          createdBy: access.userId,
        },
      });

      await tx.booking_status_history.create({
        data: {
          bookingId: createdBooking.id,
          oldStatus: null,
          newStatus: 'PENDING',
          changedBy: access.userId,
          note: 'Booking created by counter',
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
            payerId: customer.id,
            amount: advanceAmount,
            currency: 'LKR',
            method: paymentMethod,
            paymentStatus: 'PAID',
            gatewayStatus: paymentMethod === 'CARD' ? 'COMPLETED' : 'PENDING',
            gatewayProvider: paymentMethod === 'CARD' ? 'COUNTER_CARD_TERMINAL' : 'COUNTER_CASH',
            transactionId:
              paymentMethod === 'CARD'
                ? `ctr_txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
                : null,
            paidAt: new Date(),
            createdBy: access.userId,
          },
        });
      }

      const summary = await refreshPaymentSummary(tx, createdBooking.id);
      if (summary && Number(summary.balanceDue) <= 0.0001) {
        await tx.bookings.update({
          where: { id: createdBooking.id },
          data: { status: 'PAID' },
        });
        await tx.booking_status_history.create({
          data: {
            bookingId: createdBooking.id,
            oldStatus: 'PENDING',
            newStatus: 'PAID',
            changedBy: access.userId,
            note: 'Fully paid at counter during booking creation',
          },
        });
      }

      const slotNumbers = selectedSlots.map((slot) => slot.slotNumber).join(', ');
      await tx.counter_transactions.create({
        data: {
          counterUserId: access.userId,
          bookingId: createdBooking.id,
          action: 'BOOKING_CREATED',
          note: note || `Slots: ${slotNumbers}`,
        },
      });

      return {
        id: createdBooking.id,
        customerId: customer.id,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Booking failed';
    console.error('[COUNTER_CREATE_BOOKING_ERROR]', error);
    if (message.toLowerCase().includes('already assigned')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message.toLowerCase().includes('required') || message.toLowerCase().includes('invalid')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

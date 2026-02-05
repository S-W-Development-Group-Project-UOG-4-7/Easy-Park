'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export interface CreateBookingInput {
  driverName: string;
  vehicleNumber: string;
  email?: string;
  phoneNumber: string;
  idNumber: string;
  parkingSpot: string;
  vehicleType: string;
  entryTime: string;
  expectedExitTime: string;
  paymentMethod: string;
  notes?: string;
  totalCost?: number;
}

export async function createBooking(data: CreateBookingInput) {
  try {
    const booking = await prisma.booking.create({
      data: {
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        email: data.email || null,
        phoneNumber: data.phoneNumber,
        idNumber: data.idNumber,
        parkingSpot: data.parkingSpot,
        vehicleType: data.vehicleType,
        entryTime: new Date(data.entryTime),
        expectedExitTime: new Date(data.expectedExitTime),
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        totalCost: data.totalCost || 0,
        bookingStatus: 'CONFIRMED',
        paymentStatus: data.paymentMethod === 'Online' ? 'PENDING' : 'COMPLETED',
      },
    });

    return {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch bookings',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getBookingById(id: number) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch booking',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateBookingStatus(id: number, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: status,
      },
    });

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update booking',
    };
  } finally {
    await prisma.$disconnect();
  }
}

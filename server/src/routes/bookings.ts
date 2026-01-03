import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { SlotType } from '@prisma/client';

const router = Router();

// Get all bookings with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, date, time, status } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' && { propertyId: parseInt(propertyId as string) }),
        ...(date && { bookingDate: new Date(date as string) }),
        ...(status && { bookingStatus: status as any })
      },
      include: {
        customer: true,
        property: true,
        slot: true
      },
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }]
    });

    // Filter by time if provided (client-side filtering for time comparison)
    let filteredBookings = bookings;
    if (time) {
      const filterTime = time as string;
      filteredBookings = bookings.filter(b => {
        const startTimeStr = b.startTime.toISOString().slice(11, 16); // HH:MM
        const endTimeStr = b.endTime ? b.endTime.toISOString().slice(11, 16) : '23:59';
        return filterTime >= startTimeStr && filterTime <= endTimeStr;
      });
    }

    const result = filteredBookings.map(b => ({
      id: b.id.toString(),
      customerId: `C${String(b.customerId).padStart(3, '0')}`,
      name: b.customer.name,
      address: b.customer.address || '',
      email: b.customer.email,
      phone: b.customer.phone,
      propertyId: b.propertyId.toString(),
      propertyName: b.property.name,
      parkingSlotId: b.slotId.toString(),
      parkingSlot: b.slot.slotNumber,
      parkingType: b.slot.type === SlotType.CarWashing ? 'Car Washing' : b.slot.type === SlotType.EV ? 'EV Slot' : 'Normal',
      date: b.bookingDate.toISOString().split('T')[0],
      time: b.startTime.toISOString().slice(11, 16),
      hoursSelected: b.hoursSelected,
      checkOutTime: b.checkOutTime ? b.checkOutTime.toISOString() : '',
      paymentAmount: Number(b.paymentAmount),
      paymentMethod: b.paymentMethod || '',
      paymentStatus: b.paymentStatus,
      bookingStatus: b.bookingStatus,
      extras: b.extras || '',
      createdAt: b.createdAt.toISOString()
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        property: true,
        slot: true
      }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({
      id: booking.id,
      customerId: booking.customerId,
      name: booking.customer.name,
      address: booking.customer.address,
      email: booking.customer.email,
      phone: booking.customer.phone,
      propertyId: booking.propertyId,
      propertyName: booking.property.name,
      slotId: booking.slotId,
      slotNumber: booking.slot.slotNumber,
      parkingType: booking.slot.type === SlotType.CarWashing ? 'Car Washing' : booking.slot.type,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      hoursSelected: booking.hoursSelected,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      paymentAmount: booking.paymentAmount,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      extras: booking.extras,
      createdAt: booking.createdAt
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      propertyId,
      slotId,
      bookingDate,
      startTime,
      endTime,
      hoursSelected,
      paymentAmount,
      paymentMethod,
      extras
    } = req.body;

    // Update slot status to occupied
    await prisma.parkingSlot.update({
      where: { id: slotId },
      data: { status: 'occupied' }
    });

    const booking = await prisma.booking.create({
      data: {
        customerId,
        propertyId,
        slotId,
        bookingDate: new Date(bookingDate),
        startTime: new Date(`1970-01-01T${startTime}`),
        endTime: endTime ? new Date(`1970-01-01T${endTime}`) : null,
        hoursSelected: hoursSelected || 1,
        paymentAmount,
        paymentMethod,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        extras
      }
    });

    res.status(201).json({
      id: booking.id.toString(),
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;
    
    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        ...(bookingStatus && { bookingStatus }),
        ...(paymentStatus && { paymentStatus })
      }
    });

    res.json({ message: 'Booking updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in
router.post('/:id/checkin', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        checkInTime: new Date(),
        bookingStatus: 'checked_in'
      }
    });

    res.json({ message: 'Check-in successful' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-out
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { slotId: true }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Update booking
    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        checkOutTime: new Date(),
        bookingStatus: 'completed'
      }
    });

    // Free up the slot
    await prisma.parkingSlot.update({
      where: { id: booking.slotId },
      data: { status: 'available' }
    });

    res.json({ message: 'Check-out successful' });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      select: { slotId: true }
    });

    if (booking) {
      // Free up the slot
      await prisma.parkingSlot.update({
        where: { id: booking.slotId },
        data: { status: 'available' }
      });
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

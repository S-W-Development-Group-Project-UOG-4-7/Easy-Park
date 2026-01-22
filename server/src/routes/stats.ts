import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';

const router = Router();

// Get dashboard stats from database
router.get('/', async (req: Request, res: Response) => {
  try {
    // Total revenue
    const revenueResult = await prisma.booking.aggregate({
      _sum: { paymentAmount: true },
      where: { paymentStatus: 'paid' }
    });
    const totalRevenue = Number(revenueResult._sum.paymentAmount) || 0;

    // Available slots
    const availableSlots = await prisma.parkingSlot.count({
      where: { status: 'available' }
    });

    // Total customers
    const totalCustomers = await prisma.customer.count();

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'paid',
        bookingDate: { gte: sixMonthsAgo }
      },
      select: {
        bookingDate: true,
        paymentAmount: true
      }
    });

    const monthlyRevenueMap = new Map<string, number>();
    monthlyBookings.forEach(b => {
      const date = new Date(b.bookingDate);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const current = monthlyRevenueMap.get(key) || 0;
      monthlyRevenueMap.set(key, current + Number(b.paymentAmount));
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(0, 6);

    // Parking types breakdown
    const slotTypeCounts = await prisma.parkingSlot.groupBy({
      by: ['type'],
      _count: true
    });

    const bookingsBySlot = await prisma.booking.groupBy({
      by: ['slotId'],
      _count: true
    });

    const parkingTypes = slotTypeCounts.map(st => ({
      type: st.type === 'CarWashing' ? 'Car Washing' : st.type,
      bookingCount: 0 // Will be calculated below
    }));

    // Get booking counts per type
    const slots = await prisma.parkingSlot.findMany({
      include: { _count: { select: { bookings: true } } }
    });

    const typeBookingCounts: { [key: string]: number } = {};
    slots.forEach(slot => {
      const type = slot.type === 'CarWashing' ? 'Car Washing' : slot.type;
      typeBookingCounts[type] = (typeBookingCounts[type] || 0) + slot._count.bookings;
    });

    const parkingTypesWithCounts = Object.entries(typeBookingCounts).map(([type, bookingCount]) => ({
      type,
      bookingCount
    }));

    // Property occupancy
    const properties = await prisma.property.findMany({
      include: {
        slots: true
      }
    });

    const propertyOccupancy = properties.map(p => ({
      propertyName: p.name,
      totalSlots: p.slots.length,
      occupiedSlots: p.slots.filter(s => s.status === 'occupied').length
    }));

    res.json({
      totalRevenue,
      availableSlots,
      totalCustomers,
      todayBookings,
      monthlyRevenue,
      parkingTypes: parkingTypesWithCounts,
      propertyOccupancy
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

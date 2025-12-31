import { Router, Request, Response } from 'express';
import { query } from '../db/config.js';

const router = Router();

// Get dashboard stats
router.get('/', async (req: Request, res: Response) => {
  try {
    // Total revenue
    const revenueResult = await query(`
      SELECT COALESCE(SUM(payment_amount), 0) as total_revenue
      FROM bookings
      WHERE payment_status = 'paid'
    `);

    // Available slots
    const slotsResult = await query(`
      SELECT COUNT(*) as available_slots
      FROM parking_slots
      WHERE status = 'available'
    `);

    // Total customers
    const customersResult = await query(`
      SELECT COUNT(DISTINCT customer_id) as total_customers
      FROM bookings
    `);

    // Today's bookings
    const todayBookingsResult = await query(`
      SELECT COUNT(*) as today_bookings
      FROM bookings
      WHERE booking_date = CURRENT_DATE
    `);

    // Revenue by month (last 6 months)
    const monthlyRevenueResult = await query(`
      SELECT 
        TO_CHAR(booking_date, 'Mon YYYY') as month,
        COALESCE(SUM(payment_amount), 0) as revenue
      FROM bookings
      WHERE payment_status = 'paid'
        AND booking_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(booking_date, 'Mon YYYY'), DATE_TRUNC('month', booking_date)
      ORDER BY DATE_TRUNC('month', booking_date) DESC
      LIMIT 6
    `);

    // Popular parking types
    const parkingTypesResult = await query(`
      SELECT 
        ps.type,
        COUNT(b.id) as booking_count
      FROM bookings b
      JOIN parking_slots ps ON b.slot_id = ps.id
      GROUP BY ps.type
      ORDER BY booking_count DESC
    `);

    // Property occupancy
    const occupancyResult = await query(`
      SELECT 
        p.name as property_name,
        COUNT(ps.id) as total_slots,
        COUNT(CASE WHEN ps.status = 'occupied' OR ps.status = 'reserved' THEN 1 END) as occupied_slots
      FROM properties p
      LEFT JOIN parking_slots ps ON p.id = ps.property_id
      GROUP BY p.id, p.name
    `);

    res.json({
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      availableSlots: parseInt(slotsResult.rows[0].available_slots),
      totalCustomers: parseInt(customersResult.rows[0].total_customers),
      todayBookings: parseInt(todayBookingsResult.rows[0].today_bookings),
      monthlyRevenue: monthlyRevenueResult.rows.map((r) => ({
        month: r.month,
        revenue: parseFloat(r.revenue),
      })),
      parkingTypes: parkingTypesResult.rows.map((r) => ({
        type: r.type,
        count: parseInt(r.booking_count),
      })),
      propertyOccupancy: occupancyResult.rows.map((r) => ({
        name: r.property_name,
        totalSlots: parseInt(r.total_slots),
        occupiedSlots: parseInt(r.occupied_slots),
        occupancyRate: r.total_slots > 0 
          ? Math.round((parseInt(r.occupied_slots) / parseInt(r.total_slots)) * 100) 
          : 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

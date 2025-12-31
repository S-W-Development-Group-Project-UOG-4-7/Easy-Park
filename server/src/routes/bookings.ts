import { Router, Request, Response } from 'express';
import { query } from '../db/config.js';

const router = Router();

// Get all bookings with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, date, time, status } = req.query;

    let sql = `
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.hours_selected,
        b.check_in_time,
        b.check_out_time,
        b.payment_amount,
        b.payment_method,
        b.payment_status,
        b.booking_status,
        b.extras,
        b.created_at,
        c.id as customer_id,
        c.name as customer_name,
        c.address as customer_address,
        c.email as customer_email,
        c.phone as customer_phone,
        p.id as property_id,
        p.name as property_name,
        ps.id as slot_id,
        ps.slot_number,
        ps.type as parking_type
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN properties p ON b.property_id = p.id
      JOIN parking_slots ps ON b.slot_id = ps.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (propertyId && propertyId !== 'all') {
      paramCount++;
      sql += ` AND b.property_id = $${paramCount}`;
      params.push(propertyId);
    }

    if (date) {
      paramCount++;
      sql += ` AND b.booking_date = $${paramCount}`;
      params.push(date);
    }

    if (time) {
      paramCount++;
      sql += ` AND b.start_time = $${paramCount}`;
      params.push(time);
    }

    if (status) {
      paramCount++;
      sql += ` AND b.booking_status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const result = await query(sql, params);

    const bookings = result.rows.map((row) => ({
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      name: row.customer_name,
      address: row.customer_address,
      email: row.customer_email,
      phone: row.customer_phone,
      propertyName: row.property_name,
      propertyId: row.property_id.toString(),
      parkingSlot: row.slot_number,
      parkingSlotId: row.slot_id.toString(),
      date: row.booking_date.toISOString().split('T')[0],
      time: row.start_time,
      parkingType: row.parking_type === 'EV' ? 'EV Slot' : row.parking_type,
      hoursSelected: row.hours_selected,
      checkOutTime: row.check_out_time?.toISOString() || null,
      paymentAmount: parseFloat(row.payment_amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      extras: row.extras,
    }));

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        b.*,
        c.name as customer_name,
        c.address as customer_address,
        c.email as customer_email,
        c.phone as customer_phone,
        p.name as property_name,
        ps.slot_number,
        ps.type as parking_type
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN properties p ON b.property_id = p.id
      JOIN parking_slots ps ON b.slot_id = ps.id
      WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      name: row.customer_name,
      address: row.customer_address,
      propertyName: row.property_name,
      propertyId: row.property_id.toString(),
      parkingSlot: row.slot_number,
      parkingSlotId: row.slot_id.toString(),
      date: row.booking_date.toISOString().split('T')[0],
      time: row.start_time,
      parkingType: row.parking_type === 'EV' ? 'EV Slot' : row.parking_type,
      hoursSelected: row.hours_selected,
      checkOutTime: row.check_out_time?.toISOString() || null,
      paymentAmount: parseFloat(row.payment_amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      extras: row.extras,
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
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      propertyId,
      slotId,
      bookingDate,
      startTime,
      hoursSelected,
      paymentAmount,
      paymentMethod,
      extras,
    } = req.body;

    let custId = customerId;

    // Create customer if not exists
    if (!custId && customerName) {
      const customerResult = await query(
        `INSERT INTO customers (name, email, phone, address)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [customerName, customerEmail, customerPhone, customerAddress]
      );
      custId = customerResult.rows[0].id;
    }

    // Create booking
    const result = await query(
      `INSERT INTO bookings (customer_id, property_id, slot_id, booking_date, start_time, hours_selected, payment_amount, payment_method, extras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [custId, propertyId, slotId, bookingDate, startTime, hoursSelected, paymentAmount, paymentMethod, extras]
    );

    // Update slot status
    await query(
      `UPDATE parking_slots SET status = 'reserved' WHERE id = $1`,
      [slotId]
    );

    res.status(201).json({
      id: result.rows[0].id.toString(),
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, checkOutTime } = req.body;

    const result = await query(
      `UPDATE bookings 
       SET booking_status = COALESCE($1, booking_status),
           payment_status = COALESCE($2, payment_status),
           check_out_time = COALESCE($3, check_out_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING slot_id`,
      [bookingStatus, paymentStatus, checkOutTime, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Update slot status if completed or cancelled
    if (bookingStatus === 'completed' || bookingStatus === 'cancelled') {
      await query(
        `UPDATE parking_slots SET status = 'available' WHERE id = $1`,
        [result.rows[0].slot_id]
      );
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await query(
      `SELECT slot_id FROM bookings WHERE id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Free up the slot
    await query(
      `UPDATE parking_slots SET status = 'available' WHERE id = $1`,
      [booking.rows[0].slot_id]
    );

    await query(`DELETE FROM bookings WHERE id = $1`, [id]);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

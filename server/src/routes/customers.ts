import { Router, Request, Response } from 'express';
import { query } from '../db/config.js';

const router = Router();

// Get all customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT 
        c.*,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.payment_amount), 0) as total_spent
      FROM customers c
      LEFT JOIN bookings b ON c.id = b.customer_id
    `;

    const params: any[] = [];
    
    if (search) {
      sql += ` WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM customers';
    if (search) {
      countSql += ` WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`;
    }
    const countResult = await query(countSql, search ? [`%${search}%`] : []);

    res.json({
      customers: result.rows.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        totalBookings: parseInt(c.total_bookings),
        totalSpent: parseFloat(c.total_spent),
        createdAt: c.created_at,
      })),
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customerResult = await query(
      `SELECT * FROM customers WHERE id = $1`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Get customer's booking history
    const bookingsResult = await query(
      `SELECT 
        b.*,
        p.name as property_name,
        ps.slot_number,
        ps.type as parking_type
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN parking_slots ps ON b.slot_id = ps.id
      WHERE b.customer_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 10`,
      [id]
    );

    const customer = customerResult.rows[0];
    res.json({
      id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.created_at,
      recentBookings: bookingsResult.rows.map((b) => ({
        id: b.id.toString(),
        propertyName: b.property_name,
        parkingSlot: b.slot_number,
        parkingType: b.parking_type,
        date: b.booking_date.toISOString().split('T')[0],
        paymentAmount: parseFloat(b.payment_amount),
        status: b.booking_status,
      })),
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Customer name is required' });
      return;
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, address]
    );

    const customer = result.rows[0];
    res.status(201).json({
      id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Customer with this email already exists' });
      return;
    }
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const result = await query(
      `UPDATE customers 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, email, phone, address, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const customer = result.rows[0];
    res.json({
      id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM customers WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

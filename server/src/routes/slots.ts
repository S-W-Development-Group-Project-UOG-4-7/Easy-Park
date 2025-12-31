import { Router, Request, Response } from 'express';
import { query } from '../db/config.js';

const router = Router();

// Get all slots or by property
router.get('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, status, type } = req.query;

    let sql = `
      SELECT 
        ps.*,
        p.name as property_name
      FROM parking_slots ps
      JOIN properties p ON ps.property_id = p.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (propertyId) {
      paramCount++;
      sql += ` AND ps.property_id = $${paramCount}`;
      params.push(propertyId);
    }

    if (status) {
      paramCount++;
      sql += ` AND ps.status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      sql += ` AND ps.type = $${paramCount}`;
      params.push(type);
    }

    sql += ' ORDER BY ps.property_id, ps.slot_number';

    const result = await query(sql, params);

    res.json(result.rows.map((s) => ({
      id: s.id.toString(),
      propertyId: s.property_id.toString(),
      propertyName: s.property_name,
      slotNumber: s.slot_number,
      type: s.type === 'EV' ? 'EV Slot' : s.type,
      status: s.status,
      hourlyRate: parseFloat(s.hourly_rate),
    })));
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update slot status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, hourlyRate } = req.body;

    const result = await query(
      `UPDATE parking_slots 
       SET status = COALESCE($1, status),
           hourly_rate = COALESCE($2, hourly_rate),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, hourlyRate, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add slot to property
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, slotNumber, type, hourlyRate } = req.body;

    if (!propertyId || !slotNumber || !type) {
      res.status(400).json({ error: 'Property ID, slot number, and type are required' });
      return;
    }

    const result = await query(
      `INSERT INTO parking_slots (property_id, slot_number, type, hourly_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [propertyId, slotNumber, type, hourlyRate || 5.00]
    );

    res.status(201).json({
      id: result.rows[0].id.toString(),
      message: 'Slot created successfully',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Slot number already exists for this property' });
      return;
    }
    console.error('Error creating slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete slot
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM parking_slots WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

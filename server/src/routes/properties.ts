import { Router, Request, Response } from 'express';
import { query } from '../db/config.js';

const router = Router();

// Get all properties
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.address,
        p.description,
        p.created_at,
        COUNT(ps.id) as total_slots,
        COUNT(CASE WHEN ps.status = 'available' THEN 1 END) as available_slots
      FROM properties p
      LEFT JOIN parking_slots ps ON p.id = ps.property_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Get slots for each property
    const properties = await Promise.all(
      result.rows.map(async (property) => {
        const slotsResult = await query(
          `SELECT id, slot_number as number, type, status, hourly_rate
           FROM parking_slots WHERE property_id = $1`,
          [property.id]
        );
        return {
          id: property.id.toString(),
          name: property.name,
          address: property.address,
          description: property.description,
          totalSlots: parseInt(property.total_slots),
          availableSlots: parseInt(property.available_slots),
          slots: slotsResult.rows.map((s) => ({
            id: s.id.toString(),
            number: s.number,
            type: s.type === 'EV' ? 'EV Slot' : s.type,
            status: s.status,
            hourlyRate: parseFloat(s.hourly_rate),
          })),
          createdAt: property.created_at,
        };
      })
    );

    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM properties WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const property = result.rows[0];
    
    const slotsResult = await query(
      `SELECT id, slot_number as number, type, status, hourly_rate
       FROM parking_slots WHERE property_id = $1`,
      [id]
    );

    res.json({
      id: property.id.toString(),
      name: property.name,
      address: property.address,
      description: property.description,
      slots: slotsResult.rows.map((s) => ({
        id: s.id.toString(),
        number: s.number,
        type: s.type === 'EV' ? 'EV Slot' : s.type,
        status: s.status,
        hourlyRate: parseFloat(s.hourly_rate),
      })),
      createdAt: property.created_at,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyName, address, description, parkingSlots } = req.body;

    if (!propertyName || !address) {
      res.status(400).json({ error: 'Property name and address are required' });
      return;
    }

    // Create property
    const propertyResult = await query(
      `INSERT INTO properties (name, address, description)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [propertyName, address, description || null]
    );

    const propertyId = propertyResult.rows[0].id;

    // Create parking slots
    if (parkingSlots && Array.isArray(parkingSlots)) {
      let slotCounter: { [key: string]: number } = { 'Normal': 0, 'EV': 0, 'Car Washing': 0 };
      
      for (const slot of parkingSlots) {
        const slotType = slot.type;
        const count = slot.count || 1;
        
        for (let i = 0; i < count; i++) {
          slotCounter[slotType]++;
          const prefix = slotType === 'Normal' ? 'A' : slotType === 'EV' ? 'E' : 'W';
          const slotNumber = `${prefix}-${String(slotCounter[slotType]).padStart(2, '0')}`;
          const hourlyRate = slotType === 'EV' ? 8.00 : slotType === 'Car Washing' ? 15.00 : 5.00;
          
          await query(
            `INSERT INTO parking_slots (property_id, slot_number, type, hourly_rate)
             VALUES ($1, $2, $3, $4)`,
            [propertyId, slotNumber, slotType, hourlyRate]
          );
        }
      }
    }

    res.status(201).json({ 
      id: propertyId.toString(),
      message: 'Property created successfully' 
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;

    const result = await query(
      `UPDATE properties 
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           description = COALESCE($3, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, address, description, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM properties WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

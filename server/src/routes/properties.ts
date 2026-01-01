import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { SlotType } from '@prisma/client';

const router = Router();

// Get all properties with slot counts
router.get('/', async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        slots: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = properties.map(property => {
      const normalSlots = property.slots.filter(s => s.type === SlotType.Normal).length;
      const evSlots = property.slots.filter(s => s.type === SlotType.EV).length;
      const carWashSlots = property.slots.filter(s => s.type === SlotType.CarWashing).length;
      const availableSlots = property.slots.filter(s => s.status === 'available').length;

      return {
        id: property.id,
        name: property.name,
        address: property.address,
        description: property.description,
        createdAt: property.createdAt,
        totalSlots: property.slots.length,
        normalSlots,
        evSlots,
        carWashSlots,
        availableSlots,
        slots: property.slots.map(s => ({
          id: s.id,
          number: s.slotNumber,
          type: s.type === SlotType.CarWashing ? 'Car Washing' : s.type,
          status: s.status,
          hourlyRate: s.hourlyRate
        }))
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property with slots
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: { slots: true }
    });

    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({
      ...property,
      slots: property.slots.map(s => ({
        id: s.id,
        number: s.slotNumber,
        type: s.type === SlotType.CarWashing ? 'Car Washing' : s.type,
        status: s.status,
        hourlyRate: s.hourlyRate
      }))
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property with slots
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyName, address, description, parkingSlots } = req.body;

    if (!propertyName || !address) {
      res.status(400).json({ error: 'Property name and address are required' });
      return;
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        name: propertyName,
        address,
        description: description || null
      }
    });

    // Create parking slots
    if (parkingSlots && Array.isArray(parkingSlots)) {
      const slotCounter: { [key: string]: number } = { 'Normal': 0, 'EV': 0, 'Car Washing': 0 };
      
      for (const slot of parkingSlots) {
        const slotType = slot.type;
        const count = slot.count || 1;
        
        for (let i = 0; i < count; i++) {
          slotCounter[slotType]++;
          const prefix = slotType === 'Normal' ? 'A' : slotType === 'EV' ? 'E' : 'W';
          const slotNumber = `${prefix}-${String(slotCounter[slotType]).padStart(2, '0')}`;
          const hourlyRate = slotType === 'EV' ? 8.00 : slotType === 'Car Washing' ? 15.00 : 5.00;
          
          // Map slot type to enum
          const prismaType: SlotType = slotType === 'Car Washing' ? SlotType.CarWashing : slotType as SlotType;
          
          await prisma.parkingSlot.create({
            data: {
              propertyId: property.id,
              slotNumber,
              type: prismaType,
              status: 'available',
              hourlyRate
            }
          });
        }
      }
    }

    res.status(201).json({ 
      id: property.id.toString(),
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
    
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(description !== undefined && { description })
      }
    });

    res.json({ message: 'Property updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property (cascade deletes slots)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.property.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { SlotType } from '@prisma/client';

const router = Router();

// Get all slots with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, type, status } = req.query;

    const slots = await prisma.parkingSlot.findMany({
      where: {
        ...(propertyId && { propertyId: parseInt(propertyId as string) }),
        ...(type && { type: type as any }),
        ...(status && { status: status as any })
      },
      include: { property: true },
      orderBy: [{ propertyId: 'asc' }, { slotNumber: 'asc' }]
    });

    const result = slots.map(slot => ({
      id: slot.id,
      propertyId: slot.propertyId,
      propertyName: slot.property.name,
      slotNumber: slot.slotNumber,
      type: slot.type === SlotType.CarWashing ? 'Car Washing' : slot.type,
      status: slot.status,
      hourlyRate: slot.hourlyRate
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single slot
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const slot = await prisma.parkingSlot.findUnique({
      where: { id: parseInt(id) },
      include: { property: true }
    });

    if (!slot) {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }

    res.json({
      id: slot.id,
      propertyId: slot.propertyId,
      propertyName: slot.property.name,
      slotNumber: slot.slotNumber,
      type: slot.type === SlotType.CarWashing ? 'Car Washing' : slot.type,
      status: slot.status,
      hourlyRate: slot.hourlyRate
    });
  } catch (error) {
    console.error('Error fetching slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update slot status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await prisma.parkingSlot.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ message: 'Slot updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new slot
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, slotNumber, type, hourlyRate } = req.body;

    const slot = await prisma.parkingSlot.create({
      data: {
        propertyId,
        slotNumber,
        type: type === 'Car Washing' ? SlotType.CarWashing : type,
        status: 'available',
        hourlyRate: hourlyRate || 5.00
      }
    });

    res.status(201).json({
      id: slot.id,
      message: 'Slot created successfully'
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete slot
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.parkingSlot.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Slot deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Slot not found' });
      return;
    }
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

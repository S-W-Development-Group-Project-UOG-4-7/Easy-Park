import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';

const router = Router();

// Get all customers with booking stats
router.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          select: { paymentAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      totalBookings: customer.bookings.length,
      totalSpent: customer.bookings.reduce((sum, b) => sum + Number(b.paymentAmount), 0)
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer with booking history
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: {
          include: {
            property: true,
            slot: true
          },
          orderBy: { bookingDate: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      recentBookings: customer.bookings.map(b => ({
        id: b.id,
        propertyName: b.property.name,
        slotNumber: b.slot.slotNumber,
        bookingDate: b.bookingDate,
        startTime: b.startTime,
        paymentAmount: b.paymentAmount,
        bookingStatus: b.bookingStatus
      }))
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

    const customer = await prisma.customer.create({
      data: { name, email, phone, address }
    });

    res.status(201).json({
      id: customer.id.toString(),
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    
    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address })
      }
    });

    res.json({ message: 'Customer updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

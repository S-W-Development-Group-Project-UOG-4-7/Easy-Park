import prisma from './prisma.js';
import { SlotType } from '@prisma/client';

async function seed() {
  console.log('Seeding database with sample data...');

  try {
    // Create sample properties
    const property1 = await prisma.property.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Downtown Parking',
        address: '123 Main St, City Center',
        description: 'Premium downtown parking facility',
      },
    });

    const property2 = await prisma.property.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Mall Parking',
        address: '456 Oak Ave, Shopping District',
        description: 'Convenient mall parking with covered areas',
      },
    });

    const property3 = await prisma.property.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Airport Parking',
        address: '789 Airport Rd, Terminal 1',
        description: '24/7 secure airport parking',
      },
    });

    console.log('✓ Created sample properties');

    // Create parking slots for each property
    const slotConfigs = [
      { prefix: 'A', type: SlotType.Normal, rate: 5.00 },
      { prefix: 'A', type: SlotType.Normal, rate: 5.00 },
      { prefix: 'A', type: SlotType.Normal, rate: 5.00 },
      { prefix: 'A', type: SlotType.Normal, rate: 5.00 },
      { prefix: 'A', type: SlotType.Normal, rate: 5.00 },
      { prefix: 'E', type: SlotType.EV, rate: 8.00 },
      { prefix: 'E', type: SlotType.EV, rate: 8.00 },
      { prefix: 'W', type: SlotType.CarWashing, rate: 15.00 },
      { prefix: 'W', type: SlotType.CarWashing, rate: 15.00 },
      { prefix: 'W', type: SlotType.CarWashing, rate: 15.00 },
    ];

    const properties = [property1, property2, property3];
    const allSlots = [];

    for (const prop of properties) {
      for (let i = 0; i < slotConfigs.length; i++) {
        const config = slotConfigs[i];
        const slot = await prisma.parkingSlot.create({
          data: {
            propertyId: prop.id,
            slotNumber: `${config.prefix}-${String(i + 1).padStart(2, '0')}`,
            type: config.type,
            status: 'available',
            hourlyRate: config.rate,
          },
        });
        allSlots.push(slot);
      }
    }
    console.log('✓ Created parking slots');

    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: { name: 'John Doe', email: 'john@example.com', phone: '555-0101', address: '123 Main St' },
      }),
      prisma.customer.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', address: '456 Oak Ave' },
      }),
      prisma.customer.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0103', address: '789 Pine Rd' },
      }),
      prisma.customer.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: { name: 'Alice Brown', email: 'alice@example.com', phone: '555-0104', address: '321 Elm St' },
      }),
      prisma.customer.upsert({
        where: { email: 'charlie@example.com' },
        update: {},
        create: { name: 'Charlie Wilson', email: 'charlie@example.com', phone: '555-0105', address: '654 Maple Dr' },
      }),
    ]);
    console.log('✓ Created sample customers');

    // Create sample bookings
    const paymentMethods = ['Credit Card', 'Cash', 'Digital Wallet'];
    const bookingStatuses = ['confirmed', 'checked_in', 'completed', 'completed', 'completed'] as const;
    const paymentStatuses = ['paid', 'paid', 'paid', 'paid', 'pending'] as const;

    const today = new Date();
    for (let i = 0; i < 20; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const customer = customers[i % customers.length];
      const slot = allSlots[i % allSlots.length];
      const hours = Math.floor(Math.random() * 5) + 1;
      const amount = hours * Number(slot.hourlyRate);
      const startHour = 8 + Math.floor(Math.random() * 10); // 8am to 6pm

      await prisma.booking.create({
        data: {
          customerId: customer.id,
          propertyId: slot.propertyId,
          slotId: slot.id,
          bookingDate: bookingDate,
          startTime: new Date(`1970-01-01T${String(startHour).padStart(2, '0')}:00:00`),
          endTime: new Date(`1970-01-01T${String(startHour + hours).padStart(2, '0')}:00:00`),
          hoursSelected: hours,
          paymentAmount: amount,
          paymentMethod: paymentMethods[i % paymentMethods.length],
          paymentStatus: paymentStatuses[i % paymentStatuses.length],
          bookingStatus: bookingStatuses[i % bookingStatuses.length],
          extras: i % 3 === 0 ? 'Car wash requested' : null,
        },
      });
    }
    console.log('✓ Created sample bookings');

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

// ...existing code...


async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  });

  // Create vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      userId: user1.id,
      licensePlate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      color: 'Blue',
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      userId: user2.id,
      licensePlate: 'XYZ789',
      make: 'Honda',
      model: 'Civic',
      color: 'Red',
    },
  });

  // Create parking lots
  const lot1 = await prisma.parkingLot.create({
    data: {
      name: 'Main Lot',
      location: 'Downtown',
      capacity: 100,
    },
  });

  const lot2 = await prisma.parkingLot.create({
    data: {
      name: 'North Lot',
      location: 'North Side',
      capacity: 50,
    },
  });

  // Create parking spots
  const spots = [];
  for (let i = 1; i <= 20; i++) {
    spots.push({
      lotId: lot1.id,
      spotNumber: `A${i}`,
      status: 'AVAILABLE' as const,
    });
  }
  await prisma.parkingSpot.createMany({ data: spots });

  for (let i = 1; i <= 10; i++) {
    spots.push({
      lotId: lot2.id,
      spotNumber: `B${i}`,
      status: 'AVAILABLE' as const,
    });
  }
  await prisma.parkingSpot.createMany({ data: spots.slice(20) });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@easypark.com' },
    update: {},
    create: {
      email: 'test@easypark.com',
      password: hashedPassword,
      fullName: 'Test User',
      contactNo: '0771234567',
      vehicleNumber: 'ABC-1234',
      nic: '200012345678',
    },
  });
  console.log('✅ Created test user:', user.email);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@easypark.com' },
    update: {},
    create: {
      email: 'admin@easypark.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create parking locations
  const location1 = await prisma.parkingLocation.upsert({
    where: { id: 'loc-main' },
    update: {},
    create: {
      id: 'loc-main',
      name: 'Main Parking Complex',
      address: '123 Main Street, Colombo',
      description: 'Main parking area with EV charging stations',
      totalSlots: 50,
    },
  });

  const location2 = await prisma.parkingLocation.upsert({
    where: { id: 'loc-downtown' },
    update: {},
    create: {
      id: 'loc-downtown',
      name: 'Downtown Parking',
      address: '456 Downtown Road, Colombo',
      description: 'Convenient downtown parking with car wash service',
      totalSlots: 30,
    },
  });
  console.log('✅ Created parking locations');

  // Create parking slots for location 1
  const slotTypes = ['NORMAL', 'NORMAL', 'NORMAL', 'EV', 'CAR_WASH'] as const;
  
  for (let i = 1; i <= 20; i++) {
    await prisma.parkingSlot.upsert({
      where: {
        locationId_number: {
          locationId: location1.id,
          number: `A${i.toString().padStart(2, '0')}`,
        },
      },
      update: {},
      create: {
        number: `A${i.toString().padStart(2, '0')}`,
        type: slotTypes[i % 5],
        pricePerHour: slotTypes[i % 5] === 'EV' ? 400 : slotTypes[i % 5] === 'CAR_WASH' ? 500 : 300,
        locationId: location1.id,
      },
    });
  }

  // Create parking slots for location 2
  for (let i = 1; i <= 15; i++) {
    await prisma.parkingSlot.upsert({
      where: {
        locationId_number: {
          locationId: location2.id,
          number: `B${i.toString().padStart(2, '0')}`,
        },
      },
      update: {},
      create: {
        number: `B${i.toString().padStart(2, '0')}`,
        type: slotTypes[i % 5],
        pricePerHour: slotTypes[i % 5] === 'EV' ? 400 : slotTypes[i % 5] === 'CAR_WASH' ? 500 : 300,
        locationId: location2.id,
      },
    });
  }
  console.log('✅ Created parking slots');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

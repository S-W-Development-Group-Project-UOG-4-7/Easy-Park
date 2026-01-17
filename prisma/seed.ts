import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in correct order due to foreign keys)
  await prisma.payment.deleteMany();
  await prisma.bookingSlot.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.parkingLocation.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users with different roles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@easypark.com',
      password: hashedPassword,
      fullName: 'Admin User',
      contactNo: '+94 77 000 0000',
      role: 'ADMIN',
    },
  });

  const landOwner1 = await prisma.user.create({
    data: {
      email: 'landowner1@easypark.com',
      password: hashedPassword,
      fullName: 'Kamal Perera',
      contactNo: '+94 77 111 1111',
      nic: '199012345678',
      role: 'LAND_OWNER',
    },
  });

  const landOwner2 = await prisma.user.create({
    data: {
      email: 'landowner2@easypark.com',
      password: hashedPassword,
      fullName: 'Nimal Fernando',
      contactNo: '+94 77 222 2222',
      nic: '198512345678',
      role: 'LAND_OWNER',
    },
  });

  const counter = await prisma.user.create({
    data: {
      email: 'counter@easypark.com',
      password: hashedPassword,
      fullName: 'Counter Staff',
      contactNo: '+94 77 333 3333',
      role: 'COUNTER',
    },
  });

  const washer = await prisma.user.create({
    data: {
      email: 'washer@easypark.com',
      password: hashedPassword,
      fullName: 'Sunil Washer',
      contactNo: '+94 77 444 4444',
      role: 'WASHER',
    },
  });

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@gmail.com',
        password: hashedPassword,
        fullName: 'Alice Johnson',
        contactNo: '+94 77 123 4567',
        vehicleNumber: 'CAA-1234',
        nic: '199512345678',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@gmail.com',
        password: hashedPassword,
        fullName: 'Bob Smith',
        contactNo: '+94 77 234 5678',
        vehicleNumber: 'CBB-5678',
        nic: '199212345678',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@gmail.com',
        password: hashedPassword,
        fullName: 'Carol White',
        contactNo: '+94 77 345 6789',
        vehicleNumber: 'CCC-9012',
        nic: '199812345678',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@gmail.com',
        password: hashedPassword,
        fullName: 'David Brown',
        contactNo: '+94 77 456 7890',
        vehicleNumber: 'CDD-3456',
        nic: '199112345678',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'eva@gmail.com',
        password: hashedPassword,
        fullName: 'Eva Green',
        contactNo: '+94 77 567 8901',
        vehicleNumber: 'CEE-7890',
        nic: '200012345678',
        role: 'CUSTOMER',
      },
    }),
  ]);

  console.log(`👤 Created ${customers.length + 5} users`);

  // Create parking locations
  const location1 = await prisma.parkingLocation.create({
    data: {
      name: 'Colombo City Center Parking',
      address: 'No. 25, Galle Road, Colombo 03',
      description: 'Premium parking facility in the heart of Colombo with 24/7 security',
      totalSlots: 50,
      ownerId: landOwner1.id,
    },
  });

  const location2 = await prisma.parkingLocation.create({
    data: {
      name: 'Malabe Tech Park',
      address: 'SLIIT Campus Road, Malabe',
      description: 'Modern parking with EV charging stations',
      totalSlots: 30,
      ownerId: landOwner1.id,
    },
  });

  const location3 = await prisma.parkingLocation.create({
    data: {
      name: 'Kandy Central Parking',
      address: 'No. 10, Dalada Veediya, Kandy',
      description: 'Convenient parking near Temple of the Tooth',
      totalSlots: 40,
      ownerId: landOwner2.id,
    },
  });

  console.log('🏢 Created 3 parking locations');

  // Create parking slots for Location 1 (Colombo)
  const colomboSlots = [];
  for (let zone of ['A', 'B', 'C']) {
    for (let i = 1; i <= 10; i++) {
      const slotType = zone === 'C' && i <= 3 ? 'EV' : (zone === 'C' && i > 7 ? 'CAR_WASH' : 'NORMAL');
      colomboSlots.push(
        prisma.parkingSlot.create({
          data: {
            number: `${zone}${i.toString().padStart(2, '0')}`,
            zone: zone,
            type: slotType,
            status: 'AVAILABLE',
            pricePerHour: slotType === 'EV' ? 500 : (slotType === 'CAR_WASH' ? 400 : 300),
            locationId: location1.id,
          },
        })
      );
    }
  }
  const createdColomboSlots = await Promise.all(colomboSlots);

  // Create parking slots for Location 2 (Malabe)
  const malabeSlots = [];
  for (let zone of ['A', 'B']) {
    for (let i = 1; i <= 15; i++) {
      const slotType = i <= 5 ? 'EV' : 'NORMAL';
      malabeSlots.push(
        prisma.parkingSlot.create({
          data: {
            number: `${zone}${i.toString().padStart(2, '0')}`,
            zone: zone,
            type: slotType,
            status: 'AVAILABLE',
            pricePerHour: slotType === 'EV' ? 450 : 250,
            locationId: location2.id,
          },
        })
      );
    }
  }
  const createdMalabeSlots = await Promise.all(malabeSlots);

  // Create parking slots for Location 3 (Kandy)
  const kandySlots = [];
  for (let zone of ['A', 'B', 'C', 'D']) {
    for (let i = 1; i <= 10; i++) {
      kandySlots.push(
        prisma.parkingSlot.create({
          data: {
            number: `${zone}${i.toString().padStart(2, '0')}`,
            zone: zone,
            type: 'NORMAL',
            status: 'AVAILABLE',
            pricePerHour: 200,
            locationId: location3.id,
          },
        })
      );
    }
  }
  const createdKandySlots = await Promise.all(kandySlots);

  console.log(`🅿️ Created ${createdColomboSlots.length + createdMalabeSlots.length + createdKandySlots.length} parking slots`);

  // Create some bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Booking 1 - Completed
  const booking1 = await prisma.booking.create({
    data: {
      userId: customers[0].id,
      date: today,
      startTime: new Date(today.setHours(9, 0, 0, 0)),
      endTime: new Date(today.setHours(12, 0, 0, 0)),
      duration: 3,
      totalAmount: 900,
      paidAmount: 900,
      status: 'COMPLETED',
      slots: {
        create: {
          slotId: createdColomboSlots[0].id,
        },
      },
    },
  });

  // Booking 2 - Confirmed
  const booking2 = await prisma.booking.create({
    data: {
      userId: customers[1].id,
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      duration: 4,
      totalAmount: 1200,
      paidAmount: 0,
      status: 'CONFIRMED',
      slots: {
        create: {
          slotId: createdColomboSlots[5].id,
        },
      },
    },
  });

  // Booking 3 - Pending (EV slot)
  const booking3 = await prisma.booking.create({
    data: {
      userId: customers[2].id,
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      duration: 2,
      totalAmount: 1000,
      paidAmount: 0,
      status: 'PENDING',
      slots: {
        create: {
          slotId: createdColomboSlots[20].id, // Zone C EV slot
        },
      },
    },
  });

  // Booking 4 - Paid
  const booking4 = await prisma.booking.create({
    data: {
      userId: customers[3].id,
      date: today,
      startTime: new Date(today.setHours(14, 0, 0, 0)),
      endTime: new Date(today.setHours(18, 0, 0, 0)),
      duration: 4,
      totalAmount: 1000,
      paidAmount: 1000,
      status: 'PAID',
      slots: {
        create: {
          slotId: createdMalabeSlots[0].id,
        },
      },
    },
  });

  // Booking 5 - Multiple slots booking
  const booking5 = await prisma.booking.create({
    data: {
      userId: customers[4].id,
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
      duration: 8,
      totalAmount: 3200,
      paidAmount: 1600,
      status: 'CONFIRMED',
      slots: {
        create: [
          { slotId: createdKandySlots[0].id },
          { slotId: createdKandySlots[1].id },
        ],
      },
    },
  });

  console.log('📅 Created 5 bookings');

  // Create payments
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 900,
      method: 'CARD',
      status: 'COMPLETED',
      transactionId: 'TXN-001-COMPLETED',
      paidAt: today,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking4.id,
      amount: 1000,
      method: 'ONLINE',
      status: 'COMPLETED',
      transactionId: 'TXN-004-COMPLETED',
      paidAt: today,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking5.id,
      amount: 1600,
      method: 'CASH',
      status: 'PENDING',
    },
  });

  console.log('💳 Created 3 payments');

  // Mark some slots as occupied
  await prisma.parkingSlot.update({
    where: { id: createdColomboSlots[0].id },
    data: { status: 'OCCUPIED' },
  });

  await prisma.parkingSlot.update({
    where: { id: createdMalabeSlots[0].id },
    data: { status: 'OCCUPIED' },
  });

  await prisma.parkingSlot.update({
    where: { id: createdColomboSlots[15].id },
    data: { status: 'MAINTENANCE' },
  });

  console.log('✅ Updated slot statuses');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   - 1 Admin (admin@easypark.com)');
  console.log('   - 2 Land Owners (landowner1@easypark.com, landowner2@easypark.com)');
  console.log('   - 1 Counter Staff (counter@easypark.com)');
  console.log('   - 1 Washer (washer@easypark.com)');
  console.log('   - 5 Customers (alice@gmail.com, bob@gmail.com, etc.)');
  console.log('   - 3 Parking Locations');
  console.log('   - 100 Parking Slots');
  console.log('   - 5 Bookings');
  console.log('   - 3 Payments');
  console.log('');
  console.log('🔑 All users have password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

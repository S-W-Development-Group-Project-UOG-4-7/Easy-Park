import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWasherData() {
  console.log('🚗 Seeding Washer Dashboard Data...\n');

  // Clear existing washer data
  console.log('🗑️  Clearing existing washer data...');
  await prisma.washerNotification.deleteMany({});
  await prisma.washerBooking.deleteMany({});
  await prisma.washerCustomer.deleteMany({});
  console.log('✅ Cleared existing data\n');

  // ==========================================
  // 20 WASHER CUSTOMERS
  // ==========================================
  console.log('👥 Creating 20 washer customers...');

  const customers = await Promise.all([
    prisma.washerCustomer.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        phone: '+94 77 123 4567',
        vehicleDetails: 'Toyota Corolla 2020 - White (CAA-1234)',
        otherRelevantInfo: 'Regular customer, prefers morning slots',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@yahoo.com',
        phone: '+94 77 234 5678',
        vehicleDetails: 'Honda CR-V 2022 - Black (CBB-5678)',
        otherRelevantInfo: 'Prefers eco-friendly cleaning products',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Robert Johnson',
        email: 'robert.j@outlook.com',
        phone: '+94 77 345 6789',
        vehicleDetails: 'Suzuki Swift 2019 - Red (CCC-9012)',
        otherRelevantInfo: null,
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Sarah Williams',
        email: 'sarah.w@hotmail.com',
        phone: '+94 77 456 7890',
        vehicleDetails: 'Ford Ranger 2021 - Blue (CAD-3456)',
        otherRelevantInfo: 'Truck requires heavy-duty cleaning',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Michael Brown',
        email: 'michael.brown@gmail.com',
        phone: '+94 77 567 8901',
        vehicleDetails: 'Toyota HiAce 2020 - Silver (CBE-7890)',
        otherRelevantInfo: 'Van - Commercial vehicle',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Emily Davis',
        email: 'emily.davis@gmail.com',
        phone: '+94 76 111 2222',
        vehicleDetails: 'BMW X5 2023 - Midnight Blue (CAF-1111)',
        otherRelevantInfo: 'Premium customer - VIP treatment',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'David Wilson',
        email: 'david.wilson@company.lk',
        phone: '+94 76 222 3333',
        vehicleDetails: 'Mercedes-Benz C200 2022 - Pearl White (CBG-2222)',
        otherRelevantInfo: 'Corporate account',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Amanda Taylor',
        email: 'amanda.t@icloud.com',
        phone: '+94 76 333 4444',
        vehicleDetails: 'Hyundai Tucson 2021 - Gray (CCH-3333)',
        otherRelevantInfo: null,
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'James Anderson',
        email: 'james.anderson@email.com',
        phone: '+94 76 444 5555',
        vehicleDetails: 'Nissan X-Trail 2020 - Green (CAI-4444)',
        otherRelevantInfo: 'Weekend only availability',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Jennifer Martinez',
        email: 'jennifer.m@yahoo.com',
        phone: '+94 76 555 6666',
        vehicleDetails: 'Kia Sportage 2022 - Orange (CBJ-5555)',
        otherRelevantInfo: 'Allergic to strong chemicals',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Christopher Lee',
        email: 'chris.lee@techcorp.com',
        phone: '+94 75 111 7777',
        vehicleDetails: 'Tesla Model 3 2023 - Red (CCK-6666)',
        otherRelevantInfo: 'Electric vehicle - no water on charging port',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Jessica Garcia',
        email: 'jessica.garcia@gmail.com',
        phone: '+94 75 222 8888',
        vehicleDetails: 'Mazda CX-5 2021 - Brown (CAL-7777)',
        otherRelevantInfo: null,
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Daniel Thomas',
        email: 'daniel.thomas@outlook.com',
        phone: '+94 75 333 9999',
        vehicleDetails: 'Mitsubishi Pajero 2019 - Black (CBM-8888)',
        otherRelevantInfo: 'Off-road vehicle - mud cleaning often needed',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Michelle Robinson',
        email: 'michelle.r@company.lk',
        phone: '+94 75 444 0000',
        vehicleDetails: 'Audi Q7 2022 - White (CCN-9999)',
        otherRelevantInfo: 'Premium customer',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Kevin Clark',
        email: 'kevin.clark@hotmail.com',
        phone: '+94 74 111 1234',
        vehicleDetails: 'Honda Civic 2020 - Yellow (CAO-0001)',
        otherRelevantInfo: 'Student discount applicable',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Stephanie White',
        email: 'stephanie.white@email.com',
        phone: '+94 74 222 2345',
        vehicleDetails: 'Toyota RAV4 2021 - Purple (CBP-0002)',
        otherRelevantInfo: null,
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Brian Harris',
        email: 'brian.harris@gmail.com',
        phone: '+94 74 333 3456',
        vehicleDetails: 'Jeep Wrangler 2020 - Army Green (CCQ-0003)',
        otherRelevantInfo: 'Adventure vehicle - extra dirty sometimes',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Lisa Thompson',
        email: 'lisa.thompson@yahoo.com',
        phone: '+94 74 444 4567',
        vehicleDetails: 'Volkswagen Golf 2022 - Cyan (CAR-0004)',
        otherRelevantInfo: 'Prefers afternoon appointments',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Mark Jackson',
        email: 'mark.jackson@business.lk',
        phone: '+94 74 555 5678',
        vehicleDetails: 'Land Rover Discovery 2021 - Burgundy (CBS-0005)',
        otherRelevantInfo: 'Corporate fleet vehicle',
      },
    }),
    prisma.washerCustomer.create({
      data: {
        name: 'Patricia Lewis',
        email: 'patricia.lewis@gmail.com',
        phone: '+94 74 666 6789',
        vehicleDetails: 'Subaru Forester 2020 - Forest Green (CCT-0006)',
        otherRelevantInfo: 'Monthly subscription customer',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} washer customers\n`);

  // ==========================================
  // 20 WASHER BOOKINGS
  // ==========================================
  console.log('📅 Creating 20 washer bookings...');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Helper function to create date/time
  const createSlotTime = (dayOffset: number, hour: number, minute: number = 0) => {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const serviceTypes = [
    'Basic Wash',
    'Full Wash',
    'Premium Detailing',
    'Interior Cleaning',
    'Exterior Polish',
    'Full Service Package',
    'Quick Wash',
    'Deep Clean',
    'Wax & Shine',
    'Engine Bay Cleaning',
  ];

  const bookings = await Promise.all([
    // TODAY'S BOOKINGS (Morning)
    prisma.washerBooking.create({
      data: {
        customerId: customers[0].id,
        slotTime: createSlotTime(0, 8, 0),
        vehicle: 'CAA-1234',
        serviceType: 'Full Wash',
        status: 'COMPLETED',
        notes: 'Toyota Corolla - White',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[1].id,
        slotTime: createSlotTime(0, 9, 0),
        vehicle: 'CBB-5678',
        serviceType: 'Premium Detailing',
        status: 'COMPLETED',
        notes: 'Honda CR-V - Black - Used eco products',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[2].id,
        slotTime: createSlotTime(0, 10, 30),
        vehicle: 'CCC-9012',
        serviceType: 'Basic Wash',
        status: 'ACCEPTED',
        notes: 'Suzuki Swift - Red',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[3].id,
        slotTime: createSlotTime(0, 11, 0),
        vehicle: 'CAD-3456',
        serviceType: 'Full Service Package',
        status: 'ACCEPTED',
        notes: 'Ford Ranger - Truck - Heavy duty clean',
      },
    }),

    // TODAY'S BOOKINGS (Afternoon)
    prisma.washerBooking.create({
      data: {
        customerId: customers[4].id,
        slotTime: createSlotTime(0, 13, 0),
        vehicle: 'CBE-7890',
        serviceType: 'Interior Cleaning',
        status: 'PENDING',
        notes: 'Toyota HiAce - Van',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[5].id,
        slotTime: createSlotTime(0, 14, 30),
        vehicle: 'CAF-1111',
        serviceType: 'Premium Detailing',
        status: 'PENDING',
        notes: 'BMW X5 - VIP Treatment',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[6].id,
        slotTime: createSlotTime(0, 15, 0),
        vehicle: 'CBG-2222',
        serviceType: 'Wax & Shine',
        status: 'PENDING',
        notes: 'Mercedes-Benz C200',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[7].id,
        slotTime: createSlotTime(0, 16, 30),
        vehicle: 'CCH-3333',
        serviceType: 'Basic Wash',
        status: 'PENDING',
        notes: 'Hyundai Tucson - Gray',
      },
    }),

    // TOMORROW'S BOOKINGS
    prisma.washerBooking.create({
      data: {
        customerId: customers[8].id,
        slotTime: createSlotTime(1, 9, 0),
        vehicle: 'CAI-4444',
        serviceType: 'Full Wash',
        status: 'PENDING',
        notes: 'Nissan X-Trail',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[9].id,
        slotTime: createSlotTime(1, 10, 0),
        vehicle: 'CBJ-5555',
        serviceType: 'Interior Cleaning',
        status: 'PENDING',
        notes: 'Kia Sportage - Use mild products',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[10].id,
        slotTime: createSlotTime(1, 11, 30),
        vehicle: 'CCK-6666',
        serviceType: 'Exterior Polish',
        status: 'PENDING',
        notes: 'Tesla Model 3 - EV - Careful with water',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[11].id,
        slotTime: createSlotTime(1, 14, 0),
        vehicle: 'CAL-7777',
        serviceType: 'Quick Wash',
        status: 'PENDING',
        notes: 'Mazda CX-5',
      },
    }),

    // DAY AFTER TOMORROW
    prisma.washerBooking.create({
      data: {
        customerId: customers[12].id,
        slotTime: createSlotTime(2, 8, 30),
        vehicle: 'CBM-8888',
        serviceType: 'Deep Clean',
        status: 'PENDING',
        notes: 'Mitsubishi Pajero - Off-road mud clean',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[13].id,
        slotTime: createSlotTime(2, 10, 0),
        vehicle: 'CCN-9999',
        serviceType: 'Premium Detailing',
        status: 'PENDING',
        notes: 'Audi Q7 - Premium customer',
      },
    }),

    // PAST BOOKINGS (Yesterday - all completed or cancelled)
    prisma.washerBooking.create({
      data: {
        customerId: customers[14].id,
        slotTime: createSlotTime(-1, 9, 0),
        vehicle: 'CAO-0001',
        serviceType: 'Basic Wash',
        status: 'COMPLETED',
        notes: 'Honda Civic - Student discount applied',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[15].id,
        slotTime: createSlotTime(-1, 11, 0),
        vehicle: 'CBP-0002',
        serviceType: 'Full Wash',
        status: 'COMPLETED',
        notes: 'Toyota RAV4',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[16].id,
        slotTime: createSlotTime(-1, 14, 0),
        vehicle: 'CCQ-0003',
        serviceType: 'Deep Clean',
        status: 'COMPLETED',
        notes: 'Jeep Wrangler - Extra dirty',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[17].id,
        slotTime: createSlotTime(-1, 15, 30),
        vehicle: 'CAR-0004',
        serviceType: 'Interior Cleaning',
        status: 'CANCELLED',
        notes: 'VW Golf - Customer cancelled - schedule conflict',
      },
    }),

    // OLDER BOOKINGS (2 days ago)
    prisma.washerBooking.create({
      data: {
        customerId: customers[18].id,
        slotTime: createSlotTime(-2, 10, 0),
        vehicle: 'CBS-0005',
        serviceType: 'Full Service Package',
        status: 'COMPLETED',
        notes: 'Land Rover Discovery - Corporate',
      },
    }),
    prisma.washerBooking.create({
      data: {
        customerId: customers[19].id,
        slotTime: createSlotTime(-2, 13, 0),
        vehicle: 'CCT-0006',
        serviceType: 'Wax & Shine',
        status: 'CANCELLED',
        notes: 'Subaru Forester - Rescheduled to next week',
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} washer bookings\n`);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  console.log('🔔 Creating notifications...');

  await Promise.all([
    prisma.washerNotification.create({
      data: {
        type: 'new_booking',
        message: `New booking from ${customers[4].name} for Interior Cleaning at 1:00 PM`,
        bookingId: bookings[4].id,
        read: false,
      },
    }),
    prisma.washerNotification.create({
      data: {
        type: 'new_booking',
        message: `New booking from ${customers[5].name} for Premium Detailing at 2:30 PM`,
        bookingId: bookings[5].id,
        read: false,
      },
    }),
    prisma.washerNotification.create({
      data: {
        type: 'upcoming_slot',
        message: `Upcoming: ${customers[2].name} - Basic Wash at 10:30 AM`,
        bookingId: bookings[2].id,
        read: false,
      },
    }),
    prisma.washerNotification.create({
      data: {
        type: 'urgent_reminder',
        message: 'You have 4 pending bookings for today!',
        read: true,
      },
    }),
    prisma.washerNotification.create({
      data: {
        type: 'new_booking',
        message: `New booking from ${customers[10].name} for Tesla Model 3`,
        bookingId: bookings[10].id,
        read: true,
      },
    }),
  ]);

  console.log('✅ Created notifications\n');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('📊 SEED SUMMARY:');
  console.log('─'.repeat(50));
  
  const customerCount = await prisma.washerCustomer.count();
  const bookingCount = await prisma.washerBooking.count();
  const notificationCount = await prisma.washerNotification.count();
  
  console.log(`   Washer Customers:     ${customerCount}`);
  console.log(`   Washer Bookings:      ${bookingCount}`);
  console.log(`   Notifications:        ${notificationCount}`);
  
  // Booking status breakdown
  const statusCounts = await prisma.washerBooking.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  
  console.log('\n📋 BOOKING STATUS BREAKDOWN:');
  console.log('─'.repeat(50));
  statusCounts.forEach(s => {
    console.log(`   ${s.status.padEnd(15)} ${s._count.status}`);
  });

  // Today's bookings
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const todayBookings = await prisma.washerBooking.count({
    where: {
      slotTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });
  
  console.log(`\n📅 TODAY'S BOOKINGS: ${todayBookings}`);
  console.log('─'.repeat(50));

  console.log('\n🎉 Washer data seeding completed successfully!');
}

seedWasherData()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

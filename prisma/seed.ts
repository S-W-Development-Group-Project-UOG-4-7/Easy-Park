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

  // Create admin users
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

  // Create land owner user
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const landOwner = await prisma.user.upsert({
    where: { email: 'owner@easypark.com' },
    update: {
      fullName: 'Land Owner',
      role: 'LAND_OWNER',
      contactNo: '0770000000',
    },
    create: {
      email: 'owner@easypark.com',
      password: ownerPassword,
      fullName: 'Land Owner',
      contactNo: '0770000000',
      role: 'LAND_OWNER',
    },
  });
  console.log('✅ Created land owner user:', landOwner.email);

  // Create parking locations with different statuses
  const location1 = await prisma.parkingLocation.upsert({
    where: { id: 'loc-main' },
    update: {
      ownerId: landOwner.id,
      pricePerHour: 300,
      pricePerDay: 2000,
      status: 'ACTIVATED',
    },
    create: {
      id: 'loc-main',
      name: 'Main Parking Complex',
      address: '123 Main Street, Colombo',
      description: 'Main parking area with EV charging stations',
      totalSlots: 0,
      pricePerHour: 300,
      pricePerDay: 2000,
      status: 'ACTIVATED',
      ownerId: landOwner.id,
    },
  });

  const location2 = await prisma.parkingLocation.upsert({
    where: { id: 'loc-downtown' },
    update: {
      ownerId: landOwner.id,
      pricePerHour: 350,
      pricePerDay: 2500,
      status: 'ACTIVATED',
    },
    create: {
      id: 'loc-downtown',
      name: 'Downtown Parking',
      address: '456 Downtown Road, Colombo',
      description: 'Convenient downtown parking with car wash service',
      totalSlots: 0,
      pricePerHour: 350,
      pricePerDay: 2500,
      status: 'ACTIVATED',
      ownerId: landOwner.id,
    },
  });

  // Create a NOT_ACTIVATED parking location for testing
  const location3 = await prisma.parkingLocation.upsert({
    where: { id: 'loc-new-area' },
    update: {
      ownerId: landOwner.id,
      pricePerHour: 250,
      pricePerDay: 1800,
      status: 'NOT_ACTIVATED',
    },
    create: {
      id: 'loc-new-area',
      name: 'New Parking Zone',
      address: '789 Under Construction Ave, Colombo',
      description: 'New parking area under preparation - not yet available for booking',
      totalSlots: 0,
      pricePerHour: 250,
      pricePerDay: 1800,
      status: 'NOT_ACTIVATED',
      ownerId: landOwner.id,
    },
  });

  console.log('✅ Created parking locations (with status: ACTIVATED/NOT_ACTIVATED)');

  // Create parking slots for land-owner testing
  // (zones A/B so the land-owner UI can group them)
  const slotTypes = ['NORMAL', 'NORMAL', 'EV', 'NORMAL', 'CAR_WASH'] as const;

  const createZoneSlots = async (locationId: string, zone: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      const slotType = slotTypes[i % slotTypes.length];
      await prisma.parkingSlot.upsert({
        where: {
          locationId_number: {
            locationId,
            number: `${zone}${i}`,
          },
        },
        update: {
          zone,
          type: slotType,
          pricePerHour: slotType === 'EV' ? 400 : slotType === 'CAR_WASH' ? 500 : 300,
          status: i % 7 === 0 ? 'MAINTENANCE' : i % 5 === 0 ? 'OCCUPIED' : 'AVAILABLE',
        },
        create: {
          number: `${zone}${i}`,
          zone,
          type: slotType,
          pricePerHour: slotType === 'EV' ? 400 : slotType === 'CAR_WASH' ? 500 : 300,
          status: i % 7 === 0 ? 'MAINTENANCE' : i % 5 === 0 ? 'OCCUPIED' : 'AVAILABLE',
          locationId,
        },
      });
    }
  };

  await createZoneSlots(location1.id, 'A', 8);
  await createZoneSlots(location1.id, 'B', 5);
  await createZoneSlots(location2.id, 'A', 6);
  await createZoneSlots(location3.id, 'A', 4); // Slots for not-activated location

  // Keep totalSlots in sync
  const loc1Count = await prisma.parkingSlot.count({ where: { locationId: location1.id } });
  const loc2Count = await prisma.parkingSlot.count({ where: { locationId: location2.id } });
  const loc3Count = await prisma.parkingSlot.count({ where: { locationId: location3.id } });
  await prisma.parkingLocation.update({ where: { id: location1.id }, data: { totalSlots: loc1Count } });
  await prisma.parkingLocation.update({ where: { id: location2.id }, data: { totalSlots: loc2Count } });
  await prisma.parkingLocation.update({ where: { id: location3.id }, data: { totalSlots: loc3Count } });

  console.log('✅ Created land-owner parking slots');

  // Create additional users for different roles
  const counterPassword = await bcrypt.hash('counter123', 12);
  const counter = await prisma.user.upsert({
    where: { email: 'counter@easypark.com' },
    update: {},
    create: {
      email: 'counter@easypark.com',
      password: counterPassword,
      fullName: 'Counter Staff',
      contactNo: '0772222222',
      role: 'COUNTER',
    },
  });
  console.log('✅ Created counter user:', counter.email);

  const washerPassword = await bcrypt.hash('washer123', 12);
  const washer = await prisma.user.upsert({
    where: { email: 'washer@easypark.com' },
    update: {},
    create: {
      email: 'washer@easypark.com',
      password: washerPassword,
      fullName: 'Car Washer',
      contactNo: '0773333333',
      role: 'WASHER',
    },
  });
  console.log('✅ Created washer user:', washer.email);

  // Create more customer users
  const customer2 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      fullName: 'John Smith',
      contactNo: '0774444444',
      vehicleNumber: 'CAB-5678',
      nic: '199912345678',
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'mary@example.com' },
    update: {},
    create: {
      email: 'mary@example.com',
      password: hashedPassword,
      fullName: 'Mary Johnson',
      contactNo: '0775555555',
      vehicleNumber: 'WP-KA-1234',
      nic: '198812345678',
    },
  });
  console.log('✅ Created additional customers');

  // Get available slots for bookings
  const availableSlots = await prisma.parkingSlot.findMany({
    where: { status: 'AVAILABLE' },
    take: 6,
  });

  // Create bookings with different statuses
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Booking 1: Completed booking for test user (yesterday)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const booking1 = await prisma.booking.upsert({
    where: { id: 'booking-1' },
    update: {},
    create: {
      id: 'booking-1',
      userId: user.id,
      date: yesterday,
      startTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000),  // 12 PM
      duration: 3,
      totalAmount: 900,
      paidAmount: 900,
      status: 'COMPLETED',
    },
  });

  // Link slots to booking 1
  if (availableSlots[0]) {
    await prisma.bookingSlot.upsert({
      where: { bookingId_slotId: { bookingId: booking1.id, slotId: availableSlots[0].id } },
      update: {},
      create: { bookingId: booking1.id, slotId: availableSlots[0].id },
    });
  }

  // Booking 2: Confirmed booking for today (test user)
  const booking2 = await prisma.booking.upsert({
    where: { id: 'booking-2' },
    update: {},
    create: {
      id: 'booking-2',
      userId: user.id,
      date: today,
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM
      endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),   // 5 PM
      duration: 3,
      totalAmount: 900,
      paidAmount: 0,
      status: 'CONFIRMED',
    },
  });

  if (availableSlots[1]) {
    await prisma.bookingSlot.upsert({
      where: { bookingId_slotId: { bookingId: booking2.id, slotId: availableSlots[1].id } },
      update: {},
      create: { bookingId: booking2.id, slotId: availableSlots[1].id },
    });
  }

  // Booking 3: Pending booking for john
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const booking3 = await prisma.booking.upsert({
    where: { id: 'booking-3' },
    update: {},
    create: {
      id: 'booking-3',
      userId: customer2.id,
      date: tomorrow,
      startTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      endTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000),   // 2 PM
      duration: 4,
      totalAmount: 1600,
      paidAmount: 0,
      status: 'PENDING',
    },
  });

  if (availableSlots[2]) {
    await prisma.bookingSlot.upsert({
      where: { bookingId_slotId: { bookingId: booking3.id, slotId: availableSlots[2].id } },
      update: {},
      create: { bookingId: booking3.id, slotId: availableSlots[2].id },
    });
  }

  // Booking 4: Paid booking for mary (today)
  const booking4 = await prisma.booking.upsert({
    where: { id: 'booking-4' },
    update: {},
    create: {
      id: 'booking-4',
      userId: customer3.id,
      date: today,
      startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000),  // 8 AM
      endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),   // 11 AM
      duration: 3,
      totalAmount: 1200,
      paidAmount: 1200,
      status: 'PAID',
    },
  });

  if (availableSlots[3]) {
    await prisma.bookingSlot.upsert({
      where: { bookingId_slotId: { bookingId: booking4.id, slotId: availableSlots[3].id } },
      update: {},
      create: { bookingId: booking4.id, slotId: availableSlots[3].id },
    });
  }

  // Booking 5: Cancelled booking
  const booking5 = await prisma.booking.upsert({
    where: { id: 'booking-5' },
    update: {},
    create: {
      id: 'booking-5',
      userId: customer2.id,
      date: yesterday,
      startTime: new Date(yesterday.getTime() + 15 * 60 * 60 * 1000),
      endTime: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000),
      duration: 2,
      totalAmount: 600,
      paidAmount: 0,
      status: 'CANCELLED',
    },
  });

  console.log('✅ Created bookings');

  // Create payments
  // Payment for completed booking 1
  await prisma.payment.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      bookingId: booking1.id,
      amount: 900,
      method: 'CARD',
      status: 'COMPLETED',
      transactionId: 'TXN-001-CARD',
      paidAt: yesterday,
    },
  });

  // Payment for paid booking 4
  await prisma.payment.upsert({
    where: { bookingId: booking4.id },
    update: {},
    create: {
      bookingId: booking4.id,
      amount: 1200,
      method: 'CASH',
      status: 'COMPLETED',
      transactionId: 'TXN-002-CASH',
      paidAt: today,
    },
  });

  // Pending payment for booking 2
  await prisma.payment.upsert({
    where: { bookingId: booking2.id },
    update: {},
    create: {
      bookingId: booking2.id,
      amount: 900,
      method: 'ONLINE',
      status: 'PENDING',
    },
  });

  // Failed payment attempt for booking 3
  await prisma.payment.upsert({
    where: { bookingId: booking3.id },
    update: {},
    create: {
      bookingId: booking3.id,
      amount: 1600,
      method: 'CARD',
      status: 'FAILED',
      transactionId: 'TXN-003-FAILED',
    },
  });

  console.log('✅ Created payments');

  // ==========================================
  // WASHER DASHBOARD SEED DATA
  // ==========================================

  // Create Washer Customers (using emails matching the UI)
  const washerCustomer1 = await prisma.washerCustomer.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+94 77 123 4567',
      vehicleDetails: 'AB-1234 - Sedan',
      otherRelevantInfo: 'Regular customer, prefers interior detailing',
    },
  });

  const washerCustomer2 = await prisma.washerCustomer.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+94 77 234 5678',
      vehicleDetails: 'CD-5678 - SUV',
      otherRelevantInfo: 'Prefers eco-friendly products',
    },
  });

  const washerCustomer3 = await prisma.washerCustomer.upsert({
    where: { email: 'robert@example.com' },
    update: {},
    create: {
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '+94 77 345 6789',
      vehicleDetails: 'EF-9012 - Hatchback',
    },
  });

  const washerCustomer4 = await prisma.washerCustomer.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      phone: '+94 77 456 7890',
      vehicleDetails: 'GH-3456 - Truck',
      otherRelevantInfo: 'Heavy duty cleaning needed',
    },
  });

  const washerCustomer5 = await prisma.washerCustomer.upsert({
    where: { email: 'michael@example.com' },
    update: {},
    create: {
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+94 77 567 8901',
      vehicleDetails: 'IJ-7890 - Van',
    },
  });

  console.log('✅ Created washer customers');

  // Create Washer Bookings matching the UI screenshot
  const washerNow = new Date();
  
  // Booking times for 2026-01-21
  const slot0900 = new Date(washerNow.getFullYear(), washerNow.getMonth(), washerNow.getDate(), 9, 0, 0);
  const slot1030 = new Date(washerNow.getFullYear(), washerNow.getMonth(), washerNow.getDate(), 10, 30, 0);
  const slot1200 = new Date(washerNow.getFullYear(), washerNow.getMonth(), washerNow.getDate(), 12, 0, 0);
  const slot1400 = new Date(washerNow.getFullYear(), washerNow.getMonth(), washerNow.getDate(), 14, 0, 0);
  const slot1530 = new Date(washerNow.getFullYear(), washerNow.getMonth(), washerNow.getDate(), 15, 30, 0);

  // John Doe - 09:00 AM - AB-1234 Sedan - PENDING
  await prisma.washerBooking.upsert({
    where: { id: 'wb-001' },
    update: {
      slotTime: slot0900,
      vehicle: 'AB-1234',
      serviceType: 'Full Car Wash',
      status: 'PENDING',
    },
    create: {
      id: 'wb-001',
      customerId: washerCustomer1.id,
      slotTime: slot0900,
      vehicle: 'AB-1234',
      serviceType: 'Full Car Wash',
      status: 'PENDING',
      notes: 'Sedan - Please clean the interior thoroughly',
    },
  });

  // Jane Smith - 10:30 AM - CD-5678 SUV - ACCEPTED
  await prisma.washerBooking.upsert({
    where: { id: 'wb-002' },
    update: {
      slotTime: slot1030,
      vehicle: 'CD-5678',
      serviceType: 'Premium Detailing',
      status: 'ACCEPTED',
    },
    create: {
      id: 'wb-002',
      customerId: washerCustomer2.id,
      slotTime: slot1030,
      vehicle: 'CD-5678',
      serviceType: 'Premium Detailing',
      status: 'ACCEPTED',
      notes: 'SUV - Use eco-friendly products',
    },
  });

  // Robert Johnson - 12:00 PM - EF-9012 Hatchback - COMPLETED
  await prisma.washerBooking.upsert({
    where: { id: 'wb-003' },
    update: {
      slotTime: slot1200,
      vehicle: 'EF-9012',
      serviceType: 'Quick Wash',
      status: 'COMPLETED',
    },
    create: {
      id: 'wb-003',
      customerId: washerCustomer3.id,
      slotTime: slot1200,
      vehicle: 'EF-9012',
      serviceType: 'Quick Wash',
      status: 'COMPLETED',
      notes: 'Hatchback',
    },
  });

  // Sarah Williams - 02:00 PM - GH-3456 Truck - PENDING
  await prisma.washerBooking.upsert({
    where: { id: 'wb-004' },
    update: {
      slotTime: slot1400,
      vehicle: 'GH-3456',
      serviceType: 'Truck Wash',
      status: 'PENDING',
    },
    create: {
      id: 'wb-004',
      customerId: washerCustomer4.id,
      slotTime: slot1400,
      vehicle: 'GH-3456',
      serviceType: 'Truck Wash',
      status: 'PENDING',
      notes: 'Truck - Heavy mud needs extra cleaning',
    },
  });

  // Michael Brown - 03:30 PM - IJ-7890 Van - PENDING
  await prisma.washerBooking.upsert({
    where: { id: 'wb-005' },
    update: {
      slotTime: slot1530,
      vehicle: 'IJ-7890',
      serviceType: 'Full Car Wash',
      status: 'PENDING',
    },
    create: {
      id: 'wb-005',
      customerId: washerCustomer5.id,
      slotTime: slot1530,
      vehicle: 'IJ-7890',
      serviceType: 'Full Car Wash',
      status: 'PENDING',
      notes: 'Van',
    },
  });

  console.log('✅ Created washer bookings');

  // Create Washer Notifications
  await prisma.washerNotification.upsert({
    where: { id: 'wn-001' },
    update: {},
    create: {
      id: 'wn-001',
      type: 'new_booking',
      message: 'New booking from John Doe for Full Car Wash at 9:00 AM',
      bookingId: 'wb-001',
      read: false,
    },
  });

  await prisma.washerNotification.upsert({
    where: { id: 'wn-002' },
    update: {},
    create: {
      id: 'wn-002',
      type: 'upcoming_slot',
      message: 'Upcoming slot in 30 minutes: Jane Smith - Premium Detailing',
      bookingId: 'wb-002',
      read: false,
    },
  });

  await prisma.washerNotification.upsert({
    where: { id: 'wn-003' },
    update: {},
    create: {
      id: 'wn-003',
      type: 'new_booking',
      message: 'New booking from Sarah Williams for Truck Wash at 2:30 PM',
      bookingId: 'wb-004',
      read: true,
    },
  });

  await prisma.washerNotification.upsert({
    where: { id: 'wn-004' },
    update: {},
    create: {
      id: 'wn-004',
      type: 'urgent_reminder',
      message: 'Reminder: You have 3 pending bookings for today!',
      read: true,
    },
  });

  console.log('✅ Created washer notifications');

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

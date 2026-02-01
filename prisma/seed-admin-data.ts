import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminData() {
  console.log('🌱 Seeding Admin Panel Data...\n');

  // Clear existing admin data
  await prisma.adminBooking.deleteMany();
  await prisma.adminParkingSlot.deleteMany();
  await prisma.adminProperty.deleteMany();
  await prisma.adminCustomer.deleteMany();

  // Create Admin Customers
  console.log('Creating Admin Customers...');
  const customers = await Promise.all([
    prisma.adminCustomer.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94771234567',
        registeredDate: new Date('2025-12-01'),
      },
    }),
    prisma.adminCustomer.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+94772345678',
        registeredDate: new Date('2025-12-15'),
      },
    }),
    prisma.adminCustomer.create({
      data: {
        name: 'Michael Johnson',
        email: 'michael.j@example.com',
        phone: '+94773456789',
        registeredDate: new Date('2026-01-05'),
      },
    }),
    prisma.adminCustomer.create({
      data: {
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        phone: '+94774567890',
        registeredDate: new Date('2026-01-10'),
      },
    }),
    prisma.adminCustomer.create({
      data: {
        name: 'David Brown',
        email: 'david.b@example.com',
        phone: '+94775678901',
        registeredDate: new Date('2026-01-15'),
      },
    }),
  ]);
  console.log(`✅ Created ${customers.length} customers\n`);

  // Create Admin Properties
  console.log('Creating Admin Properties...');
  const properties = await Promise.all([
    prisma.adminProperty.create({
      data: {
        propertyName: 'City Center Parking',
        location: 'Colombo 01, Main Street',
        description: 'Premium parking in the heart of Colombo city center',
        pricePerHour: 500,
        status: 'ACTIVATED',
        totalSlots: 50,
      },
    }),
    prisma.adminProperty.create({
      data: {
        propertyName: 'Mall Parking Complex',
        location: 'Colombo 03, Duplication Road',
        description: 'Large parking area near shopping mall',
        pricePerHour: 300,
        status: 'ACTIVATED',
        totalSlots: 100,
      },
    }),
    prisma.adminProperty.create({
      data: {
        propertyName: 'Airport Parking',
        location: 'Katunayake, Airport Road',
        description: 'Long-term and short-term parking near the airport',
        pricePerHour: 400,
        status: 'ACTIVATED',
        totalSlots: 200,
      },
    }),
    prisma.adminProperty.create({
      data: {
        propertyName: 'Beach Road Parking',
        location: 'Mount Lavinia, Beach Road',
        description: 'Convenient parking for beach visitors',
        pricePerHour: 250,
        status: 'DEACTIVATED',
        totalSlots: 30,
      },
    }),
  ]);
  console.log(`✅ Created ${properties.length} properties\n`);

  // Create Parking Slots for each property
  console.log('Creating Parking Slots...');
  let totalSlots = 0;

  for (const property of properties) {
    const slotCount = Math.min(property.totalSlots, 20); // Create up to 20 slots per property for demo
    const slots = [];

    for (let i = 1; i <= slotCount; i++) {
      const slotNumber = `${property.propertyName.charAt(0)}${i.toString().padStart(3, '0')}`;
      let status: 'AVAILABLE' | 'BOOKED' | 'DISABLED' = 'AVAILABLE';
      
      // Make some slots booked and some disabled for variety
      if (i % 5 === 0) status = 'DISABLED';
      else if (i % 3 === 0) status = 'BOOKED';

      slots.push(
        prisma.adminParkingSlot.create({
          data: {
            propertyId: property.id,
            slotNumber,
            status,
          },
        })
      );
    }

    await Promise.all(slots);
    totalSlots += slotCount;
  }
  console.log(`✅ Created ${totalSlots} parking slots\n`);

  // Get all slots for booking creation
  const allSlots = await prisma.adminParkingSlot.findMany({
    where: { status: 'BOOKED' },
    include: { property: true },
  });

  // Create Admin Bookings
  console.log('Creating Admin Bookings...');
  const bookings = [];
  const statuses: ('PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED')[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  for (let i = 0; i < Math.min(allSlots.length, 10); i++) {
    const slot = allSlots[i];
    const customer = customers[i % customers.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
    
    const startHour = 8 + Math.floor(Math.random() * 10); // Random hour between 8 AM and 6 PM
    const duration = 1 + Math.floor(Math.random() * 4); // 1-4 hours
    
    const startTime = new Date(startDate);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration);

    bookings.push(
      prisma.adminBooking.create({
        data: {
          propertyId: slot.propertyId,
          slotId: slot.id,
          customerId: customer.id,
          bookingDate: startDate,
          startTime,
          endTime,
          totalPrice: slot.property.pricePerHour * duration,
          status: statuses[i % statuses.length],
        },
      })
    );
  }

  const createdBookings = await Promise.all(bookings);
  console.log(`✅ Created ${createdBookings.length} bookings\n`);

  // Summary
  console.log('📊 Admin Data Summary:');
  console.log('========================');
  
  const totalRevenue = await prisma.adminBooking.aggregate({
    _sum: { totalPrice: true },
    where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
  });
  
  const totalBookingsCount = await prisma.adminBooking.count();
  const totalCustomersCount = await prisma.adminCustomer.count();
  const availableSlots = await prisma.adminParkingSlot.count({
    where: { status: 'AVAILABLE' },
  });
  const activeProperties = await prisma.adminProperty.count({
    where: { status: 'ACTIVATED' },
  });

  console.log(`💰 Total Revenue: Rs. ${totalRevenue._sum.totalPrice || 0}`);
  console.log(`📅 Total Bookings: ${totalBookingsCount}`);
  console.log(`👥 Total Customers: ${totalCustomersCount}`);
  console.log(`🅿️  Available Parking Slots: ${availableSlots}`);
  console.log(`🏢 Active Properties: ${activeProperties}`);
  console.log('\n✅ Admin data seeding completed!');
}

seedAdminData()
  .catch((e) => {
    console.error('Error seeding admin data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

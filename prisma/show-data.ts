import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showData() {
  console.log('\n📋 DATABASE CONTENTS\n');
  console.log('='.repeat(80));

  // Users
  console.log('\n👤 USERS TABLE');
  console.log('-'.repeat(80));
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      contactNo: true,
      vehicleNumber: true,
      role: true,
    },
  });
  console.table(users);

  // Parking Locations
  console.log('\n📍 PARKING LOCATIONS TABLE');
  console.log('-'.repeat(80));
  const locations = await prisma.parkingLocation.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      totalSlots: true,
    },
  });
  console.table(locations);

  // Parking Slots (first 10)
  console.log('\n🅿️ PARKING SLOTS TABLE (showing first 15)');
  console.log('-'.repeat(80));
  const slots = await prisma.parkingSlot.findMany({
    take: 15,
    select: {
      id: true,
      number: true,
      type: true,
      status: true,
      pricePerHour: true,
      location: {
        select: { name: true },
      },
    },
  });
  const slotsFormatted = slots.map((s) => ({
    id: s.id.substring(0, 12) + '...',
    number: s.number,
    type: s.type,
    status: s.status,
    pricePerHour: s.pricePerHour,
    location: s.location.name,
  }));
  console.table(slotsFormatted);

  // Bookings
  console.log('\n📅 BOOKINGS TABLE');
  console.log('-'.repeat(80));
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { email: true } },
      slots: { include: { slot: true } },
    },
  });
  if (bookings.length === 0) {
    console.log('No bookings yet.');
  } else {
    console.table(bookings);
  }

  // Payments
  console.log('\n💳 PAYMENTS TABLE');
  console.log('-'.repeat(80));
  const payments = await prisma.payment.findMany();
  if (payments.length === 0) {
    console.log('No payments yet.');
  } else {
    console.table(payments);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Total Users:', users.length);
  console.log('✅ Total Locations:', locations.length);
  console.log('✅ Total Slots:', await prisma.parkingSlot.count());
  console.log('✅ Total Bookings:', bookings.length);
  console.log('✅ Total Payments:', payments.length);
}

showData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

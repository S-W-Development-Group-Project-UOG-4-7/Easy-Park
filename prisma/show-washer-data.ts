import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showData() {
  console.log('\n📋 WASHER BOOKINGS DATA:\n');
  console.log('Slot Time\t\tCustomer Name\t\tVehicle\t\tStatus');
  console.log('─'.repeat(80));

  const bookings = await prisma.washerBooking.findMany({
    include: { customer: true },
    orderBy: { slotTime: 'asc' },
  });

  bookings.forEach((b) => {
    const time = new Date(b.slotTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const date = new Date(b.slotTime).toISOString().split('T')[0];
    console.log(
      `${time}\t${date}\t${b.customer.name.padEnd(20)}\t${b.vehicle}\t\t${b.status}`
    );
  });

  console.log('\n📊 Summary:');
  const stats = await prisma.washerBooking.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  stats.forEach((s) => console.log(`  ${s.status}: ${s._count.status}`));

  await prisma.$disconnect();
}

showData();

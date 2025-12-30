import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.parkingLot.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@email.com',
        phone: '+94 77 123 4567',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@email.com',
        phone: '+94 77 234 5678',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol White',
        email: 'carol@email.com',
        phone: '+94 77 345 6789',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Brown',
        email: 'david@email.com',
        phone: '+94 77 456 7890',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eva Green',
        email: 'eva@email.com',
        phone: '+94 77 567 8901',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Frank Miller',
        email: 'frank@email.com',
        phone: '+94 77 678 9012',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Land Owner One',
        email: 'landowner1@email.com',
        phone: '+94 77 111 1111',
        role: 'landowner',
      },
    }),
    prisma.user.create({
      data: {
        name: 'John Washer',
        email: 'washer1@email.com',
        phone: '+94 77 222 2222',
        role: 'washer',
      },
    }),
  ]);

  console.log(`👤 Created ${users.length} users`);

  const landOwner = users.find(u => u.role === 'landowner')!;

  // Create parking lots
  const parkingLots = await Promise.all([
    prisma.parkingLot.create({
      data: {
        name: 'Colombo City Center Parking',
        address: 'Colombo 07, Sri Lanka',
        ownerId: landOwner.id,
      },
    }),
    prisma.parkingLot.create({
      data: {
        name: 'Malabe Tech Park',
        address: 'Malabe, Sri Lanka',
        ownerId: landOwner.id,
      },
    }),
    prisma.parkingLot.create({
      data: {
        name: 'Galle Road Plaza',
        address: 'Colombo 03, Sri Lanka',
        ownerId: landOwner.id,
      },
    }),
  ]);

  console.log(`🅿️ Created ${parkingLots.length} parking lots`);

  // Create slots for each parking lot
  const zones = ['A', 'B', 'C'];
  const slotsPerZone = 4;
  const allSlots = [];

  for (const lot of parkingLots) {
    for (const zone of zones) {
      for (let i = 1; i <= slotsPerZone; i++) {
        const slotNumber = `${zone}-${String(i).padStart(2, '0')}`;
        const statuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const slot = await prisma.slot.create({
          data: {
            slotNumber,
            zone,
            status: randomStatus,
            pricePerHour: 15 + Math.floor(Math.random() * 10),
            parkingLotId: lot.id,
          },
        });
        allSlots.push(slot);
      }
    }
  }

  console.log(`🎰 Created ${allSlots.length} slots`);

  // Create some bookings
  const customers = users.filter(u => u.role === 'customer');
  const availableSlots = allSlots.filter(s => s.status === 'available' || s.status === 'occupied');
  
  // Recent bookings (last 3 days)
  const recentBookingsData = [
    { bookingNumber: 'BK-001', vehicleNumber: 'ABC-1234', duration: '2h', status: 'active' },
    { bookingNumber: 'BK-002', vehicleNumber: 'XYZ-5678', duration: '1h 30m', status: 'active' },
    { bookingNumber: 'BK-003', vehicleNumber: 'DEF-9012', duration: '4h', status: 'completed' },
    { bookingNumber: 'BK-004', vehicleNumber: 'GHI-3456', duration: '3h', status: 'active' },
    { bookingNumber: 'BK-005', vehicleNumber: 'JKL-7890', duration: '2h', status: 'completed' },
    { bookingNumber: 'BK-006', vehicleNumber: 'MNO-1234', duration: '1h 30m', status: 'active' },
    { bookingNumber: 'BK-007', vehicleNumber: 'PQR-5678', duration: '2h', status: 'cancelled' },
    { bookingNumber: 'BK-008', vehicleNumber: 'STU-9012', duration: '3h', status: 'cancelled' },
    { bookingNumber: 'BK-009', vehicleNumber: 'VWX-3456', duration: '1h', status: 'cancelled' },
  ];

  // Bookings for 2025-12-01
  const dec1BookingsData = [
    { bookingNumber: 'BK-010', vehicleNumber: 'CAR-1001', duration: '2h', status: 'completed' },
    { bookingNumber: 'BK-011', vehicleNumber: 'CAR-1002', duration: '3h', status: 'completed' },
    { bookingNumber: 'BK-012', vehicleNumber: 'CAR-1003', duration: '1h 30m', status: 'completed' },
    { bookingNumber: 'BK-013', vehicleNumber: 'CAR-1004', duration: '4h', status: 'completed' },
    { bookingNumber: 'BK-014', vehicleNumber: 'CAR-1005', duration: '2h', status: 'completed' },
    { bookingNumber: 'BK-015', vehicleNumber: 'CAR-1006', duration: '1h', status: 'cancelled' },
  ];

  const bookings = [];
  
  // Create recent bookings
  for (let i = 0; i < recentBookingsData.length; i++) {
    const slotIndex = i % availableSlots.length;
    const customerIndex = i % customers.length;
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: recentBookingsData[i].bookingNumber,
        vehicleNumber: recentBookingsData[i].vehicleNumber,
        startTime: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
        duration: recentBookingsData[i].duration,
        amount: availableSlots[slotIndex].pricePerHour * parseFloat(recentBookingsData[i].duration),
        status: recentBookingsData[i].status,
        userId: customers[customerIndex].id,
        slotId: availableSlots[slotIndex].id,
      },
    });
    bookings.push(booking);
  }

  // Create bookings for 2025-12-01
  const dec1Date = new Date('2025-12-01');
  for (let i = 0; i < dec1BookingsData.length; i++) {
    const slotIndex = (i + recentBookingsData.length) % availableSlots.length;
    const customerIndex = i % customers.length;
    // Set different hours throughout the day
    const bookingTime = new Date(dec1Date);
    bookingTime.setHours(8 + i * 2, Math.floor(Math.random() * 60), 0, 0);
    
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: dec1BookingsData[i].bookingNumber,
        vehicleNumber: dec1BookingsData[i].vehicleNumber,
        startTime: bookingTime,
        duration: dec1BookingsData[i].duration,
        amount: availableSlots[slotIndex].pricePerHour * parseFloat(dec1BookingsData[i].duration),
        status: dec1BookingsData[i].status,
        userId: customers[customerIndex].id,
        slotId: availableSlots[slotIndex].id,
      },
    });
    bookings.push(booking);
  }

  console.log(`📋 Created ${bookings.length} bookings`);

  // Create cars for washer dashboard
  const carsData = [
    { vehicleId: 'EP-1023', location: 'Colombo 07', time: '10:30 AM', type: 'Sedan', status: 'waiting' },
    { vehicleId: 'EP-1041', location: 'Colombo 03', time: '11:15 AM', type: 'SUV', status: 'waiting' },
    { vehicleId: 'EP-1088', location: 'Malabe', time: '12:00 PM', type: 'Hatchback', status: 'waiting' },
    { vehicleId: 'EP-1102', location: 'Colombo 07', time: '09:00 AM', type: 'Sedan', status: 'accepted' },
    { vehicleId: 'EP-1115', location: 'Colombo 03', time: '10:00 AM', type: 'SUV', status: 'washing' },
    { vehicleId: 'EP-1130', location: 'Malabe', time: '08:30 AM', type: 'Van', status: 'finished' },
  ];

  const cars = await Promise.all(
    carsData.map(car => prisma.car.create({ data: car }))
  );

  console.log(`🚗 Created ${cars.length} cars for washing`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

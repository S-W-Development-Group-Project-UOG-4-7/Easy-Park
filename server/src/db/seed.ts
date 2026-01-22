import { query } from './config.js';
import bcrypt from 'bcrypt';

export async function seed() {
  console.log('Seeding database with sample data...');

  try {
    // Create default admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminResult = await query(`
      INSERT INTO admins (username, email, password_hash, full_name, role)
      VALUES ('admin', 'admin@parking.com', $1, 'System Administrator', 'super_admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [passwordHash]);
    
    const adminId = adminResult.rows[0]?.id || 1;
    console.log('✓ Created admin user (username: admin, password: admin123)');

    // Create sample properties
    const property1 = await query(`
      INSERT INTO properties (name, address, description, created_by)
      VALUES ('Downtown Parking', '123 Main St, City Center', 'Premium downtown parking facility', $1)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [adminId]);

    const property2 = await query(`
      INSERT INTO properties (name, address, description, created_by)
      VALUES ('Mall Parking', '456 Oak Ave, Shopping District', 'Convenient mall parking with covered areas', $1)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [adminId]);

    const property3 = await query(`
      INSERT INTO properties (name, address, description, created_by)
      VALUES ('Airport Parking', '789 Airport Rd, Terminal 1', '24/7 secure airport parking', $1)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [adminId]);

    console.log('✓ Created sample properties');

    // Get property IDs
    const properties = await query(`SELECT id FROM properties ORDER BY id LIMIT 3;`);
    const propIds = properties.rows.map(r => r.id);

    // Create parking slots for each property
    const slotTypes = ['Normal', 'Normal', 'Normal', 'EV', 'Car Washing'];
    for (const propId of propIds) {
      for (let i = 0; i < 10; i++) {
        const slotType = slotTypes[i % slotTypes.length];
        const prefix = slotType === 'Normal' ? 'A' : slotType === 'EV' ? 'E' : 'W';
        await query(`
          INSERT INTO parking_slots (property_id, slot_number, type, status, hourly_rate)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING;
        `, [propId, `${prefix}-${String(i + 1).padStart(2, '0')}`, slotType, 'available', slotType === 'EV' ? 8.00 : slotType === 'Car Washing' ? 15.00 : 5.00]);
      }
    }
    console.log('✓ Created parking slots');

    // Create sample customers
    const customers = [
      { name: 'John Doe', email: 'john@example.com', phone: '555-0101', address: '123 Main St' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', address: '456 Oak Ave' },
      { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0103', address: '789 Pine Rd' },
      { name: 'Alice Brown', email: 'alice@example.com', phone: '555-0104', address: '321 Elm St' },
      { name: 'Charlie Wilson', email: 'charlie@example.com', phone: '555-0105', address: '654 Maple Dr' },
    ];

    for (const customer of customers) {
      await query(`
        INSERT INTO customers (name, email, phone, address)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING;
      `, [customer.name, customer.email, customer.phone, customer.address]);
    }
    console.log('✓ Created sample customers');

    // Create sample bookings
    const customerIds = (await query(`SELECT id FROM customers ORDER BY id LIMIT 5;`)).rows.map(r => r.id);
    const slots = (await query(`SELECT id, property_id, hourly_rate FROM parking_slots LIMIT 10;`)).rows;

    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const customerId = customerIds[i % customerIds.length];
      const slot = slots[i % slots.length];
      const hours = Math.floor(Math.random() * 5) + 1;
      const amount = hours * parseFloat(slot.hourly_rate);

      await query(`
        INSERT INTO bookings (customer_id, property_id, slot_id, booking_date, start_time, hours_selected, payment_amount, payment_method, payment_status, booking_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid', 'completed')
        ON CONFLICT DO NOTHING;
      `, [customerId, slot.property_id, slot.id, bookingDate.toISOString().split('T')[0], '10:00', hours, amount, ['Credit Card', 'Cash', 'Digital Wallet'][i % 3]]);
    }
    console.log('✓ Created sample bookings');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

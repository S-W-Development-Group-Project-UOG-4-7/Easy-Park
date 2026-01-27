import { query } from './config.js';

export async function migrate() {
  console.log('Running database migrations...');

  try {
    // Create properties table
    await query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created properties table');

    // Create parking_slots table
    await query(`
      CREATE TABLE IF NOT EXISTS parking_slots (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        slot_number VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('Normal', 'EV', 'Car Washing')),
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
        hourly_rate DECIMAL(10, 2) DEFAULT 5.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, slot_number)
      );
    `);
    console.log('✓ Created parking_slots table');

    // Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created customers table');

    // Create bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        property_id INTEGER REFERENCES properties(id),
        slot_id INTEGER REFERENCES parking_slots(id),
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME,
        hours_selected INTEGER NOT NULL DEFAULT 1,
        check_in_time TIMESTAMP,
        check_out_time TIMESTAMP,
        payment_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
        booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
        extras TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created bookings table');

    // Create revenue_logs table for tracking
    await query(`
      CREATE TABLE IF NOT EXISTS revenue_logs (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        property_id INTEGER REFERENCES properties(id),
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) DEFAULT 'booking',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created revenue_logs table');

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_slots_property ON parking_slots(property_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_slots_status ON parking_slots(status);`);
    console.log('✓ Created indexes');

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if called directly
migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

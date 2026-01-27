import { query } from './config.js';

async function reset() {
  console.log('Resetting database...');
  
  try {
    // Drop tables in order (respecting foreign keys)
    await query('DROP TABLE IF EXISTS revenue_logs CASCADE;');
    await query('DROP TABLE IF EXISTS bookings CASCADE;');
    await query('DROP TABLE IF EXISTS parking_slots CASCADE;');
    await query('DROP TABLE IF EXISTS customers CASCADE;');
    await query('DROP TABLE IF EXISTS properties CASCADE;');
    
    console.log('✓ Dropped all tables');
    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('Reset failed:', error);
    throw error;
  }
}

reset()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

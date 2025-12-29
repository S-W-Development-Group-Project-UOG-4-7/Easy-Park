import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easypark',
};

let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection error:', error);
    // For development, continue without database
    console.log('Continuing without database connection (using mock data)');
  }
}

async function createTables() {
  const createPropertiesTable = `
    CREATE TABLE IF NOT EXISTS properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createParkingSlotsTable = `
    CREATE TABLE IF NOT EXISTS parking_slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      type ENUM('EV', 'Normal', 'Car Washing') NOT NULL,
      count INT NOT NULL DEFAULT 1,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )
  `;

  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id VARCHAR(50) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_address TEXT NOT NULL,
      property_id INT NOT NULL,
      property_name VARCHAR(255) NOT NULL,
      parking_slot VARCHAR(50) NOT NULL,
      parking_type ENUM('EV Slot', 'Normal', 'Car Washing') NOT NULL,
      booking_date DATE NOT NULL,
      hours_selected INT NOT NULL,
      check_out_time DATETIME NOT NULL,
      payment_amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      extras TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `;

  try {
    await pool.execute(createPropertiesTable);
    await pool.execute(createParkingSlotsTable);
    await pool.execute(createBookingsTable);
    console.log('Tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Simple authentication middleware (for development)
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  // In production, verify JWT token here
  // For now, allow all requests
  next();
};

// Mock data for development
const mockProperties = [
  { id: 1, name: 'Downtown Parking', address: '123 Main St, City' },
  { id: 2, name: 'Mall Parking', address: '456 Oak Ave, City' },
  { id: 3, name: 'Airport Parking', address: '789 Airport Rd, City' },
];

const mockBookings = [
  {
    id: 1,
    customer_id: 'C001',
    customer_name: 'John Doe',
    customer_address: '123 Main St, City',
    property_id: 1,
    property_name: 'Downtown Parking',
    parking_slot: 'A-12',
    parking_type: 'Normal',
    booking_date: '2024-01-15',
    hours_selected: 3,
    check_out_time: '2024-01-15T15:30:00',
    payment_amount: 15.00,
    payment_method: 'Credit Card',
    extras: 'None',
  },
  {
    id: 2,
    customer_id: 'C002',
    customer_name: 'Jane Smith',
    customer_address: '456 Oak Ave, City',
    property_id: 2,
    property_name: 'Mall Parking',
    parking_slot: 'B-05',
    parking_type: 'Car Washing',
    booking_date: '2024-01-15',
    hours_selected: 2,
    check_out_time: '2024-01-15T14:00:00',
    payment_amount: 25.00,
    payment_method: 'Cash',
    extras: 'Premium Wash',
  },
];

// API Routes

// GET /api/stats - Get statistics
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const [bookings] = await pool.execute(
        'SELECT SUM(payment_amount) as total_revenue, COUNT(DISTINCT customer_id) as total_customers FROM bookings'
      );
      const [slots] = await pool.execute(
        'SELECT SUM(count) as total_slots FROM parking_slots'
      );
      const [usedSlots] = await pool.execute(
        'SELECT COUNT(*) as used FROM bookings WHERE DATE(booking_date) = CURDATE()'
      );

      const totalSlots = slots[0]?.total_slots || 0;
      const used = usedSlots[0]?.used || 0;
      const available = totalSlots - used;

      res.json({
        totalRevenue: parseFloat(bookings[0]?.total_revenue || 0),
        availableSlots: Math.max(0, available),
        totalCustomers: parseInt(bookings[0]?.total_customers || 0),
      });
    } else {
      // Mock data
      res.json({
        totalRevenue: 45230,
        availableSlots: 127,
        totalCustomers: 342,
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      totalRevenue: 45230,
      availableSlots: 127,
      totalCustomers: 342,
    });
  }
});

// GET /api/properties - Get all properties
app.get('/api/properties', authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const [properties] = await pool.execute('SELECT id, name, address FROM properties');
      res.json(properties);
    } else {
      res.json(mockProperties);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.json(mockProperties);
  }
});

// POST /api/properties - Add new property
app.post('/api/properties', authenticateAdmin, async (req, res) => {
  try {
    const { propertyName, address, parkingSlots } = req.body;

    if (!propertyName || !address || !parkingSlots || parkingSlots.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Insert property
        const [result] = await connection.execute(
          'INSERT INTO properties (name, address) VALUES (?, ?)',
          [propertyName, address]
        );
        const propertyId = result.insertId;

        // Insert parking slots
        for (const slot of parkingSlots) {
          await connection.execute(
            'INSERT INTO parking_slots (property_id, type, count) VALUES (?, ?, ?)',
            [propertyId, slot.type, slot.count]
          );
        }

        await connection.commit();
        res.json({ id: propertyId, name: propertyName, address });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      // Mock response
      const newProperty = {
        id: mockProperties.length + 1,
        name: propertyName,
        address,
      };
      mockProperties.push(newProperty);
      res.json(newProperty);
    }
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

// GET /api/bookings - Get bookings with filters
app.get('/api/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId, date } = req.query;

    if (pool) {
      let query = `
        SELECT 
          id,
          customer_id as customerId,
          customer_name as name,
          customer_address as address,
          property_name as propertyName,
          parking_slot as parkingSlot,
          booking_date as date,
          parking_type as parkingType,
          hours_selected as hoursSelected,
          check_out_time as checkOutTime,
          payment_amount as paymentAmount,
          payment_method as paymentMethod,
          extras
        FROM bookings
        WHERE 1=1
      `;
      const params = [];

      if (propertyId && propertyId !== 'all') {
        query += ' AND property_id = ?';
        params.push(propertyId);
      }

      if (date) {
        query += ' AND booking_date = ?';
        params.push(date);
      }

      query += ' ORDER BY booking_date DESC, created_at DESC';

      const [bookings] = await pool.execute(query, params);
      res.json(bookings);
    } else {
      // Mock data with filtering
      let filtered = [...mockBookings];
      if (propertyId && propertyId !== 'all') {
        filtered = filtered.filter((b) => b.property_id === parseInt(propertyId));
      }
      if (date) {
        filtered = filtered.filter((b) => b.booking_date === date);
      }
      res.json(filtered.map((b) => ({
        id: b.id,
        customerId: b.customer_id,
        name: b.customer_name,
        address: b.customer_address,
        propertyName: b.property_name,
        parkingSlot: b.parking_slot,
        date: b.booking_date,
        parkingType: b.parking_type,
        hoursSelected: b.hours_selected,
        checkOutTime: b.check_out_time,
        paymentAmount: b.payment_amount,
        paymentMethod: b.payment_method,
        extras: b.extras,
      })));
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.json(mockBookings.map((b) => ({
      id: b.id,
      customerId: b.customer_id,
      name: b.customer_name,
      address: b.customer_address,
      propertyName: b.property_name,
      parkingSlot: b.parking_slot,
      date: b.booking_date,
      parkingType: b.parking_type,
      hoursSelected: b.hours_selected,
      checkOutTime: b.check_out_time,
      paymentAmount: b.payment_amount,
      paymentMethod: b.payment_method,
      extras: b.extras,
    })));
  }
});

// GET /api/bookings/:id - Get single booking details
app.get('/api/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (pool) {
      const [bookings] = await pool.execute(
        `
        SELECT 
          id,
          customer_id as customerId,
          customer_name as name,
          customer_address as address,
          property_name as propertyName,
          parking_slot as parkingSlot,
          booking_date as date,
          parking_type as parkingType,
          hours_selected as hoursSelected,
          check_out_time as checkOutTime,
          payment_amount as paymentAmount,
          payment_method as paymentMethod,
          extras
        FROM bookings
        WHERE id = ?
      `,
        [id]
      );

      if (bookings.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(bookings[0]);
    } else {
      // Mock data
      const booking = mockBookings.find((b) => b.id === parseInt(id));
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json({
        id: booking.id,
        customerId: booking.customer_id,
        name: booking.customer_name,
        address: booking.customer_address,
        propertyName: booking.property_name,
        parkingSlot: booking.parking_slot,
        date: booking.booking_date,
        parkingType: booking.parking_type,
        hoursSelected: booking.hours_selected,
        checkOutTime: booking.check_out_time,
        paymentAmount: booking.payment_amount,
        paymentMethod: booking.payment_method,
        extras: booking.extras,
      });
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});


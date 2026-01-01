import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma.js';
import propertiesRoutes from './routes/properties';
import bookingsRoutes from './routes/bookings';
import statsRoutes from './routes/stats';
import customersRoutes from './routes/customers';
import slotsRoutes from './routes/slots';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/properties', propertiesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/slots', slotsRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server and test database connection
async function startServer() {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL with Prisma');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

startServer();

export default app;

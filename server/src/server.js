/**
 * NAKKO Backend Platform - Express.js API Server
 * Complete backend service separation for the NAKKO Cooperative Gig Platform
 */

import express from 'express';
import cors from 'cors';
import { connectDB, getDbStatus } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import workerRoutes from './modules/workers/worker.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with graceful fallback
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'NAKKO Backend API',
    uptime: process.uptime(),
    db: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Gig categories catalog endpoint
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'srv-1', title: 'Plumbing Repair', category: 'plumbing', basePrice: 250, unit: 'per visit' },
      { id: 'srv-2', title: 'Home Cleaning', category: 'cleaning', basePrice: 200, unit: 'per hour' },
      { id: 'srv-3', title: 'Electrical Fixes', category: 'electrical', basePrice: 300, unit: 'per visit' },
      { id: 'srv-4', title: 'Lawn & Gardening', category: 'gardening', basePrice: 220, unit: 'per visit' },
      { id: 'srv-5', title: 'Carpentry & Woodwork', category: 'carpentry', basePrice: 350, unit: 'per visit' },
      { id: 'srv-6', title: 'House Painting', category: 'painting', basePrice: 400, unit: 'per room' }
    ]
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dev', adminRoutes);

// Direct top-level convenience aliases
app.post('/api/login', (req, res, next) => authRoutes(req, res, next));
app.post('/api/register', (req, res, next) => authRoutes(req, res, next));

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Only listen if not imported as module in tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 NAKKO Backend API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth:     http://localhost:${PORT}/api/auth`);
    console.log(`🔧 Workers:  http://localhost:${PORT}/api/workers`);
    console.log(`📦 Bookings: http://localhost:${PORT}/api/bookings`);
    console.log(`⚙️  Admin:    http://localhost:${PORT}/api/dev`);
    console.log(`❤️  Health:   http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;


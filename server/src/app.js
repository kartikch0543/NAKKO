/**
 * NAKKO Backend Platform - Express Application
 * Modular Monolith with MVC and Service Layer
 */

import express from 'express';
import cors from 'cors';
import { env } from './config/environment.js';
import { getDbStatus } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import clientRoutes from './modules/clients/client.routes.js';
import workerRoutes from './modules/workers/worker.routes.js';
import cooperativeRoutes from './modules/cooperatives/cooperative.routes.js';
import serviceRequestRoutes from './modules/serviceRequests/serviceRequest.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { WelfareApiAdapter } from './integrations/welfare/welfareApiAdapter.js';
import { WorkerService } from './modules/workers/worker.service.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || env.ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Platform Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'NAKKO Backend API',
    uptime: process.uptime(),
    db: getDbStatus(),
    innovations: {
      dynamicSearchSpaceReduction: 'ACTIVE',
      atomicStateExecutionProtocol: 'ACTIVE'
    },
    timestamp: new Date().toISOString()
  });
});

// Gig Catalog
app.get('/api/services', (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      { id: 'srv-plumb', title: 'Plumbing Repair', name: 'Plumbing', category: 'plumbing', basePrice: 250, unit: 'per visit' },
      { id: 'srv-clean', title: 'Home Cleaning', name: 'Cleaning', category: 'cleaning', basePrice: 200, unit: 'per hour' },
      { id: 'srv-elec', title: 'Electrical Fixes', name: 'Electrical', category: 'electrical', basePrice: 300, unit: 'per visit' },
      { id: 'srv-garden', title: 'Lawn & Gardening', name: 'Gardening', category: 'gardening', basePrice: 220, unit: 'per visit' },
      { id: 'srv-carp', title: 'Carpentry & Woodwork', name: 'Carpentry', category: 'carpentry', basePrice: 350, unit: 'per visit' },
      { id: 'srv-paint', title: 'House Painting', name: 'Painting', category: 'painting', basePrice: 400, unit: 'per room' }
    ]
  });
});

// Simulated Government Welfare API endpoint for live demonstration
app.get('/api/welfare/worker/:id', async (req, res, next) => {
  try {
    const worker = await WorkerService.getWorkerById(req.params.id);
    const report = await WelfareApiAdapter.verifyWorkerWelfareStatus(worker);
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
});

// Mount Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/bookings', serviceRequestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dev', adminRoutes);
app.use('/api/admin', adminRoutes);

// Direct top-level convenience aliases
app.post('/api/login', (req, res, next) => authRoutes(req, res, next));
app.post('/api/register', (req, res, next) => authRoutes(req, res, next));

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;


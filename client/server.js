/**
 * NAKKO Cooperative Gig Platform - Node.js Client Server
 * Powered by Express.js & EJS Templates
 * Frontend SSR renderer with unified API client integration
 */

'use strict';

const express = require('express');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Set up EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') || !req.path.includes('.')) {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Pass API_BASE_URL to all rendered views
app.use((req, res, next) => {
  res.locals.apiBaseUrl = API_BASE_URL;
  next();
});

// ==========================================
// LOCAL API ROUTES (Fallback & Development)
// ==========================================
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const workerRoutes = require('./routes/workerRoutes');
const devRoutes = require('./routes/devRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api', workerRoutes);
app.use('/api/dev', devRoutes);

// Direct top-level convenience alias for /api/login and /api/register
app.post('/api/login', (req, res, next) => authRoutes(req, res, next));
app.post('/api/register', (req, res, next) => authRoutes(req, res, next));

// ==========================================
// PAGE ROUTES (SSR)
// ==========================================

// Landing Page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'NAKKO – Connecting Workers with Opportunity',
    services: store.getServices(),
    metrics: store.getMetrics()
  });
});

// Authentication Page (Sign in / Register)
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Sign In – NAKKO',
    queryTab: req.query.tab || 'login',
    queryRole: req.query.role || 'user'
  });
});

// Client / User Dashboard
const renderUserDashboard = (req, res) => {
  res.render('dashboard-user', {
    title: 'Client Dashboard – NAKKO',
    services: store.getServices(),
    bookings: store.getBookings(),
    user: {
      name: 'Divyanshu Sharma',
      email: 'divyanshu@example.com',
      role: 'client'
    }
  });
};
app.get('/dashboard/user', renderUserDashboard);
app.get('/dashboard-user', renderUserDashboard);

// Worker Dashboard
const renderWorkerDashboard = (req, res) => {
  const rameshWorker = store.getWorkerById('w-101');
  res.render('dashboard-worker', {
    title: 'Worker Dashboard – NAKKO',
    worker: rameshWorker,
    bookings: store.getBookings().filter(b => b.workerId === 'w-101')
  });
};
app.get('/dashboard/worker', renderWorkerDashboard);
app.get('/dashboard-worker', renderWorkerDashboard);

// Developer & Admin Dashboard
const renderDevDashboard = (req, res) => {
  res.render('dashboard-dev', {
    title: 'Developer Portal – NAKKO',
    metrics: store.getMetrics(),
    logs: store.getLogs(),
    config: store.getConfig(),
    workers: store.getWorkers()
  });
};
app.get('/dashboard/dev', renderDevDashboard);
app.get('/dashboard-dev', renderDevDashboard);

// ==========================================
// LEGACY .HTML REDIRECTS & COMPATIBILITY
// ==========================================
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/login.html', (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, `/login${query}`);
});
app.get('/dashboard-user.html', (req, res) => res.redirect(301, '/dashboard/user'));
app.get('/dashboard-worker.html', (req, res) => res.redirect(301, '/dashboard/worker'));
app.get('/dashboard-dev.html', (req, res) => res.redirect(301, '/dashboard/dev'));

// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found (404)'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Client Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 NAKKO Platform Frontend running on Node.js v${process.version}`);
    console.log(`📡 Local Server:   http://localhost:${PORT}`);
    console.log(`🔗 Backend Target: ${API_BASE_URL}`);
    console.log(`🏠 Homepage:       http://localhost:${PORT}/`);
    console.log(`🔐 Login:          http://localhost:${PORT}/login`);
    console.log(`👤 Client Dash:    http://localhost:${PORT}/dashboard/user`);
    console.log(`🔧 Worker Dash:    http://localhost:${PORT}/dashboard/worker`);
    console.log(`⚙️  Dev Portal:     http://localhost:${PORT}/dashboard/dev`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;

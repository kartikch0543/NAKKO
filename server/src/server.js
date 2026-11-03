/**
 * NAKKO Platform - Server Entry Point
 */

import app from './app.js';
import { connectDB, getDbStatus } from './config/database.js';
import { env, validateEnvironment } from './config/environment.js';

validateEnvironment();

// Connect to MongoDB
connectDB();

const PORT = env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 NAKKO Cooperative Gig Platform API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth:         http://localhost:${PORT}/api/auth`);
    console.log(`🔧 Workers:      http://localhost:${PORT}/api/workers`);
    console.log(`📦 Bookings:     http://localhost:${PORT}/api/bookings`);
    console.log(`🏢 Cooperatives: http://localhost:${PORT}/api/cooperatives`);
    console.log(`💳 Payments:     http://localhost:${PORT}/api/payments`);
    console.log(`⚙️  Admin:        http://localhost:${PORT}/api/dev`);
    console.log(`❤️  Health:       http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;

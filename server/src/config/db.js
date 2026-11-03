/**
 * NAKKO Backend - Database Configuration
 * Graceful Mongoose connection with fallback handling
 */

import mongoose from 'mongoose';

let isDbConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nakko';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isDbConnected = false;
    console.warn(`[Database] MongoDB connection warning: ${err.message}`);
    console.warn(`[Database] Running in memory/offline mode for mock persistence.`);
    return null;
  }
}

export function getDbStatus() {
  return {
    connected: isDbConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'offline-fallback'
  };
}

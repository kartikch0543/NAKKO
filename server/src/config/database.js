/**
 * NAKKO Platform - MongoDB Connection & Lifecycle Management
 */

import mongoose from 'mongoose';
import { env } from './environment.js';

let isConnected = false;

export async function connectDB() {
  const uri = env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection notice: ${err.message}`);
    console.warn(`[Database] Running in memory/resilient mode for demonstrations.`);
    return null;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Connection error:', err.message);
});

export function getDbStatus() {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'offline-memory-fallback',
    name: mongoose.connection.name || 'nakko'
  };
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}


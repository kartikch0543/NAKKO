/**
 * NAKKO Backend - User & Auth Model
 * Mongoose Schema with in-memory seed fallback
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'user', 'worker', 'dev', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  avatar: {
    type: String,
    default: ''
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Fallback in-memory seed collection for offline/development environments
export const memoryUsers = [
  {
    id: 'u-1',
    _id: 'u-1',
    name: 'Divyanshu Sharma',
    email: 'divyanshu@example.com',
    password: 'password123',
    role: 'client',
    phone: '+91 98765 43210',
    kycStatus: 'verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'w-101',
    _id: 'w-101',
    name: 'Ramesh Kumar',
    email: 'ramesh@nakko.in',
    password: 'password123',
    role: 'worker',
    phone: '+91 91234 56789',
    kycStatus: 'verified',
    createdAt: new Date().toISOString()
  },
  {
    id: 'd-1',
    _id: 'd-1',
    name: 'Admin Divyanshu',
    email: 'admin@nakko.in',
    password: 'password123',
    role: 'dev',
    phone: '+91 99999 88888',
    kycStatus: 'verified',
    createdAt: new Date().toISOString()
  }
];

export const User = mongoose.models.User || mongoose.model('User', userSchema);


/**
 * NAKKO Platform - Authentication & User Model
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../../shared/constants/roles.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Do not return password by default in queries
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CLIENT,
    index: true
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    default: null
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// In-memory fallback repository for resilient offline execution & fast demo access
const initialSeedPasswordHash = bcrypt.hashSync('nakko2026', 10);

export const memoryUsers = [
  {
    _id: 'u-1',
    id: 'u-1',
    name: 'Divyanshu Sharma',
    email: 'divyanshu@example.com',
    password: initialSeedPasswordHash,
    role: ROLES.CLIENT,
    phone: '+91 98765 43210',
    kycStatus: 'verified',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'w-101',
    id: 'w-101',
    name: 'Ramesh Kumar',
    email: 'ramesh@nakko.in',
    password: initialSeedPasswordHash,
    role: ROLES.WORKER,
    phone: '+91 91234 56789',
    kycStatus: 'verified',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'd-1',
    id: 'd-1',
    name: 'Admin Developer',
    email: 'admin@nakko.in',
    password: initialSeedPasswordHash,
    role: ROLES.ADMIN,
    phone: '+91 99999 88888',
    kycStatus: 'verified',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

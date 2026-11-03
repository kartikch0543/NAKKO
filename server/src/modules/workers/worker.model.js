/**
 * NAKKO Backend - Worker Model
 * Mongoose Schema & in-memory seed fallback
 */

import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  name: { type: String, required: true },
  trade: { type: String, required: true },
  phone: { type: String, default: '+91 91234 56789' },
  city: { type: String, default: 'Noida' },
  hourlyRate: { type: Number, default: 250 },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 45 },
  jobsCompleted: { type: Number, default: 140 },
  earningsToday: { type: Number, default: 1250 },
  earningsTotal: { type: Number, default: 34200 },
  isAvailable: { type: Boolean, default: true },
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
  lat: { type: Number, default: 28.5355 },
  lng: { type: Number, default: 77.3910 },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const memoryWorkers = [
  {
    id: 'w-101',
    _id: 'w-101',
    name: 'Ramesh Kumar',
    trade: 'Plumbing',
    phone: '+91 91234 56789',
    city: 'Noida, Sector 62',
    hourlyRate: 250,
    rating: 4.9,
    reviewCount: 88,
    jobsCompleted: 142,
    earningsToday: 1250,
    earningsTotal: 34200,
    isAvailable: true,
    kycStatus: 'verified',
    skills: ['Pipe repair', 'Sanitary installation', 'Leak detection', 'Drainage'],
    lat: 28.6280,
    lng: 77.3649
  },
  {
    id: 'w-102',
    _id: 'w-102',
    name: 'Sunita Devi',
    trade: 'Cleaning',
    phone: '+91 98222 33445',
    city: 'Noida, Sector 18',
    hourlyRate: 200,
    rating: 4.95,
    reviewCount: 124,
    jobsCompleted: 210,
    earningsToday: 800,
    earningsTotal: 42100,
    isAvailable: true,
    kycStatus: 'verified',
    skills: ['Deep home cleaning', 'Kitchen sanitization', 'Floor scrubbing'],
    lat: 28.5708,
    lng: 77.3271
  },
  {
    id: 'w-103',
    _id: 'w-103',
    name: 'Mohan Yadav',
    trade: 'Electrical',
    phone: '+91 97111 55667',
    city: 'Ghaziabad, Indirapuram',
    hourlyRate: 300,
    rating: 4.8,
    reviewCount: 65,
    jobsCompleted: 115,
    earningsToday: 1500,
    earningsTotal: 29800,
    isAvailable: false,
    kycStatus: 'verified',
    skills: ['Wiring', 'Fuse box repair', 'Appliance installation', 'Inverter setup'],
    lat: 28.6415,
    lng: 77.3714
  },
  {
    id: 'w-104',
    _id: 'w-104',
    name: 'Lakshmi Narayan',
    trade: 'Gardening',
    phone: '+91 99555 44332',
    city: 'Noida, Sector 50',
    hourlyRate: 220,
    rating: 4.85,
    reviewCount: 42,
    jobsCompleted: 82,
    earningsToday: 650,
    earningsTotal: 18400,
    isAvailable: true,
    kycStatus: 'pending',
    skills: ['Lawn mowing', 'Plant pruning', 'Landscaping', 'Fertilizer treatment'],
    lat: 28.5733,
    lng: 77.3687
  }
];

export const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);

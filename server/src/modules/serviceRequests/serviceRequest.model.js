/**
 * NAKKO Platform - Service Request / Booking Model
 */

import mongoose from 'mongoose';
import { SERVICE_STATUS } from '../../shared/constants/status.js';

const trackingStepSchema = new mongoose.Schema({
  label: { type: String, required: true },
  done: { type: Boolean, default: false },
  time: { type: String, default: 'Pending' }
}, { _id: false });

const serviceRequestSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  clientName: {
    type: String,
    default: 'NAKKO Client'
  },
  clientPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  clientAddress: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [77.3910, 28.5355]
    }
  },
  service: {
    type: String,
    required: true,
    index: true
  },
  workerId: {
    type: String,
    default: null,
    index: true
  },
  workerName: {
    type: String,
    default: null
  },
  workerPhone: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.CREATED,
    index: true
  },
  amount: {
    type: Number,
    default: 350
  },
  scheduledTime: {
    type: String,
    default: 'Today, As soon as possible'
  },
  notes: {
    type: String,
    default: ''
  },
  trackingSteps: [trackingStepSchema],
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);

// In-memory fallback repository aligned with frontend mocks
export const memoryBookings = [
  {
    id: 'NK-0042',
    _id: 'NK-0042',
    bookingNumber: 'NK-0042',
    userId: 'u-1',
    clientId: 'u-1',
    userName: 'Divyanshu Sharma',
    clientName: 'Divyanshu Sharma',
    userPhone: '+91 98765 43210',
    clientPhone: '+91 98765 43210',
    userAddress: 'Block 4, Sector 12, Noida, UP',
    clientAddress: 'Block 4, Sector 12, Noida, UP',
    service: 'Plumbing',
    workerId: 'w-101',
    workerName: 'Ramesh Kumar',
    workerPhone: '+91 91234 56789',
    status: 'in_progress',
    date: 'Today, 2:30 PM',
    createdAt: new Date().toISOString(),
    amount: 450,
    notes: 'Kitchen sink pipe leaking water rapidly under counter',
    trackingSteps: [
      { label: 'Booking Confirmed', done: true, time: '2:15 PM' },
      { label: 'Worker Assigned (Ramesh K.)', done: true, time: '2:18 PM' },
      { label: 'On the Way (12 min away)', done: true, time: '2:25 PM' },
      { label: 'Work in Progress', done: true, time: '2:35 PM' },
      { label: 'Completed & Payment Released', done: false, time: 'Pending' }
    ]
  },
  {
    id: 'NK-0041',
    _id: 'NK-0041',
    bookingNumber: 'NK-0041',
    userId: 'u-2',
    clientId: 'u-2',
    userName: 'Priya Sharma',
    clientName: 'Priya Sharma',
    userPhone: '+91 98111 22334',
    clientPhone: '+91 98111 22334',
    userAddress: 'Flat 502, Tower B, ATS Greens, Noida',
    clientAddress: 'Flat 502, Tower B, ATS Greens, Noida',
    service: 'Deep Cleaning',
    workerId: 'w-103',
    workerName: 'Sunita Devi',
    workerPhone: '+91 94567 89012',
    status: 'completed',
    date: 'Oct 28, 2026',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    amount: 600,
    notes: 'Complete 2BHK flat sanitization before festival',
    rating: 5,
    review: 'House was left spotless. Very punctual and respectful!',
    trackingSteps: [
      { label: 'Booking Confirmed', done: true, time: '10:00 AM' },
      { label: 'Worker Assigned (Sunita D.)', done: true, time: '10:05 AM' },
      { label: 'On the Way', done: true, time: '10:20 AM' },
      { label: 'Work in Progress', done: true, time: '10:45 AM' },
      { label: 'Completed & Payment Released', done: true, time: '1:30 PM' }
    ]
  },
  {
    id: 'NK-0040',
    _id: 'NK-0040',
    bookingNumber: 'NK-0040',
    userId: 'u-1',
    clientId: 'u-1',
    userName: 'Divyanshu Sharma',
    clientName: 'Divyanshu Sharma',
    userPhone: '+91 98765 43210',
    clientPhone: '+91 98765 43210',
    userAddress: 'Block 4, Sector 12, Noida, UP',
    clientAddress: 'Block 4, Sector 12, Noida, UP',
    service: 'Electrical Work',
    workerId: 'w-104',
    workerName: 'Mohan Yadav',
    workerPhone: '+91 93456 78901',
    status: 'completed',
    date: 'Oct 15, 2026',
    createdAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    amount: 380,
    notes: 'MCB tripping repeatedly in main bedroom circuit',
    rating: 5,
    review: 'Resolved root cause quickly without extra part cost.',
    trackingSteps: [
      { label: 'Booking Confirmed', done: true, time: '3:00 PM' },
      { label: 'Worker Assigned (Mohan Y.)', done: true, time: '3:05 PM' },
      { label: 'On the Way', done: true, time: '3:20 PM' },
      { label: 'Work in Progress', done: true, time: '3:35 PM' },
      { label: 'Completed & Payment Released', done: true, time: '4:20 PM' }
    ]
  }
];


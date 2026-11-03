/**
 * NAKKO Backend - Booking & Service Request Model
 * Mongoose Schema & in-memory seed fallback
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true },
  service: { type: String, required: true },
  clientId: { type: String, default: 'u-1' },
  clientName: { type: String, default: 'Divyanshu Sharma' },
  workerId: { type: String, default: 'w-101' },
  workerName: { type: String, default: 'Ramesh Kumar' },
  date: { type: String, default: 'Today' },
  time: { type: String, default: 'Immediate' },
  address: { type: String, default: 'Sector 62, Noida' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'in_progress'
  },
  amount: { type: Number, required: true },
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'refunded'],
    default: 'held'
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const memoryBookings = [
  {
    id: 'b-42',
    _id: 'b-42',
    bookingNumber: '#NK-0042',
    service: 'Plumbing Repair',
    clientId: 'u-1',
    clientName: 'Divyanshu Sharma',
    workerId: 'w-101',
    workerName: 'Ramesh Kumar',
    date: 'Today, 2:30 PM',
    time: '2:30 PM',
    address: 'B-12, Sector 62, Noida',
    status: 'in_progress',
    amount: 450,
    escrowStatus: 'held',
    notes: 'Kitchen sink pipe leaking under the counter.'
  },
  {
    id: 'b-41',
    _id: 'b-41',
    bookingNumber: '#NK-0041',
    service: 'Full Home Cleaning',
    clientId: 'u-2',
    clientName: 'Priya Sharma',
    workerId: 'w-102',
    workerName: 'Sunita Devi',
    date: 'Yesterday',
    time: '10:00 AM',
    address: 'Flat 402, Sector 18, Noida',
    status: 'completed',
    amount: 600,
    escrowStatus: 'released',
    notes: 'Deep cleaning before housewarming.'
  },
  {
    id: 'b-40',
    _id: 'b-40',
    bookingNumber: '#NK-0040',
    service: 'Electrical Fan & Switch Repair',
    clientId: 'u-1',
    clientName: 'Divyanshu Sharma',
    workerId: 'w-103',
    workerName: 'Mohan Yadav',
    date: '28 Oct 2026',
    time: '4:00 PM',
    address: 'B-12, Sector 62, Noida',
    status: 'completed',
    amount: 380,
    escrowStatus: 'released',
    notes: 'Ceiling fan humming noise.'
  },
  {
    id: 'b-39',
    _id: 'b-39',
    bookingNumber: '#NK-0039',
    service: 'Garden Trimming & Weed Removal',
    clientId: 'u-3',
    clientName: 'Aditya Menon',
    workerId: 'w-104',
    workerName: 'Lakshmi Narayan',
    date: '24 Oct 2026',
    time: '8:00 AM',
    address: 'Sector 50, Noida',
    status: 'completed',
    amount: 350,
    escrowStatus: 'released',
    notes: 'Trimming hedge plants.'
  }
];

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

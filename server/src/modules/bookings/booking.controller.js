/**
 * NAKKO Backend - Booking Controller
 * Manages gig service requests, fair worker matching & escrow lifecycle
 */

import { Booking, memoryBookings } from './booking.model.js';
import { memoryWorkers } from '../workers/worker.model.js';
import mongoose from 'mongoose';

export async function getBookings(req, res) {
  const { clientId, workerId, status } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (clientId) query.clientId = clientId;
      if (workerId) query.workerId = workerId;
      if (status) query.status = status;

      const bookings = await Booking.find(query).sort({ createdAt: -1 });
      if (bookings && bookings.length > 0) {
        return res.json({ success: true, count: bookings.length, data: bookings });
      }
    } catch (err) {
      console.warn('[Booking Controller] DB query error, using memory fallback:', err.message);
    }
  }

  let filtered = [...memoryBookings];
  if (clientId) filtered = filtered.filter(b => b.clientId === clientId);
  if (workerId) filtered = filtered.filter(b => b.workerId === workerId);
  if (status) filtered = filtered.filter(b => b.status === status);

  return res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
}

export async function getBookingById(req, res) {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    try {
      const booking = await Booking.findById(id);
      if (booking) return res.json({ success: true, data: booking });
    } catch (err) {
      // Fallback
    }
  }

  const booking = memoryBookings.find(b => b.id === id || b._id === id || b.bookingNumber === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
  }

  return res.json({ success: true, data: booking });
}

export async function createBooking(req, res) {
  const {
    service,
    clientId,
    clientName,
    workerId,
    address,
    date,
    time,
    amount,
    notes
  } = req.body;

  if (!service || !address) {
    return res.status(400).json({
      success: false,
      message: 'Service category and service address are required.'
    });
  }

  // Server-side Worker Allocation / Matching
  let assignedWorker = null;
  if (workerId) {
    assignedWorker = memoryWorkers.find(w => w.id === workerId || w._id === workerId);
  }

  if (!assignedWorker) {
    // Fair allocation: find available worker matching service trade or first available
    assignedWorker = memoryWorkers.find(w => w.isAvailable && service.toLowerCase().includes(w.trade.toLowerCase()))
      || memoryWorkers.find(w => w.isAvailable)
      || memoryWorkers[0];
  }

  const bookingNum = `#NK-${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingAmount = Number(amount) || (assignedWorker ? assignedWorker.hourlyRate : 350);

  const newBooking = {
    id: `b-${Date.now()}`,
    _id: `b-${Date.now()}`,
    bookingNumber: bookingNum,
    service: service.trim(),
    clientId: clientId || 'u-1',
    clientName: clientName || 'Divyanshu Sharma',
    workerId: assignedWorker ? (assignedWorker.id || assignedWorker._id) : 'w-101',
    workerName: assignedWorker ? assignedWorker.name : 'Ramesh Kumar',
    date: date || 'Today',
    time: time || 'Immediate',
    address: address.trim(),
    status: 'in_progress',
    amount: bookingAmount,
    escrowStatus: 'held',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  if (mongoose.connection.readyState === 1) {
    try {
      await Booking.create(newBooking);
    } catch (err) {
      console.warn('[Booking Controller] DB save error, saved in memory:', err.message);
    }
  }

  memoryBookings.unshift(newBooking);

  return res.status(201).json({
    success: true,
    message: 'Service request booked successfully. Escrow held securely.',
    data: newBooking
  });
}

export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const booking = memoryBookings.find(b => b.id === id || b._id === id || b.bookingNumber === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
  }

  booking.status = status;
  if (status === 'completed') {
    booking.escrowStatus = 'released';
  } else if (status === 'cancelled') {
    booking.escrowStatus = 'refunded';
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Booking.findByIdAndUpdate(booking._id, {
        status: booking.status,
        escrowStatus: booking.escrowStatus
      });
    } catch (err) {
      // Fallback
    }
  }

  return res.json({
    success: true,
    message: `Booking ${booking.bookingNumber} status updated to ${status}.`,
    data: booking
  });
}


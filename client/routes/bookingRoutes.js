/**
 * NAKKO Platform - Service & Booking API Routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/services - List available gig services
router.get('/services', (req, res) => {
  res.json({
    success: true,
    data: store.getServices()
  });
});

// GET /api/bookings - Get list of bookings
router.get('/bookings', (req, res) => {
  const { status, role } = req.query;
  let list = store.getBookings();
  if (status) {
    list = list.filter(b => b.status === status);
  }
  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// GET /api/bookings/:id - Single booking details with tracking
router.get('/bookings/:id', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({
    success: true,
    data: booking
  });
});

// POST /api/bookings - Create new service booking
router.post('/bookings', (req, res) => {
  const { service, address, scheduledTime, notes, workerId } = req.body;

  if (!service) {
    return res.status(400).json({ success: false, message: 'Service category is required' });
  }

  const newBooking = store.createBooking({
    service,
    address,
    scheduledTime,
    notes,
    workerId
  });

  res.status(201).json({
    success: true,
    message: `${service} booking confirmed! Worker has been assigned.`,
    data: newBooking
  });
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const updated = store.updateBookingStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({
    success: true,
    message: `Booking #${req.params.id} updated to ${status}`,
    data: updated
  });
});

module.exports = router;


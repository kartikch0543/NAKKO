/**
 * NAKKO Backend - Booking Routes
 */

import express from 'express';
import { getBookings, getBookingById, createBooking, updateBookingStatus } from './booking.controller.js';

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.put('/:id/status', updateBookingStatus);

export default router;

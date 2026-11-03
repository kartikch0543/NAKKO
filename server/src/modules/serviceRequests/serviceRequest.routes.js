/**
 * NAKKO Platform - Service Request / Bookings Routes
 */

import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  declineBooking
} from './serviceRequest.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuthenticate);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/decline', declineBooking);

export default router;


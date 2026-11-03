/**
 * NAKKO Platform - Payments Routes
 */

import { Router } from 'express';
import { createPaymentOrder, verifyPayment, handleWebhook } from './payment.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/create-order', optionalAuthenticate, createPaymentOrder);
router.post('/verify', optionalAuthenticate, verifyPayment);
router.post('/webhook', handleWebhook);

export default router;


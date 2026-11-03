/**
 * NAKKO Platform - Client Routes
 */

import { Router } from 'express';
import { getClientPayments, getClientProfile } from './client.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/profile', getClientProfile);
router.get('/payments', getClientPayments);

export default router;


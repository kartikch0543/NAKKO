/**
 * NAKKO Platform - Client Routes
 */

import { Router } from 'express';
import { getClientPayments, getClientProfile, updateClientProfile } from './client.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/profile', getClientProfile);
router.patch('/profile', updateClientProfile);
router.get('/payments', getClientPayments);

export default router;

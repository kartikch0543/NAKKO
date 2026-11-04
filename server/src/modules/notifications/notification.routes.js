/**
 * NAKKO Platform - Notification Routes
 */

import { Router } from 'express';
import { sendNotification } from './notification.controller.js';

const router = Router();

router.post('/send', sendNotification);

export default router;


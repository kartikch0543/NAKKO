/**
 * NAKKO Platform - Admin & Developer Routes
 */

import { Router } from 'express';
import { getMetrics, getLogs, getConfig, updateConfig } from './admin.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuthenticate);

router.get('/metrics', getMetrics);
router.get('/logs', getLogs);
router.get('/config', getConfig);
router.post('/config', updateConfig);

export default router;

/**
 * NAKKO Backend - Admin Routes
 */

import express from 'express';
import { getMetrics, getLogs, getConfig, updateConfig } from './admin.controller.js';

const router = express.Router();

router.get('/metrics', getMetrics);
router.get('/logs', getLogs);
router.get('/config', getConfig);
router.post('/config', updateConfig);

export default router;


/**
 * NAKKO Backend - Worker Routes
 */

import express from 'express';
import { getWorkers, getWorkerById, updateAvailability, updateKyc } from './worker.controller.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.patch('/:id/availability', updateAvailability);
router.put('/:id/availability', updateAvailability);
router.patch('/:id/kyc', updateKyc);

export default router;

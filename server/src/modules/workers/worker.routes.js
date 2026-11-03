/**
 * NAKKO Platform - Worker Routes
 */

import { Router } from 'express';
import { getWorkers, getWorkerById, setAvailability, updateKycStatus, getEarnings } from './worker.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, getWorkers);
router.get('/:id', optionalAuthenticate, getWorkerById);
router.patch('/:id/availability', authenticate, setAvailability);
router.patch('/:id/kyc', authenticate, requireRole(['ADMIN', 'COOPERATIVE_ADMIN']), updateKycStatus);
router.get('/:id/earnings', authenticate, getEarnings);

export default router;

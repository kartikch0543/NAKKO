/**
 * NAKKO Platform - Cooperative Routes
 */

import { Router } from 'express';
import { getCooperatives, getCooperativeById } from './cooperative.controller.js';

const router = Router();

router.get('/', getCooperatives);
router.get('/:id', getCooperativeById);

export default router;


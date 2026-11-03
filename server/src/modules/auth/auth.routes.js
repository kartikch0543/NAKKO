/**
 * NAKKO Backend - Auth Routes
 */

import express from 'express';
import { login, register, getCurrentUser, logout } from './auth.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', logout);

export default router;


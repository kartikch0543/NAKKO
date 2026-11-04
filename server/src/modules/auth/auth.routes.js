/**
 * NAKKO Platform - Authentication Routes
 */

import { Router } from 'express';
import { login, register, getCurrentUser, changePassword, logout } from './auth.controller.js';
import { updateClientProfile } from '../clients/client.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();

router.post('/login', validateBody(['email', 'password']), login);
router.post('/register', validateBody(['email', 'password']), register);
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateClientProfile);
router.post('/change-password', authenticate, validateBody(['currentPassword', 'newPassword']), changePassword);
router.post('/logout', logout);

export default router;

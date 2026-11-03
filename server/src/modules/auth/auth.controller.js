/**
 * NAKKO Platform - Authentication Controller
 * Delegates request processing to AuthService
 */

import { AuthService } from './auth.service.js';

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const result = await AuthService.login({ email, password, role });
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { name, firstName, lastName, email, password, role, phone, skill, experience, cooperativeId } = req.body;
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'NAKKO Member';

    const result = await AuthService.register({
      name: fullName,
      email,
      password,
      role,
      phone,
      skill,
      experience,
      cooperativeId
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const user = await AuthService.findUserById(req.user.id);
    if (!user) {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: String(user._id || user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        kycStatus: user.kycStatus
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Session cleared successfully'
  });
}

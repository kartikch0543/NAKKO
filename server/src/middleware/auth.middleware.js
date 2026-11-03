/**
 * NAKKO Platform - JWT Authentication Middleware
 * Real cryptographically verified JWT tokens using jsonwebtoken
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { UnauthorizedError } from '../shared/errors/AppError.js';
import { normalizeRole } from '../shared/constants/roles.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Malformed authorization header.');
    }

    try {
      // Verify JWT signature using server secret
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = {
        id: decoded.id || decoded.sub || decoded._id,
        _id: decoded.id || decoded.sub || decoded._id,
        email: decoded.email,
        role: normalizeRole(decoded.role),
        name: decoded.name,
        cooperativeId: decoded.cooperativeId || null
      };
      return next();
    } catch (jwtErr) {
      // If token verification fails with jsonwebtoken, check if it's an expired token
      if (jwtErr.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid authentication token signature.');
    }
  } catch (err) {
    return next(err);
  }
}

/**
 * Optional authentication middleware: if token is present, verifies it, otherwise continues unauthenticated
 */
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.sub || decoded._id,
      _id: decoded.id || decoded.sub || decoded._id,
      email: decoded.email,
      role: normalizeRole(decoded.role),
      name: decoded.name,
      cooperativeId: decoded.cooperativeId || null
    };
  } catch (e) {
    // Silently ignore optional token parse errors
  }
  return next();
}


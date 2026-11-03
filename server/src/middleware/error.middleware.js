/**
 * NAKKO Platform - Centralized Error Handler & 404 Handler
 */

import { AppError } from '../shared/errors/AppError.js';
import { env } from '../config/environment.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
}

export function errorHandler(err, req, res, next) {
  // Normalize operational AppErrors vs unexpected runtime exceptions
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const code = err.code || (err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected internal server error occurred.';
  const details = err.details || [];

  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err);
  }

  const response = {
    success: false,
    message,
    code,
    ...(details.length > 0 && { errors: details }),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
  };

  res.status(statusCode).json(response);
}


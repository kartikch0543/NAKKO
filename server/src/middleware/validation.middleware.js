/**
 * NAKKO Platform - Request Validation Middleware
 */

import { ValidationError } from '../shared/errors/AppError.js';

export function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = [];
    const body = req.body || {};

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(new ValidationError(`Missing required field(s): ${missing.join(', ')}`, missing));
    }

    next();
  };
}


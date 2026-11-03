/**
 * NAKKO Platform - Transaction Validation & Idempotency Service
 */

import { ConflictError, ValidationError } from '../../shared/errors/AppError.js';

// Cache for processed idempotency keys: key -> result payload
const idempotencyStore = new Map();

export class ValidationService {
  /**
   * Enforces idempotency for sensitive operations
   */
  static checkIdempotency(key) {
    if (!key) return null;
    if (idempotencyStore.has(key)) {
      return idempotencyStore.get(key);
    }
    return null;
  }

  static recordIdempotency(key, result) {
    if (key) {
      idempotencyStore.set(key, result);
    }
  }

  static validateOrderPayload({ amount, currency = 'INR', bookingId }) {
    if (!amount || amount <= 0) {
      throw new ValidationError('Valid positive amount is required for payment.');
    }
    if (!bookingId) {
      throw new ValidationError('bookingId is required to associate payment with service.');
    }
    return true;
  }
}


/**
 * NAKKO Platform - Role-Based Authorization Middleware
 */

import { ForbiddenError, UnauthorizedError } from '../shared/errors/AppError.js';
import { normalizeRole } from '../shared/constants/roles.js';

export function requireRole(allowedRoles = []) {
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required to perform this action.'));
    }

    const userRole = normalizeRole(req.user.role);

    // ADMIN has superuser privileges across administrative routes
    if (userRole === 'ADMIN') {
      return next();
    }

    if (!normalizedAllowed.includes(userRole)) {
      return next(new ForbiddenError(`Forbidden: Access requires one of [${allowedRoles.join(', ')}] role(s).`));
    }

    return next();
  };
}


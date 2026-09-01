/**
 * Role-Based Authorization Middleware
 *
 * Guards routes so only users with specific roles can access them.
 * Must be placed AFTER the `authenticate` middleware in the route chain.
 *
 * Usage:
 *   router.patch('/tickets/:id/assignee', authenticate, authorize('ADMIN'), handler);
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Creates a middleware that only allows access for the given roles.
 * Rejects with 401 if not authenticated, or 403 if the user's role doesn't match.
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}

import type { Request, Response, NextFunction } from 'express';
import { getPool } from '../database/pool.js';
import { UnauthorizedError, ForbiddenError } from '../common/errors/AppError.js';
import type { UserRole } from '../modules/auth/models/user.model.js';

export const VALID_USER_ROLES: UserRole[] = ['learner', 'educator', 'admin'];

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the required roles.
 * Includes real-time database role freshness verification to prevent stale JWT privilege escalation.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth?.userId) {
      return next(new UnauthorizedError('Authentication required to access this resource'));
    }

    const tokenRole = req.auth.role as UserRole | undefined;

    // Fast-path role check from verified token payload
    if (!tokenRole || !allowedRoles.includes(tokenRole)) {
      return next(new ForbiddenError('You do not have the required permissions to perform this action.'));
    }

    // Role Freshness Strategy:
    // If the required role involves elevated administrative privileges ('admin'),
    // query the database directly to confirm the role hasn't been revoked or demoted since token issuance.
    if (allowedRoles.includes('admin')) {
      try {
        const result = await getPool().query<{ role: string }>(
          'SELECT role FROM users WHERE id = $1;',
          [req.auth.userId]
        );

        if (result.rows.length === 0) {
          return next(new UnauthorizedError('User account not found'));
        }

        const currentDbRole = result.rows[0].role as UserRole;
        if (!allowedRoles.includes(currentDbRole)) {
          // Update request context to reflect newly revoked role
          req.auth.role = currentDbRole;
          return next(new ForbiddenError('Administrative permissions have been revoked. Please re-authenticate.'));
        }

        req.auth.role = currentDbRole;
      } catch (err) {
        return next(err);
      }
    }

    next();
  };
}

/**
 * Convenient shorthand for requiring admin privileges.
 */
export const requireAdmin = requireRole('admin');

/**
 * Ownership authorization middleware.
 * Enforces that an authenticated user can only access or modify resources belonging to themselves.
 * Administrators are permitted access to support operational management.
 *
 * @param paramKey The route parameter key holding the target user ID (e.g., 'userId'). Defaults to 'userId'.
 */
export function requireOwnership(paramKey: string = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth?.userId) {
      return next(new UnauthorizedError('Authentication required to access this resource'));
    }

    const targetUserId = req.params[paramKey];
    if (!targetUserId) {
      return next(new ForbiddenError('Target user identifier not specified in request'));
    }

    // 1. Direct ownership match
    if (req.auth.userId === targetUserId) {
      return next();
    }

    // 2. Administrative override
    if (req.auth.role === 'admin') {
      return next();
    }

    // 3. Unauthorized access attempt across user boundaries
    return next(new ForbiddenError('Access denied: You do not have permission to access another user\'s private data.'));
  };
}

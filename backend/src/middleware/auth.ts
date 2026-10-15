import type { Request, Response, NextFunction } from 'express';
import {
  authContextMiddleware,
  requireAuth as coreRequireAuth,
  type AuthContext
} from '../common/middleware/authContext.js';

export { authContextMiddleware, type AuthContext };

/**
 * Route protection middleware requiring verified authentication.
 * Passes through for authenticated users; rejects anonymous callers with 401 Unauthorized.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  return coreRequireAuth(req, res, next);
}

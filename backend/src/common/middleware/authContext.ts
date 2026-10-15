import type { Request, Response, NextFunction } from 'express';
import { config } from '../../config/index.js';

export interface AuthContext {
  userId: string;
  isDevAuth?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext | null;
    }
  }
}

/**
 * Authentication Context Middleware
 *
 * Resolves caller identity with strict environment-level security:
 * - Production: Unverified headers are strictly ignored and rejected (req.auth = null).
 *   Real authenticated sessions are deferred to Task 17 (Google OAuth / verified JWT).
 * - Development / Test: Allows an explicitly isolated 'X-Dev-User-Id' header solely
 *   to exercise authenticated persistence flows during automated integration tests.
 */
export function authContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Production safeguard: never accept client-supplied identity
  if (config.isProduction) {
    req.auth = null;
    return next();
  }

  // Development / Test only: isolated dev header for automated verification
  const devUserId = req.headers['x-dev-user-id'];
  if (typeof devUserId === 'string' && devUserId.trim().length > 0) {
    req.auth = {
      userId: devUserId.trim(),
      isDevAuth: true
    };
    return next();
  }

  req.auth = null;
  next();
}

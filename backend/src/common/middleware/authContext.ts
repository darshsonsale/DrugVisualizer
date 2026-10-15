import type { Request, Response, NextFunction } from 'express';
import { config } from '../../config/index.js';
import { authService } from '../../modules/auth/services/auth.service.js';
import { UnauthorizedError } from '../errors/AppError.js';

export interface AuthContext {
  userId: string;
  email?: string;
  role?: string;
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
 * Resolves caller identity:
 * 1. Checks 'Authorization: Bearer <jwt>' header. Verifies token cryptographically.
 *    If an invalid/expired token is provided, returns HTTP 401 Unauthorized.
 * 2. If no Bearer token and in non-production environment: allows 'X-Dev-User-Id'
 *    bridge to preserve backward-compatible automated integration testing.
 * 3. Otherwise: defaults caller to anonymous ('req.auth = null').
 */
export function authContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  // 1. Process Bearer token if supplied
  if (typeof authHeader === 'string' && authHeader.trim().length > 0) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const token = parts[1].trim();
      try {
        const payload = authService.verifySessionToken(token);
        req.auth = {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          isDevAuth: false
        };
        return next();
      } catch (err: any) {
        return next(err);
      }
    } else {
      return next(new UnauthorizedError('Invalid authorization header format. Expected "Bearer <token>"'));
    }
  }

  // 2. Non-production development bridge for automated testing
  if (!config.isProduction) {
    const devUserId = req.headers['x-dev-user-id'];
    if (typeof devUserId === 'string' && devUserId.trim().length > 0) {
      req.auth = {
        userId: devUserId.trim(),
        isDevAuth: true
      };
      return next();
    }
  }

  // 3. Anonymous caller
  req.auth = null;
  next();
}

/**
 * Route protection middleware requiring authenticated context.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth?.userId) {
    return next(new UnauthorizedError('Authentication required to access this resource'));
  }
  next();
}

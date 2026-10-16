import { Router, type Request, type Response } from 'express';
import { authController } from './controllers/auth.controller.js';
import type { ApiResponse } from '../../common/types/index.js';
import { sensitiveRateLimiter, adminRateLimiter, validateBody } from '../../middleware/index.js';
import { googleVerifyBodySchema, loginBodySchema, registerBodySchema } from '../../validation/index.js';

export const authRouter: Router = Router();

// POST /api/v1/auth/register - Register new user with username, email, and password
authRouter.post(
  '/register',
  sensitiveRateLimiter,
  validateBody(registerBodySchema),
  (req, res, next) => authController.register(req, res, next)
);

// POST /api/v1/auth/login - Regular user login with email and password
authRouter.post(
  '/login',
  sensitiveRateLimiter,
  validateBody(loginBodySchema),
  (req, res, next) => authController.login(req, res, next)
);

// POST /api/v1/auth/admin/login - Dedicated administrator login with strict role enforcement
authRouter.post(
  '/admin/login',
  adminRateLimiter,
  validateBody(loginBodySchema),
  (req, res, next) => authController.loginAdmin(req, res, next)
);

// GET /api/v1/auth/google/url - Obtain Google OAuth 2.0 consent URL with CSRF state
authRouter.get('/google/url', sensitiveRateLimiter, (req, res, next) =>
  authController.getGoogleAuthUrl(req, res, next)
);

// GET /api/v1/auth/google/callback - Process Google OAuth 2.0 redirect callback
authRouter.get('/google/callback', (req, res, next) => authController.handleGoogleCallback(req, res, next));

// POST /api/v1/auth/google/verify - Authenticate via Google Identity Services (GIS) ID Token
authRouter.post(
  '/google/verify',
  sensitiveRateLimiter,
  validateBody(googleVerifyBodySchema),
  (req, res, next) => authController.verifyGoogleIdToken(req, res, next)
);

// GET /api/v1/auth/me - Retrieve current authenticated user profile
authRouter.get('/me', (req, res, next) => authController.getMe(req, res, next));

// POST /api/v1/auth/logout - Terminate current session
authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));

// GET /api/v1/auth/ - Module status
authRouter.get('/', (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'auth',
      status: 'operational',
      description: 'Authentication, Google OAuth 2.0 & OIDC identity module'
    },
    meta: {
      timestamp
    }
  };
  res.status(200).json(response);
});

import { Router, type Request, type Response } from 'express';
import { authController } from './controllers/auth.controller.js';
import type { ApiResponse } from '../../common/types/index.js';

export const authRouter: Router = Router();

// GET /api/v1/auth/google/url - Obtain Google OAuth 2.0 consent URL with CSRF state
authRouter.get('/google/url', (req, res, next) => authController.getGoogleAuthUrl(req, res, next));

// GET /api/v1/auth/google/callback - Process Google OAuth 2.0 redirect callback
authRouter.get('/google/callback', (req, res, next) => authController.handleGoogleCallback(req, res, next));

// POST /api/v1/auth/google/verify - Authenticate via Google Identity Services (GIS) ID Token
authRouter.post('/google/verify', (req, res, next) => authController.verifyGoogleIdToken(req, res, next));

// GET /api/v1/auth/me - Retrieve current authenticated user profile
authRouter.get('/me', (req, res, next) => authController.getMe(req, res, next));

// POST /api/v1/auth/logout - Terminate current session
authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));

// GET /api/v1/auth/ - Module status
authRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'auth',
      status: 'operational',
      description: 'Authentication, Google OAuth 2.0 & OIDC identity module'
    }
  };
  res.status(200).json(response);
});

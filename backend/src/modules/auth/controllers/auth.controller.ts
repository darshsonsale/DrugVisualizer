import type { Request, Response, NextFunction } from 'express';
import { authService, toUserProfileDto } from '../services/auth.service.js';
import { UnauthorizedError, BadRequestError } from '../../../common/errors/AppError.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type {
  AuthSessionResponseDto,
  GoogleAuthUrlResponseDto,
  UserProfileDto
} from '../dto/auth.dto.js';

export class AuthController {
  /**
   * GET /api/v1/auth/google/url
   * Returns Google OAuth consent URL and CSRF state parameter.
   */
  public async getGoogleAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stateParam = typeof req.query.state === 'string' ? req.query.state : undefined;
      const data: GoogleAuthUrlResponseDto = authService.getGoogleAuthUrl(stateParam);
      const response: ApiResponse<GoogleAuthUrlResponseDto> = {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/google/callback
   * Processes OAuth 2.0 Authorization Code callback from Google.
   */
  public async handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const state = typeof req.query.state === 'string' ? req.query.state : '';

      if (!code) {
        throw new BadRequestError('Missing authorization code in query parameters');
      }

      const session: AuthSessionResponseDto = await authService.handleGoogleCallback(code, state);

      // If browser navigated directly (popup or redirect), deliver session via postMessage/redirect
      const acceptsHtml = req.headers['accept']?.includes('text/html');
      if (acceptsHtml && !req.xhr) {
        const safeSession = JSON.stringify(session);
        const html = `<!DOCTYPE html>
<html>
<head><title>Authentication Complete</title></head>
<body style="background:#0D141D;color:#E1E7EF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h3 style="color:#00E5FF;">Authentication Successful</h3>
    <p>Completing sign in, please wait...</p>
  </div>
  <script>
    const session = ${safeSession};
    if (window.opener) {
      window.opener.postMessage({ type: 'DRUG_VISUALIZER_AUTH_SUCCESS', session }, '*');
      window.close();
    } else {
      window.location.href = '/?auth_token=' + encodeURIComponent(session.token);
    }
  </script>
</body>
</html>`;
        res.status(200).type('html').send(html);
        return;
      }

      const response: ApiResponse<AuthSessionResponseDto> = {
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      const acceptsHtml = req.headers['accept']?.includes('text/html');
      if (acceptsHtml && !req.xhr) {
        const errorMsg = (err as Error).message || 'Authentication failed';
        const html = `<!DOCTYPE html>
<html>
<head><title>Authentication Failed</title></head>
<body style="background:#0D141D;color:#E1E7EF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h3 style="color:#FF5252;">Authentication Failed</h3>
    <p>${errorMsg}</p>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'DRUG_VISUALIZER_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
      setTimeout(() => window.close(), 3000);
    }
  </script>
</body>
</html>`;
        res.status(400).type('html').send(html);
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/google/verify
   * Authenticates user via Google Identity Services (GIS) ID Token.
   */
  public async verifyGoogleIdToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idToken = req.body?.id_token || req.body?.idToken;
      if (!idToken || typeof idToken !== 'string') {
        throw new BadRequestError('id_token is required in request body');
      }

      const session: AuthSessionResponseDto = await authService.authenticateWithGoogleIdToken(idToken);
      const response: ApiResponse<AuthSessionResponseDto> = {
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieves profile of current authenticated user.
   */
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError('Authentication required to retrieve user profile');
      }

      const user = await authService.getUserById(userId);
      const response: ApiResponse<UserProfileDto> = {
        success: true,
        data: toUserProfileDto(user),
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Safe logout endpoint to signal session termination.
   */
  public async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: 'Logged out successfully'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

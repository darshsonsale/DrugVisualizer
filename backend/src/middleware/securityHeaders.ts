/**
 * Drug Path Visualiser - Security Headers Middleware
 * Injects OWASP defense-in-depth HTTP security headers into all responses.
 */

import type { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/security.js';

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Remove Express fingerprint
  res.removeHeader('X-Powered-By');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', securityConfig.headers.contentTypeOptions);

  // Clickjacking protection (compatible with Google OAuth popups)
  res.setHeader('X-Frame-Options', securityConfig.headers.frameOptions);

  // Modern browsers: disable legacy buggy XSS auditor
  res.setHeader('X-XSS-Protection', '0');

  // Referrer information leakage prevention
  res.setHeader('Referrer-Policy', securityConfig.headers.referrerPolicy);

  // Disable sensitive hardware APIs
  res.setHeader('Permissions-Policy', securityConfig.headers.permissionsPolicy);

  // Restrict resource loading locations
  res.setHeader('Content-Security-Policy', securityConfig.headers.contentSecurityPolicy);

  // Enforce HTTPS if configured in production
  if (securityConfig.headers.strictTransportSecurity) {
    res.setHeader('Strict-Transport-Security', securityConfig.headers.strictTransportSecurity);
  }

  next();
}

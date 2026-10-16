/**
 * Drug Path Visualiser - Security Configuration
 * Centralized security settings, rate limit profiles, headers, and CORS rules.
 */

import { config } from './env.js';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface SecurityConfig {
  maxBodySizeBytes: number;
  maxBodySizeStr: string;
  rateLimits: {
    standard: RateLimitConfig;
    sensitive: RateLimitConfig;
    admin: RateLimitConfig;
  };
  headers: {
    contentSecurityPolicy: string;
    contentTypeOptions: string;
    frameOptions: string;
    referrerPolicy: string;
    permissionsPolicy: string;
    strictTransportSecurity?: string;
  };
}

const isProd = config.isProduction;

export const securityConfig: SecurityConfig = Object.freeze({
  maxBodySizeBytes: 100 * 1024, // 100 KB
  maxBodySizeStr: '100kb',

  rateLimits: Object.freeze({
    // Standard public endpoints (drug explorer, pathways, public content)
    standard: Object.freeze({
      windowMs: Number(process.env.RATE_LIMIT_STANDARD_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      maxRequests: Number(process.env.RATE_LIMIT_STANDARD_MAX) || 300,
      message: 'Too many requests from this client. Please slow down.'
    }),

    // Sensitive endpoints (OAuth verification, quiz submissions, progress writes)
    sensitive: Object.freeze({
      windowMs: Number(process.env.RATE_LIMIT_SENSITIVE_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
      maxRequests: Number(process.env.RATE_LIMIT_SENSITIVE_MAX) || 45,
      message: 'Too many sensitive requests from this client. Please wait before retrying.'
    }),

    // Admin endpoints (privilege elevation, content editing, user management)
    admin: Object.freeze({
      windowMs: Number(process.env.RATE_LIMIT_ADMIN_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
      maxRequests: Number(process.env.RATE_LIMIT_ADMIN_MAX) || (config.isDevelopment ? 1000 : 300),
      message: 'Too many administrative requests. Access temporarily restricted.'
    })
  }),

  headers: Object.freeze({
    contentSecurityPolicy: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' http://localhost:5173 http://localhost:5174 http://localhost:3000 http://127.0.0.1:5173 http://127.0.0.1:5174 http://127.0.0.1:3000 ws://localhost:5173 ws://localhost:5174 https://accounts.google.com",
      "frame-src https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; '),

    contentTypeOptions: 'nosniff',
    frameOptions: 'SAMEORIGIN',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
    strictTransportSecurity: isProd ? 'max-age=31536000; includeSubDomains' : undefined
  })
});

/**
 * Drug Path Visualiser - In-Memory Rate Limiting Middleware
 * Zero-dependency sliding window rate limiter for API protection and abuse prevention.
 */

import type { Request, Response, NextFunction } from 'express';
import { securityConfig, type RateLimitConfig } from '../config/security.js';
import { RateLimitError } from '../errors/index.js';

interface ClientRecord {
  timestamps: number[];
}

export function createRateLimiter(options: Partial<RateLimitConfig> = {}) {
  const windowMs = options.windowMs || securityConfig.rateLimits.standard.windowMs;
  const maxRequests = options.maxRequests || securityConfig.rateLimits.standard.maxRequests;
  const message = options.message || securityConfig.rateLimits.standard.message;

  const clients = new Map<string, ClientRecord>();

  // Cleanup expired client tracking records every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        clients.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval to allow clean node process shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Resolve client identifier (proxy-aware IP or remote socket)
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let record = clients.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      clients.set(clientIp, record);
    }

    // Filter timestamps within current sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTimeMs = oldestTimestamp + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    // Standard draft RFC 6585 & IETF RateLimit Headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', retryAfterSeconds);

    if (currentCount >= maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return next(new RateLimitError(message, retryAfterSeconds));
    }

    record.timestamps.push(now);
    next();
  };
}

export const standardRateLimiter = createRateLimiter(securityConfig.rateLimits.standard);
export const sensitiveRateLimiter = createRateLimiter(securityConfig.rateLimits.sensitive);
export const adminRateLimiter = createRateLimiter(securityConfig.rateLimits.admin);

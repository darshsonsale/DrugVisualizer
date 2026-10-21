/**
 * Drug Path Visualiser (BioLumen) - Task 26 Rate Limiting & Security Middleware Suite
 *
 * Verifies:
 * 1. Standard rate limiting headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset) are present.
 * 2. Sensitive rate limiting middleware throttles excessive requests with HTTP 429 and Retry-After.
 * 3. OWASP security headers are present and configured to recommended values:
 *    - X-Content-Type-Options: nosniff
 *    - X-Frame-Options: SAMEORIGIN
 *    - X-XSS-Protection: 0
 *    - Referrer-Policy: strict-origin-when-cross-origin
 *    - Content-Security-Policy: default-src 'self'
 *    - Permissions-Policy
 *    - X-Powered-By strictly stripped
 * 4. CORS restricts unauthorized cross-origin requests.
 */

import express from 'express';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  requestApi,
  createAssertionCollector,
  type SecurityAssertionCollector
} from '../api/securityApiHelper.js';
import { createRateLimiter } from '../../src/middleware/rateLimiter.js';
import { errorHandler } from '../../src/common/middleware/errorHandler.js';

export async function runRateLimitingMiddlewareTests(baseUrl: string, collector?: SecurityAssertionCollector) {
  const { assert, getSummary } = collector || createAssertionCollector('Rate Limiting & Security Middleware');

  console.log('\n--- [Suite 5: Rate Limiting & Security Middleware] ---');

  // 1. OWASP Security Headers Verification
  const rootRes = await requestApi(baseUrl, '/');
  assert(rootRes.status === 200, 'Root status check returns HTTP 200');

  // 1.1 Server fingerprint protection
  assert(
    rootRes.headers['x-powered-by'] === undefined,
    'X-Powered-By header is strictly removed (Zero Server Fingerprinting)'
  );

  // 1.2 MIME sniffing protection
  assert(
    rootRes.headers['x-content-type-options'] === 'nosniff',
    'X-Content-Type-Options is "nosniff"'
  );

  // 1.3 Clickjacking protection
  assert(
    rootRes.headers['x-frame-options'] === 'SAMEORIGIN',
    'X-Frame-Options is "SAMEORIGIN"'
  );

  // 1.4 Modern XSS auditor policy
  assert(
    rootRes.headers['x-xss-protection'] === '0',
    'X-XSS-Protection is "0" per modern OWASP standard'
  );

  // 1.5 Referrer policy
  assert(
    rootRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin',
    'Referrer-Policy is "strict-origin-when-cross-origin"'
  );

  // 1.6 Content-Security-Policy
  assert(
    typeof rootRes.headers['content-security-policy'] === 'string' &&
      rootRes.headers['content-security-policy'].includes("default-src 'self'"),
    'Content-Security-Policy is set with "default-src \'self\'"'
  );

  // 1.7 Permissions-Policy
  assert(
    typeof rootRes.headers['permissions-policy'] === 'string' &&
      rootRes.headers['permissions-policy'].includes('camera=()'),
    'Permissions-Policy header is active and restricts device features'
  );

  // 2. Standard Rate Limiter Headers on Public API
  const publicRes = await requestApi(baseUrl, '/api/v1/drugs');
  assert(publicRes.status === 200, 'GET /api/v1/drugs returns HTTP 200');
  assert(
    publicRes.headers['ratelimit-limit'] !== undefined,
    'RateLimit-Limit header is present on API responses'
  );
  assert(
    publicRes.headers['ratelimit-remaining'] !== undefined,
    'RateLimit-Remaining header is present on API responses'
  );
  assert(
    publicRes.headers['ratelimit-reset'] !== undefined,
    'RateLimit-Reset header is present on API responses'
  );

  // 3. Rate Limiter Threshold Enforcement (Isolated Micro Limiter)
  const testApp = express();
  const testLimiter = createRateLimiter({
    windowMs: 4000,
    maxRequests: 3,
    message: 'Test rate limit reached'
  });
  testApp.get('/test-rate', testLimiter, (_req, res) => {
    res.status(200).json({ success: true });
  });
  testApp.use(errorHandler);

  const testServer = http.createServer(testApp);
  await new Promise<void>((resolve) => testServer.listen(0, '127.0.0.1', () => resolve()));
  const testAddress = testServer.address() as AddressInfo;
  const testUrl = `http://127.0.0.1:${testAddress.port}`;

  const r1 = await requestApi(testUrl, '/test-rate');
  const r2 = await requestApi(testUrl, '/test-rate');
  const r3 = await requestApi(testUrl, '/test-rate');
  assert(
    r1.status === 200 && r2.status === 200 && r3.status === 200,
    'Requests within rate limit succeed with HTTP 200'
  );

  const r4 = await requestApi(testUrl, '/test-rate');
  assert(
    r4.status === 429,
    'Request exceeding rate limit threshold blocked with HTTP 429 Too Many Requests',
    r4.body
  );
  assert(
    r4.body?.error?.code === 'RATE_LIMIT_EXCEEDED',
    'Rate limited response returns code RATE_LIMIT_EXCEEDED'
  );
  assert(
    r4.headers['retry-after'] !== undefined,
    'Retry-After header included on HTTP 429 response'
  );

  testServer.close();

  // 4. CORS Restrictions Verification
  // Unauthorized origin probe
  const corsBlockedRes = await requestApi(baseUrl, '/api/v1/drugs', {
    headers: {
      Origin: 'http://malicious-attacker-domain.xyz'
    }
  });

  const allowOriginHeader = corsBlockedRes.headers['access-control-allow-origin'];
  assert(
    allowOriginHeader !== 'http://malicious-attacker-domain.xyz',
    'CORS rejects unauthorized origin (Access-Control-Allow-Origin not granted to attacker)',
    `Allow-Origin header was: ${allowOriginHeader}`
  );

  return getSummary();
}

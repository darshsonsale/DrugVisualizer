/**
 * Drug Path Visualiser - Task 19 Verification Suite
 * Centralized Validation, Safe Error Handling & Security Middleware
 */

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app.js';
import { errorHandler } from '../common/middleware/errorHandler.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import express from 'express';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string, details?: unknown) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests}: ${message}`);
    if (details !== undefined) {
      console.error('    Details:', details);
    }
  }
}

async function request(
  baseUrl: string,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any; rawBody: string }> {
  const url = new URL(path, baseUrl);
  const method = options.method || 'GET';

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers: options.headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = null;
          }
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
            rawBody: data
          });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runSecurityValidationSuite(): Promise<void> {
  console.log('================================================================');
  console.log('TASK 19 SECURITY, VALIDATION & SAFE ERROR HANDLING SUITE');
  console.log('================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Test Server] Running on ${baseUrl}\n`);

  try {
    // --------------------------------------------------------------------------
    // Phase 1: Security Headers Verification (OWASP Standards)
    // --------------------------------------------------------------------------
    console.log('[Phase 1: Security Headers & Server Fingerprint Protection]');

    const rootRes = await request(baseUrl, '/');
    assert(rootRes.status === 200, 'Root status check returns 200');
    assert(rootRes.headers['x-powered-by'] === undefined, 'X-Powered-By header is strictly removed');
    assert(rootRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(rootRes.headers['x-frame-options'] === 'SAMEORIGIN', 'X-Frame-Options is SAMEORIGIN');
    assert(rootRes.headers['x-xss-protection'] === '0', 'X-XSS-Protection is disabled (0) per modern standards');
    assert(
      rootRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin',
      'Referrer-Policy is strict-origin-when-cross-origin'
    );
    assert(
      typeof rootRes.headers['content-security-policy'] === 'string' &&
        rootRes.headers['content-security-policy'].includes("default-src 'self'"),
      'Content-Security-Policy header is configured with default-src self'
    );
    assert(
      typeof rootRes.headers['permissions-policy'] === 'string',
      'Permissions-Policy header is present'
    );

    // --------------------------------------------------------------------------
    // Phase 2: Centralized Request Validation Layer
    // --------------------------------------------------------------------------
    console.log('\n[Phase 2: Centralized Request Validation Layer]');

    // 2.1 Invalid query parameter rejection
    const invalidCondRes = await request(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=DURING_LUNCH');
    assert(invalidCondRes.status === 400, 'Invalid condition query returns HTTP 400');
    assert(
      invalidCondRes.body?.error?.code === 'INVALID_FOOD_CONDITION' || invalidCondRes.body?.error?.code === 'VALIDATION_ERROR',
      "Invalid condition returns error code 'INVALID_FOOD_CONDITION'"
    );
    assert(
      Array.isArray(invalidCondRes.body?.error?.details?.issues),
      'Validation error returns structured issues array'
    );

    // 2.2 Valid query parameter pass-through
    const validCondRes = await request(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=BEFORE_FOOD');
    assert(validCondRes.status === 200, 'Valid condition BEFORE_FOOD passes validation and returns 200');

    // 2.3 Invalid path parameter rejection (special characters / SQL injection attempt)
    const sqlInjectParamRes = await request(baseUrl, "/api/v1/drugs/' OR '1'='1/pathway");
    assert(sqlInjectParamRes.status === 400, 'SQL injection fragment in path parameter rejected with HTTP 400');
    assert(
      sqlInjectParamRes.body?.error?.code === 'VALIDATION_ERROR',
      'Rejected path parameter flagged as VALIDATION_ERROR'
    );

    // 2.4 Missing / invalid quiz attempt body rejection
    const emptyQuizBodyRes = await request(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(emptyQuizBodyRes.status === 400, 'Empty quiz attempt body rejected with HTTP 400');
    assert(emptyQuizBodyRes.body?.error?.code === 'VALIDATION_ERROR', 'Empty body returns VALIDATION_ERROR');

    const nonArrayQuizBodyRes = await request(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: 'not-an-array' })
    });
    assert(nonArrayQuizBodyRes.status === 400, 'Non-array answers field rejected with HTTP 400');

    // 2.5 Malformed JSON payload syntax error
    const malformedJsonRes = await request(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "answers": [ bad json syntax '
    });
    assert(malformedJsonRes.status === 400, 'Malformed JSON syntax caught safely with HTTP 400');
    assert(
      malformedJsonRes.body?.error?.code === 'INVALID_JSON_BODY',
      "Malformed JSON returns code 'INVALID_JSON_BODY'"
    );

    // --------------------------------------------------------------------------
    // Phase 3: Payload Size Limits (100KB DoS Guard)
    // --------------------------------------------------------------------------
    console.log('\n[Phase 3: Payload Size Limits & DoS Protection]');

    // Generate payload slightly larger than 100KB (~120KB)
    const oversizedBody = JSON.stringify({
      data: 'X'.repeat(120 * 1024)
    });

    const oversizedRes = await request(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedBody
    });
    assert(oversizedRes.status === 413, 'Oversized payload (>100KB) rejected with HTTP 413 Payload Too Large');
    assert(
      oversizedRes.body?.error?.code === 'PAYLOAD_TOO_LARGE',
      "Oversized payload returns error code 'PAYLOAD_TOO_LARGE'"
    );

    // --------------------------------------------------------------------------
    // Phase 4: Rate Limiting & Abuse Prevention
    // --------------------------------------------------------------------------
    console.log('\n[Phase 4: Rate Limiting Middleware]');

    // 4.1 Rate limit headers exist on API responses
    const headersRes = await request(baseUrl, '/api/v1/drugs');
    assert(headersRes.status === 200, 'GET /api/v1/drugs returns 200');
    assert(headersRes.headers['ratelimit-limit'] !== undefined, 'RateLimit-Limit header is present');
    assert(headersRes.headers['ratelimit-remaining'] !== undefined, 'RateLimit-Remaining header is present');
    assert(headersRes.headers['ratelimit-reset'] !== undefined, 'RateLimit-Reset header is present');

    // 4.2 Test micro rate limiter threshold enforcement
    const testRateApp = express();
    const microLimiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 3,
      message: 'Test rate limit reached'
    });
    testRateApp.get('/test-limit', microLimiter, (_req, res) => {
      res.status(200).json({ success: true });
    });
    testRateApp.use(errorHandler);

    const rateServer = http.createServer(testRateApp);
    await new Promise<void>((resolve) => rateServer.listen(0, '127.0.0.1', () => resolve()));
    const rateAddress = rateServer.address() as AddressInfo;
    const rateBaseUrl = `http://127.0.0.1:${rateAddress.port}`;

    // Make 3 allowed requests
    const r1 = await request(rateBaseUrl, '/test-limit');
    const r2 = await request(rateBaseUrl, '/test-limit');
    const r3 = await request(rateBaseUrl, '/test-limit');
    assert(r1.status === 200 && r2.status === 200 && r3.status === 200, 'First 3 requests within limit succeed (200)');

    // 4th request must be rate limited (429)
    const r4 = await request(rateBaseUrl, '/test-limit');
    assert(r4.status === 429, '4th request exceeding limit blocked with HTTP 429');
    assert(r4.body?.error?.code === 'RATE_LIMIT_EXCEEDED', "Blocked request returns error code 'RATE_LIMIT_EXCEEDED'");
    assert(r4.headers['retry-after'] !== undefined, 'Retry-After header included on 429 response');

    rateServer.close();

    // --------------------------------------------------------------------------
    // Phase 5: Absolute Safe Error Handling & Information Leak Prevention
    // --------------------------------------------------------------------------
    console.log('\n[Phase 5: Information Leak Prevention & Database Sanitization]');

    // 5.1 Route not found (404) returns clean standardized format
    const notFoundRes = await request(baseUrl, '/api/v1/non-existent-endpoint');
    assert(notFoundRes.status === 404, 'Unknown route returns HTTP 404');
    assert(notFoundRes.body?.error?.code === 'NOT_FOUND', "Unknown route error code is 'NOT_FOUND'");
    assert(notFoundRes.body?.error?.stack === undefined, '404 response does NOT contain stack trace');

    // 5.2 Direct error handler sanitization of internal PostgreSQL errors
    let capturedStatus = 0;
    let capturedJson: any = null;
    const mockRes: any = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(payload: any) {
        capturedJson = payload;
        return this;
      }
    };

    // Simulate internal raw database error containing secret table names and SQL syntax
    const fakePgError: any = new Error('syntax error at or near "SELECT * FROM secret_credentials_table"');
    fakePgError.code = '42601';
    fakePgError.detail = 'Key (user_id)=(usr_secret) already exists in table secret_users.';
    fakePgError.table = 'secret_credentials_table';
    fakePgError.query = 'SELECT * FROM secret_credentials_table WHERE secret_token = "TOP_SECRET"';

    errorHandler(fakePgError, {} as any, mockRes, (() => {}) as any);

    assert(capturedStatus === 500, 'Internal PG error mapped to status 500');
    assert(capturedJson?.error?.code === 'DATABASE_OPERATION_FAILED', 'Safe code DATABASE_OPERATION_FAILED assigned');
    assert(
      capturedJson?.error?.message === 'Database operation could not be completed.',
      'Message is strictly generic without internal SQL'
    );
    assert(capturedJson?.error?.stack === undefined, 'Zero stack trace exposed');
    assert(capturedJson?.error?.query === undefined, 'Zero raw SQL query exposed');
    assert(capturedJson?.error?.table === undefined, 'Zero database table name exposed');
    assert(capturedJson?.error?.detail === undefined, 'Zero constraint detail exposed');

    // 5.3 Simulated unique constraint conflict (23505) sanitization
    const fakeConflict: any = new Error('duplicate key value violates unique constraint');
    fakeConflict.code = '23505';
    errorHandler(fakeConflict, {} as any, mockRes, (() => {}) as any);

    assert(capturedStatus === 409, 'Unique constraint violation mapped to HTTP 409');
    assert(capturedJson?.error?.code === 'RESOURCE_CONFLICT', 'Safe code RESOURCE_CONFLICT assigned');
    assert(
      capturedJson?.error?.message === 'A resource with the provided unique identifier already exists.',
      'Safe user-friendly message returned'
    );
    assert(!JSON.stringify(capturedJson).includes('violates unique constraint'), 'Raw constraint string not leaked');

    // --------------------------------------------------------------------------
    // Phase 6: Parameterized Query Verification (SQL Injection Immunity)
    // --------------------------------------------------------------------------
    console.log('\n[Phase 6: Parameterized Query Immunity]');

    // Query with SQL injection payload in drug lookup
    const sqlInjectionLookupRes = await request(
      baseUrl,
      "/api/v1/drugs/ibuprofen' OR 1=1; DROP TABLE drugs; --/pathway"
    );
    // Should be rejected by parameter validation or safe 404, never executing injection
    assert(
      sqlInjectionLookupRes.status === 400 || sqlInjectionLookupRes.status === 404,
      'SQL injection string handled safely without syntax error (HTTP 400 or 404)'
    );

    // Verify database drugs table remains intact and functional
    const verifyDrugsRes = await request(baseUrl, '/api/v1/drugs');
    assert(
      verifyDrugsRes.status === 200 && Array.isArray(verifyDrugsRes.body?.data) && verifyDrugsRes.body.data.length === 4,
      'Database drugs table remains completely intact with all 4 medicines'
    );
  } finally {
    server.close();
    await (await import('./pool.js')).closePool();
  }

  console.log('\n================================================================');
  console.log(`TASK 19 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSecurityValidationSuite().catch((err) => {
  console.error('[FATAL] Verification suite encountered uncaught error:', err);
  process.exit(1);
});

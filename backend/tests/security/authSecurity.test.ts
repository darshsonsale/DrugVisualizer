/**
 * Drug Path Visualiser (BioLumen) - Task 26 Authentication Security Suite
 *
 * Verifies:
 * 1. Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized.
 * 2. Invalid, expired, malformed, or tampered authentication tokens return HTTP 401 Unauthorized.
 * 3. Alg 'none' token bypass attempts return HTTP 401 Unauthorized.
 * 4. Invalid credentials do not authenticate users.
 * 5. Authentication errors do not expose secrets, password hashes, or internal database schemas.
 */

import {
  requestApi,
  forgeTamperedToken,
  signValidTestToken,
  createAssertionCollector,
  type SecurityAssertionCollector
} from '../api/securityApiHelper.js';
import { SECURITY_TEST_USERS } from '../fixtures/securityFixtures.js';

export async function runAuthSecurityTests(baseUrl: string, collector?: SecurityAssertionCollector) {
  const { assert, getSummary } = collector || createAssertionCollector('Authentication Security');

  console.log('\n--- [Suite 1: Authentication Security] ---');

  // 1. Unauthenticated Access Rejection
  const protectedEndpoints = [
    { method: 'GET', path: '/api/v1/users/me/progress', name: 'GET /users/me/progress' },
    { method: 'GET', path: '/api/v1/users/me/attempts', name: 'GET /users/me/attempts' },
    { method: 'GET', path: '/api/v1/users/me/overview', name: 'GET /users/me/overview' },
    { method: 'PUT', path: '/api/v1/progress/ibuprofen', name: 'PUT /progress/:drugId' },
    { method: 'GET', path: '/api/v1/admin/content/summary', name: 'GET /admin/content/summary' },
    { method: 'GET', path: '/api/v1/admin/metrics', name: 'GET /admin/metrics' },
    { method: 'GET', path: '/api/v1/admin/users', name: 'GET /admin/users' }
  ];

  for (const ep of protectedEndpoints) {
    const res = await requestApi(baseUrl, ep.path, { method: ep.method });
    assert(
      res.status === 401,
      `Unauthenticated access to ${ep.name} rejected with HTTP 401`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.error?.code === 'AUTHENTICATION_REQUIRED' || res.body?.error?.code === 'UNAUTHORIZED',
      `${ep.name} returns safe error code (AUTHENTICATION_REQUIRED)`,
      res.body
    );
  }

  // 2. Tampered & Malformed Token Rejection
  const tamperedScenarios = [
    { type: 'wrong_secret' as const, name: 'Forged token signed with wrong secret' },
    { type: 'expired' as const, name: 'Expired JWT token' },
    { type: 'alg_none' as const, name: 'Unsigned token with alg: none' },
    { type: 'malformed_payload' as const, name: 'Malformed Base64 payload in JWT' },
    { type: 'garbage' as const, name: 'Random non-JWT garbage string' }
  ];

  for (const scenario of tamperedScenarios) {
    const forgedToken = forgeTamperedToken(scenario.type);
    const res = await requestApi(baseUrl, '/api/v1/users/me/progress', {
      headers: {
        Authorization: `Bearer ${forgedToken}`
      }
    });

    assert(
      res.status === 401,
      `${scenario.name} rejected with HTTP 401`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.error?.code === 'AUTHENTICATION_REQUIRED' || res.body?.error?.code === 'UNAUTHORIZED',
      `${scenario.name} returns safe authentication error code`,
      res.body
    );
  }

  // 3. Malformed Authorization Header Formats
  const badHeaders = [
    { header: 'Bearer', name: 'Missing token in Bearer header' },
    { header: 'Bearer    ', name: 'Whitespace-only token in Bearer header' },
    { header: 'Basic dXNlcjpwYXNz', name: 'Unsupported Basic auth scheme' },
    { header: 'Token validtoken123', name: 'Unsupported custom Token scheme' },
    { header: 'Bearer token1 token2 extra', name: 'Too many space-delimited parts in Bearer header' }
  ];

  for (const bh of badHeaders) {
    const res = await requestApi(baseUrl, '/api/v1/users/me/progress', {
      headers: {
        Authorization: bh.header
      }
    });
    assert(
      res.status === 401,
      `Malformed header "${bh.name}" rejected with HTTP 401`,
      `Got status ${res.status}`
    );
  }

  // 4. Invalid Credentials Rejection (Standard Login)
  const invalidLogins = [
    {
      identifier: SECURITY_TEST_USERS.learnerAlice.email,
      password: 'CompletelyWrongPassword!',
      name: 'Wrong password for registered user'
    },
    {
      identifier: 'non_existent_user_999@test.local',
      password: 'SomePassword123!',
      name: 'Non-existent user email'
    },
    {
      identifier: '',
      password: 'SomePassword123!',
      name: 'Empty username/email'
    },
    {
      identifier: SECURITY_TEST_USERS.learnerAlice.email,
      password: '',
      name: 'Empty password'
    }
  ];

  for (const il of invalidLogins) {
    const res = await requestApi(baseUrl, '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: il.identifier, password: il.password })
    });
    const isExpected = res.status === 401 || res.status === 400;
    assert(
      isExpected,
      `Invalid login (${il.name}) rejected with HTTP 401 or 400`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.data?.token === undefined,
      `Invalid login (${il.name}) never returns a token`
    );
  }

  // 5. Invalid Credentials Rejection (Dedicated Admin Login)
  const invalidAdminLogins = [
    {
      identifier: SECURITY_TEST_USERS.adminCarol.email,
      password: 'WrongAdminPassword123!',
      name: 'Wrong password on admin login'
    },
    {
      identifier: 'unregistered_admin@test.local',
      password: 'SomePassword123!',
      name: 'Non-existent admin'
    }
  ];

  for (const ial of invalidAdminLogins) {
    const res = await requestApi(baseUrl, '/api/v1/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ial.identifier, password: ial.password })
    });
    assert(
      res.status === 401,
      `Invalid admin login (${ial.name}) rejected with HTTP 401`,
      `Got status ${res.status}`
    );
  }

  // 6. Zero Sensitive Data Exposure on Auth Failures
  const probeRes = await requestApi(baseUrl, '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SECURITY_TEST_USERS.learnerAlice.email,
      password: 'WrongPasswordForLeakTest!'
    })
  });

  const rawText = probeRes.rawBody.toLowerCase();
  assert(
    !rawText.includes('password_hash') &&
      !rawText.includes('secret') &&
      !rawText.includes('stack') &&
      !rawText.includes('scrypt') &&
      !rawText.includes('salt:'),
    'Auth error response does not expose password hashes, salts, or crypto secrets',
    probeRes.rawBody
  );

  return getSummary();
}

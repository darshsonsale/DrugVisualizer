/**
 * Drug Path Visualiser (BioLumen) - Task 26 Authorization & User-Data Isolation Suite
 *
 * Verifies:
 * 1. Cross-User Data Isolation (IDOR): A user cannot access another user's private progress or quiz history.
 * 2. Self-Access: An authenticated user can successfully retrieve their own private data.
 * 3. Role-Based Access Control (RBAC): Regular learners are strictly forbidden (403) from accessing admin endpoints.
 * 4. Server-Side Database Role Freshness: Demoted administrators with stale JWTs are immediately rejected (403).
 * 5. Privilege Escalation Resistance: Clients cannot elevate privileges via body, query, or headers.
 */

import {
  requestApi,
  signValidTestToken,
  createAssertionCollector,
  type SecurityAssertionCollector
} from '../api/securityApiHelper.js';
import { SECURITY_TEST_USERS } from '../fixtures/securityFixtures.js';

export async function runAuthorizationIsolationTests(baseUrl: string, collector?: SecurityAssertionCollector) {
  const { assert, getSummary } = collector || createAssertionCollector('Authorization & Isolation');

  console.log('\n--- [Suite 2: Authorization & User-Data Isolation] ---');

  const aliceToken = signValidTestToken(
    SECURITY_TEST_USERS.learnerAlice.id,
    'learner',
    SECURITY_TEST_USERS.learnerAlice.email
  );
  const bobToken = signValidTestToken(
    SECURITY_TEST_USERS.learnerBob.id,
    'learner',
    SECURITY_TEST_USERS.learnerBob.email
  );
  const adminToken = signValidTestToken(
    SECURITY_TEST_USERS.adminCarol.id,
    'admin',
    SECURITY_TEST_USERS.adminCarol.email
  );

  // 1. Self-Access (Allowed)
  const aliceSelfProgress = await requestApi(
    baseUrl,
    `/api/v1/users/${SECURITY_TEST_USERS.learnerAlice.id}/progress`,
    {
      headers: { Authorization: `Bearer ${aliceToken}` }
    }
  );
  assert(
    aliceSelfProgress.status === 200,
    'Learner Alice can access own progress (/users/:userId/progress) with HTTP 200',
    aliceSelfProgress.body
  );

  const aliceMeProgress = await requestApi(baseUrl, '/api/v1/users/me/progress', {
    headers: { Authorization: `Bearer ${aliceToken}` }
  });
  assert(
    aliceMeProgress.status === 200,
    'Learner Alice can access own progress via /users/me/progress with HTTP 200',
    aliceMeProgress.body
  );

  // 2. Cross-User Data Isolation (IDOR Prevention)
  const bobAccessAliceProgress = await requestApi(
    baseUrl,
    `/api/v1/users/${SECURITY_TEST_USERS.learnerAlice.id}/progress`,
    {
      headers: { Authorization: `Bearer ${bobToken}` }
    }
  );
  assert(
    bobAccessAliceProgress.status === 403,
    "Bob CANNOT access Alice's private progress (IDOR attempt rejected with HTTP 403)",
    bobAccessAliceProgress.body
  );
  assert(
    bobAccessAliceProgress.body?.error?.code === 'FORBIDDEN',
    'IDOR progress access returns code FORBIDDEN'
  );

  const bobAccessAliceAttempts = await requestApi(
    baseUrl,
    `/api/v1/users/${SECURITY_TEST_USERS.learnerAlice.id}/attempts`,
    {
      headers: { Authorization: `Bearer ${bobToken}` }
    }
  );
  assert(
    bobAccessAliceAttempts.status === 403,
    "Bob CANNOT access Alice's private quiz attempts (IDOR attempt rejected with HTTP 403)",
    bobAccessAliceAttempts.body
  );

  // 3. Admin Access to User Data (Permitted Operational Role)
  const adminAccessAliceProgress = await requestApi(
    baseUrl,
    `/api/v1/users/${SECURITY_TEST_USERS.learnerAlice.id}/progress`,
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );
  assert(
    adminAccessAliceProgress.status === 200,
    "Authorized Admin can inspect user's progress for educational administration (HTTP 200)",
    adminAccessAliceProgress.body
  );

  // 4. Regular Learner Denied on Admin Endpoints
  const adminEndpoints = [
    { method: 'GET', path: '/api/v1/admin/content/summary', name: 'GET /admin/content/summary' },
    { method: 'GET', path: '/api/v1/admin/metrics', name: 'GET /admin/metrics' },
    { method: 'GET', path: '/api/v1/admin/users', name: 'GET /admin/users' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/nodes', name: 'GET /admin/content/drugs/:drugId/nodes' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/edges', name: 'GET /admin/content/drugs/:drugId/edges' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/quiz', name: 'GET /admin/content/drugs/:drugId/quiz' }
  ];

  for (const aep of adminEndpoints) {
    const res = await requestApi(baseUrl, aep.path, {
      method: aep.method,
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    assert(
      res.status === 403,
      `Learner accessing ${aep.name} rejected with HTTP 403 Forbidden`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.error?.code === 'FORBIDDEN',
      `${aep.name} returns error code FORBIDDEN`
    );
  }

  // 5. Learner Denied on Dedicated Admin Sign-In Portal
  const learnerAdminLoginRes = await requestApi(baseUrl, '/api/v1/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SECURITY_TEST_USERS.learnerAlice.email,
      password: SECURITY_TEST_USERS.learnerAlice.password
    })
  });
  assert(
    learnerAdminLoginRes.status === 403,
    'Learner credentials on /auth/admin/login rejected with HTTP 403 Forbidden',
    learnerAdminLoginRes.body
  );

  // 6. Server-Side Database Role Freshness (Stale Admin Token Revocation)
  // Dan's token claims 'admin', but his row in DB is 'learner'
  const staleAdminToken = signValidTestToken(
    SECURITY_TEST_USERS.demotedAdminDan.id,
    'admin',
    SECURITY_TEST_USERS.demotedAdminDan.email
  );

  const staleAdminRes = await requestApi(baseUrl, '/api/v1/admin/content/summary', {
    headers: { Authorization: `Bearer ${staleAdminToken}` }
  });
  assert(
    staleAdminRes.status === 403,
    'Stale admin JWT rejected when database role is learner (Real-time DB Role Freshness)',
    staleAdminRes.body
  );
  assert(
    staleAdminRes.body?.error?.code === 'FORBIDDEN',
    'Stale admin JWT returns error code FORBIDDEN'
  );

  // 7. Privilege Escalation Resistance (Registration Role Injection)
  const uniqueRegEmail = `sec_escalate_${Date.now()}@test.local`;
  const registerEscalateRes = await requestApi(baseUrl, '/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueRegEmail,
      password: 'StrongPassword123!',
      name: 'Escalation Attacker',
      role: 'admin' // Attempted role escalation
    })
  });

  assert(
    registerEscalateRes.status === 201,
    'Registration with role parameter completes',
    registerEscalateRes.body
  );
  assert(
    registerEscalateRes.body?.data?.user?.role === 'learner',
    'Server unconditionally overrides requested role to "learner"',
    registerEscalateRes.body?.data?.user
  );

  // 8. Privilege Escalation Resistance via Query / Header Spoofing
  const spoofQueryRes = await requestApi(baseUrl, '/api/v1/admin/content/summary?role=admin', {
    headers: {
      Authorization: `Bearer ${aliceToken}`,
      'X-Role': 'admin',
      'X-User-Role': 'admin'
    }
  });
  assert(
    spoofQueryRes.status === 403,
    'Query/Header spoofing (?role=admin, X-Role: admin) strictly ignored by server (HTTP 403)',
    spoofQueryRes.body
  );

  return getSummary();
}

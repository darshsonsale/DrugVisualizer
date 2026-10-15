/**
 * Drug Path Visualiser - Task 20 Verification Suite
 * API Contract Freeze & Integration Verification Suite
 *
 * Verifies:
 * 1. All verified platform endpoints return standardized success/error envelopes.
 * 2. Anonymous public exploration of drugs, pathways, and quizzes across all 4 medicines:
 *    - Ibuprofen (oral solid, BEFORE_FOOD + AFTER_FOOD)
 *    - Amoxicillin (oral solid, BEFORE_FOOD + AFTER_FOOD)
 *    - Ambroxol syrup (oral liquid, BEFORE_FOOD + AFTER_FOOD)
 *    - Insulin (subcutaneous, BEFORE_FOOD)
 * 3. Canonical and slug-based routing parity.
 * 4. Authentication flow, token verification, and session lifecycle.
 * 5. Authorization, user-data ownership, and IDOR isolation.
 * 6. Admin RBAC enforcement and metrics inspection.
 * 7. Security middleware: Helmet headers, CORS, body size limits (413), and Rate Limiting isolation.
 * 8. Centralized error handling and validation failures (400) without stack trace leakage.
 */

import http from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import { authService } from '../modules/auth/services/auth.service.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string, details?: unknown) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests.toString().padStart(2, '0')}: ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests.toString().padStart(2, '0')}: ${message}`);
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

function checkEnvelope(body: any, isSuccess = true): boolean {
  if (!body || typeof body !== 'object') return false;
  if (isSuccess) {
    return body.success === true && body.data !== undefined && body.meta && typeof body.meta.timestamp === 'string';
  } else {
    return (
      body.success === false &&
      body.error &&
      typeof body.error.code === 'string' &&
      typeof body.error.message === 'string' &&
      body.meta &&
      typeof body.meta.timestamp === 'string'
    );
  }
}

async function runContractVerification(): Promise<void> {
  const pool = getPool();
  console.log('================================================================');
  console.log('TASK 20: BACKEND INTEGRATION & API CONTRACT FREEZE VERIFICATION');
  console.log('================================================================\n');

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`[Contract Suite] Test server running on ${baseUrl}\n`);

  try {
    // Setup test users in database
    const userAId = 'user-contract-learner-a';
    const userBId = 'user-contract-learner-b';
    const userAdminId = 'user-contract-admin';

    await pool.query(
      `INSERT INTO users (id, google_id, email, name, role)
       VALUES 
         ($1, 'google-id-contract-a', 'contract_a@test.local', 'Learner Alice', 'learner'),
         ($2, 'google-id-contract-b', 'contract_b@test.local', 'Learner Bob', 'learner'),
         ($3, 'google-id-contract-admin', 'contract_admin@test.local', 'Admin User', 'admin')
       ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;`,
      [userAId, userBId, userAdminId]
    );

    const nowIso = new Date().toISOString();
    const tokenA = authService.signSessionToken({
      id: userAId,
      email: 'contract_a@test.local',
      name: 'Learner Alice',
      avatar_url: null,
      google_id: 'google-id-contract-a',
      role: 'learner',
      created_at: nowIso,
      updated_at: nowIso
    });

    const tokenB = authService.signSessionToken({
      id: userBId,
      email: 'contract_b@test.local',
      name: 'Learner Bob',
      avatar_url: null,
      google_id: 'google-id-contract-b',
      role: 'learner',
      created_at: nowIso,
      updated_at: nowIso
    });

    const tokenAdmin = authService.signSessionToken({
      id: userAdminId,
      email: 'contract_admin@test.local',
      name: 'Admin User',
      avatar_url: null,
      google_id: 'google-id-contract-admin',
      role: 'admin',
      created_at: nowIso,
      updated_at: nowIso
    });

    // -------------------------------------------------------------------------
    // SECTION 1: Root Probe & Health
    // -------------------------------------------------------------------------
    console.log('--- SECTION 1: Root Probe & Health Endpoints ---');
    const rootRes = await request(baseUrl, '/');
    assert(rootRes.status === 200 && rootRes.body.service === 'drug-path-visualiser-backend', 'GET / returns service probe info');

    const healthRes = await request(baseUrl, '/api/v1/health');
    assert(healthRes.status === 200 && checkEnvelope(healthRes.body, true), 'GET /api/v1/health returns standardized success envelope');
    assert(healthRes.body.data.status === 'ok', 'GET /api/v1/health reports status ok');

    // -------------------------------------------------------------------------
    // SECTION 2: Drug Catalog & Medicine Formulations
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 2: Drug Catalog & 4-Medicine Verification ---');
    const drugsRes = await request(baseUrl, '/api/v1/drugs');
    assert(drugsRes.status === 200 && checkEnvelope(drugsRes.body, true), 'GET /api/v1/drugs returns success envelope');
    const drugs = drugsRes.body.data;
    assert(Array.isArray(drugs) && drugs.length === 4, 'GET /api/v1/drugs returns exactly 4 medicines');

    const expectedMedicines = [
      { id: 'drug-ibuprofen-001', slug: 'ibuprofen', name: 'Ibuprofen' },
      { id: 'drug-amoxicillin-002', slug: 'amoxicillin', name: 'Amoxicillin' },
      { id: 'drug-ambroxol-003', slug: 'ambroxol', name: 'Ambroxol Syrup' },
      { id: 'drug-insulin-004', slug: 'insulin', name: 'Insulin' }
    ];

    for (const med of expectedMedicines) {
      const byId = await request(baseUrl, `/api/v1/drugs/${med.id}`);
      assert(byId.status === 200 && byId.body.data.id === med.id, `GET /api/v1/drugs/${med.id} resolves by canonical ID`);

      const bySlug = await request(baseUrl, `/api/v1/drugs/${med.slug}`);
      assert(bySlug.status === 200 && bySlug.body.data.id === med.id, `GET /api/v1/drugs/${med.slug} resolves by slug alias`);
    }

    // -------------------------------------------------------------------------
    // SECTION 3: Pathways & Graph Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 3: Pathways & Graph Integrity ---');
    for (const med of expectedMedicines) {
      const pathwayRes = await request(baseUrl, `/api/v1/drugs/${med.slug}/pathway`);
      assert(pathwayRes.status === 200 && checkEnvelope(pathwayRes.body, true), `GET /api/v1/drugs/${med.slug}/pathway returns valid envelope`);
      const pathway = pathwayRes.body.data;
      assert(Array.isArray(pathway.nodes) && pathway.nodes.length > 0, `${med.name} pathway has valid nodes`);
      assert(Array.isArray(pathway.edges) && pathway.edges.length > 0, `${med.name} pathway has valid edges`);
    }

    // Pathway by ID, nodes, and edges
    const p1Res = await request(baseUrl, '/api/v1/pathways/pathway-ibuprofen-fasting');
    assert(p1Res.status === 200 && checkEnvelope(p1Res.body, true), 'GET /api/v1/pathways/:pathwayId returns pathway graph');

    const nodesRes = await request(baseUrl, '/api/v1/pathways/pathway-ibuprofen-fasting/nodes');
    assert(nodesRes.status === 200 && Array.isArray(nodesRes.body.data), 'GET /api/v1/pathways/:pathwayId/nodes returns nodes array');

    const edgesRes = await request(baseUrl, '/api/v1/pathways/pathway-ibuprofen-fasting/edges');
    assert(edgesRes.status === 200 && Array.isArray(edgesRes.body.data), 'GET /api/v1/pathways/:pathwayId/edges returns edges array');

    // Food condition variation comparison
    const fastingRes = await request(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=BEFORE_FOOD');
    const fedRes = await request(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=AFTER_FOOD');
    assert(fastingRes.status === 200 && fedRes.status === 200, 'GET /drugs/ibuprofen/pathway supports BEFORE_FOOD and AFTER_FOOD conditions');

    // -------------------------------------------------------------------------
    // SECTION 4: Educational Content Module
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 4: Content Module Status ---');
    const contentRes = await request(baseUrl, '/api/v1/content');
    assert(contentRes.status === 200 && checkEnvelope(contentRes.body, true), 'GET /api/v1/content returns content module status');

    // -------------------------------------------------------------------------
    // SECTION 5: Quizzes & Attempt Submissions
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 5: Quizzes & Scoring Integration ---');
    const quizModRes = await request(baseUrl, '/api/v1/quizzes');
    assert(quizModRes.status === 200 && checkEnvelope(quizModRes.body, true), 'GET /api/v1/quizzes returns quiz module status');

    const quizDrugRes = await request(baseUrl, '/api/v1/quizzes/drug/ibuprofen');
    assert(quizDrugRes.status === 200 && checkEnvelope(quizDrugRes.body, true), 'GET /api/v1/quizzes/drug/ibuprofen returns quiz contract');
    const quiz = quizDrugRes.body.data;
    assert(Array.isArray(quiz.questions) && quiz.questions.length > 0, 'Quiz contains questions array');

    // Confidentiality check: is_correct and explanation must NOT be present
    let answersLeaked = false;
    for (const q of quiz.questions) {
      for (const opt of q.options || []) {
        if ('is_correct' in opt || 'explanation' in opt) answersLeaked = true;
      }
    }
    assert(!answersLeaked, 'GET /api/v1/quizzes/drug/:drugId preserves answer confidentiality');

    // Singular quiz route alias
    const quizSingular = await request(baseUrl, '/api/v1/quiz/drug/ibuprofen');
    assert(quizSingular.status === 200 && checkEnvelope(quizSingular.body, true), 'GET /api/v1/quiz/drug/ibuprofen singular route works');

    // Quiz by ID
    const quizByIdRes = await request(baseUrl, `/api/v1/quizzes/${quiz.id}`);
    assert(quizByIdRes.status === 200 && quizByIdRes.body.data.id === quiz.id, 'GET /api/v1/quizzes/:quizId resolves quiz by ID');

    // Anonymous quiz attempt submission (POST /api/v1/quizzes/:quizId/attempts)
    const firstQ = quiz.questions[0];
    const anonSubmitRes = await request(baseUrl, `/api/v1/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          {
            question_id: firstQ.id,
            selected_option_id: firstQ.options[0].id
          }
        ]
      })
    });
    assert(anonSubmitRes.status === 200 && checkEnvelope(anonSubmitRes.body, true), 'POST /api/v1/quizzes/:quizId/attempts evaluates attempt and returns 200');
    assert(anonSubmitRes.body.data.score !== undefined && anonSubmitRes.body.data.details !== undefined, 'Attempt result includes score and question explanations');

    // Authenticated attempt submission (persisted in DB)
    const authSubmitRes = await request(baseUrl, `/api/v1/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        answers: [
          {
            question_id: firstQ.id,
            selected_option_id: firstQ.options[0].id
          }
        ]
      })
    });
    assert(authSubmitRes.status === 200 && authSubmitRes.body.data.id !== undefined, 'Authenticated quiz attempt returns persisted attempt ID');

    // -------------------------------------------------------------------------
    // SECTION 6: Learning Progress Tracking
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 6: Progress Tracking & Ownership ---');
    // GET progress (anonymous returns default structure)
    const anonProgGet = await request(baseUrl, '/api/v1/progress/drug-ibuprofen-001');
    assert(anonProgGet.status === 200 && checkEnvelope(anonProgGet.body, true), 'GET /api/v1/progress/:drugId returns progress envelope');

    // PUT progress without auth returns 401
    const unauthPut = await request(baseUrl, '/api/v1/progress/drug-ibuprofen-001', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_nodes: ['node-ibu-mouth'] })
    });
    assert(unauthPut.status === 401 && checkEnvelope(unauthPut.body, false), 'PUT /api/v1/progress/:drugId without auth rejects with 401');

    // PUT progress with auth saves
    const authPut = await request(baseUrl, '/api/v1/progress/drug-ibuprofen-001', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ completed_nodes: ['node-ibu-mouth', 'node-ibu-stomach'] })
    });
    assert(authPut.status === 200 && checkEnvelope(authPut.body, true), 'PUT /api/v1/progress/:drugId with auth succeeds');

    // -------------------------------------------------------------------------
    // SECTION 7: Auth, Users & Ownership Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 7: Auth & Ownership Enforcement ---');
    const authModRes = await request(baseUrl, '/api/v1/auth/');
    assert(authModRes.status === 200 && checkEnvelope(authModRes.body, true), 'GET /api/v1/auth/ returns auth module status');

    const googleUrlRes = await request(baseUrl, '/api/v1/auth/google/url');
    assert(googleUrlRes.status === 200 && typeof googleUrlRes.body.data.url === 'string', 'GET /api/v1/auth/google/url returns OAuth URL');

    const meRes = await request(baseUrl, '/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(meRes.status === 200 && meRes.body.data.id === userAId, 'GET /api/v1/auth/me returns current user profile');

    // User progress list
    const myProgressRes = await request(baseUrl, '/api/v1/users/me/progress', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myProgressRes.status === 200 && Array.isArray(myProgressRes.body.data), 'GET /api/v1/users/me/progress returns progress array');

    // User attempts list
    const myAttemptsRes = await request(baseUrl, '/api/v1/users/me/attempts', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myAttemptsRes.status === 200 && Array.isArray(myAttemptsRes.body.data), 'GET /api/v1/users/me/attempts returns attempts array');

    // User overview
    const myOverviewRes = await request(baseUrl, '/api/v1/users/me/overview', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myOverviewRes.status === 200 && checkEnvelope(myOverviewRes.body, true), 'GET /api/v1/users/me/overview returns dashboard overview');

    // Parameterized User Progress (own profile)
    const userProgOwn = await request(baseUrl, `/api/v1/users/${userAId}/progress`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(userProgOwn.status === 200 && checkEnvelope(userProgOwn.body, true), 'GET /api/v1/users/:userId/progress allows owner access');

    // IDOR Check: Parameterized User Progress (cross-user profile)
    const userProgCross = await request(baseUrl, `/api/v1/users/${userAId}/progress`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userProgCross.status === 403 && checkEnvelope(userProgCross.body, false), 'GET /api/v1/users/:userId/progress blocks non-owner with 403');

    // Parameterized User Attempts (cross-user check)
    const userAttCross = await request(baseUrl, `/api/v1/users/${userAId}/attempts`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userAttCross.status === 403 && checkEnvelope(userAttCross.body, false), 'GET /api/v1/users/:userId/attempts blocks non-owner with 403');

    // Logout
    const logoutRes = await request(baseUrl, '/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(logoutRes.status === 200 && checkEnvelope(logoutRes.body, true), 'POST /api/v1/auth/logout succeeds');

    // -------------------------------------------------------------------------
    // SECTION 8: Admin RBAC & Metrics
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 8: Admin RBAC Controls ---');
    const adminModForbidden = await request(baseUrl, '/api/v1/admin/', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(adminModForbidden.status === 403 && checkEnvelope(adminModForbidden.body, false), 'GET /api/v1/admin/ blocks learner with 403');

    const adminModAllowed = await request(baseUrl, '/api/v1/admin/', {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(adminModAllowed.status === 200 && checkEnvelope(adminModAllowed.body, true), 'GET /api/v1/admin/ allows admin access');

    const adminUsersForbidden = await request(baseUrl, '/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(adminUsersForbidden.status === 403 && checkEnvelope(adminUsersForbidden.body, false), 'GET /api/v1/admin/users blocks learner with 403');

    const adminUsersAllowed = await request(baseUrl, '/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(adminUsersAllowed.status === 200 && checkEnvelope(adminUsersAllowed.body, true), 'GET /api/v1/admin/users allows admin access');

    const adminMetrics = await request(baseUrl, '/api/v1/admin/metrics', {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(adminMetrics.status === 200 && checkEnvelope(adminMetrics.body, true), 'GET /api/v1/admin/metrics returns system metrics');

    const adminInspectProg = await request(baseUrl, `/api/v1/admin/users/${userAId}/progress`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    assert(adminInspectProg.status === 200 && checkEnvelope(adminInspectProg.body, true), 'GET /api/v1/admin/users/:userId/progress allows admin cross-user inspection');

    // -------------------------------------------------------------------------
    // SECTION 9: Security Controls, Headers & Limits
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 9: Security Controls, Headers & Validation ---');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'Security header: X-Content-Type-Options is nosniff');
    assert(healthRes.headers['x-frame-options'] === 'SAMEORIGIN', 'Security header: X-Frame-Options is SAMEORIGIN');
    assert(!!healthRes.headers['content-security-policy'], 'Security header: Content-Security-Policy is present');

    // Payload size ceiling (100kb limit)
    const largePayload = JSON.stringify({ text: 'X'.repeat(120 * 1024) });
    const payloadRes = await request(baseUrl, '/api/v1/auth/google/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largePayload
    });
    assert(payloadRes.status === 413 && checkEnvelope(payloadRes.body, false), 'POST with payload > 100kb triggers 413 PAYLOAD_TOO_LARGE');

    // Validation failure (Zod)
    const badInputRes = await request(baseUrl, `/api/v1/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ invalidField: 123 })
    });
    assert(badInputRes.status === 400 && checkEnvelope(badInputRes.body, false) && badInputRes.body.error.code === 'VALIDATION_ERROR', 'Schema validation error returns 400 VALIDATION_ERROR');

    // No stack trace in error
    assert(!badInputRes.rawBody.includes('at Object.') && !badInputRes.rawBody.includes('node_modules'), 'Error responses do not leak stack traces');

    // Isolated Rate Limiter Test
    console.log('\n--- Isolated Rate Limiter Verification ---');
    const rateLimitApp = express();
    rateLimitApp.use(createRateLimiter({ windowMs: 10000, maxRequests: 2, message: 'Too many requests' }));
    rateLimitApp.get('/test-rl', (_req, res) => res.json({ success: true, data: { ok: true } }));
    rateLimitApp.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode || 500).json({
        success: false,
        error: { code: err.code || 'INTERNAL_SERVER_ERROR', message: err.message },
        meta: { timestamp: new Date().toISOString() }
      });
    });

    const rlServer: Server = await new Promise((resolve) => {
      const s = rateLimitApp.listen(0, '127.0.0.1', () => resolve(s));
    });
    const rlPort = (rlServer.address() as AddressInfo).port;
    const rlBaseUrl = `http://127.0.0.1:${rlPort}`;

    const r1 = await request(rlBaseUrl, '/test-rl');
    const r2 = await request(rlBaseUrl, '/test-rl');
    const r3 = await request(rlBaseUrl, '/test-rl');

    assert(r1.status === 200, 'Rate limiter: 1st request succeeds');
    assert(r2.status === 200, 'Rate limiter: 2nd request succeeds');
    assert(r3.status === 429 && checkEnvelope(r3.body, false) && r3.body.error.code === 'RATE_LIMIT_EXCEEDED', 'Rate limiter: 3rd request blocked with 429 RATE_LIMIT_EXCEEDED');

    await new Promise<void>((resolve) => rlServer.close(() => resolve()));

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closePool();
  }

  console.log('\n================================================================');
  console.log(`CONTRACT VERIFICATION SUMMARY: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runContractVerification().catch((err) => {
  console.error('Fatal error during contract verification:', err);
  process.exit(1);
});

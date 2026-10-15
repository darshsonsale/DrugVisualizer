/**
 * Drug Path Visualiser - Task 17 Authentication & Google OAuth Verification Suite
 *
 * Exercises:
 * - Google OAuth consent URL generation and cryptographic CSRF state validation
 * - Rejection of invalid/missing OAuth code and mismatched/tampered state (400)
 * - Deterministic Google OAuth 2.0 authorization code callback and user upsert
 * - Deterministic Google Identity Services (GIS) ID Token verification
 * - Rejection of malformed/tampered Google ID tokens (401)
 * - Cryptographic JWT session issuance, signature verification, and tamper rejection (401)
 * - Protected profile retrieval (GET /api/v1/auth/me) with Bearer token vs unauthenticated (401)
 * - Safe session logout (POST /api/v1/auth/logout)
 * - End-to-end user progress persistence via verified JWT bearer token
 * - Anonymous exploration preservation across drugs, pathways, and quizzes
 * - Migration 0005 rollback and re-application integrity
 */

import type { Server } from 'node:http';
import path from 'node:path';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import { authService } from '../modules/auth/services/auth.service.js';
import {
  parseMigrationSql,
  getMigrationsDirectory,
  computeChecksum
} from './migrator.js';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details?: string): void {
  results.push({ name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[Test] ${icon}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAuthVerification(): Promise<void> {
  console.log('[Test Suite] Initializing Express server for Task 17 Auth verification...');
  const app = createApp();

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`[Test Suite] Server active on ${baseUrl}`);

  try {
    const pool = getPool();

    // -------------------------------------------------------------------------
    // TEST 1: Google OAuth URL Generation & Cryptographic State
    // -------------------------------------------------------------------------
    const urlRes = await fetch(`${baseUrl}/auth/google/url`);
    const urlBody: any = await urlRes.json();
    const hasUrl = typeof urlBody.data?.url === 'string' && urlBody.data.url.includes('accounts.google.com');
    const hasState = typeof urlBody.data?.state === 'string' && urlBody.data.state.length > 20;
    const isStateValid = hasState && authService.verifyOAuthState(urlBody.data.state);

    record(
      'GET /api/v1/auth/google/url returns 200 with consent URL and cryptographically valid CSRF state',
      urlRes.status === 200 && urlBody.success && hasUrl && isStateValid,
      `status=${urlRes.status}, stateValid=${isStateValid}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: CSRF Protection & State Verification
    // -------------------------------------------------------------------------
    const validState = authService.generateOAuthState();
    const tamperedState = `${validState}tampered`;
    const isTamperedValid = authService.verifyOAuthState(tamperedState);

    // Rejection on callback with missing code
    const missingCodeRes = await fetch(`${baseUrl}/auth/google/callback?state=${encodeURIComponent(validState)}`);
    const missingCodeBody: any = await missingCodeRes.json();

    // Rejection on callback with tampered state
    const badStateRes = await fetch(
      `${baseUrl}/auth/google/callback?code=mock-code&state=${encodeURIComponent(tamperedState)}`
    );
    const badStateBody: any = await badStateRes.json();

    record(
      'OAuth state rejects tampering and callback enforces mandatory code & valid CSRF state (HTTP 400)',
      !isTamperedValid &&
        missingCodeRes.status === 400 &&
        missingCodeBody.error?.code === 'BAD_REQUEST' &&
        badStateRes.status === 400 &&
        badStateBody.error?.code === 'BAD_REQUEST',
      `tamperedStateRejected=${!isTamperedValid}, missingCodeStatus=${missingCodeRes.status}, badStateStatus=${badStateRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Google Authorization Code Exchange (Deterministic Flow)
    // -------------------------------------------------------------------------
    const authCode = `mock-auth-code:google-sub-alpha:alex.morgan@biolumen.org:Alex+Morgan`;
    const callbackRes = await fetch(
      `${baseUrl}/auth/google/callback?code=${encodeURIComponent(authCode)}&state=${encodeURIComponent(validState)}`
    );
    const callbackBody: any = await callbackRes.json();

    const userInDb = await pool.query('SELECT * FROM users WHERE google_id = $1;', ['google-sub-alpha']);

    const callbackValid =
      callbackRes.status === 200 &&
      callbackBody.success === true &&
      typeof callbackBody.data?.token === 'string' &&
      callbackBody.data?.user?.email === 'alex.morgan@biolumen.org' &&
      userInDb.rows.length === 1 &&
      userInDb.rows[0].email === 'alex.morgan@biolumen.org';

    record(
      'Google OAuth callback exchanges code, upserts user in PostgreSQL, and issues signed JWT session',
      callbackValid,
      `status=${callbackRes.status}, email=${callbackBody.data?.user?.email}, dbRows=${userInDb.rows.length}`
    );

    // -------------------------------------------------------------------------
    // TEST 3B: Browser Popup HTML Callback Integration
    // -------------------------------------------------------------------------
    const browserCallbackRes = await fetch(
      `${baseUrl}/auth/google/callback?code=${encodeURIComponent(authCode)}&state=${encodeURIComponent(validState)}`,
      {
        headers: { Accept: 'text/html' }
      }
    );
    const browserHtml = await browserCallbackRes.text();
    const isBrowserHtmlValid =
      browserCallbackRes.status === 200 &&
      browserHtml.includes('Authentication Complete') &&
      browserHtml.includes('DRUG_VISUALIZER_AUTH_SUCCESS');

    record(
      'Browser OAuth callback delivers session to parent window via HTML postMessage script',
      isBrowserHtmlValid,
      `status=${browserCallbackRes.status}, containsPostMessage=${browserHtml.includes('DRUG_VISUALIZER_AUTH_SUCCESS')}`
    );

    const alexToken = callbackBody.data?.token;

    // -------------------------------------------------------------------------
    // TEST 4: Google Identity Services (GIS) ID Token Verification
    // -------------------------------------------------------------------------
    const gisRes = await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: 'mock-google-token:google-sub-beta:taylor.reed@biolumen.org:Taylor+Reed'
      })
    });
    const gisBody: any = await gisRes.json();

    // Invalid token rejection
    const badGisRes = await fetch(`${baseUrl}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: 'invalid-garbage-google-token'
      })
    });
    const badGisBody: any = await badGisRes.json();

    const gisValid =
      gisRes.status === 200 &&
      gisBody.success === true &&
      gisBody.data?.user?.email === 'taylor.reed@biolumen.org' &&
      (badGisRes.status === 400 || badGisRes.status === 401) &&
      badGisBody.success === false;

    record(
      'POST /auth/google/verify authenticates GIS ID tokens and rejects invalid tokens',
      gisValid,
      `gisStatus=${gisRes.status}, userEmail=${gisBody.data?.user?.email}, badTokenStatus=${badGisRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: JWT Signature & Expiration Security
    // -------------------------------------------------------------------------
    const validPayload = authService.verifySessionToken(alexToken);
    let tamperedRejected = false;
    try {
      authService.verifySessionToken(`${alexToken}tampered_signature`);
    } catch {
      tamperedRejected = true;
    }

    record(
      'JWT verification validates authentic signature and strictly rejects tampered tokens',
      validPayload.email === 'alex.morgan@biolumen.org' && tamperedRejected,
      `sub=${validPayload.sub}, role=${validPayload.role}, tamperedRejected=${tamperedRejected}`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Authenticated Profile (GET /api/v1/auth/me)
    // -------------------------------------------------------------------------
    // 1. With valid JWT
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    const meBody: any = await meRes.json();

    // 2. Unauthenticated
    const anonMeRes = await fetch(`${baseUrl}/auth/me`);
    const anonMeBody: any = await anonMeRes.json();

    // 3. Bogus token
    const bogusMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer bogus.unsigned.token' }
    });
    const bogusMeBody: any = await bogusMeRes.json();

    const meValid =
      meRes.status === 200 &&
      meBody.data?.email === 'alex.morgan@biolumen.org' &&
      anonMeRes.status === 401 &&
      anonMeBody.error?.code === 'AUTHENTICATION_REQUIRED' &&
      bogusMeRes.status === 401 &&
      bogusMeBody.error?.code === 'AUTHENTICATION_REQUIRED';

    record(
      'GET /api/v1/auth/me resolves user profile with valid Bearer token and rejects unauthenticated/bogus requests (401)',
      meValid,
      `meStatus=${meRes.status}, anonStatus=${anonMeRes.status}, bogusStatus=${bogusMeRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Safe Session Logout (POST /api/v1/auth/logout)
    // -------------------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST'
    });
    const logoutBody: any = await logoutRes.json();
    record(
      'POST /api/v1/auth/logout returns 200 with clean session termination message',
      logoutRes.status === 200 && logoutBody.success === true,
      `status=${logoutRes.status}, message=${logoutBody.data?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: End-to-End Progress Persistence via Verified JWT Bearer
    // -------------------------------------------------------------------------
    const progressPutRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alexToken}`
      },
      body: JSON.stringify({
        completed_nodes: ['node-oral-cavity', 'node-stomach']
      })
    });
    const progressPutBody: any = await progressPutRes.json();

    const progressGetRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    const progressGetBody: any = await progressGetRes.json();

    const progressValid =
      progressPutRes.status === 200 &&
      progressPutBody.data?.completed_nodes?.length === 2 &&
      progressGetRes.status === 200 &&
      progressGetBody.data?.completed_nodes?.includes('node-stomach') &&
      progressGetBody.meta?.persistent === true;

    record(
      'Verified JWT bearer token authenticates user to persist and retrieve learning progress',
      progressValid,
      `putStatus=${progressPutRes.status}, getStatus=${progressGetRes.status}, persistent=${progressGetBody.meta?.persistent}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Anonymous Access Continuity (Zero Regression)
    // -------------------------------------------------------------------------
    const drugsRes = await fetch(`${baseUrl}/drugs`);
    const pathwayRes = await fetch(`${baseUrl}/pathways/pathway-ibuprofen-fasting`);
    const quizRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001`);
    const anonProgRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`);
    const anonProgBody: any = await anonProgRes.json();

    const anonContinues =
      drugsRes.status === 200 &&
      pathwayRes.status === 200 &&
      quizRes.status === 200 &&
      anonProgRes.status === 200 &&
      anonProgBody.meta?.persistent === false;

    record(
      'Anonymous users can freely explore drugs, pathways, quizzes, and baseline progress',
      anonContinues,
      `drugsStatus=${drugsRes.status}, pathwayStatus=${pathwayRes.status}, quizStatus=${quizRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Migration 0005 Rollback and Reapplication Integrity
    // -------------------------------------------------------------------------
    console.log('[Test Suite] Testing migration 0005 rollback and re-application...');
    const migrationDir = getMigrationsDirectory();
    const migrationPath = path.resolve(migrationDir, '0005_users_and_auth_schema.sql');
    const { up, down } = parseMigrationSql(migrationPath);
    const checksum = computeChecksum(up);

    // Rollback migration 0005
    await pool.query('BEGIN');
    await pool.query(down);
    await pool.query('DELETE FROM schema_migrations WHERE name = $1;', ['0005_users_and_auth_schema.sql']);
    await pool.query('COMMIT');

    // Confirm users table is dropped
    const checkUsersDropped = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
    const usersDropped = checkUsersDropped.rows.length === 0;

    // Confirm core domain and quiz tables remain intact
    const checkPriorTables = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('drugs', 'pathways', 'quizzes', 'user_progress');
    `);
    const priorTablesIntact = checkPriorTables.rows.length === 4;

    // Reapply migration 0005
    await pool.query('BEGIN');
    await pool.query(up);
    await pool.query(
      'INSERT INTO schema_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW());',
      ['0005_users_and_auth_schema.sql', checksum]
    );
    await pool.query('COMMIT');

    const checkUsersReapplied = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
    const usersRestored = checkUsersReapplied.rows.length === 1;

    record(
      'Migration 0005 rollback cleanly drops users table without affecting prior migrations, and re-applies cleanly',
      usersDropped && priorTablesIntact && usersRestored,
      `usersDropped=${usersDropped}, priorTablesIntact=${priorTablesIntact}, usersRestored=${usersRestored}`
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[Test Suite] Ephemeral server closed.');
  }

  // Summary
  console.log('\n======================================================');
  console.log('             TASK 17 VERIFICATION SUMMARY             ');
  console.log('======================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.name}`);
  }
  console.log('======================================================\n');

  if (!allPassed) {
    throw new Error('Task 17 Verification Suite encountered test failures.');
  }
}

runAuthVerification()
  .then(async () => {
    console.log('[Test Suite] Task 17 Verification completed successfully.');
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[Test Suite] Task 17 Verification failed:', err);
    await closePool();
    process.exit(1);
  });

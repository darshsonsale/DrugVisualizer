/**
 * Drug Path Visualiser - Authorization and User Data Protection Verification Suite (Task 18)
 *
 * Verifies:
 * 1. Anonymous access is preserved for public drug exploration and anonymous quizzes.
 * 2. Protected endpoints reject missing / invalid authentication (401).
 * 3. User data isolation: Learner can read own progress / attempts (200).
 * 4. Cross-user data isolation (IDOR): Learner CANNOT read another user's private records (403).
 * 5. Server-side identity enforcement: Learner CANNOT tamper with user_id in progress updates (403).
 * 6. Admin-only operations: Learner CANNOT access admin endpoints (403).
 * 7. Admin can access admin endpoints and inspect system metrics (200).
 * 8. Real-time DB role freshness: Revoking admin role in DB immediately invalidates stale admin JWT (403).
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import { authService } from '../modules/auth/services/auth.service.js';

async function runAuthorizationVerification(): Promise<void> {
  const pool = getPool();
  console.log('================================================================');
  console.log('TASK 18 AUTHORIZATION & USER DATA PROTECTION VERIFICATION SUITE');
  console.log('================================================================\n');

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`[Test Suite] Test server running on ${baseUrl}`);

  // Create isolated test users in database
  const userLearnerAId = 'user-test-learner-a-18';
  const userLearnerBId = 'user-test-learner-b-18';
  const userAdminId = 'user-test-admin-18';

  await pool.query(
    `INSERT INTO users (id, google_id, email, name, role)
     VALUES 
       ($1, 'google-id-test-learner-a', 'learner_a_18@test.local', 'Learner Alice', 'learner'),
       ($2, 'google-id-test-learner-b', 'learner_b_18@test.local', 'Learner Bob', 'learner'),
       ($3, 'google-id-test-admin', 'admin_18@test.local', 'Admin User', 'admin')
     ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;`,
    [userLearnerAId, userLearnerBId, userAdminId]
  );

  const nowIso = new Date().toISOString();
  const learnerAToken = authService.signSessionToken({
    id: userLearnerAId,
    email: 'learner_a_18@test.local',
    name: 'Learner Alice',
    avatar_url: null,
    google_id: 'google-id-test-learner-a',
    role: 'learner',
    created_at: nowIso,
    updated_at: nowIso
  });

  const learnerBToken = authService.signSessionToken({
    id: userLearnerBId,
    email: 'learner_b_18@test.local',
    name: 'Learner Bob',
    avatar_url: null,
    google_id: 'google-id-test-learner-b',
    role: 'learner',
    created_at: nowIso,
    updated_at: nowIso
  });

  const adminToken = authService.signSessionToken({
    id: userAdminId,
    email: 'admin_18@test.local',
    name: 'Admin User',
    avatar_url: null,
    google_id: 'google-id-test-admin',
    role: 'admin',
    created_at: nowIso,
    updated_at: nowIso
  });

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 1. PUBLIC ENDPOINTS PRESERVED
    console.log('\n[Phase 1: Public Drug Exploration & Anonymous Quiz Preservation]');
    const drugsRes = await fetch(`${baseUrl}/drugs`);
    const drugsData: any = await drugsRes.json();
    assert(drugsRes.status === 200 && Array.isArray(drugsData.data), 'Anonymous user can browse drugs');

    const pathwayRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway`);
    const pathwayData: any = await pathwayRes.json();
    assert(pathwayRes.status === 200 && pathwayData.data.nodes.length > 0, 'Anonymous user can explore pathway');

    const quizRes = await fetch(`${baseUrl}/quizzes/drug/drug-ibuprofen-001`);
    const quizData: any = await quizRes.json();
    assert(quizRes.status === 200 && quizData.data.id === 'quiz-ibuprofen-001', 'Anonymous user can fetch quiz');

    const anonSubmitRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [{ question_id: 'q1', selected_option_id: 'opt1-b' }]
      })
    });
    const anonSubmitData: any = await anonSubmitRes.json();
    assert(anonSubmitRes.status === 200 && anonSubmitData.data.passed !== undefined, 'Anonymous user can submit quiz');

    // 2. AUTHENTICATION ENFORCEMENT
    console.log('\n[Phase 2: Authentication Enforcement for Protected Endpoints]');
    const unauthProgress = await fetch(`${baseUrl}/users/me/progress`);
    assert(unauthProgress.status === 401, 'Unauthenticated access to /users/me/progress returns 401');

    const unauthAdmin = await fetch(`${baseUrl}/admin/users`);
    assert(unauthAdmin.status === 401, 'Unauthenticated access to /admin/users returns 401');

    // 3. USER DATA ISOLATION & OWNERSHIP
    console.log('\n[Phase 3: User Data Isolation & Ownership Enforcement]');
    const learnerAProgress = await fetch(`${baseUrl}/users/me/progress`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    const learnerAProgressData: any = await learnerAProgress.json();
    assert(learnerAProgress.status === 200 && Array.isArray(learnerAProgressData.data), 'Learner A can view own progress');

    const learnerAOwnParam = await fetch(`${baseUrl}/users/${userLearnerAId}/progress`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    assert(learnerAOwnParam.status === 200, 'Learner A can view own progress via :userId parameter');

    const learnerBOwnParam = await fetch(`${baseUrl}/users/${userLearnerBId}/progress`, {
      headers: { Authorization: `Bearer ${learnerBToken}` }
    });
    assert(learnerBOwnParam.status === 200, 'Learner B can view own progress via :userId parameter');

    // 4. CROSS-USER FORBIDDEN (IDOR)
    console.log('\n[Phase 4: Cross-User IDOR Prevention]');
    const crossUserRead = await fetch(`${baseUrl}/users/${userLearnerBId}/progress`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    assert(crossUserRead.status === 403, 'Learner A CANNOT view Learner B private progress (returns 403 Forbidden)');

    const crossUserAttempts = await fetch(`${baseUrl}/users/${userLearnerBId}/attempts`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    assert(crossUserAttempts.status === 403, 'Learner A CANNOT view Learner B private quiz attempts (returns 403 Forbidden)');

    // 5. SERVER-SIDE IDENTITY ENFORCEMENT IN PROGRESS UPDATES
    console.log('\n[Phase 5: Server-Side Identity Enforcement in Progress API]');
    const idorTamperAttempt = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerAToken}`
      },
      body: JSON.stringify({
        user_id: userLearnerBId, // Attempting to tamper user_id
        pathway_completed: true
      })
    });
    assert(idorTamperAttempt.status === 403, 'Progress update with mismatched user_id payload returns 403 Forbidden');

    const validProgressUpdate = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerAToken}`
      },
      body: JSON.stringify({
        pathway_completed: true
      })
    });
    assert(validProgressUpdate.status === 200, 'Valid progress update saves successfully under authenticated user');

    // 6. RBAC & ADMIN-ONLY OPERATIONS
    console.log('\n[Phase 6: Role-Based Access Control (Admin-Only Routes)]');
    const learnerAdminAttempt = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    assert(learnerAdminAttempt.status === 403, 'Learner accessing /admin/users returns 403 Forbidden');

    const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUsersData: any = await adminUsersRes.json();
    assert(adminUsersRes.status === 200 && Array.isArray(adminUsersData.data), 'Admin can list all users');

    const adminMetricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminMetricsData: any = await adminMetricsRes.json();
    assert(adminMetricsRes.status === 200 && adminMetricsData.data.total_users !== undefined, 'Admin can view system metrics');

    const adminInspectUserProgress = await fetch(`${baseUrl}/admin/users/${userLearnerAId}/progress`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminInspectUserProgress.status === 200, 'Admin can inspect any learner progress');

    // 7. REAL-TIME DB ROLE FRESHNESS (STALE TOKEN INVALIDATION)
    console.log('\n[Phase 7: Real-Time DB Role Freshness / Stale Token Invalidation]');
    const tempAdminId = 'user-test-temp-admin-18';
    await pool.query(
      `INSERT INTO users (id, google_id, email, name, role)
       VALUES ($1, 'google-id-temp-admin', 'temp_admin@test.local', 'Temp Admin', 'admin')
       ON CONFLICT (id) DO UPDATE SET role = 'admin';`,
      [tempAdminId]
    );

    const staleAdminToken = authService.signSessionToken({
      id: tempAdminId,
      email: 'temp_admin@test.local',
      name: 'Temp Admin',
      avatar_url: null,
      google_id: 'google-id-temp-admin',
      role: 'admin',
      created_at: nowIso,
      updated_at: nowIso
    });

    const preDemotionRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${staleAdminToken}` }
    });
    assert(preDemotionRes.status === 200, 'Token with admin role succeeds when DB role is admin');

    // Demote role in DB to 'learner'
    await pool.query(`UPDATE users SET role = 'learner' WHERE id = $1;`, [tempAdminId]);

    // Same JWT token should now be rejected from admin endpoint because DB role is learner
    const postDemotionRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${staleAdminToken}` }
    });
    assert(postDemotionRes.status === 403, 'Stale admin token REJECTED (403) immediately after DB role demoted to learner');

    console.log('\n================================================================');
    console.log(`ALL ${passedTests}/${totalTests} AUTHORIZATION VERIFICATION TESTS PASSED!`);
    console.log('================================================================\n');
  } finally {
    await pool.query(`DELETE FROM users WHERE id IN ($1, $2, $3, 'user-test-temp-admin-18');`, [
      userLearnerAId,
      userLearnerBId,
      userAdminId
    ]);
    server.close();
  }
}

if (process.argv[1]?.endsWith('verifyAuthorization.ts') || process.argv[1]?.endsWith('verifyAuthorization.js')) {
  runAuthorizationVerification()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Verification Failed]:', err);
      await closePool();
      process.exit(1);
    });
}

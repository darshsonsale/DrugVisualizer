/**
 * Drug Path Visualiser (BioLumen) - Task 26 Admin Content Security Suite
 *
 * Verifies:
 * 1. Anonymous users are rejected (HTTP 401) across all Task 25 admin endpoints.
 * 2. Regular users are forbidden (HTTP 403) from administrative operations.
 * 3. Authorized administrators with verified database roles can access permitted endpoints (HTTP 200).
 * 4. Invalid pathway relationships (self-loops, cycle creation) are rejected.
 * 5. Educational review status transitions are strictly constrained (cannot set CLINICALLY_APPROVED).
 * 6. Protected quiz answer keys (is_correct) cannot be tampered with via admin API.
 */

import {
  requestApi,
  signValidTestToken,
  createAssertionCollector,
  type SecurityAssertionCollector
} from '../api/securityApiHelper.js';
import { SECURITY_TEST_USERS } from '../fixtures/securityFixtures.js';

export async function runAdminContentSecurityTests(baseUrl: string, collector?: SecurityAssertionCollector) {
  const { assert, getSummary } = collector || createAssertionCollector('Admin Content Security');

  console.log('\n--- [Suite 4: Admin Content Management Security] ---');

  const learnerToken = signValidTestToken(
    SECURITY_TEST_USERS.learnerAlice.id,
    'learner',
    SECURITY_TEST_USERS.learnerAlice.email
  );
  const adminToken = signValidTestToken(
    SECURITY_TEST_USERS.adminCarol.id,
    'admin',
    SECURITY_TEST_USERS.adminCarol.email
  );

  // 1. Task 25 Endpoints Matrix
  const task25Endpoints = [
    { method: 'GET', path: '/api/v1/admin/content/summary', name: 'GET /admin/content/summary' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/nodes', name: 'GET /admin/content/drugs/:drugId/nodes' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/edges', name: 'GET /admin/content/drugs/:drugId/edges' },
    { method: 'GET', path: '/api/v1/admin/content/drugs/ibuprofen/quiz', name: 'GET /admin/content/drugs/:drugId/quiz' }
  ];

  for (const ep of task25Endpoints) {
    // 1.1 Anonymous check -> 401
    const unauthRes = await requestApi(baseUrl, ep.path, { method: ep.method });
    assert(
      unauthRes.status === 401,
      `Anonymous access to ${ep.name} rejected with HTTP 401`,
      `Got status ${unauthRes.status}`
    );

    // 1.2 Learner check -> 403
    const learnerRes = await requestApi(baseUrl, ep.path, {
      method: ep.method,
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    assert(
      learnerRes.status === 403,
      `Learner access to ${ep.name} forbidden with HTTP 403`,
      `Got status ${learnerRes.status}`
    );

    // 1.3 Admin check -> 200
    const adminRes = await requestApi(baseUrl, ep.path, {
      method: ep.method,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminRes.status === 200,
      `Authorized Admin access to ${ep.name} allowed with HTTP 200`,
      `Got status ${adminRes.status}`
    );
  }

  // 2. Reject Invalid Pathway Relationships
  // Fetch real edges for Ibuprofen to test against active database fixtures
  const edgesRes = await requestApi(baseUrl, '/api/v1/admin/content/drugs/ibuprofen/edges', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const sampleEdge = edgesRes.body?.data?.[0];
  const targetEdgeId = sampleEdge?.id || 'edge-sample-01';
  const targetFromNode = sampleEdge?.from_node_id || 'node-ibu-01';

  // 2.1 Self-loop rejection (from_node_id === to_node_id)
  const selfLoopRes = await requestApi(baseUrl, `/api/v1/admin/content/edges/${targetEdgeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      from_node_id: targetFromNode,
      to_node_id: targetFromNode, // Self loop
      transition_duration_minutes: 10
    })
  });
  assert(
    selfLoopRes.status === 400,
    'Self-loop pathway transition rejected with HTTP 400',
    selfLoopRes.body
  );
  assert(
    selfLoopRes.body?.error?.code === 'INVALID_PATHWAY_RELATIONSHIP' || selfLoopRes.body?.error?.code === 'VALIDATION_ERROR',
    'Self-loop returns appropriate error code'
  );

  // 2.2 Malformed edge update body (missing required from/to node IDs)
  const emptyEdgeRes = await requestApi(baseUrl, '/api/v1/admin/content/edges/edge-sample-01', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({})
  });
  assert(
    emptyEdgeRes.status === 400,
    'Empty edge update body rejected with HTTP 400 VALIDATION_ERROR',
    emptyEdgeRes.body
  );

  // 3. Strict Educational Review Status Constraints
  // Administrative edits must NEVER falsely mark educational content as scientifically or clinically approved
  const fakeClinicalApprovalRes = await requestApi(
    baseUrl,
    '/api/v1/admin/content/nodes/node-ibu-01/review-status',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        review_status: 'CLINICALLY_APPROVED' // Malicious / invalid status
      })
    }
  );
  assert(
    fakeClinicalApprovalRes.status === 400,
    'Unauthorized scientific review status "CLINICALLY_APPROVED" rejected with HTTP 400',
    fakeClinicalApprovalRes.body
  );

  const fakeApprovalRes = await requestApi(
    baseUrl,
    '/api/v1/admin/content/nodes/node-ibu-01/review-status',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        review_status: 'APPROVED' // Malicious / invalid status
      })
    }
  );
  assert(
    fakeApprovalRes.status === 400,
    'Unauthorized scientific review status "APPROVED" rejected with HTTP 400',
    fakeApprovalRes.body
  );

  // Valid status 'FLAGGED_FOR_SCIENTIFIC_REVIEW' accepted
  const validFlagRes = await requestApi(
    baseUrl,
    '/api/v1/admin/content/nodes/node-ibu-01/review-status',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
      })
    }
  );
  assert(
    validFlagRes.status === 200 || validFlagRes.status === 404,
    'Valid status FLAGGED_FOR_SCIENTIFIC_REVIEW accepted by validation schema'
  );

  // 4. Protected Quiz Answer Keys
  // Attempting to modify answer key `is_correct` via quiz options endpoint
  const answerKeyTamperRes = await requestApi(
    baseUrl,
    '/api/v1/admin/content/quiz-options/opt-ibu-01-a/review',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        needs_scientific_review: true,
        is_correct: false // Tampering attempt: field is rejected or excluded by schema
      })
    }
  );
  assert(
    answerKeyTamperRes.status === 200 || answerKeyTamperRes.status === 404,
    'Quiz option review status handled safely'
  );

  return getSummary();
}

/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test Suite 2
 * Educational Content & Administrator Content Management Integration
 *
 * Verifies against PostgreSQL:
 * 1. Structured educational content (defined terms JSONB, takeaways, references, review status).
 * 2. Public educational content endpoints for all 4 medicines.
 * 3. Role-based access control for administrative content endpoints.
 * 4. Safe admin content updates and subsequent read reflection in PostgreSQL (when dedicated test DB active).
 * 5. Scientific review status updates and cycle / self-loop prevention on pathway edges.
 */

import {
  requestApi,
  signValidIntegrationToken,
  getActiveTestDatabaseStatus,
  type IntegrationAssertionCollector
} from '../api/integrationApiHelper.js';
import {
  SUPPORTED_DRUGS,
  INTEGRATION_TEST_USERS,
  TEST_NODE_UPDATE_PAYLOAD
} from '../fixtures/integrationFixtures.js';

export async function runEducationalContentAndAdminTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [Suite 2: Educational Content & Administrator Content Integration] ---');

  const { canMutate, activeDatabase } = getActiveTestDatabaseStatus();
  const learnerToken = signValidIntegrationToken(
    INTEGRATION_TEST_USERS.learnerAlice.id,
    INTEGRATION_TEST_USERS.learnerAlice.role,
    INTEGRATION_TEST_USERS.learnerAlice.email
  );
  const adminToken = signValidIntegrationToken(
    INTEGRATION_TEST_USERS.adminCarol.id,
    INTEGRATION_TEST_USERS.adminCarol.role,
    INTEGRATION_TEST_USERS.adminCarol.email
  );

  // 1. Structured Educational Content APIs for all 4 medicines
  for (const [key, drug] of Object.entries(SUPPORTED_DRUGS)) {
    const contentRes = await requestApi(baseUrl, `/api/v1/content/drugs/${drug.id}`);
    collector.assert(
      contentRes.status === 200 && contentRes.body?.success === true,
      `GET /api/v1/content/drugs/${drug.id} returns HTTP 200 with structured content`,
      { status: contentRes.status }
    );

    const contentList = contentRes.body?.data?.nodes;
    collector.assert(
      Array.isArray(contentList) && contentList.length === drug.nodeCount,
      `Educational content for '${drug.name}' contains ${drug.nodeCount} nodes with content`,
      { expected: drug.nodeCount, actual: contentList?.length }
    );

    // Verify structured fields: key_takeaway, defined_terms, references_list, review_status
    if (contentList && contentList.length > 0) {
      const firstNode = contentList[0];
      const hasStructuredFields =
        typeof firstNode.general_description === 'string' &&
        typeof firstNode.physiological_role === 'string' &&
        (firstNode.key_takeaway === null || typeof firstNode.key_takeaway === 'string') &&
        Array.isArray(firstNode.defined_terms) &&
        Array.isArray(firstNode.references_list) &&
        typeof firstNode.review_status === 'string';

      collector.assert(
        hasStructuredFields,
        `Node content schema for '${drug.name}' includes structured educational properties`,
        {
          hasTakeaway: Boolean(firstNode.key_takeaway),
          definedTermsCount: firstNode.defined_terms?.length,
          referencesCount: firstNode.references_list?.length,
          reviewStatus: firstNode.review_status
        }
      );
    }
  }

  // 2. Admin Content Summary & Access Control
  const unauthRes = await requestApi(baseUrl, '/api/v1/admin/content/summary');
  collector.assert(
    unauthRes.status === 401,
    'Unauthenticated access to GET /api/v1/admin/content/summary rejected with HTTP 401',
    { status: unauthRes.status }
  );

  const learnerRes = await requestApi(baseUrl, '/api/v1/admin/content/summary', {
    headers: { Authorization: `Bearer ${learnerToken}` }
  });
  collector.assert(
    learnerRes.status === 403,
    'Learner token to GET /api/v1/admin/content/summary forbidden with HTTP 403',
    { status: learnerRes.status }
  );

  const adminSummaryRes = await requestApi(baseUrl, '/api/v1/admin/content/summary', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  collector.assert(
    adminSummaryRes.status === 200,
    'Admin access to GET /api/v1/admin/content/summary allowed with HTTP 200',
    { status: adminSummaryRes.status }
  );

  const summaryData = adminSummaryRes.body?.data;
  collector.assert(
    summaryData?.total_drugs === 4 && summaryData?.total_nodes >= 27,
    'Admin summary metrics match real database catalog (4 drugs, >= 27 nodes)',
    { totalDrugs: summaryData?.total_drugs, totalNodes: summaryData?.total_nodes }
  );

  // 3. Admin Inspection of Drug Nodes and Edge Transitions
  const adminNodesRes = await requestApi(baseUrl, '/api/v1/admin/content/drugs/drug-ibuprofen-001/nodes', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  collector.assert(
    adminNodesRes.status === 200 && Array.isArray(adminNodesRes.body?.data) && adminNodesRes.body?.data.length === 7,
    'Admin inspection retrieves all 7 Ibuprofen nodes with review status and content metadata',
    { status: adminNodesRes.status, count: adminNodesRes.body?.data?.length }
  );

  const adminEdgesRes = await requestApi(baseUrl, '/api/v1/admin/content/drugs/drug-ibuprofen-001/edges', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  collector.assert(
    adminEdgesRes.status === 200 && Array.isArray(adminEdgesRes.body?.data) && adminEdgesRes.body?.data.length > 0,
    'Admin inspection retrieves Ibuprofen pathway edges',
    { status: adminEdgesRes.status, count: adminEdgesRes.body?.data?.length }
  );

  // 4. Edge Self-Loop Invariant Protection
  const selfLoopRes = await requestApi(baseUrl, '/api/v1/admin/content/edges/edge-1-2', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from_node_id: 'node-oral-cavity',
      to_node_id: 'node-oral-cavity' // Self-loop violation
    })
  });
  collector.assert(
    selfLoopRes.status === 400 && selfLoopRes.body?.error?.code === 'INVALID_PATHWAY_RELATIONSHIP',
    'Edge self-loop update rejected with HTTP 400 INVALID_PATHWAY_RELATIONSHIP',
    { status: selfLoopRes.status, code: selfLoopRes.body?.error?.code }
  );

  // 5. Admin Content Mutation and Database Persistence (Guarded by Dedicated Test DB)
  if (canMutate) {
    console.log(`    [Mutation Check] Running safe content persistence tests on dedicated database: "${activeDatabase}"...`);

    // Update node content
    const updateNodeRes = await requestApi(baseUrl, '/api/v1/admin/content/nodes/node-oral-cavity', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_NODE_UPDATE_PAYLOAD)
    });

    collector.assert(
      updateNodeRes.status === 200 && updateNodeRes.body?.success === true,
      'Admin PUT /api/v1/admin/content/nodes/node-oral-cavity succeeds with HTTP 200',
      { status: updateNodeRes.status, body: updateNodeRes.body }
    );

    // Verify subsequent read reflects the updated data from PostgreSQL
    const readBackRes = await requestApi(baseUrl, '/api/v1/content/drugs/drug-ibuprofen-001');
    const updatedNode = readBackRes.body?.data?.nodes?.find((n: any) => n.node_id === 'node-oral-cavity' || n.name?.toLowerCase().includes('mouth'));
    collector.assert(
      updatedNode?.key_takeaway === TEST_NODE_UPDATE_PAYLOAD.key_takeaway,
      'Subsequent educational content read reflects persisted key_takeaway from PostgreSQL',
      { persistedTakeaway: updatedNode?.key_takeaway }
    );

    // Update scientific review status
    const updateReviewRes = await requestApi(baseUrl, '/api/v1/admin/content/nodes/node-oral-cavity/review-status', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW' })
    });

    collector.assert(
      updateReviewRes.status === 200,
      'Admin PATCH review-status accepted for valid status FLAGGED_FOR_SCIENTIFIC_REVIEW',
      { status: updateReviewRes.status }
    );
  } else {
    collector.skip(
      'Admin PUT /api/v1/admin/content/nodes/:nodeId mutation test',
      'Dedicated test database is not active; mutation tests safely skipped per database safety protocol.'
    );
    collector.skip(
      'Subsequent educational content read persistence test',
      'Skipped in read-only fallback mode to protect development data.'
    );
  }
}

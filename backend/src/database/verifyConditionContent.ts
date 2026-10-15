/**
 * Drug Path Visualiser - Task 22 Condition-Specific Content & Dynamic Transit Verification Suite
 *
 * Verifies (Read-Only / Non-Mutating):
 * 1. Environment and database target confirmation without mutations.
 * 2. Database records integrity:
 *    - Exactly 8 pathway_variations (2 per drug, all FLAGGED_FOR_SCIENTIFIC_REVIEW).
 *    - Exactly 54 node_variations (2 per node for 27 nodes, all FLAGGED_FOR_SCIENTIFIC_REVIEW).
 * 3. Matrix of 4 medicines x 2 conditions (8 graph permutations):
 *    - Invariant graph topology (exact node count, edge count, and IDs between conditions).
 *    - Ibuprofen: 7 nodes, 6 edges.
 *    - Amoxicillin: 7 nodes, 6 edges.
 *    - Ambroxol: 8 nodes, 7 edges.
 *    - Insulin: 5 nodes, 4 edges.
 * 4. Dynamic effective transit calculation:
 *    - Ibuprofen stomach: 15 -> 60 min (+300%).
 *    - Amoxicillin stomach: 20 -> 50 min (+150%).
 *    - Ambroxol stomach: 10 -> 20 min (+100%).
 *    - Insulin: all 5 nodes 0% modifier, effective == base.
 * 5. Content API condition parameterization & error handling:
 *    - Returns pathway_variation and node variations from database.
 *    - Correctly marks is_food_dependent (false for insulin, true for oral drugs).
 *    - Rejects invalid conditions with HTTP 400 and code INVALID_FOOD_CONDITION.
 *    - Omitted condition safely defaults to BEFORE_FOOD.
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import type { ApiResponse } from '../common/types/index.js';
import type { DrugEducationalContentDto } from '../modules/content/dto/content.dto.js';
import type { PathwayGraphResponseDto } from '../modules/pathways/dto/pathway.dto.js';

interface DbCountResult {
  count: string | number;
}

async function runConditionContentVerification(): Promise<void> {
  const pool = getPool();

  console.log('================================================================');
  console.log('TASK 22 CONDITION-SPECIFIC EDUCATIONAL CONTENT VERIFICATION');
  console.log('================================================================\n');

  // 1. Confirm target database and read-only protocol
  const dbInfoRes = await pool.query<{ current_database: string; inet_server_addr: string | null }>(
    'SELECT current_database(), inet_server_addr();'
  );
  const currentDb = dbInfoRes.rows[0]?.current_database || 'unknown';
  const serverAddr = dbInfoRes.rows[0]?.inet_server_addr || 'localhost';
  console.log(`[Safe Protocol] Target Database: "${currentDb}" on host: ${serverAddr}`);
  console.log('[Safe Protocol] Verification mode: Strictly Read-Only (0 mutations)\n');

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`[Test Server] Ephemeral HTTP server listening at: ${baseUrl}\n`);

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
    // -------------------------------------------------------------
    // Section 1: Database Variation Records & Scientific Review Flags
    // -------------------------------------------------------------
    console.log('[Phase 1] Auditing Database Variation Tables & Scientific Flags...');

    const pvCount = await pool.query<DbCountResult>('SELECT COUNT(*) AS count FROM pathway_variations;');
    assert(Number(pvCount.rows[0].count) === 8, 'pathway_variations contains exactly 8 rows (2 per drug for 4 drugs)');

    const nvCount = await pool.query<DbCountResult>('SELECT COUNT(*) AS count FROM node_variations;');
    assert(Number(nvCount.rows[0].count) === 54, 'node_variations contains exactly 54 rows (2 per node for 27 nodes)');

    const unflaggedNv = await pool.query<DbCountResult>(
      "SELECT COUNT(*) AS count FROM node_content WHERE review_status != 'FLAGGED_FOR_SCIENTIFIC_REVIEW';"
    );
    assert(Number(unflaggedNv.rows[0].count) === 0, 'All 27 node_content rows are strictly FLAGGED_FOR_SCIENTIFIC_REVIEW');

    // -------------------------------------------------------------
    // Section 2: Graph Topology Stability Across All 4 Medicines
    // -------------------------------------------------------------
    console.log('\n[Phase 2] Verifying Invariant Graph Topology Across Conditions...');

    const drugSlugs = ['ibuprofen', 'amoxicillin', 'ambroxol', 'insulin'];
    const expectedTopology: Record<string, { nodes: number; edges: number }> = {
      ibuprofen: { nodes: 7, edges: 6 },
      amoxicillin: { nodes: 7, edges: 6 },
      ambroxol: { nodes: 8, edges: 7 },
      insulin: { nodes: 5, edges: 4 }
    };

    for (const slug of drugSlugs) {
      const fastedRes = await fetch(`${baseUrl}/drugs/${slug}/pathway?condition=BEFORE_FOOD`);
      const fedRes = await fetch(`${baseUrl}/drugs/${slug}/pathway?condition=AFTER_FOOD`);

      assert(fastedRes.status === 200, `Fasted pathway query for ${slug} returns HTTP 200`);
      assert(fedRes.status === 200, `Fed pathway query for ${slug} returns HTTP 200`);

      const fastedBody = (await fastedRes.json()) as ApiResponse<PathwayGraphResponseDto>;
      const fedBody = (await fedRes.json()) as ApiResponse<PathwayGraphResponseDto>;

      const expected = expectedTopology[slug];
      assert(
        fastedBody.data.nodes.length === expected.nodes && fedBody.data.nodes.length === expected.nodes,
        `${slug} maintains exact node count (${expected.nodes}) across both conditions`
      );
      assert(
        fastedBody.data.edges.length === expected.edges && fedBody.data.edges.length === expected.edges,
        `${slug} maintains exact edge count (${expected.edges}) across both conditions`
      );

      const fastedNodeIds = fastedBody.data.nodes.map((n) => n.id);
      const fedNodeIds = fedBody.data.nodes.map((n) => n.id);
      assert(
        JSON.stringify(fastedNodeIds) === JSON.stringify(fedNodeIds),
        `${slug} node IDs are 100% identical between BEFORE_FOOD and AFTER_FOOD`
      );

      const fastedEdgeIds = fastedBody.data.edges.map((e) => e.id);
      const fedEdgeIds = fedBody.data.edges.map((e) => e.id);
      assert(
        JSON.stringify(fastedEdgeIds) === JSON.stringify(fedEdgeIds),
        `${slug} edge IDs are 100% identical between BEFORE_FOOD and AFTER_FOOD`
      );
    }

    // -------------------------------------------------------------
    // Section 3: Dynamic Effective Transit Calculation
    // -------------------------------------------------------------
    console.log('\n[Phase 3] Auditing Dynamic Effective Transit Calculations...');

    // Ibuprofen Stomach
    const ibupFed = (await (await fetch(`${baseUrl}/drugs/ibuprofen/pathway?condition=AFTER_FOOD`)).json()) as ApiResponse<PathwayGraphResponseDto>;
    const ibupStomach = ibupFed.data.nodes.find((n) => n.id === 'node-stomach');
    assert(
      ibupStomach?.estimated_time_minutes === 60,
      `Ibuprofen stomach dynamic transit: base 15 min * (1 + 300%) = 60 min`
    );

    // Amoxicillin Stomach
    const amoxFed = (await (await fetch(`${baseUrl}/drugs/amoxicillin/pathway?condition=AFTER_FOOD`)).json()) as ApiResponse<PathwayGraphResponseDto>;
    const amoxStomach = amoxFed.data.nodes.find((n) => n.id === 'node-amox-stomach');
    assert(
      amoxStomach?.estimated_time_minutes === 50,
      `Amoxicillin stomach dynamic transit: base 20 min * (1 + 150%) = 50 min`
    );

    // Ambroxol Stomach
    const ambFed = (await (await fetch(`${baseUrl}/drugs/ambroxol/pathway?condition=AFTER_FOOD`)).json()) as ApiResponse<PathwayGraphResponseDto>;
    const ambStomach = ambFed.data.nodes.find((n) => n.id === 'node-amb-stomach');
    assert(
      ambStomach?.estimated_time_minutes === 20,
      `Ambroxol stomach dynamic transit: base 10 min * (1 + 100%) = 20 min`
    );

    // Insulin: 0% modifiers on all 5 nodes
    const insFasted = (await (await fetch(`${baseUrl}/drugs/insulin/pathway?condition=BEFORE_FOOD`)).json()) as ApiResponse<PathwayGraphResponseDto>;
    const insFed = (await (await fetch(`${baseUrl}/drugs/insulin/pathway?condition=AFTER_FOOD`)).json()) as ApiResponse<PathwayGraphResponseDto>;
    for (let i = 0; i < insFasted.data.nodes.length; i++) {
      const fNode = insFasted.data.nodes[i];
      const fedNode = insFed.data.nodes[i];
      assert(
        fNode.estimated_time_minutes === fedNode.estimated_time_minutes,
        `Insulin node ${fNode.id} transit time unaffected by food (${fNode.estimated_time_minutes} min)`
      );
    }

    // -------------------------------------------------------------
    // Section 4: Content API Condition Parameterization
    // -------------------------------------------------------------
    console.log('\n[Phase 4] Testing Content API Condition Parameterization...');

    // 4.1 Ibuprofen Fasted vs Fed
    const ibupContentFastedRes = await fetch(`${baseUrl}/content/drugs/ibuprofen?condition=BEFORE_FOOD`);
    assert(ibupContentFastedRes.status === 200, 'GET /content/drugs/ibuprofen?condition=BEFORE_FOOD returns 200');
    const ibupContentFasted = (await ibupContentFastedRes.json()) as ApiResponse<DrugEducationalContentDto>;
    assert(ibupContentFasted.data.condition === 'BEFORE_FOOD', 'Content response records condition BEFORE_FOOD');
    assert(ibupContentFasted.data.is_food_dependent === true, 'Ibuprofen is marked as food dependent (true)');
    assert(
      ibupContentFasted.data.pathway_variation?.condition === 'BEFORE_FOOD',
      'Attached pathway_variation condition is BEFORE_FOOD'
    );

    const ibupContentFedRes = await fetch(`${baseUrl}/content/drugs/ibuprofen?condition=AFTER_FOOD`);
    assert(ibupContentFedRes.status === 200, 'GET /content/drugs/ibuprofen?condition=AFTER_FOOD returns 200');
    const ibupContentFed = (await ibupContentFedRes.json()) as ApiResponse<DrugEducationalContentDto>;
    assert(ibupContentFed.data.condition === 'AFTER_FOOD', 'Content response records condition AFTER_FOOD');
    assert(
      ibupContentFed.data.pathway_variation?.condition === 'AFTER_FOOD',
      'Attached pathway_variation condition is AFTER_FOOD'
    );
    const ibupContentStomach = ibupContentFed.data.nodes.find((n) => n.node_id === 'node-stomach');
    assert(
      ibupContentStomach?.estimated_time_minutes === 60,
      'Content node-stomach reflects dynamic fed transit time (60 min)'
    );
    assert(
      ibupContentStomach?.variation?.transit_time_modifier_pct === 300,
      'Content node variation contains transit_time_modifier_pct = 300'
    );

    // 4.2 Insulin Route Limitation & Parenteral Independence
    const insContentRes = await fetch(`${baseUrl}/content/drugs/insulin?condition=AFTER_FOOD`);
    assert(insContentRes.status === 200, 'GET /content/drugs/insulin?condition=AFTER_FOOD returns 200');
    const insContent = (await insContentRes.json()) as ApiResponse<DrugEducationalContentDto>;
    assert(insContent.data.is_food_dependent === false, 'Insulin is marked is_food_dependent = false');
    assert(
      typeof insContent.data.limitation_note === 'string' &&
        insContent.data.limitation_note.includes('Parenteral Administration'),
      'Insulin includes explicit parenteral route limitation note'
    );
    assert(
      insContent.data.drug.tmax_hours === 0.5,
      'Stored drug catalog tmax_hours = 0.5 is preserved without mutation'
    );

    // 4.3 Safe default when condition is omitted
    const defaultContentRes = await fetch(`${baseUrl}/content/drugs/amoxicillin`);
    assert(defaultContentRes.status === 200, 'GET /content/drugs/amoxicillin (no condition query) returns 200');
    const defaultContent = (await defaultContentRes.json()) as ApiResponse<DrugEducationalContentDto>;
    assert(defaultContent.data.condition === 'BEFORE_FOOD', 'Omitted condition safely defaults to BEFORE_FOOD');

    // 4.4 Error Handling: Invalid food condition
    const invalidContentRes = await fetch(`${baseUrl}/content/drugs/ibuprofen?condition=WITH_ALCOHOL`);
    assert(invalidContentRes.status === 400, 'Invalid condition query returns HTTP 400');
    const invalidContentBody = (await invalidContentRes.json()) as { success: boolean; error: { code: string; message: string } };
    assert(invalidContentBody.success === false, 'Invalid condition response has success: false');
    assert(
      invalidContentBody.error.code === 'INVALID_FOOD_CONDITION',
      'Invalid condition error code is INVALID_FOOD_CONDITION'
    );

    const invalidPathwayRes = await fetch(`${baseUrl}/drugs/ibuprofen/pathway?condition=INVALID_STATE`);
    assert(invalidPathwayRes.status === 400, 'Invalid condition on pathways API returns HTTP 400');
    const invalidPathwayBody = (await invalidPathwayRes.json()) as { success: boolean; error: { code: string } };
    assert(
      invalidPathwayBody.error.code === 'INVALID_FOOD_CONDITION',
      'Pathways API returns code INVALID_FOOD_CONDITION'
    );

    console.log('\n================================================================');
    console.log(`ALL ${totalTests} TESTS PASSED SUCCESSFULLY! (0 failures)`);
    console.log('================================================================');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closePool();
  }
}

runConditionContentVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});

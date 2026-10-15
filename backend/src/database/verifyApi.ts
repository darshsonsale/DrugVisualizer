/**
 * Drug Path Visualiser - Task 15 HTTP Integration Verification
 *
 * Verifies live database-backed REST endpoints:
 * - /api/v1/drugs (list & numeric types)
 * - /api/v1/drugs/:drugId (single & 404)
 * - /api/v1/drugs/:drugId/pathway (BEFORE_FOOD, AFTER_FOOD, invalid 400 condition, 404 missing)
 * - /api/v1/pathways/:pathwayId (metadata, nodes, edges, 404)
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { closePool } from './pool.js';

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

async function runApiVerification(): Promise<void> {
  console.log('[Test Suite] Initializing Express server for Task 15 API verification...');
  const app = createApp();

  // Listen on ephemeral OS-assigned port
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
    // ----------------------------------------------------
    // TEST 1: GET /api/v1/drugs (List & Numeric Types)
    // ----------------------------------------------------
    const drugsRes = await fetch(`${baseUrl}/drugs`);
    const drugsBody: any = await drugsRes.json();
    const isStatus200 = drugsRes.status === 200;
    const isSuccessEnvelope = drugsBody.success === true && Array.isArray(drugsBody.data);
    const has4Drugs = drugsBody.data?.length >= 4;
    const ibuprofen = drugsBody.data?.find((d: any) => d.id === 'drug-ibuprofen-001');

    const numericFieldsValid =
      typeof ibuprofen?.half_life_hours === 'number' &&
      typeof ibuprofen?.bioavailability_pct === 'number' &&
      typeof ibuprofen?.cmax_ug_ml === 'number' &&
      typeof ibuprofen?.tmax_hours === 'number';

    record(
      'GET /api/v1/drugs returns 200 with JSON drug list and valid numeric types',
      isStatus200 && isSuccessEnvelope && has4Drugs && numericFieldsValid,
      `status=${drugsRes.status}, count=${drugsBody.data?.length}, ibuprofen half_life=${ibuprofen?.half_life_hours} (type: ${typeof ibuprofen?.half_life_hours})`
    );

    // ----------------------------------------------------
    // TEST 2: GET /api/v1/drugs/:drugId (Single Drug)
    // ----------------------------------------------------
    const singleDrugRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001`);
    const singleDrugBody: any = await singleDrugRes.json();
    const singleDrugValid =
      singleDrugRes.status === 200 &&
      singleDrugBody.success === true &&
      singleDrugBody.data?.name === 'Ibuprofen' &&
      singleDrugBody.data?.form === 'Tablets';

    record(
      'GET /api/v1/drugs/:drugId returns 200 with specific drug details',
      singleDrugValid,
      `status=${singleDrugRes.status}, name=${singleDrugBody.data?.name}`
    );

    // ----------------------------------------------------
    // TEST 3: GET /api/v1/drugs/:drugId (Missing Resource 404)
    // ----------------------------------------------------
    const missingDrugRes = await fetch(`${baseUrl}/drugs/non-existent-drug-xyz`);
    const missingDrugBody: any = await missingDrugRes.json();
    const missingDrugValid =
      missingDrugRes.status === 404 &&
      missingDrugBody.success === false &&
      missingDrugBody.error?.code === 'RESOURCE_NOT_FOUND';

    record(
      'GET /api/v1/drugs/:drugId returns 404 RESOURCE_NOT_FOUND for unknown drug',
      missingDrugValid,
      `status=${missingDrugRes.status}, code=${missingDrugBody.error?.code}`
    );

    // ----------------------------------------------------
    // TEST 4: GET /api/v1/drugs/:drugId/pathway?condition=BEFORE_FOOD (Fasting)
    // ----------------------------------------------------
    const fastingRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const fastingBody: any = await fastingRes.json();
    const fastingData = fastingBody.data;

    const hasGraphStructure =
      fastingRes.status === 200 &&
      fastingBody.success === true &&
      fastingData?.drug?.id === 'drug-ibuprofen-001' &&
      fastingData?.pathway?.condition === 'BEFORE_FOOD' &&
      Array.isArray(fastingData?.nodes) &&
      Array.isArray(fastingData?.edges);

    const has7Nodes = fastingData?.nodes?.length === 7;
    const has6Edges = fastingData?.edges?.length === 6;

    const stomachFasting = fastingData?.nodes?.find((n: any) => n.id === 'node-stomach');
    const stomachFastingTimeValid =
      stomachFasting?.estimated_time_minutes === 15 &&
      typeof stomachFasting?.estimated_time_minutes === 'number';

    const node1ContentValid =
      fastingData?.nodes[0]?.content?.micro_environment_ph === 6.8 &&
      typeof fastingData?.nodes[0]?.content?.micro_environment_ph === 'number';

    record(
      'GET /api/v1/drugs/:drugId/pathway?condition=BEFORE_FOOD returns complete 7-node graph with numeric fields',
      hasGraphStructure && has7Nodes && has6Edges && stomachFastingTimeValid && node1ContentValid,
      `nodes=${fastingData?.nodes?.length}, edges=${fastingData?.edges?.length}, stomach_time=${stomachFasting?.estimated_time_minutes} min`
    );

    // ----------------------------------------------------
    // TEST 5: GET /api/v1/drugs/:drugId/pathway?condition=AFTER_FOOD (Fed state)
    // ----------------------------------------------------
    const fedRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway?condition=AFTER_FOOD`);
    const fedBody: any = await fedRes.json();
    const fedData = fedBody.data;

    const fedPathwayConditionValid = fedData?.pathway?.condition === 'AFTER_FOOD';
    const fedDrugTmaxValid = fedData?.drug?.tmax_hours === 2.5;

    const stomachFed = fedData?.nodes?.find((n: any) => n.id === 'node-stomach');
    const stomachFedTimeValid =
      stomachFed?.estimated_time_minutes === 60 &&
      typeof stomachFed?.estimated_time_minutes === 'number';

    const stomachVariationValid =
      stomachFed?.variation?.condition === 'AFTER_FOOD' &&
      stomachFed?.variation?.transit_time_modifier_pct === 300 &&
      typeof stomachFed?.variation?.transit_time_modifier_pct === 'number' &&
      stomachFed?.variation?.clinical_observation?.includes('delay');

    record(
      'GET /api/v1/drugs/:drugId/pathway?condition=AFTER_FOOD overlays fed state transit delays correctly',
      fedRes.status === 200 &&
        fedPathwayConditionValid &&
        fedDrugTmaxValid &&
        stomachFedTimeValid &&
        stomachVariationValid,
      `tmax=${fedData?.drug?.tmax_hours}h, stomach_time=${stomachFed?.estimated_time_minutes} min, transit_mod=${stomachFed?.variation?.transit_time_modifier_pct}%`
    );

    // ----------------------------------------------------
    // TEST 6: GET /api/v1/drugs/:drugId/pathway?condition=INVALID_STATE (400)
    // ----------------------------------------------------
    const invalidCondRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway?condition=WITH_COFFEE`);
    const invalidCondBody: any = await invalidCondRes.json();
    const invalidCondValid =
      invalidCondRes.status === 400 &&
      invalidCondBody.success === false &&
      invalidCondBody.error?.code === 'INVALID_FOOD_CONDITION';

    record(
      'GET /api/v1/drugs/:drugId/pathway rejects invalid condition with HTTP 400',
      invalidCondValid,
      `status=${invalidCondRes.status}, code=${invalidCondBody.error?.code}`
    );

    // ----------------------------------------------------
    // TEST 7: GET /api/v1/pathways/:pathwayId (Complete PathwayGraphResponse by pathway ID)
    // ----------------------------------------------------
    const pathwayMetaRes = await fetch(`${baseUrl}/pathways/pathway-ibuprofen-fasting`);
    const pathwayMetaBody: any = await pathwayMetaRes.json();
    const pathwayData = pathwayMetaBody.data;
    const pathwayMetaValid =
      pathwayMetaRes.status === 200 &&
      pathwayMetaBody.success === true &&
      pathwayData?.pathway?.id === 'pathway-ibuprofen-fasting' &&
      pathwayData?.drug?.id === 'drug-ibuprofen-001' &&
      Array.isArray(pathwayData?.nodes) &&
      pathwayData?.nodes?.length === 7 &&
      Array.isArray(pathwayData?.edges) &&
      pathwayData?.edges?.length === 6;

    record(
      'GET /api/v1/pathways/:pathwayId returns 200 with complete PathwayGraphResponse',
      pathwayMetaValid,
      `status=${pathwayMetaRes.status}, pathway_id=${pathwayData?.pathway?.id}, nodes=${pathwayData?.nodes?.length}, edges=${pathwayData?.edges?.length}`
    );

    // ----------------------------------------------------
    // TEST 8: GET /api/v1/pathways/:pathwayId/nodes
    // ----------------------------------------------------
    const nodesRes = await fetch(`${baseUrl}/pathways/pathway-ibuprofen-fasting/nodes`);
    const nodesBody: any = await nodesRes.json();
    const nodesValid =
      nodesRes.status === 200 &&
      nodesBody.success === true &&
      Array.isArray(nodesBody.data) &&
      nodesBody.data.length === 7;

    record(
      'GET /api/v1/pathways/:pathwayId/nodes returns 200 with 7 ordered nodes',
      nodesValid,
      `status=${nodesRes.status}, count=${nodesBody.data?.length}`
    );

    // ----------------------------------------------------
    // TEST 9: GET /api/v1/pathways/:pathwayId/edges
    // ----------------------------------------------------
    const edgesRes = await fetch(`${baseUrl}/pathways/pathway-ibuprofen-fasting/edges`);
    const edgesBody: any = await edgesRes.json();
    const edge1 = edgesBody.data?.[0];
    const edgeDurationNumber =
      edge1?.transition_duration_minutes != null &&
      typeof edge1.transition_duration_minutes === 'number';

    const edgesValid =
      edgesRes.status === 200 &&
      edgesBody.success === true &&
      Array.isArray(edgesBody.data) &&
      edgesBody.data.length === 6 &&
      edgeDurationNumber;

    record(
      'GET /api/v1/pathways/:pathwayId/edges returns 200 with 6 edges and numeric durations',
      edgesValid,
      `status=${edgesRes.status}, count=${edgesBody.data?.length}, duration_type=${typeof edge1?.transition_duration_minutes}`
    );

    // ----------------------------------------------------
    // TEST 10: GET /api/v1/pathways/:pathwayId (Missing 404)
    // ----------------------------------------------------
    const missingPathwayRes = await fetch(`${baseUrl}/pathways/non-existent-pathway-xyz`);
    const missingPathwayBody: any = await missingPathwayRes.json();
    const missingPathwayValid =
      missingPathwayRes.status === 404 &&
      missingPathwayBody.success === false &&
      missingPathwayBody.error?.code === 'RESOURCE_NOT_FOUND';

    record(
      'GET /api/v1/pathways/:pathwayId returns 404 for unknown pathway',
      missingPathwayValid,
      `status=${missingPathwayRes.status}, code=${missingPathwayBody.error?.code}`
    );
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    console.log('[Test Suite] HTTP server shut down cleanly.');
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n=========================================');
  console.log(`Task 15 API Test Results: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length}`);
  console.log('=========================================');

  if (failedCount > 0) {
    throw new Error(`${failedCount} test(s) failed in Task 15 verification suite.`);
  }
}

// Direct execution
runApiVerification()
  .then(async () => {
    await closePool();
    console.log('[Test Suite] All Task 15 API tests completed successfully.');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[Test Suite] API Verification failed with error:', err);
    await closePool();
    process.exit(1);
  });

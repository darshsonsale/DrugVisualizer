/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test Suite 1
 * Pathways, Anatomical Topologies & Condition-Aware Variations
 *
 * Verifies against PostgreSQL:
 * 1. All 4 supported medicines (Ibuprofen, Amoxicillin, Ambroxol, Insulin).
 * 2. Canonical IDs and slug aliases resolution.
 * 3. Node ordering, anatomical locations, organ systems, and graph edges.
 * 4. BEFORE_FOOD vs AFTER_FOOD condition-specific variations.
 * 5. Regular Human Insulin subcutaneous food-independence.
 * 6. Validation error rejection on invalid conditions and missing identifiers.
 */

import {
  requestApi,
  type IntegrationAssertionCollector
} from '../api/integrationApiHelper.js';
import {
  SUPPORTED_DRUGS,
  INVALID_FOOD_CONDITIONS
} from '../fixtures/integrationFixtures.js';

export async function runPathwaysAndVariationsTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [Suite 1: Pathways, Anatomical Topologies & Variations] ---');

  // 1. Drug Catalog API (GET /api/v1/drugs)
  const catalogRes = await requestApi(baseUrl, '/api/v1/drugs');
  collector.assert(
    catalogRes.status === 200,
    'GET /api/v1/drugs returns HTTP 200 OK',
    { status: catalogRes.status }
  );

  const catalog = catalogRes.body?.data;
  collector.assert(
    Array.isArray(catalog) && catalog.length >= 4,
    'GET /api/v1/drugs catalog includes all 4 supported medicines',
    { count: catalog?.length }
  );

  // 2. Cross-Medicine Canonical vs Slug resolution & PK/PD parameter types
  for (const [key, drug] of Object.entries(SUPPORTED_DRUGS)) {
    // Canonical ID lookup
    const canonicalRes = await requestApi(baseUrl, `/api/v1/drugs/${drug.id}`);
    collector.assert(
      canonicalRes.status === 200 && canonicalRes.body?.data?.id === drug.id,
      `GET /api/v1/drugs/:id resolves '${drug.name}' by canonical ID (${drug.id})`,
      { status: canonicalRes.status, id: canonicalRes.body?.data?.id }
    );

    // Slug alias lookup
    const slugRes = await requestApi(baseUrl, `/api/v1/drugs/${drug.slug}`);
    collector.assert(
      slugRes.status === 200 && slugRes.body?.data?.id === drug.id,
      `GET /api/v1/drugs/:slug resolves '${drug.name}' by slug alias ('${drug.slug}')`,
      { status: slugRes.status, id: slugRes.body?.data?.id }
    );

    // PK/PD properties numeric check
    const drugData = canonicalRes.body?.data;
    const pkValid =
      typeof drugData?.half_life_hours === 'number' &&
      typeof drugData?.bioavailability_pct === 'number' &&
      typeof drugData?.cmax_ug_ml === 'number' &&
      typeof drugData?.tmax_hours === 'number';

    collector.assert(
      pkValid,
      `PK/PD properties for '${drug.name}' have valid numeric types in JSON response`,
      {
        half_life: drugData?.half_life_hours,
        bioavailability: drugData?.bioavailability_pct,
        tmax: drugData?.tmax_hours
      }
    );
  }

  // 3. Full Pathway Graph & Node Ordering for All 4 Medicines
  for (const [key, drug] of Object.entries(SUPPORTED_DRUGS)) {
    const pathwayRes = await requestApi(baseUrl, `/api/v1/drugs/${drug.id}/pathway`);
    collector.assert(
      pathwayRes.status === 200 && pathwayRes.body?.success === true,
      `GET /api/v1/drugs/${drug.id}/pathway returns valid pathway graph envelope`,
      { status: pathwayRes.status }
    );

    const nodes = pathwayRes.body?.data?.nodes;
    const edges = pathwayRes.body?.data?.edges;

    collector.assert(
      Array.isArray(nodes) && nodes.length === drug.nodeCount,
      `Pathway for '${drug.name}' has exactly ${drug.nodeCount} anatomical nodes matching PostgreSQL`,
      { expected: drug.nodeCount, actual: nodes?.length }
    );

    // Node ordering sequential check
    let ordersCorrect = true;
    for (let i = 0; i < (nodes?.length || 0); i++) {
      if (nodes[i].node_order !== i + 1) {
        ordersCorrect = false;
        break;
      }
    }
    collector.assert(
      ordersCorrect,
      `Pathway nodes for '${drug.name}' are strictly ordered 1 through ${drug.nodeCount}`,
      { nodeOrders: nodes?.map((n: any) => n.node_order) }
    );

    // Directed Edges integrity: edges should connect valid nodes within this pathway
    collector.assert(
      Array.isArray(edges) && edges.length > 0,
      `Pathway for '${drug.name}' contains valid directed edges`,
      { edgeCount: edges?.length }
    );

    const nodeIds = new Set(nodes?.map((n: any) => n.id));
    const allEdgesValid = edges?.every((e: any) => nodeIds.has(e.from_node_id) && nodeIds.has(e.to_node_id));
    collector.assert(
      allEdgesValid,
      `All edge transitions for '${drug.name}' connect existing nodes within the pathway`,
      { allEdgesValid }
    );
  }

  // 4. Food Condition Variations: BEFORE_FOOD vs AFTER_FOOD
  // Test Ibuprofen
  const ibuBefore = await requestApi(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=BEFORE_FOOD');
  const ibuAfter = await requestApi(baseUrl, '/api/v1/drugs/ibuprofen/pathway?condition=AFTER_FOOD');

  collector.assert(
    ibuBefore.body?.data?.drug?.tmax_hours === 0.75,
    'Ibuprofen BEFORE_FOOD reflects baseline Tmax of 0.75 hours',
    { tmax: ibuBefore.body?.data?.drug?.tmax_hours }
  );
  collector.assert(
    ibuAfter.body?.data?.drug?.tmax_hours === 2.5,
    'Ibuprofen AFTER_FOOD reflects delayed Tmax of 2.5 hours',
    { tmax: ibuAfter.body?.data?.drug?.tmax_hours }
  );

  // Test Amoxicillin
  const amoxBefore = await requestApi(baseUrl, '/api/v1/drugs/amoxicillin/pathway?condition=BEFORE_FOOD');
  const amoxAfter = await requestApi(baseUrl, '/api/v1/drugs/amoxicillin/pathway?condition=AFTER_FOOD');
  collector.assert(
    amoxBefore.body?.data?.drug?.tmax_hours === 1.25 && amoxAfter.body?.data?.drug?.tmax_hours === 1.8,
    'Amoxicillin reflects condition-dependent Tmax shift (1.25h fasting -> 1.8h fed)',
    { before: amoxBefore.body?.data?.drug?.tmax_hours, after: amoxAfter.body?.data?.drug?.tmax_hours }
  );

  // Test Ambroxol
  const ambroxBefore = await requestApi(baseUrl, '/api/v1/drugs/ambroxol/pathway?condition=BEFORE_FOOD');
  const ambroxAfter = await requestApi(baseUrl, '/api/v1/drugs/ambroxol/pathway?condition=AFTER_FOOD');
  collector.assert(
    ambroxBefore.body?.data?.drug?.tmax_hours === 2.0 && ambroxAfter.body?.data?.drug?.tmax_hours === 2.5,
    'Ambroxol syrup reflects condition-dependent Tmax shift (2.0h fasting -> 2.5h fed)',
    { before: ambroxBefore.body?.data?.drug?.tmax_hours, after: ambroxAfter.body?.data?.drug?.tmax_hours }
  );

  // 5. Regular Human Insulin: Physiologic Food Independence
  const insBefore = await requestApi(baseUrl, '/api/v1/drugs/insulin/pathway?condition=BEFORE_FOOD');
  const insAfter = await requestApi(baseUrl, '/api/v1/drugs/insulin/pathway?condition=AFTER_FOOD');

  collector.assert(
    insBefore.body?.data?.drug?.tmax_hours === 0.5 && insAfter.body?.data?.drug?.tmax_hours === 0.5,
    'Subcutaneous Regular Human Insulin Tmax remains 0.5h under both conditions (food-independent)',
    { before: insBefore.body?.data?.drug?.tmax_hours, after: insAfter.body?.data?.drug?.tmax_hours }
  );

  // 6. Invalid Food Condition Parameter Rejection
  for (const invalidCond of INVALID_FOOD_CONDITIONS) {
    const invalidRes = await requestApi(baseUrl, `/api/v1/drugs/ibuprofen/pathway?condition=${invalidCond}`);
    collector.assert(
      invalidRes.status === 400 && invalidRes.body?.error?.code === 'INVALID_FOOD_CONDITION',
      `Unsupported food condition '${invalidCond}' rejected with HTTP 400 INVALID_FOOD_CONDITION`,
      { status: invalidRes.status, code: invalidRes.body?.error?.code }
    );
  }

  // 7. Nonexistent Drug Lookup
  const notFoundRes = await requestApi(baseUrl, '/api/v1/drugs/drug-nonexistent-999');
  collector.assert(
    notFoundRes.status === 404 && notFoundRes.body?.success === false,
    'Nonexistent drug returns HTTP 404 NOT_FOUND envelope',
    { status: notFoundRes.status, body: notFoundRes.body }
  );
}

/**
 * Drug Path Visualiser (BioLumen) - Task 29 Master E2E & Acceptance Test Runner
 *
 * Coordinates execution of:
 * 1. Multi-Step End-to-End User Journeys (e2eWorkflows.test.ts)
 * 2. Official Roadmap MVP Use-Case Acceptance (useCaseAcceptance.test.ts: UC-01 through UC-06)
 *
 * Enforces strict PostgreSQL isolation:
 * - Directs execution to dedicated test database 'drug_visualizer_test'
 * - Guarantees zero mutation of 'drug_visualizer_dev' or production data
 * - Cleans up all isolated test entities on completion
 */

import {
  setupTestDatabase,
  cleanupIntegrationTestData,
  startIntegrationTestServer,
  createAssertionCollector,
} from '../api/integrationApiHelper.js';
import { closePool } from '../../src/database/pool.js';
import { runE2EWorkflowTests } from './e2eWorkflows.test.js';
import { runUseCaseAcceptanceTests } from '../use-cases/useCaseAcceptance.test.js';

export async function runAllE2ETests(): Promise<boolean> {
  console.log('================================================================');
  console.log('  BIOLUMEN / DRUG PATH VISUALISER - TASK 29 E2E & ACCEPTANCE   ');
  console.log('================================================================');

  const overallCollector = createAssertionCollector('Task 29 Master E2E Suite');
  let testServer: Awaited<ReturnType<typeof startIntegrationTestServer>> | null = null;

  try {
    // 1. Setup and verify dedicated PostgreSQL test database
    const dbStatus = await setupTestDatabase();
    console.log(`[Safety Notice] Dedicated test database active: ${dbStatus.isDedicatedTestDb} (Target: ${dbStatus.activeDatabase})`);
    console.log(`[Safety Notice] Mutation tests allowed: ${dbStatus.canMutate}`);

    // 2. Start ephemeral test Express server on an unassigned port
    console.log('\n[Init] Spawning ephemeral Express test server...');
    testServer = await startIntegrationTestServer();
    console.log(`[Init] Test server active at: ${testServer.baseUrl}`);

    // 3. Execute Suite 1: Multi-Step End-to-End User Journeys
    await runE2EWorkflowTests(testServer.baseUrl, overallCollector);

    // 4. Execute Suite 2: Official Roadmap MVP Use-Case Acceptance
    await runUseCaseAcceptanceTests(testServer.baseUrl, overallCollector);

  } catch (err) {
    console.error('\n[FATAL] Unexpected error during E2E test execution:', err);
    overallCollector.assert(false, 'Unexpected fatal E2E test runner failure', err);
  } finally {
    // Teardown
    console.log('\n[Teardown] Cleaning up isolated E2E test records...');
    await cleanupIntegrationTestData();

    if (testServer) {
      console.log('[Teardown] Closing ephemeral HTTP test server...');
      await testServer.close();
    }

    console.log('[Teardown] Closing database pools...');
    await closePool();
  }

  const summary = overallCollector.getSummary();
  console.log('\n================================================================');
  console.log('  TASK 29 E2E & MVP ACCEPTANCE AUDIT REPORT SUMMARY');
  console.log('================================================================');
  console.log(`  Total Checks Discovered : ${summary.discovered}`);
  console.log(`  Checks Passed           : ${summary.passed}`);
  console.log(`  Checks Failed           : ${summary.failed}`);
  console.log(`  Checks Skipped          : ${summary.skipped}`);
  console.log(`  Checks Blocked          : ${summary.blocked}`);
  console.log('================================================================');

  if (summary.failed > 0) {
    console.error('\nFailures Detected:');
    for (const f of summary.failures) {
      console.error(`  - ${f}`);
    }
    return false;
  } else {
    console.log('\n✅ ALL TASK 29 E2E AND MVP ACCEPTANCE CHECKS PASSED SUCCESSFULLY.');
    return true;
  }
}

// Direct execution when invoked via CLI
if (process.argv[1]?.includes('runAllE2ETests')) {
  runAllE2ETests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Runner Fatal]', err);
      process.exit(1);
    });
}

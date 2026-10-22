/**
 * Drug Path Visualiser (BioLumen) - Task 27 Master Integration Test Runner
 *
 * Coordinates execution of all 4 API and Database Integration test suites:
 * 1. Pathways, Anatomical Topologies & Variations (All 4 medicines, food conditions, insulin independence).
 * 2. Educational Content & Administrator Content Integration (Defined terms, takeaways, admin mutations).
 * 3. Checkpoint Quizzes, Grading & Progress Persistence (Server-side grading, attempt persistence, dashboard).
 * 4. Database Failure, Rollback & Relational Integrity (Atomic rollback, foreign keys, error envelopes).
 *
 * Implements strict PostgreSQL database safety:
 * - Requires dedicated test database 'drug_visualizer_test'.
 * - Protects 'drug_visualizer_dev' and production from any mutations.
 * - Dynamically tracks discovered, passed, failed, skipped, and blocked tests.
 */

import {
  setupTestDatabase,
  cleanupIntegrationTestData,
  startIntegrationTestServer,
  createAssertionCollector,
  getActiveTestDatabaseStatus
} from '../api/integrationApiHelper.js';
import { closePool } from '../../src/database/pool.js';
import { runPathwaysAndVariationsTests } from './pathwaysAndVariations.integration.test.js';
import { runEducationalContentAndAdminTests } from './educationalContentAndAdmin.integration.test.js';
import { runQuizAndProgressTests } from './quizAndProgress.integration.test.js';
import { runDatabaseFailureAndResilienceTests } from './databaseFailureAndResilience.integration.test.js';

export async function runAllIntegrationTests(): Promise<boolean> {
  console.log('================================================================');
  console.log('  BIOLUMEN / DRUG PATH VISUALISER - TASK 27 INTEGRATION SUITE  ');
  console.log('================================================================');

  const overallCollector = createAssertionCollector('Master Integration Suite');
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

    // 3. Execute Suite 1: Pathways, Anatomical Topologies & Variations
    await runPathwaysAndVariationsTests(testServer.baseUrl, overallCollector);

    // 4. Execute Suite 2: Educational Content & Administrator Content Management
    await runEducationalContentAndAdminTests(testServer.baseUrl, overallCollector);

    // 5. Execute Suite 3: Checkpoint Quizzes, Grading & Progress Persistence
    await runQuizAndProgressTests(testServer.baseUrl, overallCollector);

    // 6. Execute Suite 4: Database Failure, Rollback & Relational Integrity
    await runDatabaseFailureAndResilienceTests(testServer.baseUrl, overallCollector);

  } catch (err) {
    console.error('\n[FATAL] Unexpected error during integration test execution:', err);
    overallCollector.assert(false, 'Unexpected fatal test suite failure', err);
  } finally {
    // Teardown
    console.log('\n[Teardown] Cleaning up isolated integration test records...');
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
  console.log('  TASK 27 INTEGRATION TEST AUDIT REPORT SUMMARY');
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
    console.log('\n✅ ALL INTEGRATION VERIFICATION CHECKS PASSED SUCCESSFULLY.');
    return true;
  }
}

// Run test runner directly
if (process.argv[1]?.endsWith('runAllIntegrationTests.ts') || process.argv[1]?.endsWith('runAllIntegrationTests.js')) {
  runAllIntegrationTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled fatal error in master runner:', err);
      process.exit(1);
    });
}

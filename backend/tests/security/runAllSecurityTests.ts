/**
 * Drug Path Visualiser (BioLumen) - Task 26 Master Security Test Suite
 *
 * Coordinates and executes all 5 specialized security testing suites:
 * 1. Authentication Security (Token tampering, expired tokens, unauthenticated rejections)
 * 2. Authorization & Isolation (IDOR, role freshness, privilege escalation resistance)
 * 3. Input Validation & Malicious Inputs (SQLi, XSS, DoS, malformed JSON, quiz integrity)
 * 4. Admin Content Security (Task 25 admin authorization, pathway graph integrity, review constraints)
 * 5. Rate Limiting & Security Middleware (OWASP headers, rate limits, CORS)
 */

import {
  startTestServer,
  setupSecurityTestUsers,
  cleanupSecurityTestUsers,
  createAssertionCollector
} from '../api/securityApiHelper.js';
import { closePool } from '../../src/database/pool.js';
import { runAuthSecurityTests } from './authSecurity.test.js';
import { runAuthorizationIsolationTests } from './authorizationIsolation.test.js';
import { runInputValidationMaliciousTests } from './inputValidationMalicious.test.js';
import { runAdminContentSecurityTests } from './adminContentSecurity.test.js';
import { runRateLimitingMiddlewareTests } from './rateLimitingMiddleware.test.js';

export async function runAllSecuritySuites(): Promise<boolean> {
  console.log('================================================================');
  console.log('  BIOLUMEN / DRUG PATH VISUALISER - TASK 26 SECURITY TEST SUITE');
  console.log('================================================================');

  const overallCollector = createAssertionCollector('Master Security Suite');
  let testServer: Awaited<ReturnType<typeof startTestServer>> | null = null;

  try {
    // 1. Setup isolated test users in database
    console.log('\n[Init] Setting up isolated security test users...');
    await setupSecurityTestUsers();

    // 2. Start ephemeral test server
    console.log('[Init] Spawning ephemeral test server on free port...');
    testServer = await startTestServer();
    console.log(`[Init] Test server active at: ${testServer.baseUrl}`);

    // 3. Execute Suite 1: Authentication Security
    await runAuthSecurityTests(testServer.baseUrl, overallCollector);

    // 4. Execute Suite 2: Authorization & Isolation
    await runAuthorizationIsolationTests(testServer.baseUrl, overallCollector);

    // 5. Execute Suite 3: Input Validation & Malicious Inputs
    await runInputValidationMaliciousTests(testServer.baseUrl, overallCollector);

    // 6. Execute Suite 4: Admin Content Management Security
    await runAdminContentSecurityTests(testServer.baseUrl, overallCollector);

    // 7. Execute Suite 5: Rate Limiting & Security Middleware
    await runRateLimitingMiddlewareTests(testServer.baseUrl, overallCollector);

  } catch (err) {
    console.error('\n[FATAL] Unexpected error during security test suite execution:', err);
    overallCollector.assert(false, 'Unexpected fatal test suite failure', err);
  } finally {
    // Teardown
    console.log('\n[Teardown] Cleaning up isolated test users and attempts...');
    await cleanupSecurityTestUsers();

    if (testServer) {
      console.log('[Teardown] Closing test HTTP server...');
      await testServer.close();
    }

    console.log('[Teardown] Closing database pool...');
    await closePool();
  }

  const summary = overallCollector.getSummary();
  console.log('\n================================================================');
  console.log('  SECURITY TEST SUITE AUDIT REPORT SUMMARY');
  console.log('================================================================');
  console.log(`  Total Checks Executed : ${summary.total}`);
  console.log(`  Checks Passed         : ${summary.passed}`);
  console.log(`  Checks Failed         : ${summary.failed}`);
  console.log('================================================================');

  if (summary.failed > 0) {
    console.error('\nFailures Detected:');
    for (const f of summary.failures) {
      console.error(`  - ${f}`);
    }
    return false;
  } else {
    console.log('\n✅ ALL SECURITY VERIFICATION CHECKS PASSED SUCCESSFULLY.');
    return true;
  }
}

// Execute test suite
runAllSecuritySuites()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Unhandled fatal error in runner:', err);
    process.exit(1);
  });

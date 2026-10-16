/**
 * Dedicated Administrator Sign-In & Role Enforcement Verification Suite
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import { authService } from '../modules/auth/services/auth.service.js';

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

async function runDedicatedAdminAuthVerification(): Promise<void> {
  console.log('===================================================');
  console.log(' Dedicated Administrator Sign-In Verification Suite');
  console.log('===================================================');

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  try {
    // 0. Ensure default credentials exist
    await authService.bootstrapDefaultCredentials();

    const testLearnerEmail = `learner.auth.${Date.now()}@biolumen.test`;
    const testLearnerPassword = 'SecurePassword123!';

    // Test 1: Register Regular User with Email & Password
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLearnerEmail,
        password: testLearnerPassword,
        name: 'Regular Test Learner'
      })
    });
    const regData: any = await regRes.json();
    const regOk = regRes.status === 201 && regData.data?.user?.role === 'learner' && Boolean(regData.data?.token);
    record('Regular User Registration (POST /auth/register)', regOk, `status=${regRes.status}, role=${regData.data?.user?.role}`);

    // Test 2: Reject Duplicate Email Registration (409 Conflict)
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLearnerEmail,
        password: testLearnerPassword
      })
    });
    record('Duplicate Registration Rejection (409 Conflict)', dupRes.status === 409, `status=${dupRes.status}`);

    // Test 3: Regular User Password Login (POST /auth/login)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLearnerEmail,
        password: testLearnerPassword
      })
    });
    const loginData: any = await loginRes.json();
    const learnerToken = loginData.data?.token;
    const loginOk = loginRes.status === 200 && loginData.data?.user?.role === 'learner' && Boolean(learnerToken);
    record('Regular User Login (POST /auth/login)', loginOk, `status=${loginRes.status}, role=${loginData.data?.user?.role}`);

    // Test 4: Invalid Password Rejection (401 Unauthorized)
    const invalidPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLearnerEmail,
        password: 'WrongPassword999!'
      })
    });
    record('Invalid Password Rejection (401 Unauthorized)', invalidPassRes.status === 401, `status=${invalidPassRes.status}`);

    // Test 5: Regular User Denied on Dedicated Admin Login (403 Forbidden)
    const adminLoginDeniedRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testLearnerEmail,
        password: testLearnerPassword
      })
    });
    const adminDeniedData: any = await adminLoginDeniedRes.json();
    const deniedOk = adminLoginDeniedRes.status === 403 && !adminDeniedData.data?.token;
    record(
      'Regular User Denied on Administrator Login (403 Forbidden)',
      deniedOk,
      `status=${adminLoginDeniedRes.status}, message="${adminDeniedData.error?.message}"`
    );

    // Test 6: Dedicated Administrator Login (POST /auth/admin/login)
    const adminLoginRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@biolumen.org',
        password: 'Admin@BioLumen2026!'
      })
    });
    const adminLoginData: any = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.token;
    const adminOk = adminLoginRes.status === 200 && adminLoginData.data?.user?.role === 'admin' && Boolean(adminToken);
    record('Administrator Login (POST /auth/admin/login)', adminOk, `status=${adminLoginRes.status}, role=${adminLoginData.data?.user?.role}`);

    // Test 7: Direct Admin Route Access with Learner Token (403 Forbidden)
    const directLearnerRes = await fetch(`${baseUrl}/admin/content/summary`, {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    record('Direct Admin Route Access with Learner Token Denied (403)', directLearnerRes.status === 403, `status=${directLearnerRes.status}`);

    // Test 8: Direct Admin Route Access with Admin Token (200 OK)
    const directAdminRes = await fetch(`${baseUrl}/admin/content/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const directAdminData: any = await directAdminRes.json();
    const summaryOk = directAdminRes.status === 200 && typeof directAdminData.data?.total_nodes === 'number';
    record('Direct Admin Route Access with Admin Token Allowed (200)', summaryOk, `status=${directAdminRes.status}, nodes=${directAdminData.data?.total_nodes}`);

    // Test 9: Input Validation Rejection on Missing/Malformed Fields (400)
    const badReqRes = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' })
    });
    record('Administrator Login Input Validation (400 Bad Request)', badReqRes.status === 400, `status=${badReqRes.status}`);

    // Clean up test user
    await getPool().query(`DELETE FROM users WHERE email = $1;`, [testLearnerEmail]);

  } finally {
    server.close();
    await closePool();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('===================================================');
  console.log(`Verification Summary: ${passedCount}/${results.length} PASSED`);
  console.log('===================================================');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runDedicatedAdminAuthVerification().catch((err) => {
  console.error('[FATAL] Verification suite crashed:', err);
  process.exit(1);
});

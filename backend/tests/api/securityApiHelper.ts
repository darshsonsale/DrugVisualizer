/**
 * Drug Path Visualiser (BioLumen) - Task 26 Security Test API Helper
 *
 * Ephemeral server lifecycle management, HTTP request wrapper,
 * deterministic test database setup/teardown, and token tampering utilities.
 */

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { getPool } from '../../src/database/pool.js';
import { config } from '../../src/config/index.js';
import { hashPassword } from '../../src/modules/auth/services/auth.service.js';
import { SECURITY_TEST_USERS } from '../fixtures/securityFixtures.js';

export interface ApiResponse<T = any> {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: T | null;
  rawBody: string;
}

export interface TestServerInstance {
  baseUrl: string;
  server: http.Server;
  close: () => Promise<void>;
}

export interface SecurityAssertionCollector {
  assert: (condition: boolean, testName: string, failureDetails?: unknown) => void;
  getSummary: () => { total: number; passed: number; failed: number; failures: string[] };
}

export function createAssertionCollector(suiteName: string): SecurityAssertionCollector {
  let total = 0;
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  return {
    assert(condition: boolean, testName: string, failureDetails?: unknown) {
      total++;
      if (condition) {
        passed++;
        console.log(`    [PASS] ${testName}`);
      } else {
        failed++;
        const failMsg = `[FAIL] [${suiteName}] ${testName}`;
        failures.push(failMsg);
        console.error(`    ${failMsg}`);
        if (failureDetails !== undefined) {
          console.error('      Failure Details:', failureDetails);
        }
      }
    },
    getSummary() {
      return { total, passed, failed, failures };
    }
  };
}

/**
 * Boots the full Express application with real middleware on an ephemeral port.
 */
export async function startTestServer(): Promise<TestServerInstance> {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    server,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      })
  };
}

/**
 * Executes an HTTP request against the test server.
 */
export async function requestApi<T = any>(
  baseUrl: string,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const url = new URL(path, baseUrl);
  const method = options.method || 'GET';

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers: options.headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = null;
          }
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
            rawBody: data
          });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Populates isolated test users in PostgreSQL.
 * Safe: Overwrites only 'test-sec-%' records, never touches real or development records.
 */
export async function setupSecurityTestUsers(): Promise<void> {
  const pool = getPool();
  for (const user of Object.values(SECURITY_TEST_USERS)) {
    const hashedPassword = await hashPassword(user.password);
    await pool.query(
      `INSERT INTO users (id, google_id, email, name, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET 
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         password_hash = EXCLUDED.password_hash;`,
      [
        user.id,
        `g-${user.id}`,
        user.email,
        user.name,
        user.role,
        hashedPassword
      ]
    );
  }
}

/**
 * Cleans up ONLY isolated security test users and attempts.
 */
export async function cleanupSecurityTestUsers(): Promise<void> {
  const pool = getPool();
  try {
    await pool.query(`DELETE FROM quiz_attempts WHERE user_id LIKE 'test-sec-%';`);
    await pool.query(`DELETE FROM user_progress WHERE user_id LIKE 'test-sec-%';`);
    await pool.query(`DELETE FROM users WHERE id LIKE 'test-sec-%';`);
  } catch (err) {
    console.warn('[Security Helper] Cleanup notice (non-fatal):', err);
  }
}

/**
 * Signs a legitimate test JWT session token.
 */
export function signValidTestToken(userId: string, role: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      role
    },
    config.auth.jwtSecret,
    {
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );
}

/**
 * Forges various malicious or invalid JWT tokens for security testing.
 */
export function forgeTamperedToken(type: 'wrong_secret' | 'expired' | 'alg_none' | 'malformed_payload' | 'garbage'): string {
  const payload = {
    sub: 'test-sec-forged-user',
    email: 'forged@attacker.local',
    role: 'admin'
  };

  switch (type) {
    case 'wrong_secret':
      return jwt.sign(payload, 'wrong-secret-key-attacker-guess-12345678', {
        expiresIn: '1h',
        algorithm: 'HS256'
      });

    case 'expired':
      return jwt.sign(payload, config.auth.jwtSecret, {
        expiresIn: -60, // Expired 60 seconds ago
        algorithm: 'HS256'
      });

    case 'alg_none': {
      // Craft an unsigned token with alg: "none"
      const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'none' })).toString('base64url');
      const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
      return `${header}.${body}.`;
    }

    case 'malformed_payload': {
      const validToken = signValidTestToken('test-sec-learner-alice', 'learner', 'sec_alice@test.local');
      const parts = validToken.split('.');
      return `${parts[0]}.bad_base64_payload==.${parts[2]}`;
    }

    case 'garbage':
      return 'NotEvenAJwtTokenAtAll.JustGarbage.String123';
  }
}

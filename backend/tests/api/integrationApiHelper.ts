/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test API Helper
 *
 * Provides:
 * 1. Safe PostgreSQL test database lifecycle (`drug_visualizer_test`).
 * 2. Strict verification that connection targets `drug_visualizer_test` and never `drug_visualizer_dev` or production.
 * 3. Fail-safe fallback to read-only mode if dedicated test DB cannot be established.
 * 4. Ephemeral Express server lifecycle management.
 * 5. HTTP client and JWT token utilities.
 * 6. Dynamic test assertion and execution tracking (discovered, passed, failed, skipped, blocked).
 */

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { getPool, closePool, setPool } from '../../src/database/pool.js';
import { config } from '../../src/config/index.js';
import { dbConfig } from '../../src/config/database.js';
import { hashPassword } from '../../src/modules/auth/services/auth.service.js';
import { getMigrationFiles } from '../../src/database/migrator.js';
import { runAllSeeders } from '../../src/database/seeds/index.js';
import { INTEGRATION_TEST_USERS } from '../fixtures/integrationFixtures.js';

const { Client, Pool } = pg;

export interface TestServerInstance {
  baseUrl: string;
  server: http.Server;
  close: () => Promise<void>;
}

export interface TestExecutionSummary {
  discovered: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  failures: string[];
}

export interface IntegrationAssertionCollector {
  assert: (condition: boolean, testName: string, failureDetails?: unknown) => void;
  skip: (testName: string, reason: string) => void;
  block: (testName: string, reason: string) => void;
  getSummary: () => TestExecutionSummary;
}

export function createAssertionCollector(suiteName: string): IntegrationAssertionCollector {
  let discovered = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let blocked = 0;
  const failures: string[] = [];

  return {
    assert(condition: boolean, testName: string, failureDetails?: unknown) {
      discovered++;
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
    skip(testName: string, reason: string) {
      discovered++;
      skipped++;
      console.log(`    [SKIP] ${testName} -> Reason: ${reason}`);
    },
    block(testName: string, reason: string) {
      discovered++;
      blocked++;
      console.warn(`    [BLOCKED] ${testName} -> Reason: ${reason}`);
    },
    getSummary() {
      return { discovered, passed, failed, skipped, blocked, failures };
    }
  };
}

export interface TestDatabaseStatus {
  isDedicatedTestDb: boolean;
  canMutate: boolean;
  activeDatabase: string;
  testPool?: pg.Pool;
}

let activeTestStatus: TestDatabaseStatus = {
  isDedicatedTestDb: false,
  canMutate: false,
  activeDatabase: dbConfig.database
};

export function getActiveTestDatabaseStatus(): TestDatabaseStatus {
  return activeTestStatus;
}

/**
 * Initializes and verifies the dedicated PostgreSQL test database ('drug_visualizer_test').
 * Strictly ensures we never run mutations against development or production.
 */
export async function setupTestDatabase(): Promise<TestDatabaseStatus> {
  const targetDb = 'drug_visualizer_test';
  console.log(`\n[Database Safety Guard] Verifying dedicated test database: "${targetDb}"...`);

  // 1. Connect to PostgreSQL maintenance database to check/create target test DB
  const maintenanceClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres',
    user: dbConfig.user,
    password: dbConfig.password ?? '',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false
  });

  try {
    await maintenanceClient.connect();

    const dbCheck = await maintenanceClient.query<{ datname: string }>(
      'SELECT datname FROM pg_database WHERE datname = $1;',
      [targetDb]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`[Database Safety Guard] Creating dedicated database "${targetDb}"...`);
      await maintenanceClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`[Database Safety Guard] Dedicated database "${targetDb}" created.`);
    } else {
      console.log(`[Database Safety Guard] Dedicated database "${targetDb}" exists.`);
    }
  } catch (err) {
    console.warn(`[Database Safety Guard] Could not manage maintenance connection:`, err);
    console.warn(`[Database Safety Guard] Falling back to safe READ-ONLY testing mode.`);
    activeTestStatus = {
      isDedicatedTestDb: false,
      canMutate: false,
      activeDatabase: dbConfig.database
    };
    return activeTestStatus;
  } finally {
    try {
      await maintenanceClient.end();
    } catch {
      // Ignore
    }
  }

  // 2. Connect directly to drug_visualizer_test and verify identity
  const testPool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: targetDb,
    user: dbConfig.user,
    password: dbConfig.password ?? '',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    max: 10
  });

  try {
    const client = await testPool.connect();
    const currentDbRes = await client.query<{ current_database: string }>('SELECT current_database();');
    const currentDb = currentDbRes.rows[0]?.current_database;

    // Strict safety invariant: current_database MUST explicitly be 'drug_visualizer_test'
    if (currentDb !== targetDb) {
      client.release();
      await testPool.end();
      throw new Error(`CRITICAL SAFETY ERROR: Connection targets "${currentDb}" instead of "${targetDb}". Refusing mutations.`);
    }

    console.log(`[Database Safety Guard] Verified active database: "${currentDb}".`);

    // 3. Run real migrations on drug_visualizer_test
    console.log(`[Database Safety Guard] Applying application migrations (0001-0007) to "${targetDb}"...`);
    const migrations = getMigrationFiles();
    for (const m of migrations) {
      try {
        await client.query('BEGIN');
        await client.query(m.up);
        await client.query('COMMIT');
      } catch (migErr) {
        await client.query('ROLLBACK');
        // If already applied (tables exist), continue gracefully
        const errorMsg = String(migErr);
        if (!errorMsg.includes('already exists')) {
          console.warn(`Migration notice for ${m.name}:`, errorMsg);
        }
      }
    }

    // 4. Seed real domain catalog (drugs, pathways, variations, content, quizzes)
    console.log(`[Database Safety Guard] Seeding real baseline catalog to "${targetDb}"...`);
    await client.query('BEGIN');
    await runAllSeeders(client);
    await client.query('COMMIT');

    // 5. Populate isolated test users
    console.log(`[Database Safety Guard] Populating isolated test users in "${targetDb}"...`);
    for (const u of Object.values(INTEGRATION_TEST_USERS)) {
      const hashed = await hashPassword(u.password);
      await client.query(
        `INSERT INTO users (id, google_id, email, name, role, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET 
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash;`,
        [u.id, `g-${u.id}`, u.email, u.name, u.role, hashed]
      );
    }

    client.release();

    // 6. Point process.env.DATABASE_URL to drug_visualizer_test for the Express application
    process.env.DATABASE_URL = `postgresql://${dbConfig.user}:${dbConfig.password || ''}@${dbConfig.host}:${dbConfig.port}/${targetDb}`;
    process.env.DB_NAME = targetDb;

    // Explicitly inject the dedicated test database pool into the application
    setPool(testPool);

    activeTestStatus = {
      isDedicatedTestDb: true,
      canMutate: true,
      activeDatabase: targetDb,
      testPool
    };

    console.log(`[Database Safety Guard] Database isolation active on "${targetDb}". Full mutation tests enabled.`);
    return activeTestStatus;
  } catch (err) {
    console.error(`[Database Safety Guard] Failed to prepare "${targetDb}":`, err);
    console.warn(`[Database Safety Guard] Falling back to safe READ-ONLY testing mode.`);
    activeTestStatus = {
      isDedicatedTestDb: false,
      canMutate: false,
      activeDatabase: dbConfig.database
    };
    return activeTestStatus;
  }
}

/**
 * Clean up test records created during integration tests.
 */
export async function cleanupIntegrationTestData(): Promise<void> {
  const pool = activeTestStatus.testPool || getPool();
  try {
    await pool.query(`DELETE FROM quiz_attempt_answers WHERE attempt_id LIKE 'attempt-test-int-%';`);
    await pool.query(`DELETE FROM quiz_attempts WHERE id LIKE 'attempt-test-int-%' OR user_id LIKE 'test-int-%';`);
    await pool.query(`DELETE FROM user_progress WHERE user_id LIKE 'test-int-%' OR id LIKE 'test-int-%';`);
    await pool.query(`DELETE FROM users WHERE id LIKE 'test-int-%';`);
  } catch (err) {
    console.warn('[Integration Helper] Cleanup notice (non-fatal):', err);
  }
}

/**
 * Boots the full Express application on an ephemeral port.
 */
export async function startIntegrationTestServer(): Promise<TestServerInstance> {
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
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: T | null; rawBody: string }> {
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
 * Signs a legitimate test JWT session token.
 */
export function signValidIntegrationToken(userId: string, role: string, email: string): string {
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

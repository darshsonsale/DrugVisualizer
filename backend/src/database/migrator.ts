import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import { getPool, closePool } from './pool.js';
import { dbConfig, getSanitizedConnectionSummary } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate migrations directory (supports both tsx runtime and compiled dist/)
export function getMigrationsDirectory(): string {
  const adjacentMigrations = path.resolve(__dirname, 'migrations');
  if (fs.existsSync(adjacentMigrations)) {
    return adjacentMigrations;
  }
  const srcMigrations = path.resolve(__dirname, '../../src/database/migrations');
  if (fs.existsSync(srcMigrations)) {
    return srcMigrations;
  }
  throw new Error(`Migrations directory not found adjacent to ${__dirname}`);
}

export interface MigrationFile {
  name: string;
  fullPath: string;
  up: string;
  down: string;
  checksum: string;
}

export interface AppliedMigration {
  name: string;
  checksum?: string;
  appliedAt: string;
}

export function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

export function parseMigrationSql(filePath: string): { up: string; down: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const upMatch = content.match(/--\s*Up([\s\S]*?)(?:--\s*Down|$)/i);
  const downMatch = content.match(/--\s*Down([\s\S]*)$/i);

  const up = upMatch ? upMatch[1].trim() : content.trim();
  const down = downMatch ? downMatch[1].trim() : '';

  return { up, down };
}

export function getMigrationFiles(): MigrationFile[] {
  const dir = getMigrationsDirectory();
  const files = fs.readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return files.map((file) => {
    const fullPath = path.join(dir, file);
    const { up, down } = parseMigrationSql(fullPath);
    return {
      name: file,
      fullPath,
      up,
      down,
      checksum: computeChecksum(up)
    };
  });
}

async function ensureMigrationsTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Ensure column exists if table was created in an earlier revision
  await client.query(`
    ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum VARCHAR(64);
  `);
}

async function getAppliedMigrations(client: pg.PoolClient): Promise<Map<string, AppliedMigration>> {
  await ensureMigrationsTable(client);
  const res = await client.query<{ name: string; checksum: string | null; applied_at: Date }>(
    'SELECT name, checksum, applied_at FROM schema_migrations ORDER BY id ASC;'
  );
  const applied = new Map<string, AppliedMigration>();
  for (const row of res.rows) {
    applied.set(row.name, {
      name: row.name,
      checksum: row.checksum || undefined,
      appliedAt: row.applied_at.toISOString()
    });
  }
  return applied;
}

function formatMigrationError(err: unknown): void {
  const error = err as Error & { code?: string };
  console.error(`❌ Database error: ${error.message}`);

  if (error.message.includes('SASL: SCRAM-SERVER-FIRST-MESSAGE') || error.message.includes('client password must be a string')) {
    console.log('🔍 Cause: PostgreSQL server requires SCRAM-SHA-256 password authentication, but no password was provided (DB_PASSWORD is empty or undefined).');
    console.log('👉 Solution: Add your database password to backend/.env:');
    console.log(`   DB_USER=${dbConfig.user}`);
    console.log('   DB_PASSWORD=your_actual_postgres_password');
  } else if (error.code === '3D000' || error.message.includes('does not exist')) {
    console.log(`🔍 Cause: The database "${dbConfig.database}" does not exist on this PostgreSQL instance.`);
    console.log('👉 Solution: Run "npm run db:create" to create the database.');
  } else if (error.code === '28P01' || error.message.includes('password authentication failed')) {
    console.log(`🔍 Cause: Password authentication failed for user "${dbConfig.user}".`);
    console.log('👉 Solution: Check DB_PASSWORD in backend/.env.');
  }
}

export async function migrateStatus(): Promise<void> {
  console.log('===================================================');
  console.log(' Drug Path Visualiser - Migration Status');
  console.log('===================================================');
  console.log(`Target: ${getSanitizedConnectionSummary()}`);

  let migrationFiles: MigrationFile[] = [];
  try {
    migrationFiles = getMigrationFiles();
  } catch (err) {
    console.error('❌ Failed to read migrations directory:', (err as Error).message);
    return;
  }

  if (migrationFiles.length === 0) {
    console.log('No migration files found.');
    return;
  }

  console.log(`Found ${migrationFiles.length} migration file(s) locally.\n`);

  // Try checking database connection to determine applied status
  let appliedMap: Map<string, AppliedMigration> | null = null;
  const pool = getPool();

  try {
    const client = await pool.connect();
    try {
      appliedMap = await getAppliedMigrations(client);
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.warn('⚠️  Database connection could not be established.');
    formatMigrationError(err);
    console.warn('   Displaying local migration files without live database tracking.\n');
  } finally {
    await closePool();
  }

  console.log('Migration Files:');
  console.log('---------------------------------------------------');
  for (const file of migrationFiles) {
    if (appliedMap) {
      const record = appliedMap.get(file.name);
      if (record) {
        const checksumMatch = !record.checksum || record.checksum === file.checksum;
        if (checksumMatch) {
          console.log(` [APPLIED]  ${file.name} (Checksum: ${file.checksum.substring(0, 8)}..., Applied: ${record.appliedAt})`);
        } else {
          console.log(` [MISMATCH] ⚠️  ${file.name} (Recorded: ${record.checksum?.substring(0, 8)}..., Disk: ${file.checksum.substring(0, 8)}...)`);
        }
      } else {
        console.log(` [PENDING]  ${file.name} (Checksum: ${file.checksum.substring(0, 8)}...)`);
      }
    } else {
      console.log(` [LOCAL]    ${file.name} (DB offline - status unverified)`);
    }
  }
  console.log('---------------------------------------------------\n');
}

export async function migrateUp(): Promise<boolean> {
  console.log('===================================================');
  console.log(' Drug Path Visualiser - Running Migrations (UP)');
  console.log('===================================================');
  console.log(`Target: ${getSanitizedConnectionSummary()}`);

  const migrationFiles = getMigrationFiles();
  if (migrationFiles.length === 0) {
    console.log('No migration files to run.');
    return true;
  }

  const pool = getPool();
  let client: pg.PoolClient;

  try {
    client = await pool.connect();
  } catch (err) {
    formatMigrationError(err);
    await closePool();
    return false;
  }

  try {
    const appliedMap = await getAppliedMigrations(client);

    // Check integrity of already-applied migrations
    for (const file of migrationFiles) {
      const record = appliedMap.get(file.name);
      if (record && record.checksum && record.checksum !== file.checksum) {
        throw new Error(
          `Integrity Violation: Migration "${file.name}" has been modified on disk after being applied!\n` +
          `Recorded checksum: ${record.checksum}\n` +
          `Current file checksum: ${file.checksum}`
        );
      }
    }

    const pending = migrationFiles.filter((m) => !appliedMap.has(m.name));

    if (pending.length === 0) {
      console.log('✅ All migrations are already applied. Database is up to date.');
      return true;
    }

    console.log(`Applying ${pending.length} pending migration(s)...`);

    for (const migration of pending) {
      console.log(`\n▶ Applying: ${migration.name}`);

      if (!migration.up) {
        console.warn(`⚠️  Warning: No UP instructions found in ${migration.name}`);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(migration.up);
        await client.query(
          'INSERT INTO schema_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW());',
          [migration.name, migration.checksum]
        );
        await client.query('COMMIT');
        console.log(`✔ Applied:  ${migration.name} (Checksum: ${migration.checksum.substring(0, 8)}...)`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${migration.name}. Rolled back transaction.`);
        throw migrationErr;
      }
    }

    console.log('\n✅ All pending migrations applied successfully.');
    return true;
  } catch (err) {
    console.error('❌ Migration execution error:', (err as Error).message);
    return false;
  } finally {
    client.release();
    await closePool();
  }
}

export async function migrateDown(): Promise<boolean> {
  console.log('===================================================');
  console.log(' Drug Path Visualiser - Rollback Migration (DOWN)');
  console.log('===================================================');
  console.log(`Target: ${getSanitizedConnectionSummary()}`);

  const pool = getPool();
  let client: pg.PoolClient;

  try {
    client = await pool.connect();
  } catch (err) {
    formatMigrationError(err);
    await closePool();
    return false;
  }

  try {
    await ensureMigrationsTable(client);
    const lastRes = await client.query<{ name: string }>(
      'SELECT name FROM schema_migrations ORDER BY id DESC LIMIT 1;'
    );

    if (lastRes.rows.length === 0) {
      console.log('ℹ️  No applied migrations found to roll back.');
      return true;
    }

    const lastMigrationName = lastRes.rows[0].name;
    const migrationFiles = getMigrationFiles();
    const targetFile = migrationFiles.find((m) => m.name === lastMigrationName);

    if (!targetFile) {
      throw new Error(`Migration file for '${lastMigrationName}' not found in migrations directory.`);
    }

    console.log(`\n◀ Rolling back: ${lastMigrationName}`);

    if (!targetFile.down) {
      throw new Error(`No DOWN instructions found in migration file: ${lastMigrationName}`);
    }

    await client.query('BEGIN');
    try {
      await client.query(targetFile.down);
      await client.query('DELETE FROM schema_migrations WHERE name = $1;', [lastMigrationName]);
      await client.query('COMMIT');
      console.log(`✔ Rolled back: ${lastMigrationName}`);
    } catch (downErr) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback failed for ${lastMigrationName}. Rolled back transaction.`);
      throw downErr;
    }

    console.log('\n✅ Rollback completed successfully.');
    return true;
  } catch (err) {
    console.error('❌ Migration rollback error:', (err as Error).message);
    return false;
  } finally {
    client.release();
    await closePool();
  }
}

// CLI handler
const command = process.argv[2]?.toLowerCase();

if (command === 'up') {
  migrateUp().then((success) => process.exit(success ? 0 : 1));
} else if (command === 'down') {
  migrateDown().then((success) => process.exit(success ? 0 : 1));
} else if (command === 'status') {
  migrateStatus().then(() => process.exit(0));
} else if (process.argv[1]?.endsWith('migrator.ts') || process.argv[1]?.endsWith('migrator.js')) {
  console.log('Usage: npm run [migrate:up | migrate:down | migrate:status]');
}

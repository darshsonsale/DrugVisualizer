/**
 * Drug Path Visualiser - Development Database Seeder
 *
 * Coordinates execution of modular seeders (drugs, pathways, variations, content, quizzes)
 * inside a single PostgreSQL client and atomic transaction.
 *
 * Strategy:
 * - Domain content (drugs, pathways, nodes, content, edges): Idempotent upsert (ON CONFLICT DO UPDATE).
 * - Quiz content (quizzes, questions, options): Immutable insert (ON CONFLICT (id) DO NOTHING)
 *   to guarantee past student attempts are never retroactively corrupted.
 */

import type pg from 'pg';
import { getPool, closePool } from './pool.js';
import { runAllSeeders, type FullSeedResult } from './seeds/index.js';

/**
 * Seed the database idempotently.
 *
 * @param clientOverride Optional PostgreSQL client. If provided, the caller is responsible
 * for transaction management (useful for isolated rollback tests). If not provided, checks out
 * a client from the pool and handles BEGIN / COMMIT / ROLLBACK automatically.
 */
export async function seedDatabase(clientOverride?: pg.PoolClient): Promise<FullSeedResult> {
  const client = clientOverride ?? (await getPool().connect());
  const isSelfManaged = !clientOverride;

  try {
    if (isSelfManaged) {
      await client.query('BEGIN');
    }

    const result = await runAllSeeders(client);

    if (isSelfManaged) {
      await client.query('COMMIT');
      console.log('[Seeder] Database seeding completed successfully.');
    }

    return result;
  } catch (error) {
    if (isSelfManaged) {
      await client.query('ROLLBACK');
      console.error('[Seeder] Error during database seeding, transaction rolled back:', error);
    }
    throw error;
  } finally {
    if (isSelfManaged) {
      client.release();
    }
  }
}

// Allow direct execution via CLI (npm run db:seed)
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder] Seeding failed:', err);
      await closePool();
      process.exit(1);
    });
}

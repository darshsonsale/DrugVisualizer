import type pg from 'pg';
import { seedDrugs, SEED_DRUGS } from './drugSeeder.js';
import { seedPathwaysAndContent, type PathwaySeedResult } from './pathwaySeeder.js';
import { seedQuizzes, type QuizSeedResult } from './quizSeeder.js';

export interface FullSeedResult {
  drugsCount: number;
  pathwayResult: PathwaySeedResult;
  quizResult: QuizSeedResult;
}

/**
 * Execute the complete database seed operation using a single PostgreSQL client
 * within an explicit transaction (BEGIN -> seeders -> COMMIT / ROLLBACK).
 *
 * Guarantees:
 * 1. Single-client, single-transaction boundary. No modular seeder opens an independent connection.
 * 2. Proper rollback on any error to prevent partial writes.
 * 3. Idempotent upserts for domain content and ON CONFLICT DO NOTHING for quiz records.
 */
export async function runAllSeeders(client: pg.PoolClient): Promise<FullSeedResult> {
  console.log('[Seeder] Starting modular database seeding in single transaction...');

  // 1. Seed Core Drugs
  const drugsCount = await seedDrugs(client);
  console.log(`[Seeder] Seeded ${drugsCount} drugs.`);

  // 2. Seed Pathways, Nodes, Contents, Variations, and Edges
  const pathwayResult = await seedPathwaysAndContent(client);
  console.log(
    `[Seeder] Seeded ${pathwayResult.pathwaysCount} pathways, ` +
    `${pathwayResult.variationsCount} pathway variations, ` +
    `${pathwayResult.nodesCount} nodes, ` +
    `${pathwayResult.contentsCount} contents, ` +
    `${pathwayResult.nodeVariationsCount} node variations, ` +
    `${pathwayResult.edgesCount} edges.`
  );

  // 3. Seed Quizzes, Questions, and Options (with fixture-drift detection)
  const quizResult = await seedQuizzes(client);
  console.log(
    `[Seeder] Seeded/Verified ${quizResult.quizzesCount} quizzes, ` +
    `${quizResult.questionsCount} questions, and ` +
    `${quizResult.optionsCount} options ` +
    `(Drift warnings: ${quizResult.driftWarningsCount}).`
  );

  return {
    drugsCount,
    pathwayResult,
    quizResult
  };
}

export { seedDrugs, SEED_DRUGS, seedPathwaysAndContent, seedQuizzes };

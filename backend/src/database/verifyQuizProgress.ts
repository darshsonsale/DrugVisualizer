/**
 * Drug Path Visualiser - Task 16 Quiz and Progress Verification Suite
 *
 * Exercises:
 * - Answer confidentiality (GET /quizzes/:id strictly omits is_correct & explanation)
 * - Quiz lookup by drug ID (GET /quizzes/drug/:drugId)
 * - Validation: duplicate question rejection, invalid/mismatched options (400)
 * - Server-side grading (client-submitted score ignored)
 * - Anonymous quiz attempt flow (graded, unlocked explanations, no DB persistence)
 * - Authenticated quiz attempt flow (persisted in DB, updates user_progress)
 * - User isolation: User B cannot access or see User A's progress
 * - Progress API: GET and PUT persistence and anonymous 401 rejection
 * - Scientific provenance: needs_scientific_review = true confirmed
 * - Migration rollback & re-application integrity (0004 down and up)
 */

import type { Server } from 'node:http';
import path from 'node:path';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';
import { seedDatabase } from './seed.js';
import {
  parseMigrationSql,
  getMigrationsDirectory,
  computeChecksum
} from './migrator.js';

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

async function runQuizProgressVerification(): Promise<void> {
  console.log('[Test Suite] Initializing Express server for Task 16 Verification...');
  const app = createApp();

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`[Test Suite] Server active on ${baseUrl}`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Answer Confidentiality on GET /api/v1/quizzes/:quizId
    // -------------------------------------------------------------------------
    const quizRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001`);
    const quizBody: any = await quizRes.json();
    const isQuiz200 = quizRes.status === 200;
    const questions = quizBody.data?.questions || [];
    const hasQuestions = questions.length >= 2;

    let answersLeaked = false;
    for (const q of questions) {
      for (const opt of q.options || []) {
        if ('is_correct' in opt || 'explanation' in opt) {
          answersLeaked = true;
        }
      }
    }

    record(
      'GET /api/v1/quizzes/:quizId returns 200 and strictly preserves answer confidentiality (no is_correct or explanation)',
      isQuiz200 && hasQuestions && !answersLeaked,
      `status=${quizRes.status}, questions=${questions.length}, confidentialityPreserved=${!answersLeaked}`
    );

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // TEST 2: GET /api/v1/quizzes/drug/:drugId (Quiz by Drug Lookup)
    // -------------------------------------------------------------------------
    const drugQuizRes = await fetch(`${baseUrl}/quizzes/drug/drug-ibuprofen-001`);
    const drugQuizBody: any = await drugQuizRes.json();
    const drugQuizValid =
      drugQuizRes.status === 200 &&
      drugQuizBody.success === true &&
      drugQuizBody.data?.id === 'quiz-ibuprofen-001';

    const amoxQuizRes = await fetch(`${baseUrl}/quizzes/drug/drug-amoxicillin-002`);
    const ambQuizRes = await fetch(`${baseUrl}/quizzes/drug/drug-ambroxol-003`);
    const insQuizRes = await fetch(`${baseUrl}/quizzes/drug/drug-insulin-004`);
    const allFourSeeded =
      amoxQuizRes.status === 200 &&
      ambQuizRes.status === 200 &&
      insQuizRes.status === 200;

    const missingDrugQuizRes = await fetch(`${baseUrl}/quizzes/drug/drug-unknown-999`);
    const missingDrugQuizBody: any = await missingDrugQuizRes.json();
    const missingValid =
      missingDrugQuizRes.status === 404 &&
      missingDrugQuizBody.error?.code === 'RESOURCE_NOT_FOUND';

    record(
      'GET /api/v1/quizzes/drug/:drugId finds quizzes for all 4 drugs and returns 404 for unseeded drug',
      drugQuizValid && allFourSeeded && missingValid,
      `ibuprofenStatus=${drugQuizRes.status}, amoxStatus=${amoxQuizRes.status}, unseededStatus=${missingDrugQuizRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Duplicate Question Rejection (HTTP 400)
    // -------------------------------------------------------------------------
    const dupRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'q1', selected_option_id: 'opt1-a' },
          { question_id: 'q1', selected_option_id: 'opt1-b' }
        ]
      })
    });
    const dupBody: any = await dupRes.json();
    record(
      'POST /quizzes/:id/attempts rejects duplicate answers for same question with 400 BAD_REQUEST',
      dupRes.status === 400 && dupBody.error?.code === 'BAD_REQUEST',
      `status=${dupRes.status}, message=${dupBody.error?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Mismatched Option Rejection (HTTP 400)
    // -------------------------------------------------------------------------
    const mismatchRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'q1', selected_option_id: 'opt2-b' } // opt2-b belongs to q2, not q1
        ]
      })
    });
    const mismatchBody: any = await mismatchRes.json();
    record(
      'POST /quizzes/:id/attempts rejects option belonging to another question with 400 BAD_REQUEST',
      mismatchRes.status === 400 && mismatchBody.error?.code === 'BAD_REQUEST',
      `status=${mismatchRes.status}, message=${mismatchBody.error?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Zero-Trust Server Grading (Client-Supplied Score Ignored, 2/5 = 40% Fail)
    // -------------------------------------------------------------------------
    // Submit 2 correct (opt1-b, opt3-a) and 3 incorrect, while attempting to claim 100% score
    const gradeRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: 100, // Client tries to cheat
        passed: true,
        answers: [
          { question_id: 'q1', selected_option_id: 'opt1-b' }, // correct
          { question_id: 'q2', selected_option_id: 'opt2-a' }, // incorrect
          { question_id: 'q3', selected_option_id: 'opt3-a' }, // correct
          { question_id: 'q4', selected_option_id: 'opt4-b' }, // incorrect
          { question_id: 'q5', selected_option_id: 'opt5-a' }  // incorrect
        ]
      })
    });
    const gradeBody: any = await gradeRes.json();
    const data = gradeBody.data;
    const gradingAccurate =
      gradeRes.status === 200 &&
      data.score === 40 &&
      data.total_questions === 5 &&
      data.correct_answers === 2 &&
      data.passed === false &&
      Array.isArray(data.details) &&
      data.details.find((d: any) => d.question_id === 'q1')?.correct === true &&
      data.details.find((d: any) => d.question_id === 'q2')?.correct === false &&
      Boolean(data.details.find((d: any) => d.question_id === 'q1')?.explanation);

    record(
      'Server-side grading ignores client score, evaluates 40% (2/5 failed), and unlocks post-submission explanations',
      gradingAccurate,
      `status=${gradeRes.status}, serverCalculatedScore=${data?.score}, passed=${data?.passed}`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Anonymous Quiz Flow (No Database Persistence, 5/5 = 100% Pass)
    // -------------------------------------------------------------------------
    const pool = getPool();
    const beforeAnonCountRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM quiz_attempts WHERE user_id IS NULL;'
    );
    const beforeAnonCount = parseInt(beforeAnonCountRes.rows[0].count, 10);

    const anonRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'q1', selected_option_id: 'opt1-b' },
          { question_id: 'q2', selected_option_id: 'opt2-b' },
          { question_id: 'q3', selected_option_id: 'opt3-a' },
          { question_id: 'q4', selected_option_id: 'opt4-a' },
          { question_id: 'q5', selected_option_id: 'opt5-b' }
        ]
      })
    });
    const anonBody: any = await anonRes.json();
    const afterAnonCountRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM quiz_attempts WHERE user_id IS NULL;'
    );
    const afterAnonCount = parseInt(afterAnonCountRes.rows[0].count, 10);

    const anonValid =
      anonRes.status === 200 &&
      anonBody.data?.score === 100 &&
      anonBody.data?.passed === true &&
      anonBody.data?.total_questions === 5 &&
      anonBody.data?.user_id === undefined &&
      afterAnonCount === beforeAnonCount; // Verified zero persistence

    record(
      'Anonymous user can submit quiz, receive 100% score and feedback, without writing attempt to database',
      anonValid,
      `status=${anonRes.status}, score=${anonBody.data?.score}, dbUnchanged=${afterAnonCount === beforeAnonCount}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Authenticated Attempt Persistence & Progress Telemetry Update
    // -------------------------------------------------------------------------
    const testUserId = `test-user-${Date.now()}`;
    const authRes = await fetch(`${baseUrl}/quizzes/quiz-ibuprofen-001/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dev-User-Id': testUserId
      },
      body: JSON.stringify({
        answers: [
          { question_id: 'q1', selected_option_id: 'opt1-b' },
          { question_id: 'q2', selected_option_id: 'opt2-b' },
          { question_id: 'q3', selected_option_id: 'opt3-a' },
          { question_id: 'q4', selected_option_id: 'opt4-a' },
          { question_id: 'q5', selected_option_id: 'opt5-b' }
        ]
      })
    });
    const authBody: any = await authRes.json();

    // Verify DB records
    const attemptInDb = await pool.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1;',
      [testUserId]
    );
    const answersInDb = await pool.query(
      'SELECT * FROM quiz_attempt_answers WHERE attempt_id = $1;',
      [authBody.data?.id]
    );
    const progressInDb = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND drug_id = $2;',
      [testUserId, 'drug-ibuprofen-001']
    );

    const authValid =
      authRes.status === 200 &&
      authBody.data?.score === 100 &&
      authBody.data?.passed === true &&
      attemptInDb.rows.length === 1 &&
      answersInDb.rows.length === 5 &&
      progressInDb.rows.length === 1 &&
      Number(progressInDb.rows[0].quiz_score) === 100 &&
      progressInDb.rows[0].quiz_completed === true;

    record(
      'Authenticated attempt persists in quiz_attempts, records answers, and updates user_progress telemetry',
      authValid,
      `status=${authRes.status}, dbAttempts=${attemptInDb.rows.length}, dbAnswers=${answersInDb.rows.length}, quizCompleted=${progressInDb.rows[0]?.quiz_completed}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: User Progress API - User Isolation & Anonymous Safeguard
    // -------------------------------------------------------------------------
    // User Alpha (testUserId) retrieves progress
    const alphaRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      headers: { 'X-Dev-User-Id': testUserId }
    });
    const alphaBody: any = await alphaRes.json();

    // User Beta (isolated user) retrieves progress for same drug
    const betaUserId = `user-beta-${Date.now()}`;
    const betaRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      headers: { 'X-Dev-User-Id': betaUserId }
    });
    const betaBody: any = await betaRes.json();

    // Anonymous GET progress
    const anonProgRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`);
    const anonProgBody: any = await anonProgRes.json();

    // Anonymous PUT progress (must reject with 401)
    const anonPutRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_nodes: ['node-oral-cavity'] })
    });
    const anonPutBody: any = await anonPutRes.json();

    const isolationValid =
      alphaRes.status === 200 &&
      alphaBody.data?.quiz_score === 100 &&
      alphaBody.data?.quiz_completed === true &&
      betaRes.status === 200 &&
      (betaBody.data?.quiz_score === undefined || betaBody.data?.quiz_score === null) &&
      betaBody.data?.quiz_completed === false &&
      anonProgRes.status === 200 &&
      anonProgBody.meta?.persistent === false &&
      anonPutRes.status === 401 &&
      anonPutBody.error?.code === 'AUTHENTICATION_REQUIRED';

    record(
      'User progress isolation enforced: User Beta cannot see User Alpha progress, anonymous PUT rejected 401',
      isolationValid,
      `alphaScore=${alphaBody.data?.quiz_score}, betaScore=${betaBody.data?.quiz_score}, anonPutStatus=${anonPutRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Progress API - Authenticated PUT Updates Completed Nodes
    // -------------------------------------------------------------------------
    const putRes = await fetch(`${baseUrl}/progress/drug-ibuprofen-001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Dev-User-Id': testUserId
      },
      body: JSON.stringify({
        completed_nodes: ['node-oral-cavity', 'node-stomach', 'node-small-intestine']
      })
    });
    const putBody: any = await putRes.json();

    const putValid =
      putRes.status === 200 &&
      putBody.data?.completed_nodes?.length === 3 &&
      putBody.data?.completed_nodes?.includes('node-small-intestine') &&
      putBody.data?.quiz_score === 100; // Preserved prior score

    record(
      'PUT /api/v1/progress/:drugId updates completed_nodes while preserving quiz score',
      putValid,
      `status=${putRes.status}, nodesCount=${putBody.data?.completed_nodes?.length}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Scientific Provenance & Constraints Verification
    // -------------------------------------------------------------------------
    const optionsReviewRes = await pool.query<{ count: string; unflagged: string }>(`
      SELECT
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE needs_scientific_review = false) as unflagged
      FROM quiz_options;
    `);
    const totalOptions = parseInt(optionsReviewRes.rows[0].count, 10);
    const unflaggedOptions = parseInt(optionsReviewRes.rows[0].unflagged, 10);

    const provenanceValid = totalOptions > 0 && unflaggedOptions === 0;

    record(
      'Database quiz options are explicitly flagged with needs_scientific_review = true (no unverified citations)',
      provenanceValid,
      `totalOptions=${totalOptions}, unflagged=${unflaggedOptions}`
    );

    // -------------------------------------------------------------------------
    // TEST 11: Migration Rollback and Reapplication Integrity (0004 Down then Up)
    // -------------------------------------------------------------------------
    console.log('[Test Suite] Testing migration 0004 rollback and re-application...');
    const migrationDir = getMigrationsDirectory();
    const migrationPath = path.resolve(migrationDir, '0004_quiz_and_progress_schema.sql');
    const { up, down } = parseMigrationSql(migrationPath);
    const checksum = computeChecksum(up);

    // Rollback migration 0004
    await pool.query('BEGIN');
    await pool.query(down);
    await pool.query('DELETE FROM schema_migrations WHERE name = $1;', ['0004_quiz_and_progress_schema.sql']);
    await pool.query('COMMIT');

    // Verify 0004 tables are dropped
    const checkTablesRes = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('quizzes', 'quiz_questions', 'quiz_options', 'quiz_attempts', 'quiz_attempt_answers', 'user_progress');
    `);
    const droppedCleanly = checkTablesRes.rows.length === 0;

    // Verify migrations 0001-0003 still exist and are healthy
    const checkCoreRes = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('drugs', 'pathways', 'pathway_nodes', 'pathway_variations');
    `);
    const corePreserved = checkCoreRes.rows.length === 4;

    // Reapply migration 0004
    await pool.query('BEGIN');
    await pool.query(up);
    await pool.query(
      'INSERT INTO schema_migrations (name, checksum, applied_at) VALUES ($1, $2, NOW());',
      ['0004_quiz_and_progress_schema.sql', checksum]
    );
    await pool.query('COMMIT');

    // Reseed database
    await seedDatabase();

    const checkReappliedRes = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('quizzes', 'quiz_questions', 'quiz_options', 'quiz_attempts', 'quiz_attempt_answers', 'user_progress');
    `);
    const reapplicationClean = checkReappliedRes.rows.length === 6;

    record(
      'Migration 0004 rollback cleanly drops quiz/progress tables without affecting 0001-0003, and re-applies cleanly',
      droppedCleanly && corePreserved && reapplicationClean,
      `dropped=${droppedCleanly}, corePreserved=${corePreserved}, reappliedTables=${checkReappliedRes.rows.length}`
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[Test Suite] Ephemeral server closed.');
  }

  // Summary
  console.log('\n======================================================');
  console.log('             TASK 16 VERIFICATION SUMMARY             ');
  console.log('======================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.name}`);
  }
  console.log('======================================================\n');

  if (!allPassed) {
    throw new Error('Task 16 Verification Suite encountered test failures.');
  }
}

runQuizProgressVerification()
  .then(async () => {
    console.log('[Test Suite] Task 16 Verification completed successfully.');
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[Test Suite] Task 16 Verification failed:', err);
    await closePool();
    process.exit(1);
  });

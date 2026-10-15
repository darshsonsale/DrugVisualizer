/**
 * Drug Path Visualiser - Task 23 Question Bank Verification Suite
 *
 * Verifies:
 * - 4 Quizzes, 20 Questions, 80 Options present in PostgreSQL
 * - Exactly 5 contiguous questions per quiz (order 1..5)
 * - Exactly 4 options per question
 * - Exactly 1 correct option per question
 * - needs_scientific_review = true on all 80 options
 * - Non-empty scientific explanations on all correct options
 * - Historical Ibuprofen IDs (q1, q2, opt1-a..d, opt2-a..d) preserved
 * - Answer confidentiality: GET /quizzes/:id & GET /quizzes/drug/:drugId strictly omit is_correct & explanation
 * - Zero-mutation server-side grading (Anonymous HTTP submissions evaluated accurately with 0 DB writes)
 * - Pass threshold discrete grading math: 40% (2/5 fail), 80% (4/5 pass), 100% (5/5 pass)
 * - Safe transactional rollback test for database persistence
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';

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

async function runQuizBankVerification(): Promise<void> {
  const pool = getPool();
  console.log('[Test Suite] Starting Task 23 Multi-Drug Question Bank Verification...');

  // =========================================================================
  // 1. DATABASE INVENTORY & SCHEMA INTEGRITY (READ-ONLY)
  // =========================================================================

  // Test 1: Verify exactly 4 quizzes exist for the 4 core drugs
  const quizzesRes = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM quizzes;'
  );
  const quizCount = parseInt(quizzesRes.rows[0].count, 10);

  const drugQuizMapRes = await pool.query<{ id: string; drug_id: string }>(
    'SELECT id, drug_id FROM quizzes ORDER BY id ASC;'
  );
  const expectedDrugs = [
    'drug-ibuprofen-001',
    'drug-amoxicillin-002',
    'drug-ambroxol-003',
    'drug-insulin-004'
  ];
  const sortedExpected = expectedDrugs.slice().sort();
  const actualDrugs = drugQuizMapRes.rows.map((r) => r.drug_id).sort();
  const allDrugsCovered =
    sortedExpected.length === actualDrugs.length &&
    sortedExpected.every((d, i) => d === actualDrugs[i]);

  record(
    'Exactly 4 quizzes exist in database mapped 1-to-1 to all 4 core medicines',
    quizCount === 4 && allDrugsCovered,
    `quizCount=${quizCount}, drugs=${actualDrugs.join(', ')}`
  );

  // Test 2: Verify exactly 20 questions exist (5 per quiz with contiguous order 1..5)
  const questionsCountRes = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM quiz_questions;'
  );
  const totalQuestions = parseInt(questionsCountRes.rows[0].count, 10);

  const questionsPerQuizRes = await pool.query<{ quiz_id: string; q_count: string; min_order: number; max_order: number }>(`
    SELECT
      quiz_id,
      COUNT(*) as q_count,
      MIN(question_order) as min_order,
      MAX(question_order) as max_order
    FROM quiz_questions
    GROUP BY quiz_id;
  `);

  const allQuizzesHave5ContiguousQuestions =
    questionsPerQuizRes.rows.length === 4 &&
    questionsPerQuizRes.rows.every(
      (r) =>
        parseInt(r.q_count, 10) === 5 &&
        r.min_order === 1 &&
        r.max_order === 5
    );

  record(
    'Exactly 20 questions exist across all quizzes (strictly 5 contiguous questions per quiz, orders 1 to 5)',
    totalQuestions === 20 && allQuizzesHave5ContiguousQuestions,
    `totalQuestions=${totalQuestions}, quizQuestionBuckets=${questionsPerQuizRes.rows.length}`
  );

  // Test 3: Verify exactly 80 options exist (strictly 4 options per question)
  const optionsCountRes = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM quiz_options;'
  );
  const totalOptions = parseInt(optionsCountRes.rows[0].count, 10);

  const optionsPerQuestionRes = await pool.query<{ question_id: string; opt_count: string }>(`
    SELECT question_id, COUNT(*) as opt_count
    FROM quiz_options
    GROUP BY question_id;
  `);

  const allQuestionsHave4Options =
    optionsPerQuestionRes.rows.length === 20 &&
    optionsPerQuestionRes.rows.every((r) => parseInt(r.opt_count, 10) === 4);

  record(
    'Exactly 80 options exist (strictly 4 options per question across all 20 questions)',
    totalOptions === 80 && allQuestionsHave4Options,
    `totalOptions=${totalOptions}, questionsWithFourOptions=${optionsPerQuestionRes.rows.length}/20`
  );

  // Test 4: Exactly 1 correct option per question
  const correctPerQuestionRes = await pool.query<{ question_id: string; correct_count: string }>(`
    SELECT question_id, COUNT(*) as correct_count
    FROM quiz_options
    WHERE is_correct = true
    GROUP BY question_id;
  `);

  const allQuestionsHaveExactlyOneCorrect =
    correctPerQuestionRes.rows.length === 20 &&
    correctPerQuestionRes.rows.every((r) => parseInt(r.correct_count, 10) === 1);

  record(
    'Every question has exactly 1 correct option (is_correct = true count is strictly 1 per question)',
    allQuestionsHaveExactlyOneCorrect,
    `questionsWithOneCorrect=${correctPerQuestionRes.rows.length}/20`
  );

  // Test 5: Scientific Provenance Flags (needs_scientific_review = true on all 80 options)
  const provenanceRes = await pool.query<{ count: string; unflagged: string }>(`
    SELECT
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE needs_scientific_review = false) as unflagged
    FROM quiz_options;
  `);
  const unflaggedCount = parseInt(provenanceRes.rows[0].unflagged, 10);

  record(
    'Scientific review provenance preserved: all 80 options flagged with needs_scientific_review = true',
    totalOptions === 80 && unflaggedCount === 0,
    `totalOptions=${totalOptions}, unflagged=${unflaggedCount}`
  );

  // Test 6: Scientific Explanations present on all 20 correct options
  const explanationsRes = await pool.query<{ count: string }>(`
    SELECT COUNT(*) as count
    FROM quiz_options
    WHERE is_correct = true
      AND explanation IS NOT NULL
      AND LENGTH(TRIM(explanation)) > 10;
  `);
  const validExplanationCount = parseInt(explanationsRes.rows[0].count, 10);

  record(
    'All 20 correct options possess substantiated, non-empty scientific explanations',
    validExplanationCount === 20,
    `validExplanations=${validExplanationCount}/20`
  );

  // Test 7: Historical Ibuprofen IDs preserved without semantic drift
  const historicalQuestionsRes = await pool.query<{ id: string; question_order: number; question_text: string }>(`
    SELECT id, question_order, question_text
    FROM quiz_questions
    WHERE id IN ('q1', 'q2')
    ORDER BY question_order ASC;
  `);
  const historicalOptionsRes = await pool.query<{ id: string; question_id: string; is_correct: boolean }>(`
    SELECT id, question_id, is_correct
    FROM quiz_options
    WHERE id IN ('opt1-a', 'opt1-b', 'opt1-c', 'opt1-d', 'opt2-a', 'opt2-b', 'opt2-c', 'opt2-d')
    ORDER BY id ASC;
  `);

  const q1Valid = historicalQuestionsRes.rows.find((q) => q.id === 'q1')?.question_order === 1;
  const q2Valid = historicalQuestionsRes.rows.find((q) => q.id === 'q2')?.question_order === 2;
  const opt1bCorrect = historicalOptionsRes.rows.find((o) => o.id === 'opt1-b')?.is_correct === true;
  const opt2bCorrect = historicalOptionsRes.rows.find((o) => o.id === 'opt2-b')?.is_correct === true;
  const otherHistoricalFalse = historicalOptionsRes.rows
    .filter((o) => o.id !== 'opt1-b' && o.id !== 'opt2-b')
    .every((o) => o.is_correct === false);

  record(
    'Historical Ibuprofen question and option records preserved without semantic drift (q1, q2, opt1-a..d, opt2-a..d intact)',
    q1Valid && q2Valid && opt1bCorrect && opt2bCorrect && otherHistoricalFalse && historicalOptionsRes.rows.length === 8,
    `historicalQuestions=${historicalQuestionsRes.rows.length}/2, historicalOptions=${historicalOptionsRes.rows.length}/8`
  );

  // =========================================================================
  // 2. ANSWER CONFIDENTIALITY ON PUBLIC API ROUTES (HTTP SERVER)
  // =========================================================================
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  try {
    // Test 8: Public GET /quizzes/:id confidentiality for all 4 quizzes
    const quizIds = [
      'quiz-ibuprofen-001',
      'quiz-amoxicillin-002',
      'quiz-ambroxol-003',
      'quiz-insulin-004'
    ];

    let allQuizzesConfidential = true;
    for (const qId of quizIds) {
      const res = await fetch(`${baseUrl}/quizzes/${qId}`);
      if (res.status !== 200) {
        allQuizzesConfidential = false;
        break;
      }
      const body: any = await res.json();
      const questions = body.data?.questions || [];
      if (questions.length !== 5) {
        allQuizzesConfidential = false;
        break;
      }
      for (const q of questions) {
        for (const opt of q.options || []) {
          if ('is_correct' in opt || 'explanation' in opt) {
            allQuizzesConfidential = false;
            break;
          }
        }
      }
    }

    record(
      'GET /api/v1/quizzes/:quizId returns 200 with 5 questions per quiz and strictly omits is_correct and explanation',
      allQuizzesConfidential,
      `quizzesTested=${quizIds.length}, confidentialityGuaranteed=${allQuizzesConfidential}`
    );

    // Test 9: Public GET /quizzes/drug/:drugId confidentiality for all 4 drugs
    let allDrugQuizzesConfidential = true;
    for (const dId of expectedDrugs) {
      const res = await fetch(`${baseUrl}/quizzes/drug/${dId}`);
      if (res.status !== 200) {
        allDrugQuizzesConfidential = false;
        break;
      }
      const body: any = await res.json();
      const questions = body.data?.questions || [];
      if (questions.length !== 5) {
        allDrugQuizzesConfidential = false;
        break;
      }
      for (const q of questions) {
        for (const opt of q.options || []) {
          if ('is_correct' in opt || 'explanation' in opt) {
            allDrugQuizzesConfidential = false;
            break;
          }
        }
      }
    }

    record(
      'GET /api/v1/quizzes/drug/:drugId resolves all 4 medicines with zero answer key leakage in payload',
      allDrugQuizzesConfidential,
      `drugsTested=${expectedDrugs.length}`
    );

    // =========================================================================
    // 3. ZERO-MUTATION SERVER-SIDE GRADING VERIFICATION (ANONYMOUS SUBMISSIONS)
    // =========================================================================

    const initialAttemptsCountRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM quiz_attempts;'
    );
    const initialAttemptsCount = parseInt(initialAttemptsCountRes.rows[0].count, 10);

    // Test 10: Anonymous submission to Amoxicillin Quiz (2/5 = 40% fail)
    const amoxSubmitRes = await fetch(`${baseUrl}/quizzes/quiz-amoxicillin-002/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'amox-q1', selected_option_id: 'amox-opt1-a' }, // correct
          { question_id: 'amox-q2', selected_option_id: 'amox-opt2-b' }, // incorrect
          { question_id: 'amox-q3', selected_option_id: 'amox-opt3-b' }, // correct
          { question_id: 'amox-q4', selected_option_id: 'amox-opt4-b' }, // incorrect
          { question_id: 'amox-q5', selected_option_id: 'amox-opt5-b' }  // incorrect
        ]
      })
    });
    const amoxSubmitBody: any = await amoxSubmitRes.json();
    const amoxData = amoxSubmitBody.data;

    const amoxGradingValid =
      amoxSubmitRes.status === 200 &&
      amoxData.score === 40 &&
      amoxData.total_questions === 5 &&
      amoxData.correct_answers === 2 &&
      amoxData.passed === false &&
      amoxData.details?.length === 5 &&
      Boolean(amoxData.details.find((d: any) => d.question_id === 'amox-q1')?.explanation);

    record(
      'Server-side grading on Amoxicillin: 2/5 correct evaluates score = 40%, passed = false, and unlocks feedback',
      amoxGradingValid,
      `status=${amoxSubmitRes.status}, score=${amoxData?.score}, passed=${amoxData?.passed}`
    );

    // Test 11: Anonymous submission to Ambroxol Quiz (4/5 = 80% pass threshold reached)
    const ambSubmitRes = await fetch(`${baseUrl}/quizzes/quiz-ambroxol-003/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'amb-q1', selected_option_id: 'amb-opt1-a' }, // correct
          { question_id: 'amb-q2', selected_option_id: 'amb-opt2-a' }, // correct
          { question_id: 'amb-q3', selected_option_id: 'amb-opt3-a' }, // correct
          { question_id: 'amb-q4', selected_option_id: 'amb-opt4-a' }, // correct
          { question_id: 'amb-q5', selected_option_id: 'amb-opt5-b' }  // incorrect
        ]
      })
    });
    const ambSubmitBody: any = await ambSubmitRes.json();
    const ambData = ambSubmitBody.data;

    const ambGradingValid =
      ambSubmitRes.status === 200 &&
      ambData.score === 80 &&
      ambData.total_questions === 5 &&
      ambData.correct_answers === 4 &&
      ambData.passed === true;

    record(
      'Server-side grading on Ambroxol: 4/5 correct evaluates score = 80%, passed = true (satisfies 70% threshold)',
      ambGradingValid,
      `status=${ambSubmitRes.status}, score=${ambData?.score}, passed=${ambData?.passed}`
    );

    // Test 12: Anonymous submission to Insulin Quiz (5/5 = 100% mastery)
    const insSubmitRes = await fetch(`${baseUrl}/quizzes/quiz-insulin-004/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { question_id: 'ins-q1', selected_option_id: 'ins-opt1-a' }, // correct
          { question_id: 'ins-q2', selected_option_id: 'ins-opt2-a' }, // correct
          { question_id: 'ins-q3', selected_option_id: 'ins-opt3-a' }, // correct
          { question_id: 'ins-q4', selected_option_id: 'ins-opt4-a' }, // correct
          { question_id: 'ins-q5', selected_option_id: 'ins-opt5-a' }  // correct
        ]
      })
    });
    const insSubmitBody: any = await insSubmitRes.json();
    const insData = insSubmitBody.data;

    const insGradingValid =
      insSubmitRes.status === 200 &&
      insData.score === 100 &&
      insData.total_questions === 5 &&
      insData.correct_answers === 5 &&
      insData.passed === true;

    record(
      'Server-side grading on Insulin: 5/5 correct evaluates score = 100%, passed = true',
      insGradingValid,
      `status=${insSubmitRes.status}, score=${insData?.score}, passed=${insData?.passed}`
    );

    // Test 13: Zero-Mutation Guarantee (Zero rows written to database during grading tests)
    const finalAttemptsCountRes = await pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM quiz_attempts;'
    );
    const finalAttemptsCount = parseInt(finalAttemptsCountRes.rows[0].count, 10);
    const zeroDbMutation = finalAttemptsCount === initialAttemptsCount;

    record(
      'Zero-mutation verification guarantee: Anonymous submissions wrote exactly 0 rows to database',
      zeroDbMutation,
      `initialAttempts=${initialAttemptsCount}, finalAttempts=${finalAttemptsCount}`
    );

    // =========================================================================
    // 4. TRANSACTIONAL ROLLBACK TEST FOR ATTEMPT PERSISTENCE
    // =========================================================================
    // Test 14: Direct isolated transaction with explicit ROLLBACK
    const client = await pool.connect();
    let transactionRolledBackCleanly = false;
    try {
      await client.query('BEGIN');

      const testAttemptId = `test-tx-${Date.now()}`;
      await client.query(
        `INSERT INTO quiz_attempts (
          id, quiz_id, user_id, score, total_questions, correct_answers, passed, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());`,
        [testAttemptId, 'quiz-ibuprofen-001', 'test-tx-user', 100, 5, 5, true]
      );

      await client.query(
        `INSERT INTO quiz_attempt_answers (
          id, attempt_id, question_id, selected_option_id, is_correct
        ) VALUES ($1, $2, $3, $4, $5);`,
        [`ans-${Date.now()}`, testAttemptId, 'q1', 'opt1-b', true]
      );

      const inTxCheck = await client.query(
        'SELECT COUNT(*) as count FROM quiz_attempts WHERE id = $1;',
        [testAttemptId]
      );
      const visibleInTx = parseInt(inTxCheck.rows[0].count, 10) === 1;

      await client.query('ROLLBACK');

      const postTxCheck = await pool.query(
        'SELECT COUNT(*) as count FROM quiz_attempts WHERE id = $1;',
        [testAttemptId]
      );
      const disappearedPostTx = parseInt(postTxCheck.rows[0].count, 10) === 0;

      transactionRolledBackCleanly = visibleInTx && disappearedPostTx;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    record(
      'Database write persistence verified inside transactional client with 100% rollback guarantee',
      transactionRolledBackCleanly,
      `rollbackClean=${transactionRolledBackCleanly}`
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[Test Suite] Ephemeral test server closed.');
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n======================================================');
  console.log('         TASK 23 QUESTION BANK VERIFICATION SUMMARY   ');
  console.log('======================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.name}`);
  }
  console.log('======================================================\n');

  if (!allPassed) {
    throw new Error('Task 23 Verification Suite encountered test failures.');
  }
}

runQuizBankVerification()
  .then(async () => {
    console.log('[Test Suite] Task 23 Verification completed successfully.');
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[Test Suite] Task 23 Verification failed:', err);
    await closePool();
    process.exit(1);
  });

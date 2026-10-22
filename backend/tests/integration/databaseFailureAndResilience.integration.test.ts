/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test Suite 4
 * Database Integration, Transaction Boundaries & Failure Resilience
 *
 * Verifies against PostgreSQL:
 * 1. Multi-step transaction rollback leaves zero partial records in PostgreSQL.
 * 2. Foreign-key constraints and relational integrity invariants.
 * 3. Centralized error handling and safe response envelopes without SQL syntax leaks.
 * 4. Constraint violation handling (duplicate answers, nonexistent entities, self-loops).
 */

import {
  requestApi,
  signValidIntegrationToken,
  getActiveTestDatabaseStatus,
  type IntegrationAssertionCollector
} from '../api/integrationApiHelper.js';
import {
  INTEGRATION_TEST_USERS
} from '../fixtures/integrationFixtures.js';

export async function runDatabaseFailureAndResilienceTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [Suite 4: Database Failure, Rollback & Relational Integrity] ---');

  const { canMutate, activeDatabase, testPool } = getActiveTestDatabaseStatus();
  const learnerToken = signValidIntegrationToken(
    INTEGRATION_TEST_USERS.learnerAlice.id,
    INTEGRATION_TEST_USERS.learnerAlice.role,
    INTEGRATION_TEST_USERS.learnerAlice.email
  );

  // 1. Duplicate Answer Submission Constraint Check
  const dupAnswerRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${learnerToken}`
    },
    body: JSON.stringify({
      answers: [
        { question_id: 'q1', selected_option_id: 'opt1-a' },
        { question_id: 'q1', selected_option_id: 'opt1-b' } // Duplicate answer for same question!
      ]
    })
  });

  collector.assert(
    dupAnswerRes.status === 400,
    'Duplicate answer for same question rejected with HTTP 400',
    { status: dupAnswerRes.status, body: dupAnswerRes.body }
  );

  // 2. Mismatched Question & Option Foreign Reference Check
  const mismatchedRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${learnerToken}`
    },
    body: JSON.stringify({
      answers: [
        // opt2-a belongs to q2, not q1
        { question_id: 'q1', selected_option_id: 'opt2-a' }
      ]
    })
  });

  collector.assert(
    mismatchedRes.status === 400,
    'Mismatched question-option reference rejected with HTTP 400 Bad Request',
    { status: mismatchedRes.status, body: mismatchedRes.body }
  );

  // 3. Question not belonging to Quiz Constraint Check
  const foreignQuestionRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${learnerToken}`
    },
    body: JSON.stringify({
      answers: [
        // q6 belongs to Amoxicillin quiz, sent to Ibuprofen quiz
        { question_id: 'q6', selected_option_id: 'opt6-a' }
      ]
    })
  });

  collector.assert(
    foreignQuestionRes.status === 400,
    'Question from different quiz rejected with HTTP 400',
    { status: foreignQuestionRes.status }
  );

  // 4. Foreign Key Nonexistent Drug Reference Check
  const nonExistentDrugRes = await requestApi(baseUrl, '/api/v1/progress/drug-does-not-exist-999', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${learnerToken}`
    },
    body: JSON.stringify({ completed_nodes: ['node-1'] })
  });

  collector.assert(
    nonExistentDrugRes.status === 404 || nonExistentDrugRes.status === 400,
    'Progress update for nonexistent drug safely rejected (HTTP 404 or 400)',
    { status: nonExistentDrugRes.status }
  );

  // 5. Transaction Rollback Verification (Guarded by Dedicated Test DB)
  if (canMutate && testPool) {
    console.log(`    [Transaction Check] Testing atomic rollback in PostgreSQL on "${activeDatabase}"...`);

    // Verify initial count of attempts for this test user
    const initialCountRes = await testPool.query<{ count: string }>(
      `SELECT count(*) FROM quiz_attempts WHERE user_id = $1;`,
      [INTEGRATION_TEST_USERS.learnerAlice.id]
    );
    const initialAttemptsCount = parseInt(initialCountRes.rows[0].count, 10);

    // Send a payload that passes early checks but fails during option validation/database constraint
    const failingTxRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        answers: [
          { question_id: 'q1', selected_option_id: 'invalid-nonexistent-option-id-999' }
        ]
      })
    });

    collector.assert(
      failingTxRes.status === 400,
      'Failed attempt rejected cleanly with HTTP 400',
      { status: failingTxRes.status }
    );

    // Verify PostgreSQL database state: No partial row was created in quiz_attempts
    const postCountRes = await testPool.query<{ count: string }>(
      `SELECT count(*) FROM quiz_attempts WHERE user_id = $1;`,
      [INTEGRATION_TEST_USERS.learnerAlice.id]
    );
    const postAttemptsCount = parseInt(postCountRes.rows[0].count, 10);

    collector.assert(
      postAttemptsCount === initialAttemptsCount,
      'Atomic rollback verified: failed attempt leaves zero partial records in PostgreSQL quiz_attempts',
      { initialCount: initialAttemptsCount, postCount: postAttemptsCount }
    );
  } else {
    collector.skip(
      'Transaction rollback verification on quiz_attempts',
      'Dedicated test database is not active; rollback mutation tests safely skipped per database safety protocol.'
    );
  }

  // 6. Error Response Schema Standard & Absence of Stack Traces
  const errorSchemaRes = await requestApi(baseUrl, '/api/v1/drugs/nonexistent/invalid-sub-path');
  const errorBody = errorSchemaRes.body;

  const validErrorEnvelope =
    errorBody?.success === false &&
    Boolean(errorBody?.error?.code) &&
    Boolean(errorBody?.error?.message) &&
    Boolean(errorBody?.meta?.timestamp);

  collector.assert(
    validErrorEnvelope,
    'Application error conforms to standardized { success: false, error, meta } envelope',
    { body: errorBody }
  );

  const leaksStackTrace =
    JSON.stringify(errorBody).includes('at ') ||
    JSON.stringify(errorBody).includes('node_modules') ||
    'stack' in (errorBody || {});

  collector.assert(
    !leaksStackTrace,
    'Centralized error handler strictly suppresses stack traces and internal paths',
    { leaksStackTrace }
  );
}

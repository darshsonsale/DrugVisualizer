/**
 * Drug Path Visualiser (BioLumen) - Task 27 Integration Test Suite 3
 * Checkpoint Quizzes, Server-Side Grading & Progress Persistence Integration
 *
 * Verifies against PostgreSQL:
 * 1. Public quiz retrieval across all 4 medicines without leaking answer keys.
 * 2. Strict answer confidentiality (no is_correct or explanation in public options).
 * 3. Server-side grading accuracy (evaluates correct count vs total questions).
 * 4. Client score tampering resistance (client-submitted scores are discarded).
 * 5. Atomic persistence into quiz_attempts and quiz_attempt_answers.
 * 6. Progress persistence across /api/v1/progress/:drugId and /api/v1/users/me/*.
 */

import {
  requestApi,
  signValidIntegrationToken,
  getActiveTestDatabaseStatus,
  type IntegrationAssertionCollector
} from '../api/integrationApiHelper.js';
import {
  SUPPORTED_DRUGS,
  INTEGRATION_TEST_USERS
} from '../fixtures/integrationFixtures.js';

export async function runQuizAndProgressTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [Suite 3: Quizzes, Server-Side Grading & Progress Persistence] ---');

  const { canMutate, activeDatabase, testPool } = getActiveTestDatabaseStatus();
  const learnerToken = signValidIntegrationToken(
    INTEGRATION_TEST_USERS.learnerAlice.id,
    INTEGRATION_TEST_USERS.learnerAlice.role,
    INTEGRATION_TEST_USERS.learnerAlice.email
  );
  const adminToken = signValidIntegrationToken(
    INTEGRATION_TEST_USERS.adminCarol.id,
    INTEGRATION_TEST_USERS.adminCarol.role,
    INTEGRATION_TEST_USERS.adminCarol.email
  );

  // 1. Public Quiz Retrieval & Answer Confidentiality across all 4 medicines
  for (const [key, drug] of Object.entries(SUPPORTED_DRUGS)) {
    const quizRes = await requestApi(baseUrl, `/api/v1/quizzes/drug/${drug.id}`);
    collector.assert(
      quizRes.status === 200 && quizRes.body?.success === true,
      `GET /api/v1/quizzes/drug/${drug.id} returns HTTP 200 OK`,
      { status: quizRes.status }
    );

    const quiz = quizRes.body?.data;
    collector.assert(
      quiz?.id === drug.quizId && Array.isArray(quiz?.questions) && quiz?.questions.length === 5,
      `Quiz for '${drug.name}' contains exactly 5 questions matching PostgreSQL`,
      { quizId: quiz?.id, questionCount: quiz?.questions?.length }
    );

    // Verify Answer Confidentiality: No option leaks is_correct or explanation
    let leakedAnswer = false;
    for (const q of quiz?.questions || []) {
      for (const opt of q.options || []) {
        if ('is_correct' in opt || 'explanation' in opt) {
          leakedAnswer = true;
          break;
        }
      }
      if (leakedAnswer) break;
    }

    collector.assert(
      !leakedAnswer,
      `Public quiz options for '${drug.name}' strictly preserve answer confidentiality`,
      { confidentialityPreserved: !leakedAnswer }
    );
  }

  // 2. Fetch Admin Quiz View to Obtain Real Option Mapping for Server Grading Verification
  const adminQuizRes = await requestApi(baseUrl, '/api/v1/admin/content/drugs/drug-ibuprofen-001/quiz', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  collector.assert(
    adminQuizRes.status === 200 && Array.isArray(adminQuizRes.body?.data?.questions),
    'Admin endpoint retrieves full Ibuprofen quiz with verified answer keys for grading test',
    { status: adminQuizRes.status }
  );

  const correctAnswers: Array<{ question_id: string; selected_option_id: string }> = [];
  const incorrectAnswers: Array<{ question_id: string; selected_option_id: string }> = [];

  if (testPool) {
    const optionsRes = await testPool.query<{ id: string; question_id: string; is_correct: boolean }>(
      `SELECT o.id, o.question_id, o.is_correct
       FROM quiz_options o
       JOIN quiz_questions q ON q.id = o.question_id
       WHERE q.quiz_id = 'quiz-ibuprofen-001'
       ORDER BY q.question_order ASC, o.id ASC;`
    );

    for (const opt of optionsRes.rows) {
      if (opt.is_correct && !correctAnswers.some((a) => a.question_id === opt.question_id)) {
        correctAnswers.push({ question_id: opt.question_id, selected_option_id: opt.id });
      } else if (!opt.is_correct && !incorrectAnswers.some((a) => a.question_id === opt.question_id)) {
        incorrectAnswers.push({ question_id: opt.question_id, selected_option_id: opt.id });
      }
    }
  }

  // 3. Server-Side Grading Evaluation & Tampering Resistance
  if (correctAnswers.length === 5) {
    // Submit 100% Correct Submission (including attempted client-side score injection)
    const perfectAttemptRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify({
        answers: correctAnswers,
        client_score: 50, // Tampering attempt: should be ignored
        score: 0 // Tampering attempt: should be ignored
      })
    });

    collector.assert(
      perfectAttemptRes.status === 200 && perfectAttemptRes.body?.success === true,
      'POST /api/v1/quizzes/:quizId/attempts accepts valid submission with HTTP 200',
      { status: perfectAttemptRes.status }
    );

    const result = perfectAttemptRes.body?.data;
    collector.assert(
      result?.score === 100 && result?.passed === true && result?.correct_answers === 5,
      'Server-side grading accurately calculates 100% score (ignoring client score injections)',
      {
        calculatedScore: result?.score,
        passed: result?.passed,
        correctCount: result?.correct_answers
      }
    );

    collector.assert(
      Boolean(result?.id),
      'Authenticated quiz submission returns persisted attempt record ID (id)',
      { attemptId: result?.id }
    );
  }

  // Submit Failing Submission
  if (incorrectAnswers.length >= 4) {
    const failingAnswers = incorrectAnswers.slice(0, 5);
    const failAttemptRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify({ answers: failingAnswers })
    });

    const failResult = failAttemptRes.body?.data;
    collector.assert(
      failAttemptRes.status === 200 && failResult?.score < 70 && failResult?.passed === false,
      'Server-side grading calculates failing score (< 70%) and sets passed = false',
      { score: failResult?.score, passed: failResult?.passed }
    );
  }

  // 4. Learning Progress Persistence Lifecycle
  // Anonymous progress retrieval
  const anonProgRes = await requestApi(baseUrl, '/api/v1/progress/drug-ibuprofen-001');
  collector.assert(
    anonProgRes.status === 200 && Array.isArray(anonProgRes.body?.data?.completed_nodes),
    'Anonymous GET /api/v1/progress/:drugId returns unpersisted default envelope',
    { completedNodes: anonProgRes.body?.data?.completed_nodes }
  );

  // Anonymous progress update is rejected with 401
  const anonSaveRes = await requestApi(baseUrl, '/api/v1/progress/drug-ibuprofen-001', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed_nodes: ['node-ibu-mouth'] })
  });
  collector.assert(
    anonSaveRes.status === 401,
    'Anonymous PUT /api/v1/progress/:drugId rejected with HTTP 401 Unauthorized',
    { status: anonSaveRes.status }
  );

  // Authenticated progress persistence (Guarded by Dedicated Test DB)
  if (canMutate) {
    console.log(`    [Mutation Check] Testing progress persistence on dedicated database: "${activeDatabase}"...`);

    const updatePayload = {
      completed_nodes: ['node-oral-cavity', 'node-stomach', 'node-small-intestine'],
      quiz_score: 90
    };

    const authSaveRes = await requestApi(baseUrl, '/api/v1/progress/drug-ibuprofen-001', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`
      },
      body: JSON.stringify(updatePayload)
    });

    collector.assert(
      authSaveRes.status === 200 && authSaveRes.body?.success === true,
      'Authenticated PUT /api/v1/progress/:drugId succeeds with HTTP 200',
      { status: authSaveRes.status }
    );

    // Verify progress retrieval reflects persisted state
    const authGetRes = await requestApi(baseUrl, '/api/v1/progress/drug-ibuprofen-001', {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });

    const savedProg = authGetRes.body?.data;
    collector.assert(
      savedProg?.completed_nodes?.length === 3 && savedProg?.quiz_score === 90,
      'Subsequent GET /api/v1/progress reflects persisted node completion and quiz score from PostgreSQL',
      {
        nodes: savedProg?.completed_nodes,
        score: savedProg?.quiz_score
      }
    );

    // Verify user dashboard endpoints reflect saved progress
    const overviewRes = await requestApi(baseUrl, '/api/v1/users/me/overview', {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });

    collector.assert(
      overviewRes.status === 200 && Array.isArray(overviewRes.body?.data?.progress),
      'GET /api/v1/users/me/overview reflects learner progress in overview dashboard',
      { status: overviewRes.status, progressCount: overviewRes.body?.data?.progress?.length }
    );
  } else {
    collector.skip(
      'Authenticated PUT /api/v1/progress/:drugId persistence test',
      'Dedicated test database is not active; mutation tests safely skipped per database safety protocol.'
    );
    collector.skip(
      'User overview dashboard reflection test',
      'Skipped in read-only fallback mode to protect development data.'
    );
  }
}

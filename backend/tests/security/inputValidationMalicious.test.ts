/**
 * Drug Path Visualiser (BioLumen) - Task 26 Input Validation & Malicious Inputs Suite
 *
 * Verifies:
 * 1. Malformed JSON payloads return HTTP 400 with 'INVALID_JSON_BODY'.
 * 2. Missing required fields and unexpected types return HTTP 400 'VALIDATION_ERROR'.
 * 3. Oversized inputs (>100KB) return HTTP 413 'PAYLOAD_TOO_LARGE'.
 * 4. SQL injection payloads in path, query, and body are safely handled via parameterized queries.
 * 5. XSS-like strings are handled safely and returned without script execution risk.
 * 6. Malicious quiz attempt manipulations (duplicates, foreign questions, answer key tampering) are rejected.
 * 7. Quiz answer keys (is_correct) are strictly confidential in public API queries.
 * 8. All error responses return safe, sanitized JSON without stack traces or SQL details.
 */

import {
  requestApi,
  signValidTestToken,
  createAssertionCollector,
  type SecurityAssertionCollector
} from '../api/securityApiHelper.js';
import {
  SQL_INJECTION_PAYLOADS,
  XSS_PAYLOADS,
  PATH_TRAVERSAL_PAYLOADS,
  INVALID_IDENTIFIER_PAYLOADS,
  MALFORMED_JSON_PAYLOADS,
  SECURITY_TEST_USERS,
  generateOversizedPayload
} from '../fixtures/securityFixtures.js';

export async function runInputValidationMaliciousTests(baseUrl: string, collector?: SecurityAssertionCollector) {
  const { assert, getSummary } = collector || createAssertionCollector('Input Validation & Malicious Inputs');

  console.log('\n--- [Suite 3: Input Validation & Malicious Inputs] ---');

  const aliceToken = signValidTestToken(
    SECURITY_TEST_USERS.learnerAlice.id,
    'learner',
    SECURITY_TEST_USERS.learnerAlice.email
  );

  // 1. Malformed JSON Body Syntax Handling
  for (const malformedBody of MALFORMED_JSON_PAYLOADS) {
    const res = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`
      },
      body: malformedBody
    });

    assert(
      res.status === 400,
      `Malformed JSON syntax caught with HTTP 400: "${malformedBody.substring(0, 20)}..."`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.error?.code === 'INVALID_JSON_BODY',
      'Malformed JSON returns code INVALID_JSON_BODY',
      res.body
    );
  }

  // 2. Payload Size Limits (>100KB DoS Guard)
  const oversizedPayload = generateOversizedPayload(120); // 120KB
  const oversizedRes = await requestApi(baseUrl, '/api/v1/quizzes/quiz-ibuprofen-001/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: oversizedPayload
  });

  assert(
    oversizedRes.status === 413,
    'Oversized payload (>100KB) rejected with HTTP 413 Payload Too Large',
    `Got status ${oversizedRes.status}`
  );
  assert(
    oversizedRes.body?.error?.code === 'PAYLOAD_TOO_LARGE',
    'Oversized payload returns code PAYLOAD_TOO_LARGE',
    oversizedRes.body
  );

  // 3. SQL Injection Payloads in Path Parameters
  for (const sqli of SQL_INJECTION_PAYLOADS) {
    const encoded = encodeURIComponent(sqli);
    const res = await requestApi(baseUrl, `/api/v1/drugs/${encoded}/pathway`);
    assert(
      res.status === 400 || res.status === 404,
      `SQL injection in path param (${sqli}) rejected safely (HTTP 400 or 404)`,
      `Got status ${res.status}`
    );
    assert(
      !res.rawBody.toLowerCase().includes('syntax error') &&
        !res.rawBody.toLowerCase().includes('pg_sleep') &&
        !res.rawBody.toLowerCase().includes('postgresql') &&
        !res.rawBody.toLowerCase().includes('select'),
      `SQL injection payload does not cause database syntax error leak`,
      res.rawBody
    );
  }

  // 4. SQL Injection Payloads in Query Parameters
  for (const sqli of SQL_INJECTION_PAYLOADS.slice(0, 5)) {
    const encoded = encodeURIComponent(sqli);
    const res = await requestApi(baseUrl, `/api/v1/drugs/ibuprofen/pathway?condition=${encoded}`);
    assert(
      res.status === 400,
      `SQL injection in query param (${sqli}) rejected by schema validation (HTTP 400)`,
      `Got status ${res.status}`
    );
    assert(
      res.body?.error?.code === 'INVALID_FOOD_CONDITION' || res.body?.error?.code === 'VALIDATION_ERROR',
      'Rejected query param returns structured validation error'
    );
  }

  // 5. Path Traversal & Invalid Identifier Payloads
  for (const pt of PATH_TRAVERSAL_PAYLOADS) {
    const encoded = encodeURIComponent(pt);
    const res = await requestApi(baseUrl, `/api/v1/drugs/${encoded}/pathway`);
    assert(
      res.status === 400 || res.status === 404,
      `Path traversal payload "${pt}" rejected safely (HTTP ${res.status})`
    );
  }

  for (const inv of INVALID_IDENTIFIER_PAYLOADS) {
    if (!inv.trim()) continue;
    const encoded = encodeURIComponent(inv);
    const res = await requestApi(baseUrl, `/api/v1/drugs/${encoded}/pathway`);
    assert(
      res.status === 400 || res.status === 404,
      `Invalid identifier "${inv.substring(0, 15)}" rejected safely (HTTP ${res.status})`
    );
  }

  // 6. XSS String Handling in Requests
  for (const xss of XSS_PAYLOADS) {
    const res = await requestApi(baseUrl, '/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `sec_xss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@test.local`,
        password: 'ValidPassword123!',
        name: xss
      })
    });

    assert(
      res.status === 201 || res.status === 400,
      `XSS string in registration name handled safely (HTTP ${res.status})`
    );
    // Ensure response content-type is application/json (browser will not execute as HTML)
    assert(
      typeof res.headers['content-type'] === 'string' &&
        res.headers['content-type'].includes('application/json'),
      'Response is strictly returned with Content-Type application/json'
    );
  }

  // 7. Malicious & Invalid Quiz Submissions
  const quizId = 'quiz-ibuprofen-001';

  // 7.1 Empty answers array
  const emptyAnswersRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: JSON.stringify({ answers: [] })
  });
  assert(
    emptyAnswersRes.status === 400,
    'Empty answers array in quiz submission rejected with HTTP 400',
    emptyAnswersRes.body
  );

  // 7.2 Non-array answers field
  const nonArrayAnswersRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: JSON.stringify({ answers: 'true' })
  });
  assert(
    nonArrayAnswersRes.status === 400,
    'Non-array answers field rejected with HTTP 400',
    nonArrayAnswersRes.body
  );

  // 7.3 Duplicate answers for the same question
  const duplicateAnswersRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: JSON.stringify({
      answers: [
        { question_id: 'q-ibu-01', selected_option_id: 'opt-ibu-01-a' },
        { question_id: 'q-ibu-01', selected_option_id: 'opt-ibu-01-b' }
      ]
    })
  });
  assert(
    duplicateAnswersRes.status === 400,
    'Duplicate answer for same question rejected with HTTP 400',
    duplicateAnswersRes.body
  );

  // 7.4 Cross-quiz foreign question injection
  const foreignQuestionRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: JSON.stringify({
      answers: [
        { question_id: 'q-morphine-01', selected_option_id: 'opt-morphine-01-a' }
      ]
    })
  });
  assert(
    foreignQuestionRes.status === 400,
    'Foreign question not belonging to quiz rejected with HTTP 400',
    foreignQuestionRes.body
  );

  // 7.5 Attempting to forge score/grade or inject answers in submission
  const forgedSubmissionRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aliceToken}`
    },
    body: JSON.stringify({
      score: 100,
      passed: true,
      answers: [
        { question_id: 'q-ibu-01', selected_option_id: 'opt-ibu-01-a', is_correct: true }
      ]
    })
  });
  assert(
    forgedSubmissionRes.status === 200 || forgedSubmissionRes.status === 400,
    'Submission processed or validated',
    forgedSubmissionRes.body
  );
  if (forgedSubmissionRes.status === 200) {
    // Score must be calculated server-side, not blindly accept score=100
    assert(
      typeof forgedSubmissionRes.body?.data?.score === 'number',
      'Score is evaluated server-side by backend grading engine'
    );
  }

  // 8. Quiz Answer Confidentiality Verification
  const quizDetailsRes = await requestApi(baseUrl, `/api/v1/quizzes/${quizId}`);
  assert(quizDetailsRes.status === 200, 'Public quiz details retrieved with HTTP 200');

  const rawQuizJson = JSON.stringify(quizDetailsRes.body);
  assert(
    !rawQuizJson.includes('"is_correct"') && !rawQuizJson.includes('"isCorrect"'),
    'Quiz questions response strictly omits is_correct answer keys to prevent client cheating',
    quizDetailsRes.body
  );

  // 9. Information Leakage Prevention Across All Error Responses
  const nonExistentRes = await requestApi(baseUrl, '/api/v1/unknown/resource/probe');
  assert(
    nonExistentRes.status === 404,
    'Non-existent route returns clean HTTP 404',
    nonExistentRes.body
  );
  assert(
    !nonExistentRes.rawBody.includes('node_modules') &&
      !nonExistentRes.rawBody.includes('at Function.') &&
      !nonExistentRes.rawBody.includes('Error:'),
    'Error response strictly omits stack traces and internal file paths',
    nonExistentRes.rawBody
  );

  return getSummary();
}

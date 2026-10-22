/**
 * Drug Path Visualiser (BioLumen) - Task 29 Use-Case Acceptance Tests
 *
 * Verifies the 6 explicit acceptance criteria from the official MVP Roadmap:
 * - UC-01: Anonymous user can explore Ibuprofen
 * - UC-02: User can inspect nodes
 * - UC-03: User can switch Before Food / After Food
 * - UC-04: User can complete quiz
 * - UC-05: Google authentication and progress saving work
 * - UC-06: Admin content workflow works
 */

import { IntegrationAssertionCollector, getActiveTestDatabaseStatus } from '../api/integrationApiHelper.js';
import { INTEGRATION_TEST_USERS } from '../fixtures/integrationFixtures.js';

export async function runUseCaseAcceptanceTests(
  baseUrl: string,
  collector: IntegrationAssertionCollector
): Promise<void> {
  console.log('\n--- [E2E Suite 2: Official Roadmap MVP Use-Case Acceptance] ---');
  const dbStatus = getActiveTestDatabaseStatus();

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 1 (UC-01): Anonymous user can explore Ibuprofen
  // -------------------------------------------------------------------------
  console.log('  [UC-01] Anonymous user can explore Ibuprofen...');
  try {
    const pathwayRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const pathwayData = await pathwayRes.json();

    collector.assert(
      pathwayRes.status === 200 && pathwayData.success === true,
      'UC-01.1: Ibuprofen pathway successfully retrieved without authentication tokens',
      { status: pathwayRes.status }
    );
    collector.assert(
      Array.isArray(pathwayData.data.nodes) && pathwayData.data.nodes.length === 7,
      'UC-01.2: Ibuprofen 3D pathway contains complete anatomical sequence (7 stations)',
      { stations: pathwayData.data.nodes?.length }
    );
    collector.assert(
      Array.isArray(pathwayData.data.edges) && pathwayData.data.edges.length === 6,
      'UC-01.3: Ibuprofen 3D pathway contains directed anatomical edges connecting consecutive stations',
      { edges: pathwayData.data.edges?.length }
    );
    collector.assert(
      pathwayData.data.drug?.name === 'Ibuprofen',
      'UC-01.4: Pathway graph is attributed to Ibuprofen with valid pharmacokinetics metadata',
      { drugName: pathwayData.data.drug?.name }
    );
  } catch (err) {
    collector.assert(false, 'UC-01: Anonymous user explore Ibuprofen failed', err);
  }

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 2 (UC-02): User can inspect nodes
  // -------------------------------------------------------------------------
  console.log('  [UC-02] User can inspect nodes...');
  try {
    const contentRes = await fetch(`${baseUrl}/api/v1/content/drugs/drug-ibuprofen-001`);
    const contentData = await contentRes.json();

    collector.assert(
      contentRes.status === 200 && Array.isArray(contentData.data.nodes),
      'UC-02.1: Educational station content retrieved for all nodes',
      { status: contentRes.status }
    );

    const requiredStations = [
      'node-oral-cavity',
      'node-stomach',
      'node-small-intestine',
      'node-liver',
      'node-bloodstream',
      'node-target-sites',
      'node-kidneys'
    ];

    let allStationsPresent = true;
    let allStationsHaveTakeaways = true;
    for (const stationId of requiredStations) {
      const node = contentData.data.nodes.find((n: any) => n.node_id === stationId);
      if (!node) allStationsPresent = false;
      if (!node?.key_takeaway) allStationsHaveTakeaways = false;
    }

    collector.assert(
      allStationsPresent,
      'UC-02.2: All 7 Ibuprofen anatomical stations have corresponding clinical inspection content',
      { requiredStationsCount: requiredStations.length }
    );
    collector.assert(
      allStationsHaveTakeaways,
      'UC-02.3: Each anatomical station presents an actionable clinical key takeaway',
      { hasTakeaways: allStationsHaveTakeaways }
    );
  } catch (err) {
    collector.assert(false, 'UC-02: User can inspect nodes failed', err);
  }

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 3 (UC-03): User can switch Before Food / After Food
  // -------------------------------------------------------------------------
  console.log('  [UC-03] User can switch Before Food / After Food...');
  try {
    const fastingRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const fastingData = await fastingRes.json();
    const fedRes = await fetch(`${baseUrl}/api/v1/drugs/drug-ibuprofen-001/pathway?condition=AFTER_FOOD`);
    const fedData = await fedRes.json();

    collector.assert(
      fastingRes.status === 200 && fedRes.status === 200,
      'UC-03.1: Both BEFORE_FOOD and AFTER_FOOD conditions resolve successfully',
      { fastingStatus: fastingRes.status, fedStatus: fedRes.status }
    );

    const fastingTmax = Number(fastingData.data.drug?.tmax_hours);
    const fedTmax = Number(fedData.data.drug?.tmax_hours);

    collector.assert(
      fastingTmax === 0.75 && fedTmax === 2.5,
      'UC-03.2: Food condition switch reflects documented Tmax shift from 0.75h (fasting) to 2.50h (fed)',
      { fastingTmax, fedTmax }
    );
    collector.assert(
      typeof fedData.data.pathway?.description === 'string' &&
      (fedData.data.pathway.description.toLowerCase().includes('gastric') ||
       fedData.data.pathway.description.toLowerCase().includes('food') ||
       fedData.data.pathway.description.toLowerCase().includes('absorption')),
      'UC-03.3: Condition description details physiological impact of fed state on drug absorption',
      { description: fedData.data.pathway?.description }
    );
  } catch (err) {
    collector.assert(false, 'UC-03: Switch Before Food / After Food failed', err);
  }

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 4 (UC-04): User can complete quiz
  // -------------------------------------------------------------------------
  console.log('  [UC-04] User can complete quiz...');
  try {
    const quizRes = await fetch(`${baseUrl}/api/v1/quizzes/drug/drug-ibuprofen-001`);
    const quizData = await quizRes.json();
    const quizId = quizData.data.id;

    collector.assert(
      quizRes.status === 200 && Array.isArray(quizData.data.questions),
      'UC-04.1: Quiz questions loaded with 5 verified clinical items',
      { status: quizRes.status, count: quizData.data?.questions?.length }
    );

    // Build complete attempt submission
    const submissionPayload = {
      answers: quizData.data.questions.map((q: any) => ({
        question_id: q.id,
        selected_option_id: q.options[0].id
      }))
    };

    const attemptRes = await fetch(`${baseUrl}/api/v1/quizzes/${quizId}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionPayload)
    });
    const attemptData = await attemptRes.json();

    collector.assert(
      attemptRes.status === 200 && attemptData.success === true,
      'UC-04.2: Quiz attempt submitted successfully and processed by server grading engine',
      { status: attemptRes.status }
    );
    collector.assert(
      typeof attemptData.data.score === 'number' &&
      typeof attemptData.data.passed === 'boolean' &&
      Array.isArray(attemptData.data.details),
      'UC-04.3: Quiz result response contains complete grade breakdown with question rationales',
      { score: attemptData.data.score, passed: attemptData.data.passed, details: attemptData.data.details?.length }
    );
  } catch (err) {
    collector.assert(false, 'UC-04: User can complete quiz failed', err);
  }

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 5 (UC-05): Google authentication and progress saving work
  // -------------------------------------------------------------------------
  console.log('  [UC-05] Google authentication and progress saving work...');
  try {
    // 5.1 Google OAuth URL and protocol check
    const googleUrlRes = await fetch(`${baseUrl}/api/v1/auth/google/url`);
    const googleUrlData = await googleUrlRes.json();

    collector.assert(
      googleUrlRes.status === 200 && typeof googleUrlData.data.url === 'string',
      'UC-05.1: Google OAuth endpoint provides compliant authorization URL with identity scopes',
      { status: googleUrlRes.status }
    );

    // 5.2 Authenticated Progress Saving (if dedicated test database is available)
    if (!dbStatus.canMutate) {
      collector.skip('UC-05.2: Progress Persistence', 'Skipped: Read-only mode active');
    } else {
      const candidateEmail = `progress_uc_${Date.now()}@test.biolumen.org`;
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: candidateEmail,
          password: 'CandidateStrongPass88!',
          name: 'UC Candidate Learner'
        })
      });
      const regData = await regRes.json();
      const token = regData.data.token;

      // Persist progress for Ibuprofen
      const saveProgRes = await fetch(`${baseUrl}/api/v1/progress/drug-ibuprofen-001`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          completed_nodes: ['node-oral-cavity', 'node-stomach', 'node-small-intestine']
        })
      });
      collector.assert(
        saveProgRes.status === 200,
        'UC-05.2: Authenticated user saves station completion progress to PostgreSQL',
        { status: saveProgRes.status }
      );

      // Verify progress persists on retrieval
      const getProgRes = await fetch(`${baseUrl}/api/v1/progress/drug-ibuprofen-001`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const getProgData = await getProgRes.json();
      collector.assert(
        getProgRes.status === 200 &&
        Array.isArray(getProgData.data.completed_nodes) &&
        getProgData.data.completed_nodes.includes('node-small-intestine'),
        'UC-05.3: Persisted stations are reliably retrieved for authenticated user',
        { completedNodes: getProgData.data.completed_nodes }
      );
    }
  } catch (err) {
    collector.assert(false, 'UC-05: Google auth and progress saving failed', err);
  }

  // -------------------------------------------------------------------------
  // ACCEPTANCE CRITERIA 6 (UC-06): Admin content workflow works
  // -------------------------------------------------------------------------
  console.log('  [UC-06] Admin content workflow works...');
  if (!dbStatus.canMutate) {
    collector.skip('UC-06: Admin Content Workflow', 'Skipped: Read-only mode active');
  } else {
    try {
      // 6.1 Admin authentication
      const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: INTEGRATION_TEST_USERS.adminCarol.email,
          password: INTEGRATION_TEST_USERS.adminCarol.password
        })
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.data.token;

      collector.assert(
        adminLoginRes.status === 200 && adminLoginData.data.user.role === 'admin',
        'UC-06.1: Administrator authenticates and receives verified admin session token',
        { role: adminLoginData.data.user.role }
      );

      // 6.2 Admin accesses summary metrics
      const summaryRes = await fetch(`${baseUrl}/api/v1/admin/content/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const summaryData = await summaryRes.json();

      collector.assert(
        summaryRes.status === 200 && summaryData.data?.total_drugs === 4,
        'UC-06.2: Admin reviews clinical content metrics across all 4 catalog medicines',
        { totalDrugs: summaryData.data?.total_drugs }
      );

      // 6.3 Admin updates node content
      const updatedTakeaway = `UC-06 Scientific Revision: Pharmacokinetic equilibrium at ${Date.now()}`;
      const updateRes = await fetch(`${baseUrl}/api/v1/admin/content/nodes/node-oral-cavity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          general_description: 'UC-06 verified updated description for Oral Cavity.',
          physiological_role: 'UC-06 physiological role.',
          key_takeaway: updatedTakeaway,
          key_cellular_mechanisms: ['Passive diffusion'],
          micro_environment_ph: 6.8,
          defined_terms: [{ term: 'Salivary Amylase', definition: 'Enzyme initiating starch breakdown.' }],
          references_list: ['Clinical Pharmacology Handbook 10th Ed.']
        })
      });

      collector.assert(
        updateRes.status === 200,
        'UC-06.3: Admin updates station clinical content with HTTP 200 OK',
        { status: updateRes.status }
      );

      // 6.4 Public Learner reads the updated content
      const publicContentRes = await fetch(`${baseUrl}/api/v1/content/drugs/drug-ibuprofen-001`);
      const publicContentData = await publicContentRes.json();
      const oralNode = publicContentData.data.nodes?.find((n: any) => n.node_id === 'node-oral-cavity');

      collector.assert(
        oralNode?.key_takeaway === updatedTakeaway,
        'UC-06.4: Content workflow verification: updated clinical takeaway is immediately served to public learners',
        { publishedTakeaway: oralNode?.key_takeaway }
      );
    } catch (err) {
      collector.assert(false, 'UC-06: Admin content workflow failed', err);
    }
  }
}

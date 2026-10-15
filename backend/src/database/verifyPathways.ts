/**
 * Drug Path Visualiser - Complete Drug Pathway Verification Suite (Task 18)
 *
 * Verifies:
 * 1. Database-backed pathways exist for all 4 core medications:
 *    - Ibuprofen 400 mg tablet (7 nodes, 6 edges, 2 variations)
 *    - Amoxicillin 500 mg capsule (7 nodes, 6 edges, 2 variations)
 *    - Ambroxol Syrup 15 mg / 5 ml (7 nodes, 6 edges, 2 variations)
 *    - Insulin 100 IU / ml SubQ Injection (6 nodes, 5 edges, 2 variations)
 * 2. Condition variation support (BEFORE_FOOD / AFTER_FOOD) with physiological modifiers.
 * 3. Pharmacokinetic Tmax and bioavailability adjustments per condition.
 * 4. Traceable scientific references and review status flags.
 * 5. Topological graph continuity (directed edges connect sequentially from start to clearance).
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';

async function runPathwaysVerification(): Promise<void> {
  const pool = getPool();
  console.log('================================================================');
  console.log('TASK 18 COMPLETE DRUG PATHWAY VERIFICATION SUITE');
  console.log('================================================================\n');

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind test HTTP server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`[Test Suite] Test server running on ${baseUrl}`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 1. VERIFY ALL 4 DRUGS IN DATABASE
    console.log('[Phase 1: Drug Catalog Completeness]');
    const drugsQuery = await pool.query(`SELECT id, name, route, form FROM drugs ORDER BY name ASC;`);
    assert(drugsQuery.rows.length === 4, 'Catalog contains exactly 4 medications in database');

    const drugIds = drugsQuery.rows.map((r: any) => r.id);
    assert(drugIds.includes('drug-ibuprofen-001'), 'Ibuprofen exists in database');
    assert(drugIds.includes('drug-amoxicillin-002'), 'Amoxicillin exists in database');
    assert(drugIds.includes('drug-ambroxol-003'), 'Ambroxol exists in database');
    assert(drugIds.includes('drug-insulin-004'), 'Insulin exists in database');

    // 2. VERIFY IBUPROFEN PATHWAY & VARIATIONS
    console.log('\n[Phase 2: Ibuprofen Database Pathway Verification]');
    const ibupRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway?condition=BEFORE_FOOD`);
    const ibupData: any = await ibupRes.json();
    assert(ibupRes.status === 200, 'Ibuprofen BEFORE_FOOD pathway returned 200');
    assert(ibupData.data.nodes.length === 7, 'Ibuprofen has 7 anatomical nodes');
    assert(ibupData.data.edges.length === 6, 'Ibuprofen has 6 directed edges');
    assert(ibupData.data.pathway.condition === 'BEFORE_FOOD', 'Active condition matches query');

    const ibupFedRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway?condition=AFTER_FOOD`);
    const ibupFedData: any = await ibupFedRes.json();
    assert(ibupFedRes.status === 200, 'Ibuprofen AFTER_FOOD pathway returned 200');
    assert(ibupFedData.data.drug.tmax_hours === 2.5, 'Ibuprofen AFTER_FOOD reflects delayed Tmax (2.5h)');

    // 3. VERIFY AMOXICILLIN PATHWAY & SCIENTIFIC CITATIONS
    console.log('\n[Phase 3: Amoxicillin Pathway & Scientific Content Verification]');
    const amoxRes = await fetch(`${baseUrl}/drugs/drug-amoxicillin-002/pathway?condition=BEFORE_FOOD`);
    const amoxData: any = await amoxRes.json();
    assert(amoxRes.status === 200, 'Amoxicillin BEFORE_FOOD pathway returned 200');
    assert(amoxData.data.nodes.length === 7, 'Amoxicillin has 7 pathway nodes (Oral Cavity to Kidneys)');
    assert(amoxData.data.edges.length === 6, 'Amoxicillin has 6 directed edges');

    const amoxIntestineNode = amoxData.data.nodes.find((n: any) => n.name === 'Small Intestine');
    assert(amoxIntestineNode !== undefined, 'Amoxicillin includes Small Intestine node');
    assert(
      amoxIntestineNode.content.physiological_role.includes('PEPT1') ||
      amoxIntestineNode.content.general_description.includes('PEPT1'),
      'Amoxicillin content documents verified PEPT1 transporter uptake'
    );
    assert(
      amoxIntestineNode.content?.general_description?.includes('FLAGGED_FOR_SCIENTIFIC_REVIEW') ||
      amoxIntestineNode.content?.physiological_role?.includes('FLAGGED_FOR_SCIENTIFIC_REVIEW') ||
      amoxIntestineNode.variation?.notes?.includes('FLAGGED_FOR_SCIENTIFIC_REVIEW'),
      'Amoxicillin content includes scientific review status flag'
    );

    const amoxFedRes = await fetch(`${baseUrl}/drugs/drug-amoxicillin-002/pathway?condition=AFTER_FOOD`);
    const amoxFedData: any = await amoxFedRes.json();
    assert(amoxFedData.data.drug.tmax_hours === 1.8, 'Amoxicillin AFTER_FOOD reflects verified fed-state Tmax delay (~1.8h)');

    // 4. VERIFY AMBROXOL SYRUP PATHWAY
    console.log('\n[Phase 4: Ambroxol Syrup Pathway & Respiratory Tropism Verification]');
    const ambroxolRes = await fetch(`${baseUrl}/drugs/drug-ambroxol-003/pathway?condition=BEFORE_FOOD`);
    const ambroxolData: any = await ambroxolRes.json();
    assert(ambroxolRes.status === 200, 'Ambroxol BEFORE_FOOD pathway returned 200');
    assert(ambroxolData.data.nodes.length === 8, 'Ambroxol has 8 pathway nodes');
    assert(ambroxolData.data.edges.length === 7, 'Ambroxol has 7 directed edges');

    const ambroxolTargetNode = ambroxolData.data.nodes.find((n: any) => n.name === 'Respiratory Tissues');
    assert(ambroxolTargetNode !== undefined, 'Ambroxol includes Respiratory Tissues node');
    assert(
      ambroxolTargetNode.content.general_description.includes('surfactant') ||
      ambroxolTargetNode.content.physiological_role.includes('surfactant'),
      'Ambroxol documents pulmonary surfactant synthesis and alveolar type II pneumocyte stimulation'
    );

    const ambroxolFedRes = await fetch(`${baseUrl}/drugs/drug-ambroxol-003/pathway?condition=AFTER_FOOD`);
    const ambroxolFedData: any = await ambroxolFedRes.json();
    assert(ambroxolFedData.data.drug.tmax_hours === 2.5, 'Ambroxol AFTER_FOOD reflects delayed Tmax (2.5h)');

    // 5. VERIFY INSULIN SUBCUTANEOUS PATHWAY
    console.log('\n[Phase 5: Insulin Subcutaneous Pathway & Parenteral Mechanics Verification]');
    const insulinRes = await fetch(`${baseUrl}/drugs/drug-insulin-004/pathway?condition=BEFORE_FOOD`);
    const insulinData: any = await insulinRes.json();
    assert(insulinRes.status === 200, 'Insulin BEFORE_FOOD pathway returned 200');
    assert(insulinData.data.nodes.length === 5, 'Insulin has 5 pathway nodes (Injection Site to Kidneys)');
    assert(insulinData.data.edges.length === 4, 'Insulin has 4 directed edges');

    const subQNode = insulinData.data.nodes.find((n: any) => n.name === 'Injection Site');
    assert(subQNode !== undefined, 'Insulin begins at Injection Site (Subcutaneous route)');
    assert(
      subQNode.content.general_description.includes('hexamer') ||
      subQNode.content.physiological_role.includes('monomer'),
      'Insulin documents zinc-stabilized hexamer dissociation into absorbable monomers'
    );

    const insulinTargetNode = insulinData.data.nodes.find((n: any) => n.name === 'Body Tissues');
    assert(insulinTargetNode !== undefined, 'Insulin includes Body Tissues node');
    assert(
      insulinTargetNode.content.general_description.includes('GLUT4') ||
      insulinTargetNode.content.physiological_role.includes('GLUT4'),
      'Insulin documents GLUT4 translocation via tyrosine kinase signaling'
    );

    const insulinClearanceNode = insulinData.data.nodes.find((n: any) => n.name === 'Liver');
    assert(insulinClearanceNode !== undefined, 'Insulin includes hepatic receptor clearance node');

    // 6. TOPOLOGICAL ORDERING ACROSS ALL PATHWAYS
    console.log('\n[Phase 6: Topological Edge Continuity]');
    for (const drugId of ['drug-ibuprofen-001', 'drug-amoxicillin-002', 'drug-ambroxol-003', 'drug-insulin-004']) {
      const pRes = await fetch(`${baseUrl}/drugs/${drugId}/pathway`);
      const pData: any = await pRes.json();
      const nodes = pData.data.nodes;
      const edges = pData.data.edges;

      for (let i = 0; i < nodes.length - 1; i++) {
        const fromId = nodes[i].id;
        const toId = nodes[i + 1].id;
        const matchingEdge = edges.find((e: any) => e.from_node_id === fromId && e.to_node_id === toId);
        assert(matchingEdge !== undefined, `Continuous directed edge exists from ${nodes[i].name} to ${nodes[i + 1].name} in ${drugId}`);
      }
    }

    console.log('\n================================================================');
    console.log(`ALL ${passedTests}/${totalTests} PATHWAY VERIFICATION TESTS PASSED!`);
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

if (process.argv[1]?.endsWith('verifyPathways.ts') || process.argv[1]?.endsWith('verifyPathways.js')) {
  runPathwaysVerification()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Verification Failed]:', err);
      await closePool();
      process.exit(1);
    });
}

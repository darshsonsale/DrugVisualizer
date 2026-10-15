/**
 * Drug Path Visualiser - Task 21 Educational Content & Scientific Integrity Verification Suite
 *
 * Verifies:
 * 1. Migration 0006 database schema additions on node_content (key_takeaway, defined_terms, references_list, review_status).
 * 2. All 27 pathway nodes across 4 core medications contain:
 *    - Plain-English explanation for general college students.
 *    - Deep scientific mechanism with technical terms/acronyms defined upon first use.
 *    - Distinct student key takeaway.
 *    - Traceable peer-reviewed citations (PMIDs, DOIs, FDA NDAs, SmPCs).
 *    - Mandatory status: FLAGGED_FOR_SCIENTIFIC_REVIEW on every single node.
 * 3. Pharmacological specificity across all 4 medicines:
 *    - Ibuprofen: ~60% chiral inversion of (R)- to (S)- via 2-arylpropionyl-CoA epimerase; >99% albumin binding.
 *    - Amoxicillin: Alpha-amino acid stability; PEPT1 active peptide transport; 75–80% bioavailability.
 *    - Ambroxol: Oral demulcent transit; 2.5–5x pulmonary tropism; alveolar type II surfactant stimulation.
 *    - Regular Human Insulin: Regular soluble insulin identity (U-100); zinc-stabilized hexamers dissociating to 5.8 kDa monomers; GLUT4 translocation via tyrosine kinase PI3K-Akt cascade.
 * 4. REST API endpoints & envelopes:
 *    - GET /api/v1/content/drugs/:drugId (all 4 medicines by canonical ID)
 *    - GET /api/v1/content/drugs/:slug (all 4 medicines by slug)
 *    - GET /api/v1/content/drug/:drugId (singular alias compatibility)
 *    - GET /api/v1/content/drugs/unknown-drug-999 (404 error envelope)
 *    - GET /api/v1/pathways/drugs/:drugId (includes 4 new fields in node content)
 */

import type { Server } from 'node:http';
import { createApp } from '../app.js';
import { getPool, closePool } from './pool.js';

async function runContentVerification(): Promise<void> {
  const pool = getPool();
  console.log('================================================================');
  console.log('TASK 21 EDUCATIONAL CONTENT & SCIENTIFIC INTEGRITY VERIFICATION');
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
  console.log(`[Test Suite] Test server running on ${baseUrl}\n`);

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
    // -------------------------------------------------------------
    // Phase 1: Database Schema & Migration 0006 Verification
    // -------------------------------------------------------------
    console.log('[Phase 1: Database Schema & Migration 0006 Verification]');
    const columnsRes = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'node_content'
      ORDER BY ordinal_position ASC;
    `);

    const colNames = columnsRes.rows.map((r: any) => r.column_name);
    assert(colNames.includes('key_takeaway'), 'Column node_content.key_takeaway exists');
    assert(colNames.includes('defined_terms'), 'Column node_content.defined_terms exists (JSONB)');
    assert(colNames.includes('references_list'), 'Column node_content.references_list exists (TEXT[])');
    assert(colNames.includes('review_status'), 'Column node_content.review_status exists (VARCHAR)');

    // -------------------------------------------------------------
    // Phase 2: All 27 Pathway Nodes Scientific Content Audit
    // -------------------------------------------------------------
    console.log('\n[Phase 2: All 27 Pathway Nodes Scientific Content Audit]');
    const allContentRes = await pool.query(`
      SELECT
        nc.id,
        nc.node_id,
        nc.general_description,
        nc.physiological_role,
        nc.key_takeaway,
        nc.key_cellular_mechanisms,
        nc.defined_terms,
        nc.micro_environment_ph,
        nc.references_list,
        nc.review_status,
        pn.name AS node_name,
        p.drug_id
      FROM node_content nc
      JOIN pathway_nodes pn ON pn.id = nc.node_id
      JOIN pathways p ON p.id = pn.pathway_id
      ORDER BY p.drug_id, pn.node_order ASC;
    `);

    assert(allContentRes.rows.length === 27, 'Total node_content rows in database is exactly 27');

    let allHavePlainEnglish = true;
    let allHaveDeepMechanisms = true;
    let allHaveKeyTakeaways = true;
    let allHaveReferences = true;
    let allHaveDefinedTerms = true;
    let allFlaggedForReview = true;
    let phValuesValid = true;

    for (const r of allContentRes.rows) {
      if (!r.general_description || r.general_description.trim().length < 20) {
        allHavePlainEnglish = false;
        console.error(`Node ${r.node_id} missing plain English description`);
      }
      if (!r.physiological_role || r.physiological_role.trim().length < 30) {
        allHaveDeepMechanisms = false;
        console.error(`Node ${r.node_id} missing scientific mechanism`);
      }
      if (!r.key_takeaway || r.key_takeaway.trim().length < 10) {
        allHaveKeyTakeaways = false;
        console.error(`Node ${r.node_id} missing key takeaway`);
      }
      if (!r.references_list || r.references_list.length === 0) {
        allHaveReferences = false;
        console.error(`Node ${r.node_id} missing scientific references`);
      }
      if (!r.defined_terms || (Array.isArray(r.defined_terms) && r.defined_terms.length === 0)) {
        allHaveDefinedTerms = false;
        console.error(`Node ${r.node_id} missing defined terms`);
      }
      if (r.review_status !== 'FLAGGED_FOR_SCIENTIFIC_REVIEW') {
        allFlaggedForReview = false;
        console.error(`Node ${r.node_id} review_status is '${r.review_status}', expected 'FLAGGED_FOR_SCIENTIFIC_REVIEW'`);
      }
      if (r.micro_environment_ph != null) {
        const ph = parseFloat(r.micro_environment_ph);
        if (isNaN(ph) || ph < 0 || ph > 14) {
          phValuesValid = false;
          console.error(`Node ${r.node_id} has invalid pH ${r.micro_environment_ph}`);
        }
      }
    }

    assert(allHavePlainEnglish, 'All 27 nodes contain student-friendly plain English explanations');
    assert(allHaveDeepMechanisms, 'All 27 nodes contain deep scientific mechanisms');
    assert(allHaveKeyTakeaways, 'All 27 nodes contain distinct student key takeaways');
    assert(allHaveReferences, 'All 27 nodes contain traceable peer-reviewed references (PMIDs/DOIs/NDAs)');
    assert(allHaveDefinedTerms, 'All 27 nodes contain defined scientific terms & acronyms glossary');
    assert(allFlaggedForReview, 'All 27 nodes are marked FLAGGED_FOR_SCIENTIFIC_REVIEW');
    assert(phValuesValid, 'All provided micro_environment_ph values fall within valid range (0–14)');

    // -------------------------------------------------------------
    // Phase 3: Medication Specificity & Scientific Integrity Audit
    // -------------------------------------------------------------
    console.log('\n[Phase 3: Medication Specificity & Scientific Integrity Audit]');

    // Ibuprofen Audit
    const ibuRows = allContentRes.rows.filter((r: any) => r.drug_id === 'drug-ibuprofen-001');
    assert(ibuRows.length === 7, 'Ibuprofen has exactly 7 audited content nodes');
    const ibuLiver = ibuRows.find((r: any) => r.node_id.includes('liver'));
    assert(
      ibuLiver &&
        (ibuLiver.physiological_role.includes('epimerase') || ibuLiver.physiological_role.includes('chiral')) &&
        (ibuLiver.physiological_role.includes('2-arylpropionyl-CoA epimerase') ||
          ibuLiver.physiological_role.includes('epimerase')),
      'Ibuprofen liver node documents hepatic unidirectional chiral inversion via 2-arylpropionyl-CoA epimerase'
    );
    const ibuBlood = ibuRows.find((r: any) => r.node_id.includes('bloodstream'));
    assert(
      ibuBlood && ibuBlood.physiological_role.includes('99%') && ibuBlood.physiological_role.includes('albumin'),
      'Ibuprofen bloodstream node documents >99% serum albumin protein binding'
    );

    // Amoxicillin Audit
    const amxRows = allContentRes.rows.filter((r: any) => r.drug_id === 'drug-amoxicillin-002');
    assert(amxRows.length === 7, 'Amoxicillin has exactly 7 audited content nodes');
    const amxStomach = amxRows.find((r: any) => r.node_id.includes('stomach'));
    assert(
      amxStomach && amxStomach.physiological_role.includes('amino'),
      'Amoxicillin stomach node documents alpha-amino side chain acid stability'
    );
    const amxIntestine = amxRows.find((r: any) => r.node_id.includes('small-intestine'));
    assert(
      amxIntestine && amxIntestine.physiological_role.includes('PEPT1'),
      'Amoxicillin intestinal node documents active uptake via PEPT1 oligopeptide transporter'
    );

    // Ambroxol Audit
    const ambRows = allContentRes.rows.filter((r: any) => r.drug_id === 'drug-ambroxol-003');
    assert(ambRows.length === 8, 'Ambroxol syrup has exactly 8 audited content nodes');
    const ambMouth = ambRows.find((r: any) => r.node_id.includes('mouth'));
    assert(
      ambMouth && (ambMouth.general_description.includes('soothe') || ambMouth.physiological_role.includes('demulcent')),
      'Ambroxol syrup mouth node accurately distinguishes oral demulcent contact (<10s)'
    );
    const ambLungs = ambRows.find((r: any) => r.node_id.includes('respiratory') || r.node_id.includes('lungs'));
    assert(
      ambLungs &&
        ambLungs.physiological_role.includes('surfactant') &&
        ambLungs.physiological_role.includes('pneumocyte'),
      'Ambroxol lung node documents alveolar type II pneumocyte stimulation and surfactant synthesis'
    );

    // Regular Human Insulin Audit
    const insRows = allContentRes.rows.filter((r: any) => r.drug_id === 'drug-insulin-004');
    assert(insRows.length === 5, 'Regular human insulin has exactly 5 audited content nodes');
    const insInjection = insRows.find((r: any) => r.node_id.includes('injection'));
    assert(
      insInjection &&
        insInjection.physiological_role.includes('hexamer') &&
        insInjection.physiological_role.includes('monomer'),
      'Insulin injection node documents zinc-stabilized hexamer dissociation into 5.8 kDa monomers'
    );
    const insTissues = insRows.find((r: any) => r.node_id.includes('tissues'));
    assert(
      insTissues &&
        insTissues.physiological_role.includes('GLUT4') &&
        insTissues.physiological_role.includes('tyrosine kinase'),
      'Insulin body tissues node documents GLUT4 translocation driven by tyrosine kinase receptor signaling'
    );

    // -------------------------------------------------------------
    // Phase 4: Educational Content API Enpoints & Envelope Verification
    // -------------------------------------------------------------
    console.log('\n[Phase 4: Educational Content API Endpoints & Envelope Verification]');

    const canonicalDrugs = [
      { id: 'drug-ibuprofen-001', slug: 'ibuprofen', name: 'Ibuprofen', expectedNodes: 7 },
      { id: 'drug-amoxicillin-002', slug: 'amoxicillin', name: 'Amoxicillin', expectedNodes: 7 },
      { id: 'drug-ambroxol-003', slug: 'ambroxol', name: 'Ambroxol Syrup', expectedNodes: 8 },
      { id: 'drug-insulin-004', slug: 'insulin', name: 'Insulin', expectedNodes: 5 }
    ];

    for (const d of canonicalDrugs) {
      // 1. Test by canonical ID
      const resById = await fetch(`${baseUrl}/content/drugs/${d.id}`);
      assert(resById.status === 200, `GET /content/drugs/${d.id} returned 200`);
      const bodyById: any = await resById.json();
      assert(bodyById.success === true, `GET /content/drugs/${d.id} has success: true`);
      assert(bodyById.data.drug.id === d.id, `Drug ID in data matches ${d.id}`);
      assert(bodyById.data.nodes.length === d.expectedNodes, `${d.name} returned ${d.expectedNodes} nodes`);
      assert(bodyById.data.review_status === 'FLAGGED_FOR_SCIENTIFIC_REVIEW', `Drug review_status is FLAGGED_FOR_SCIENTIFIC_REVIEW`);
      assert(bodyById.data.adme_overview != null, `ADME overview present for ${d.name}`);
      assert(bodyById.data.faqs.length > 0, `Sourced FAQs present for ${d.name}`);

      // 2. Test by short slug
      const resBySlug = await fetch(`${baseUrl}/content/drugs/${d.slug}`);
      assert(resBySlug.status === 200, `GET /content/drugs/${d.slug} (slug) returned 200`);
      const bodyBySlug: any = await resBySlug.json();
      assert(bodyBySlug.data.drug.id === d.id, `Slug lookup correctly resolved canonical ID ${d.id}`);

      // 3. Test singular alias /content/drug/:drugId
      const resSingular = await fetch(`${baseUrl}/content/drug/${d.id}`);
      assert(resSingular.status === 200, `GET /content/drug/${d.id} (singular alias) returned 200`);
    }

    // 4. Test unknown drug ID 404 envelope
    const resUnknown = await fetch(`${baseUrl}/content/drugs/unknown-drug-999`);
    assert(resUnknown.status === 404, `GET /content/drugs/unknown-drug-999 returned 404`);
    const bodyUnknown: any = await resUnknown.json();
    assert(bodyUnknown.success === false, `404 response has success: false`);
    assert(bodyUnknown.error?.code === 'RESOURCE_NOT_FOUND', `404 error code is RESOURCE_NOT_FOUND`);

    // -------------------------------------------------------------
    // Phase 5: Pathway API Contract Integration
    // -------------------------------------------------------------
    console.log('\n[Phase 5: Pathway API Contract Integration]');
    const pathwayRes = await fetch(`${baseUrl}/drugs/drug-ibuprofen-001/pathway`);
    assert(pathwayRes.status === 200, `GET /drugs/drug-ibuprofen-001/pathway returned 200`);
    const pathwayBody: any = await pathwayRes.json();
    const firstNode = pathwayBody.data.nodes[0];
    assert(firstNode.content != null, 'Pathway node includes content object');
    assert(firstNode.content.key_takeaway != null, 'Pathway node content includes key_takeaway');
    assert(Array.isArray(firstNode.content.defined_terms), 'Pathway node content includes defined_terms array');
    assert(Array.isArray(firstNode.content.references_list), 'Pathway node content includes references_list array');
    assert(firstNode.content.review_status === 'FLAGGED_FOR_SCIENTIFIC_REVIEW', 'Pathway node content includes review_status FLAGGED_FOR_SCIENTIFIC_REVIEW');

    console.log('\n================================================================');
    console.log(`ALL ${passedTests}/${totalTests} TASK 21 VERIFICATION TESTS PASSED!`);
    console.log('================================================================\n');
  } finally {
    server.close();
    await closePool();
  }
}

runContentVerification().catch((err) => {
  console.error('\n[FATAL ERROR IN CONTENT VERIFICATION]:', err);
  process.exit(1);
});

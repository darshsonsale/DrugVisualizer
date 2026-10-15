/**
 * Drug Path Visualiser - Development Database Seeder
 *
 * Imports the approved development fixture matching frontend/src/api/mockData.ts.
 * Note: These values reflect the project MVP visual & pedagogical design fixture
 * for Ibuprofen and core catalog drugs, seeded with strict idempotency (ON CONFLICT DO UPDATE).
 */

import { getPool, closePool } from './pool.js';
import {
  SEED_PATHWAYS,
  SEED_PATHWAY_VARIATIONS,
  SEED_NODES,
  SEED_CONTENTS,
  SEED_NODE_VARIATIONS,
  SEED_EDGES
} from './data/medicationPathways.js';

export async function seedDatabase(): Promise<void> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    console.log('[Seeder] Starting repeatable database seed...');

    // 1. SEED DRUGS
    const drugs = [
      {
        id: 'drug-ibuprofen-001',
        name: 'Ibuprofen',
        brand_name: 'Advil / Motrin (400 mg tablet)',
        category: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
        description:
          'Reversible competitive inhibitor of cyclooxygenase enzymes (COX-1 and COX-2), reducing prostaglandin synthesis to deliver targeted relief from pain, inflammation, and fever.',
        molecular_formula: 'C13H18O2',
        half_life_hours: 2.0,
        bioavailability_pct: 88,
        cmax_ug_ml: 25.0,
        tmax_hours: 0.75,
        form: 'Tablets',
        dosage: '400 mg Tablet',
        indication: 'Used for pain, inflammation and fever relief.',
        route: 'Oral Route',
        image_url: '/assets/drugs/ibuprofen.jpg'
      },
      {
        id: 'drug-amoxicillin-002',
        name: 'Amoxicillin',
        brand_name: 'Amoxil (500 mg capsule)',
        category: 'Beta-Lactam Antibiotic (Penicillin Derivative)',
        description:
          'Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), leading to autolysis and destruction of susceptible Gram-positive and Gram-negative pathogens.',
        molecular_formula: 'C16H19N3O5S',
        half_life_hours: 1.0,
        bioavailability_pct: 75,
        cmax_ug_ml: 8.5,
        tmax_hours: 1.25,
        form: 'Capsules',
        dosage: '500 mg Capsule',
        indication: 'Used to treat bacterial infections.',
        route: 'Oral Route',
        image_url: '/assets/drugs/amoxicillin.jpg'
      },
      {
        id: 'drug-ambroxol-003',
        name: 'Ambroxol Syrup',
        brand_name: 'Mucosolvan (15 mg / 5 ml)',
        category: 'Mucolytic Secretolytic Agent',
        description:
          'Decreases mucus viscosity, stimulates surfactant synthesis by alveolar type II pneumocytes, and enhances ciliary clearance in acute and chronic bronchopulmonary conditions.',
        molecular_formula: 'C13H18Br2N2O',
        half_life_hours: 10.0,
        bioavailability_pct: 79,
        cmax_ug_ml: 12.0,
        tmax_hours: 2.0,
        form: 'Syrups',
        dosage: '15 mg / 5 ml',
        indication: 'Used to relieve cough with mucus by loosening phlegm.',
        route: 'Oral Route',
        image_url: '/assets/drugs/ambroxol.jpg'
      },
      {
        id: 'drug-insulin-004',
        name: 'Insulin',
        brand_name: 'Humalog / Novolog (Regular Human Insulin)',
        category: 'Peptide Hormone (Antidiabetic Agent)',
        description:
          'Binds to insulin tyrosine kinase receptors, triggering GLUT-4 translocation to promote cellular glucose uptake into skeletal muscle and adipose tissue while suppressing hepatic glucose production.',
        molecular_formula: 'C257H383N65O77S6',
        half_life_hours: 0.1,
        bioavailability_pct: 100,
        cmax_ug_ml: 4.5,
        tmax_hours: 0.5,
        form: 'Injections',
        dosage: 'Injection',
        indication: 'Used to manage blood sugar levels in diabetes.',
        route: 'Injection Route',
        image_url: '/assets/drugs/insulin.jpg'
      }
    ];

    for (const d of drugs) {
      await client.query(
        `INSERT INTO drugs (
          id, name, brand_name, category, description, molecular_formula,
          half_life_hours, bioavailability_pct, cmax_ug_ml, tmax_hours,
          form, dosage, indication, route, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          brand_name = EXCLUDED.brand_name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          molecular_formula = EXCLUDED.molecular_formula,
          half_life_hours = EXCLUDED.half_life_hours,
          bioavailability_pct = EXCLUDED.bioavailability_pct,
          cmax_ug_ml = EXCLUDED.cmax_ug_ml,
          tmax_hours = EXCLUDED.tmax_hours,
          form = EXCLUDED.form,
          dosage = EXCLUDED.dosage,
          indication = EXCLUDED.indication,
          route = EXCLUDED.route,
          image_url = EXCLUDED.image_url;`,
        [
          d.id,
          d.name,
          d.brand_name,
          d.category,
          d.description,
          d.molecular_formula,
          d.half_life_hours,
          d.bioavailability_pct,
          d.cmax_ug_ml,
          d.tmax_hours,
          d.form,
          d.dosage,
          d.indication,
          d.route,
          d.image_url
        ]
      );
    }
    console.log(`[Seeder] Seeded ${drugs.length} drugs.`);

    // 2. SEED PATHWAYS (All 4 core medications)
    for (const p of SEED_PATHWAYS) {
      await client.query(
        `INSERT INTO pathways (id, drug_id, name, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           drug_id = EXCLUDED.drug_id,
           name = EXCLUDED.name,
           description = EXCLUDED.description;`,
        [p.id, p.drug_id, p.name, p.description]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_PATHWAYS.length} pathways.`);

    // 3. SEED PATHWAY VARIATIONS (All 4 core medications - BEFORE_FOOD & AFTER_FOOD)
    for (const pv of SEED_PATHWAY_VARIATIONS) {
      await client.query(
        `INSERT INTO pathway_variations (id, pathway_id, condition, name, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           pathway_id = EXCLUDED.pathway_id,
           condition = EXCLUDED.condition,
           name = EXCLUDED.name,
           description = EXCLUDED.description;`,
        [pv.id, pv.pathway_id, pv.condition, pv.name, pv.description]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_PATHWAY_VARIATIONS.length} pathway variations.`);

    // 4. SEED PATHWAY NODES (All 4 core medications)
    for (const n of SEED_NODES) {
      await client.query(
        `INSERT INTO pathway_nodes (
          id, pathway_id, node_order, name, anatomical_location,
          organ_system, estimated_time_minutes, camera_focus_x, camera_focus_y, camera_focus_z
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          pathway_id = EXCLUDED.pathway_id,
          node_order = EXCLUDED.node_order,
          name = EXCLUDED.name,
          anatomical_location = EXCLUDED.anatomical_location,
          organ_system = EXCLUDED.organ_system,
          estimated_time_minutes = EXCLUDED.estimated_time_minutes,
          camera_focus_x = EXCLUDED.camera_focus_x,
          camera_focus_y = EXCLUDED.camera_focus_y,
          camera_focus_z = EXCLUDED.camera_focus_z;`,
        [
          n.id,
          n.pathway_id,
          n.node_order,
          n.name,
          n.anatomical_location,
          n.organ_system,
          n.estimated_time_minutes,
          n.camera_focus_x,
          n.camera_focus_y,
          n.camera_focus_z
        ]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_NODES.length} pathway nodes.`);

    // 5. SEED NODE CONTENT (With verified scientific rationales, student key takeaways, and review flags)
    for (const c of SEED_CONTENTS) {
      await client.query(
        `INSERT INTO node_content (
          id, node_id, general_description, physiological_role,
          key_cellular_mechanisms, micro_environment_ph,
          key_takeaway, defined_terms, references_list, review_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (node_id) DO UPDATE SET
          id = EXCLUDED.id,
          general_description = EXCLUDED.general_description,
          physiological_role = EXCLUDED.physiological_role,
          key_cellular_mechanisms = EXCLUDED.key_cellular_mechanisms,
          micro_environment_ph = EXCLUDED.micro_environment_ph,
          key_takeaway = EXCLUDED.key_takeaway,
          defined_terms = EXCLUDED.defined_terms,
          references_list = EXCLUDED.references_list,
          review_status = EXCLUDED.review_status;`,
        [
          c.id,
          c.node_id,
          c.general_description,
          c.physiological_role,
          c.key_cellular_mechanisms,
          c.micro_environment_ph ?? null,
          c.key_takeaway || null,
          JSON.stringify(c.defined_terms || []),
          c.references_list || [],
          c.review_status || 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
        ]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_CONTENTS.length} node content records.`);

    // 6. SEED NODE VARIATIONS (Condition variations across all nodes)
    for (const v of SEED_NODE_VARIATIONS) {
      await client.query(
        `INSERT INTO node_variations (
          id, node_id, condition, transit_time_modifier_pct,
          absorption_modifier_pct, clinical_observation, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          node_id = EXCLUDED.node_id,
          condition = EXCLUDED.condition,
          transit_time_modifier_pct = EXCLUDED.transit_time_modifier_pct,
          absorption_modifier_pct = EXCLUDED.absorption_modifier_pct,
          clinical_observation = EXCLUDED.clinical_observation,
          notes = EXCLUDED.notes;`,
        [
          v.id,
          v.node_id,
          v.condition,
          v.transit_time_modifier_pct,
          v.absorption_modifier_pct,
          v.clinical_observation,
          v.notes ?? null
        ]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_NODE_VARIATIONS.length} node variation records.`);

    // 7. SEED PATHWAY EDGES (Directed transitions across all 4 pathways)
    for (const e of SEED_EDGES) {
      await client.query(
        `INSERT INTO pathway_edges (
          id, pathway_id, from_node_id, to_node_id,
          transition_description, transition_duration_minutes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          pathway_id = EXCLUDED.pathway_id,
          from_node_id = EXCLUDED.from_node_id,
          to_node_id = EXCLUDED.to_node_id,
          transition_description = EXCLUDED.transition_description,
          transition_duration_minutes = EXCLUDED.transition_duration_minutes;`,
        [
          e.id,
          e.pathway_id,
          e.from_node_id,
          e.to_node_id,
          e.transition_description,
          e.transition_duration_minutes
        ]
      );
    }
    console.log(`[Seeder] Seeded ${SEED_EDGES.length} pathway edges.`);

    // 8. SEED QUIZZES, QUESTIONS, AND OPTIONS (Ibuprofen Quiz Fixture)
    // Approved pedagogical development fixture from mockData.ts flagged with needs_scientific_review = true
    const quizId = 'quiz-ibuprofen-001';
    await client.query(
      `INSERT INTO quizzes (id, drug_id, title, description, pass_percentage)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         drug_id = EXCLUDED.drug_id,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         pass_percentage = EXCLUDED.pass_percentage;`,
      [
        quizId,
        'drug-ibuprofen-001',
        'Ibuprofen Pharmacokinetics & Mechanism Assessment',
        'Test your understanding of physiological transit, chiral inversion, and food effects on Ibuprofen.',
        70.0
      ]
    );

    const questions = [
      {
        id: 'q1',
        quiz_id: quizId,
        question_order: 1,
        question_text:
          'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?'
      },
      {
        id: 'q2',
        quiz_id: quizId,
        question_order: 2,
        question_text: 'How does taking Ibuprofen after a meal influence its pharmacokinetics?'
      }
    ];

    for (const q of questions) {
      await client.query(
        `INSERT INTO quiz_questions (id, quiz_id, question_order, question_text)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           quiz_id = EXCLUDED.quiz_id,
           question_order = EXCLUDED.question_order,
           question_text = EXCLUDED.question_text;`,
        [q.id, q.quiz_id, q.question_order, q.question_text]
      );
    }

    const options = [
      {
        id: 'opt1-a',
        question_id: 'q1',
        option_text: 'Stomach mucosa',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      },
      {
        id: 'opt1-b',
        question_id: 'q1',
        option_text: 'Liver (hepatic epimerase & CYP2C9)',
        is_correct: true,
        explanation:
          'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
        needs_scientific_review: true
      },
      {
        id: 'opt1-c',
        question_id: 'q1',
        option_text: 'Kidney glomeruli',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      },
      {
        id: 'opt1-d',
        question_id: 'q1',
        option_text: 'Oral cavity epithelium',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      },
      {
        id: 'opt2-a',
        question_id: 'q2',
        option_text: 'It permanently destroys drug bioavailability',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      },
      {
        id: 'opt2-b',
        question_id: 'q2',
        option_text: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
        is_correct: true,
        explanation:
          'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) without reducing total systemic bioavailability.',
        needs_scientific_review: true
      },
      {
        id: 'opt2-c',
        question_id: 'q2',
        option_text: 'It converts Ibuprofen into an irreversible enzyme blocker',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      },
      {
        id: 'opt2-d',
        question_id: 'q2',
        option_text: 'It increases peak plasma concentration tenfold',
        is_correct: false,
        explanation: null,
        needs_scientific_review: true
      }
    ];

    for (const opt of options) {
      await client.query(
        `INSERT INTO quiz_options (
          id, question_id, option_text, is_correct, explanation, needs_scientific_review
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          question_id = EXCLUDED.question_id,
          option_text = EXCLUDED.option_text,
          is_correct = EXCLUDED.is_correct,
          explanation = EXCLUDED.explanation,
          needs_scientific_review = EXCLUDED.needs_scientific_review;`,
        [
          opt.id,
          opt.question_id,
          opt.option_text,
          opt.is_correct,
          opt.explanation,
          opt.needs_scientific_review
        ]
      );
    }
    console.log(`[Seeder] Seeded 1 quiz with ${questions.length} questions and ${options.length} options (flagged for review).`);

    await client.query('COMMIT');
    console.log('[Seeder] Database seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seeder] Error during database seeding, transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct execution via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seeder] Seeding failed:', err);
      await closePool();
      process.exit(1);
    });
}

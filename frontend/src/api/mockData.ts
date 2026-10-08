/**
 * Drug Path Visualiser - Development Contract Mock Fixture
 *
 * PURPOSE:
 * Provides a strictly typed mock fixture representing the backend database contract
 * for local development and component testing while the backend (Tasks 11-20) is being developed.
 *
 * MVP SCOPE:
 * The primary MVP drug is Ibuprofen (400 mg oral tablet).
 *
 * SAFETY NOTICE:
 * This fixture is for development/testing only.
 * The production backend is the authoritative source of truth for pharmacology data.
 */

import {
  DrugSummary,
  PathwayGraphResponse,
  QuizResponse,
  UserProgress,
} from './types';

// ==========================================
// Mock Drug Summaries (MVP: Ibuprofen)
// ==========================================

export const MOCK_DRUGS: DrugSummary[] = [
  {
    id: 'drug-ibuprofen-001',
    name: 'Ibuprofen',
    brand_name: 'Advil / Motrin (400 mg tablet)',
    category: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    description:
      'Reversible competitive inhibitor of cyclooxygenase enzymes (COX-1 and COX-2), reducing prostaglandin synthesis to deliver targeted relief from pain, inflammation, and fever.',
    molecular_formula: 'C13H18O2',
    half_life_hours: 2.0,
    bioavailability_pct: 85,
    cmax_ug_ml: 25.0,
    tmax_hours: 1.2,
  },
];

// ==========================================
// Mock Pathway Graphs (Ibuprofen: Before Food / Fasting)
// ==========================================

export const MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD: PathwayGraphResponse = {
  drug: MOCK_DRUGS[0],
  pathway: {
    id: 'pathway-ibuprofen-fasting',
    drug_id: 'drug-ibuprofen-001',
    name: 'Oral Absorption Pathway (Fasting / Before Food)',
    description: 'Rapid gastric emptying and accelerated small intestinal passive transcellular absorption.',
    condition: 'BEFORE_FOOD',
  },
  nodes: [
    {
      id: 'node-oral-cavity',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 1,
      name: 'Oral Cavity & Ingestion',
      anatomical_location: 'Mouth / Pharynx / Esophagus',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.5,
      camera_focus_z: 1.0,
      content: {
        id: 'content-oral-cavity',
        node_id: 'node-oral-cavity',
        general_description:
          'Solid ibuprofen tablet enters the oral cavity, lubricated by saliva. Minimal to zero drug dissolution occurs during this transit phase before peristaltic transport through the esophagus.',
        physiological_role: 'Intake gateway and rapid esophageal transit.',
        key_cellular_mechanisms: ['Peristalsis', 'Salivary wetting'],
        micro_environment_ph: 6.8,
      },
      variation: {
        id: 'var-oral-cavity-before',
        node_id: 'node-oral-cavity',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Standard rapid bolus transit through the esophagus (<1 min).',
      },
    },
    {
      id: 'node-stomach',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 2,
      name: 'Gastric Disintegration',
      anatomical_location: 'Stomach (Fundus & Antrum)',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 15,
      camera_focus_x: -0.5,
      camera_focus_y: 1.2,
      camera_focus_z: 0.8,
      content: {
        id: 'content-stomach',
        node_id: 'node-stomach',
        general_description:
          'Gastric acid causes tablet coat disintegration. As a weak acid with a pKa of ~4.4, ibuprofen remains unionized and lipophilic, limiting gastric mucosal dissolution while preparing for intestinal entry.',
        physiological_role: 'Mechanical dispersion and acidic tablet breakdown.',
        key_cellular_mechanisms: ['Gastric motility', 'Acidic fluid dissolution'],
        micro_environment_ph: 1.8,
      },
      variation: {
        id: 'var-stomach-before',
        node_id: 'node-stomach',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: -75,
        absorption_modifier_pct: 0,
        clinical_observation:
          'In fasting state, rapid gastric emptying transfers the drug bolus into the duodenum within 15 minutes.',
      },
    },
    {
      id: 'node-small-intestine',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 3,
      name: 'Intestinal Absorption',
      anatomical_location: 'Duodenum & Proximal Jejunum',
      organ_system: 'Lower Gastrointestinal System',
      estimated_time_minutes: 30,
      camera_focus_x: 0.2,
      camera_focus_y: 0.2,
      camera_focus_z: 0.5,
      content: {
        id: 'content-intestine',
        node_id: 'node-small-intestine',
        general_description:
          'Primary site of ibuprofen absorption across enterocytes. The neutral pH environment ionizes ibuprofen sufficiently for rapid transcellular passive diffusion.',
        physiological_role: 'High-surface mucosal transfer into mesenteric capillary network.',
        key_cellular_mechanisms: ['Passive transcellular diffusion', 'Enterocyte membrane permeation'],
        micro_environment_ph: 6.5,
      },
      variation: {
        id: 'var-intestine-before',
        node_id: 'node-small-intestine',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 15,
        clinical_observation:
          'Rapid arrival produces an early sharp peak plasma concentration (Tmax approx 1.0–1.2 hours).',
      },
    },
    {
      id: 'node-liver',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 4,
      name: 'Hepatic First-Pass & Chiral Inversion',
      anatomical_location: 'Liver Lobules & Sinusoids',
      organ_system: 'Hepatic System',
      estimated_time_minutes: 20,
      camera_focus_x: 0.8,
      camera_focus_y: 0.9,
      camera_focus_z: 0.6,
      content: {
        id: 'content-liver',
        node_id: 'node-liver',
        general_description:
          'Portal venous blood transports ibuprofen to the liver. Undergoes modest first-pass extraction (~15%). In the liver, stereospecific 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active (S)-enantiomer, alongside CYP2C9 oxidation.',
        physiological_role: 'Chiral bioactivation and initial metabolic clearance.',
        key_cellular_mechanisms: [
          'Stereospecific (R)-to-(S) chiral inversion',
          'CYP2C9 & CYP2C8 oxidation',
          'Glucuronide conjugation',
        ],
        micro_environment_ph: 7.2,
      },
      variation: {
        id: 'var-liver-before',
        node_id: 'node-liver',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation:
          'Modest first-pass extraction leaves ~85% of active ibuprofen available for systemic delivery.',
      },
    },
    {
      id: 'node-systemic-circulation',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 5,
      name: 'Systemic Distribution & COX Inhibition',
      anatomical_location: 'Circulatory Vascular Bed & Target Tissues',
      organ_system: 'Circulatory & Peripheral Target System',
      estimated_time_minutes: 45,
      camera_focus_x: 0,
      camera_focus_y: 1.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-circulation',
        node_id: 'node-systemic-circulation',
        general_description:
          'Ibuprofen binds tightly (>99%) to serum albumin. The unbound 1% fraction diffuses into inflamed peripheral tissues and joint capsules, competitively inhibiting COX-1 and COX-2 enzymes to halt prostaglandin E2 synthesis.',
        physiological_role: 'Therapeutic target binding and pain/inflammation reduction.',
        key_cellular_mechanisms: [
          'Reversible competitive COX-1 & COX-2 active site inhibition',
          'Prostaglandin E2 (PGE2) downregulation',
          'Nociceptor sensitization blockade',
        ],
        micro_environment_ph: 7.4,
      },
      variation: {
        id: 'var-circulation-before',
        node_id: 'node-systemic-circulation',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation:
          'Therapeutic systemic distribution achieved rapidly, reaching effective analgesia within 60 minutes.',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1-2',
      pathway_id: 'pathway-ibuprofen-fasting',
      from_node_id: 'node-oral-cavity',
      to_node_id: 'node-stomach',
      transition_description: 'Esophageal bolus peristalsis',
      transition_duration_minutes: 1,
    },
    {
      id: 'edge-2-3',
      pathway_id: 'pathway-ibuprofen-fasting',
      from_node_id: 'node-stomach',
      to_node_id: 'node-small-intestine',
      transition_description: 'Pyloric sphincter passage via coordinated gastric contractions',
      transition_duration_minutes: 15,
    },
    {
      id: 'edge-3-4',
      pathway_id: 'pathway-ibuprofen-fasting',
      from_node_id: 'node-small-intestine',
      to_node_id: 'node-liver',
      transition_description: 'Mesenteric venous drainage through portal vein into liver sinusoids',
      transition_duration_minutes: 10,
    },
    {
      id: 'edge-4-5',
      pathway_id: 'pathway-ibuprofen-fasting',
      from_node_id: 'node-liver',
      to_node_id: 'node-systemic-circulation',
      transition_description: 'Hepatic vein drainage into inferior vena cava and systemic arterial distribution',
      transition_duration_minutes: 15,
    },
  ],
};

// ==========================================
// Mock Pathway Graphs (Ibuprofen: After Food / Fed State)
// ==========================================

export const MOCK_IBUPROFEN_PATHWAY_AFTER_FOOD: PathwayGraphResponse = {
  ...MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD,
  pathway: {
    id: 'pathway-ibuprofen-fed',
    drug_id: 'drug-ibuprofen-001',
    name: 'Oral Absorption Pathway (Fed State / After Food)',
    description: 'Delayed gastric emptying leading to broadened absorption window and delayed peak plasma concentration.',
    condition: 'AFTER_FOOD',
  },
  nodes: MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD.nodes.map((node) => {
    if (node.id === 'node-stomach') {
      return {
        ...node,
        estimated_time_minutes: 60,
        variation: {
          id: 'var-stomach-after',
          node_id: 'node-stomach',
          condition: 'AFTER_FOOD',
          transit_time_modifier_pct: 300,
          absorption_modifier_pct: 0,
          clinical_observation:
            'Food content delays gastric emptying from 15 minutes to over an hour, holding the drug in the stomach and flattening the plasma concentration peak curve.',
        },
      };
    }
    if (node.id === 'node-small-intestine') {
      return {
        ...node,
        variation: {
          id: 'var-intestine-after',
          node_id: 'node-small-intestine',
          condition: 'AFTER_FOOD',
          transit_time_modifier_pct: 25,
          absorption_modifier_pct: -5,
          clinical_observation:
            'Total bioavailability (AUC) remains preserved (~85%), but the rate of absorption is slowed, delaying Tmax to 2.5–3.0 hours while reducing gastric irritation.',
        },
      };
    }
    return node;
  }),
};

// ==========================================
// Mock Quiz Data (MVP: Ibuprofen)
// ==========================================

export const MOCK_IBUPROFEN_QUIZ: QuizResponse = {
  id: 'quiz-ibuprofen-001',
  drug_id: 'drug-ibuprofen-001',
  title: 'Ibuprofen Pharmacokinetics & Mechanism Assessment',
  description: 'Test your understanding of physiological transit, chiral inversion, and food effects on Ibuprofen.',
  questions: [
    {
      id: 'q1',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 1,
      question_text:
        'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?',
      options: [
        { id: 'opt1-a', question_id: 'q1', option_text: 'Stomach mucosa' },
        {
          id: 'opt1-b',
          question_id: 'q1',
          option_text: 'Liver (hepatic epimerase & CYP2C9)',
          is_correct: true,
          explanation:
            'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
        },
        { id: 'opt1-c', question_id: 'q1', option_text: 'Kidney glomeruli' },
        { id: 'opt1-d', question_id: 'q1', option_text: 'Oral cavity epithelium' },
      ],
    },
    {
      id: 'q2',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 2,
      question_text: 'How does taking Ibuprofen after a meal influence its pharmacokinetics?',
      options: [
        { id: 'opt2-a', question_id: 'q2', option_text: 'It permanently destroys drug bioavailability' },
        {
          id: 'opt2-b',
          question_id: 'q2',
          option_text: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
          is_correct: true,
          explanation:
            'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) without reducing total systemic bioavailability.',
        },
        { id: 'opt2-c', question_id: 'q2', option_text: 'It converts Ibuprofen into an irreversible enzyme blocker' },
        { id: 'opt2-d', question_id: 'q2', option_text: 'It increases peak plasma concentration tenfold' },
      ],
    },
  ],
};

// ==========================================
// Mock User Progress Data (MVP: Ibuprofen)
// ==========================================

export const MOCK_USER_PROGRESS: UserProgress = {
  id: 'progress-ibuprofen-001',
  user_id: 'dev-user-001',
  drug_id: 'drug-ibuprofen-001',
  completed_nodes: ['node-oral-cavity', 'node-stomach'],
  quiz_score: 100,
  quiz_completed: true,
  last_accessed: new Date().toISOString(),
};

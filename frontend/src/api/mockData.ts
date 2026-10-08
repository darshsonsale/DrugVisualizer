/**
 * Drug Path Visualiser - Development Contract Mock Fixture
 *
 * MVP SCOPE:
 * Ibuprofen (400 mg oral tablet) with all 7 physiological transit milestones
 * matching the Google Stitch specification and visual design.
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
    bioavailability_pct: 88,
    cmax_ug_ml: 25.0,
    tmax_hours: 0.75, // ~45 min fasting
  },
];

// ==========================================
// Mock Pathway Graphs (Ibuprofen: 7 Milestones)
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
      name: 'Mouth',
      anatomical_location: 'Oral Cavity Ingestion & Deglutition',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.5,
      camera_focus_z: 1.0,
      content: {
        id: 'content-oral-cavity',
        node_id: 'node-oral-cavity',
        general_description:
          'The solid ibuprofen tablet enters the oral cavity, lubricated by saliva. Minimal to zero drug dissolution occurs during this transit phase before peristaltic transport through the esophagus.',
        physiological_role:
          'Acts strictly as an intake gateway. Because ibuprofen is poorly soluble in acidic to neutral saliva and transit is rapid, mucosal absorption here contributes less than 0.1% of systemic dosage.',
        key_cellular_mechanisms: [
          'Saliva produces ~1.5 liters daily containing salivary amylase and mucins that safeguard the oral mucosa from solid tablet friction.',
        ],
        micro_environment_ph: 6.8,
      },
      variation: {
        id: 'var-oral-cavity-before',
        node_id: 'node-oral-cavity',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Standard rapid bolus transit through the esophagus (5 - 10 sec).',
      },
    },
    {
      id: 'node-stomach',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 2,
      name: 'Stomach',
      anatomical_location: 'Gastric Breakdown & Disintegration',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 15,
      camera_focus_x: -0.5,
      camera_focus_y: 1.2,
      camera_focus_z: 0.8,
      content: {
        id: 'content-stomach',
        node_id: 'node-stomach',
        general_description:
          'Gastric acid (pH 1.5-2.0) causes tablet coat disintegration. Ibuprofen remains in an un-ionized lipophilic form due to its pKa of ~4.4, limiting gastric dissolution while preparing for intestinal entry.',
        physiological_role:
          'Gastric motility governs the gastric emptying rate, which serves as the principal rate-limiting step for onset of analgesic action.',
        key_cellular_mechanisms: [
          'Taking ibuprofen after a meal delays gastric transit from 15 minutes to over an hour, flattening the plasma peak curve.',
        ],
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
      name: 'Small Intestine',
      anatomical_location: 'Duodenum & Jejunum Absorption',
      organ_system: 'Lower Gastrointestinal System',
      estimated_time_minutes: 30,
      camera_focus_x: 0.2,
      camera_focus_y: 0.2,
      camera_focus_z: 0.5,
      content: {
        id: 'content-intestine',
        node_id: 'node-small-intestine',
        general_description:
          'Elevated pH (6.0-7.4) enhances drug ionization and massive surface area provided by microvilli facilitates passive transcellular absorption across the enterocyte lipid bilayer.',
        physiological_role:
          'Over 80-90% of the active molecule permeates the systemic portal system right here through high-capacity mesenteric capillaries.',
        key_cellular_mechanisms: [
          'The intestinal villi expand the total absorbent surface area to approximately that of a standard badminton court!',
        ],
        micro_environment_ph: 6.5,
      },
      variation: {
        id: 'var-intestine-before',
        node_id: 'node-small-intestine',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 15,
        clinical_observation:
          'Rapid arrival produces an early sharp peak plasma concentration (Tmax approx 45 minutes).',
      },
    },
    {
      id: 'node-liver',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 4,
      name: 'Liver',
      anatomical_location: 'First Pass Hepatic Metabolism',
      organ_system: 'Hepatic System',
      estimated_time_minutes: 20,
      camera_focus_x: 0.8,
      camera_focus_y: 0.9,
      camera_focus_z: 0.6,
      content: {
        id: 'content-liver',
        node_id: 'node-liver',
        general_description:
          'Portal venous blood carries the absorbed drug directly into hepatic lobules. Cytochrome P450 enzymes (mainly CYP2C9) catalyze oxidation into inactive metabolites.',
        physiological_role:
          'Ibuprofen undergoes modest hepatic extraction (~15%), leaving ~85% of intact active molecule available for widespread systemic delivery.',
        key_cellular_mechanisms: [
          'Genetic polymorphism in CYP2C9 can significantly extend ibuprofen half-life in up to 5% of diverse patient demographics.',
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
          'In the liver, stereospecific 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into active (S)-enantiomer.',
      },
    },
    {
      id: 'node-bloodstream',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 5,
      name: 'Bloodstream',
      anatomical_location: 'Plasma Protein Binding & Circulation',
      organ_system: 'Circulatory Vascular System',
      estimated_time_minutes: 45,
      camera_focus_x: 0,
      camera_focus_y: 1.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-bloodstream',
        node_id: 'node-bloodstream',
        general_description:
          'Ibuprofen binds tightly (>99%) to circulating serum albumin, creating an intravascular reservoir that slowly unbinds to yield biologically active free fractions.',
        physiological_role:
          'Systemic circulation distributes free drug across peripheral capillary beds, reaching target pain receptors and inflammatory foci within minutes.',
        key_cellular_mechanisms: [
          'Only the ~1% unbound fraction of ibuprofen is pharmacologically active and able to cross endothelial barriers into tissues.',
        ],
        micro_environment_ph: 7.4,
      },
      variation: {
        id: 'var-bloodstream-before',
        node_id: 'node-bloodstream',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation:
          'Therapeutic systemic distribution achieved rapidly, reaching effective analgesia within 45 to 60 minutes.',
      },
    },
    {
      id: 'node-target-sites',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 6,
      name: 'Target Sites',
      anatomical_location: 'Peripheral Inflammation & COX Inhibition',
      organ_system: 'Target Nociceptor & Peripheral Tissue',
      estimated_time_minutes: 60,
      camera_focus_x: 0,
      camera_focus_y: 1.5,
      camera_focus_z: 0.2,
      content: {
        id: 'content-target-sites',
        node_id: 'node-target-sites',
        general_description:
          'Active ibuprofen inhibits cyclooxygenase enzymes (COX-1 and COX-2), halting the synthesis of pro-inflammatory prostaglandins and substance P sensitization.',
        physiological_role:
          'Peripheral edema and hyperalgesia decrease sharply within 30 to 60 minutes after reaching effective synovial concentration levels.',
        key_cellular_mechanisms: [
          'COX-1 inhibition also reduces protective stomach prostaglandins, which is why chronic dosing requires food buffering.',
        ],
        micro_environment_ph: 7.35,
      },
      variation: {
        id: 'var-target-before',
        node_id: 'node-target-sites',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation:
          'Competitive active site blockage halving local PGE2 levels and attenuating pain signals.',
      },
    },
    {
      id: 'node-kidneys',
      pathway_id: 'pathway-ibuprofen-fasting',
      node_order: 7,
      name: 'Kidneys',
      anatomical_location: 'Renal Filtration & Clearance',
      organ_system: 'Renal Excretory System',
      estimated_time_minutes: 120,
      camera_focus_x: 0,
      camera_focus_y: 0.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-kidneys',
        node_id: 'node-kidneys',
        general_description:
          'Hydroxylated and carboxylated metabolites are filtered via glomeruli, undergoing minimal tubular reabsorption and excreted cleanly into urine.',
        physiological_role:
          'Within 24 hours of an oral dose, over 95% is safely cleared as inert glucuronide conjugates and oxidized metabolites.',
        key_cellular_mechanisms: [
          'Less than 1% of parent ibuprofen is eliminated unchanged, underscoring the vital efficiency of prior hepatic conversion.',
        ],
        micro_environment_ph: 6.0,
      },
      variation: {
        id: 'var-kidneys-before',
        node_id: 'node-kidneys',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation:
          'Complete renal excretion ensuring zero toxic tissue accumulation in healthy kidneys.',
      },
    },
  ],
  edges: [
    { id: 'edge-1-2', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-oral-cavity', to_node_id: 'node-stomach' },
    { id: 'edge-2-3', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-stomach', to_node_id: 'node-small-intestine' },
    { id: 'edge-3-4', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-small-intestine', to_node_id: 'node-liver' },
    { id: 'edge-4-5', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-liver', to_node_id: 'node-bloodstream' },
    { id: 'edge-5-6', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-bloodstream', to_node_id: 'node-target-sites' },
    { id: 'edge-6-7', pathway_id: 'pathway-ibuprofen-fasting', from_node_id: 'node-target-sites', to_node_id: 'node-kidneys' },
  ],
};

// Fed state variation
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
            'Total bioavailability (AUC) remains preserved (~88%), but the rate of absorption is slowed, delaying Tmax to 2.5–3.0 hours while reducing gastric irritation.',
        },
      };
    }
    return node;
  }),
};

// Mock Quiz Data
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

// Mock User Progress Data
export const MOCK_USER_PROGRESS: UserProgress = {
  id: 'progress-ibuprofen-001',
  user_id: 'dev-user-001',
  drug_id: 'drug-ibuprofen-001',
  completed_nodes: ['node-oral-cavity', 'node-stomach'],
  quiz_score: 100,
  quiz_completed: true,
  last_accessed: new Date().toISOString(),
};

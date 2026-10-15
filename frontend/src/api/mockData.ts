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
    form: 'Tablets',
    dosage: '400 mg Tablet',
    indication: 'Used for pain, inflammation and fever relief.',
    route: 'Oral Route',
    image_url: '/assets/drugs/ibuprofen.jpg',
    journey_stages: [
      { name: 'Mouth' },
      { name: 'Esophagus' },
      { name: 'Stomach' },
      { name: 'Small Intestine' },
      { name: 'Bloodstream' },
      { name: 'Liver' },
      { name: 'Body Tissues' },
      { name: 'Kidneys' },
    ],
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
    image_url: '/assets/drugs/amoxicillin.jpg',
    journey_stages: [
      { name: 'Mouth' },
      { name: 'Esophagus' },
      { name: 'Stomach' },
      { name: 'Small Intestine' },
      { name: 'Bloodstream' },
      { name: 'Infected Tissues' },
      { name: 'Kidneys' },
    ],
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
    image_url: '/assets/drugs/ambroxol.jpg',
    journey_stages: [
      { name: 'Mouth' },
      { name: 'Esophagus' },
      { name: 'Stomach' },
      { name: 'Small Intestine' },
      { name: 'Bloodstream' },
      { name: 'Respiratory Tissues' },
      { name: 'Liver' },
      { name: 'Kidneys' },
    ],
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
    image_url: '/assets/drugs/insulin.jpg',
    journey_stages: [
      { name: 'Injection Site' },
      { name: 'Bloodstream' },
      { name: 'Body Tissues' },
      { name: 'Liver / Kidneys' },
    ],
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
  drug: {
    ...MOCK_DRUGS[0],
    tmax_hours: 2.5,
  },
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

// ==========================================
// Mock Pathway: Amoxicillin (500 mg Capsule)
// ==========================================

export const MOCK_AMOXICILLIN_PATHWAY_BEFORE_FOOD: PathwayGraphResponse = {
  drug: MOCK_DRUGS[1],
  pathway: {
    id: 'pathway-amox-fasting',
    drug_id: 'drug-amoxicillin-002',
    name: 'Amoxicillin Oral Absorption Pathway',
    description: 'Rapid gastric capsule shell dissolution with saturable transcellular small intestinal absorption.',
    condition: 'BEFORE_FOOD',
  },
  nodes: [
    {
      id: 'node-amox-mouth',
      pathway_id: 'pathway-amox-fasting',
      node_order: 1,
      name: 'Mouth',
      anatomical_location: 'Oral Ingestion',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.5,
      camera_focus_z: 1.0,
      content: {
        id: 'content-amox-mouth',
        node_id: 'node-amox-mouth',
        general_description: 'Gelatin capsule ingested with water passes intact through the oral cavity.',
        physiological_role: 'Entry port with minimal sublingual mucosal exposure.',
        micro_environment_ph: 6.8,
      },
      variation: {
        id: 'var-amox-mouth-before',
        node_id: 'node-amox-mouth',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Quick esophageal transit.',
      },
    },
    {
      id: 'node-amox-esophagus',
      pathway_id: 'pathway-amox-fasting',
      node_order: 2,
      name: 'Esophagus',
      anatomical_location: 'Esophageal Transit',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.1,
      camera_focus_z: 1.0,
      content: {
        id: 'content-amox-esophagus',
        node_id: 'node-amox-esophagus',
        general_description: 'Peristaltic muscular contractions propel the gelatin capsule into the lower esophageal sphincter.',
        physiological_role: 'Transit conduit with mucus lubrication.',
        micro_environment_ph: 7.0,
      },
      variation: {
        id: 'var-amox-esophagus-before',
        node_id: 'node-amox-esophagus',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Direct bolus transit in <10 seconds.',
      },
    },
    {
      id: 'node-amox-stomach',
      pathway_id: 'pathway-amox-fasting',
      node_order: 3,
      name: 'Stomach',
      anatomical_location: 'Gastric Capsule Dissolution',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 20,
      camera_focus_x: -0.5,
      camera_focus_y: 1.2,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amox-stomach',
        node_id: 'node-amox-stomach',
        general_description: 'Acid-resistant amino side chain protects the beta-lactam ring from degradation in gastric acid (pH 1.5–2.0). Gelatin shell hydrates and ruptures.',
        physiological_role: 'Amoxicillin is stable in gastric acid unlike benzylpenicillin, releasing trihydrate powder for downstream transit.',
        micro_environment_ph: 1.8,
      },
      variation: {
        id: 'var-amox-stomach-before',
        node_id: 'node-amox-stomach',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Rapid unhindered gastric emptying.',
      },
    },
    {
      id: 'node-amox-small-intestine',
      pathway_id: 'pathway-amox-fasting',
      node_order: 4,
      name: 'Small Intestine',
      anatomical_location: 'Duodenal & Jejunal Enterocyte Absorption',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 45,
      camera_focus_x: 0,
      camera_focus_y: 0,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amox-intestine',
        node_id: 'node-amox-small-intestine',
        general_description: 'Primary site of absorption via active peptide transporter (PEPT1) and transcellular passive diffusion across jejunum enterocytes (~75% bioavailability).',
        physiological_role: 'High enteric absorption profile independent of food intake, though food delays peak onset.',
        micro_environment_ph: 6.5,
      },
      variation: {
        id: 'var-amox-intestine-before',
        node_id: 'node-amox-small-intestine',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Rapid uptake via proton-coupled oligopeptide transporter PEPT1.',
      },
    },
    {
      id: 'node-amox-bloodstream',
      pathway_id: 'pathway-amox-fasting',
      node_order: 5,
      name: 'Bloodstream',
      anatomical_location: 'Systemic Distribution & Plasma Free Fraction',
      organ_system: 'Cardiovascular System',
      estimated_time_minutes: 30,
      camera_focus_x: 0.4,
      camera_focus_y: 1.4,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amox-bloodstream',
        node_id: 'node-amox-bloodstream',
        general_description: 'Circulates with low plasma protein binding (only ~18–20% bound to albumin), leaving >80% as free active antimicrobial agent.',
        physiological_role: 'Distributes widely across extracellular fluids, middle ear fluid, bronchial secretions, and peritoneal fluid.',
        micro_environment_ph: 7.4,
      },
      variation: {
        id: 'var-amox-bloodstream-before',
        node_id: 'node-amox-bloodstream',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Peak serum level ~8.5 ug/mL achieved at 1.0–1.5 hours.',
      },
    },
    {
      id: 'node-amox-infected-tissues',
      pathway_id: 'pathway-amox-fasting',
      node_order: 6,
      name: 'Infected Tissues',
      anatomical_location: 'Target Bacterial Infection Foci',
      organ_system: 'Target Organs / Systemic Tissue',
      estimated_time_minutes: 60,
      camera_focus_x: 0,
      camera_focus_y: 0.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-amox-infected-tissues',
        node_id: 'node-amox-infected-tissues',
        general_description: 'Binds irreversibly to bacterial Penicillin-Binding Proteins (PBP-1A, PBP-2), blocking peptidoglycan transpeptidation and triggering autolytic bacterial death.',
        physiological_role: 'Bactericidal cell wall destruction targeting Streptococcus pneumoniae, Haemophilus influenzae, and H. pylori.',
        micro_environment_ph: 7.35,
      },
      variation: {
        id: 'var-amox-infected-before',
        node_id: 'node-amox-infected-tissues',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Time-dependent killing: efficacy correlates with time above minimum inhibitory concentration (T > MIC).',
      },
    },
    {
      id: 'node-amox-kidneys',
      pathway_id: 'pathway-amox-fasting',
      node_order: 7,
      name: 'Kidneys',
      anatomical_location: 'Renal Clearance & Tubular Secretion',
      organ_system: 'Renal Excretory System',
      estimated_time_minutes: 60,
      camera_focus_x: 0,
      camera_focus_y: 0.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-amox-kidneys',
        node_id: 'node-amox-kidneys',
        general_description: '60%–70% of amoxicillin is excreted unchanged in urine within 6 hours by active organic anion tubular secretion (OAT3) and glomerular filtration.',
        physiological_role: 'Rapid renal elimination yields high urinary antibacterial concentrations while maintaining short elimination half-life (~1.0 hr).',
        micro_environment_ph: 6.0,
      },
      variation: {
        id: 'var-amox-kidneys-before',
        node_id: 'node-amox-kidneys',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Clearance can be prolonged competitively with probenecid.',
      },
    },
  ],
  edges: [
    { id: 'edge-amox-1-2', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-mouth', to_node_id: 'node-amox-esophagus' },
    { id: 'edge-amox-2-3', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-esophagus', to_node_id: 'node-amox-stomach' },
    { id: 'edge-amox-3-4', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-stomach', to_node_id: 'node-amox-small-intestine' },
    { id: 'edge-amox-4-5', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-small-intestine', to_node_id: 'node-amox-bloodstream' },
    { id: 'edge-amox-5-6', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-bloodstream', to_node_id: 'node-amox-infected-tissues' },
    { id: 'edge-amox-6-7', pathway_id: 'pathway-amox-fasting', from_node_id: 'node-amox-infected-tissues', to_node_id: 'node-amox-kidneys' },
  ],
};

export const MOCK_AMOXICILLIN_PATHWAY_AFTER_FOOD: PathwayGraphResponse = {
  ...MOCK_AMOXICILLIN_PATHWAY_BEFORE_FOOD,
  drug: {
    ...MOCK_DRUGS[1],
    tmax_hours: 1.8,
  },
  pathway: {
    id: 'pathway-amox-fed',
    drug_id: 'drug-amoxicillin-002',
    name: 'Amoxicillin Oral Absorption Pathway (After Food)',
    description: 'Food delays gastric emptying but total antibiotic absorption AUC remains unchanged.',
    condition: 'AFTER_FOOD',
  },
};

// ==========================================
// Mock Pathway: Ambroxol Syrup (15 mg / 5 ml)
// ==========================================

export const MOCK_AMBROXOL_PATHWAY_BEFORE_FOOD: PathwayGraphResponse = {
  drug: MOCK_DRUGS[2],
  pathway: {
    id: 'pathway-ambroxol-fasting',
    drug_id: 'drug-ambroxol-003',
    name: 'Ambroxol Syrup Secretolytic Pathway',
    description: 'Rapid liquid oral deglutition, rapid small intestinal absorption, high bronchial tissue affinity.',
    condition: 'BEFORE_FOOD',
  },
  nodes: [
    {
      id: 'node-amb-mouth',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 1,
      name: 'Mouth',
      anatomical_location: 'Oral Liquid Intake',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.5,
      camera_focus_z: 1.0,
      content: {
        id: 'content-amb-mouth',
        node_id: 'node-amb-mouth',
        general_description: 'Oral deglutition of viscous aromatic syrup vehicle providing immediate local soothing of pharyngeal mucosa.',
        physiological_role: 'Direct liquid transport with rapid esophageal passage.',
        micro_environment_ph: 6.8,
      },
      variation: {
        id: 'var-amb-mouth-before',
        node_id: 'node-amb-mouth',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Instant swallow without tablet disintegration requirement.',
      },
    },
    {
      id: 'node-amb-esophagus',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 2,
      name: 'Esophagus',
      anatomical_location: 'Esophageal Transit',
      organ_system: 'Upper Digestive System',
      estimated_time_minutes: 1,
      camera_focus_x: 0,
      camera_focus_y: 2.1,
      camera_focus_z: 1.0,
      content: {
        id: 'content-amb-esophagus',
        node_id: 'node-amb-esophagus',
        general_description: 'Liquid flows smoothly down the esophagus into the cardiac orifice in under 5 seconds.',
        physiological_role: 'Transit pathway.',
        micro_environment_ph: 7.0,
      },
      variation: {
        id: 'var-amb-esophagus-before',
        node_id: 'node-amb-esophagus',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Rapid gravity-assisted flow.',
      },
    },
    {
      id: 'node-amb-stomach',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 3,
      name: 'Stomach',
      anatomical_location: 'Gastric Transit',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 10,
      camera_focus_x: -0.5,
      camera_focus_y: 1.2,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amb-stomach',
        node_id: 'node-amb-stomach',
        general_description: 'Because ambroxol is pre-dissolved in syrup vehicle, it does not require dissolution and empties rapidly through the pyloric sphincter.',
        physiological_role: 'Rapid liquid gastric emptying.',
        micro_environment_ph: 2.0,
      },
      variation: {
        id: 'var-amb-stomach-before',
        node_id: 'node-amb-stomach',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Liquid empties substantially faster than solid tablets.',
      },
    },
    {
      id: 'node-amb-small-intestine',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 4,
      name: 'Small Intestine',
      anatomical_location: 'Enteral Absorption',
      organ_system: 'Gastrointestinal System',
      estimated_time_minutes: 30,
      camera_focus_x: 0,
      camera_focus_y: 0,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amb-intestine',
        node_id: 'node-amb-small-intestine',
        general_description: 'Rapid and almost complete absorption from the gastrointestinal tract (~79% bioavailability).',
        physiological_role: 'Passively absorbed across the enteric villi into mesenteric circulation.',
        micro_environment_ph: 6.8,
      },
      variation: {
        id: 'var-amb-intestine-before',
        node_id: 'node-amb-small-intestine',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Peak therapeutic plasma concentration onset.',
      },
    },
    {
      id: 'node-amb-bloodstream',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 5,
      name: 'Bloodstream',
      anatomical_location: 'Plasma Distribution & Protein Binding',
      organ_system: 'Cardiovascular System',
      estimated_time_minutes: 30,
      camera_focus_x: 0.4,
      camera_focus_y: 1.4,
      camera_focus_z: 0.8,
      content: {
        id: 'content-amb-bloodstream',
        node_id: 'node-amb-bloodstream',
        general_description: 'High volume of distribution (552 L), bound ~90% to plasma proteins, with selective high affinity for pulmonary tissue.',
        physiological_role: 'Circulatory carrier delivering molecule selectively to respiratory epithelium.',
        micro_environment_ph: 7.4,
      },
      variation: {
        id: 'var-amb-bloodstream-before',
        node_id: 'node-amb-bloodstream',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Rapid tissue partition coefficient from blood into lungs.',
      },
    },
    {
      id: 'node-amb-respiratory-tissues',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 6,
      name: 'Respiratory Tissues',
      anatomical_location: 'Bronchial Mucosa & Alveolar Epithelium',
      organ_system: 'Respiratory System',
      estimated_time_minutes: 90,
      camera_focus_x: 0.3,
      camera_focus_y: 1.8,
      camera_focus_z: 0.9,
      content: {
        id: 'content-amb-respiratory',
        node_id: 'node-amb-respiratory-tissues',
        general_description: 'Accumulates in lung parenchyma. Stimulates surfactant production by alveolar type II pneumocytes and activates ciliary motility.',
        physiological_role: 'Decreases mucus viscosity, restores mucociliary transport, and eases sputum expectoration.',
        micro_environment_ph: 7.2,
      },
      variation: {
        id: 'var-amb-respiratory-before',
        node_id: 'node-amb-respiratory-tissues',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Pulmonary concentration is up to 15 times higher than blood serum.',
      },
    },
    {
      id: 'node-amb-liver',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 7,
      name: 'Liver',
      anatomical_location: 'Hepatic Glucuronidation',
      organ_system: 'Hepatic System',
      estimated_time_minutes: 60,
      camera_focus_x: 0.5,
      camera_focus_y: 1.1,
      camera_focus_z: 0.6,
      content: {
        id: 'content-amb-liver',
        node_id: 'node-amb-liver',
        general_description: 'Metabolized via glucuronidation and CYP3A4 to dibromoanthranilic acid (~30% first pass effect).',
        physiological_role: 'Phase II conjugation into water-soluble metabolites.',
        micro_environment_ph: 7.2,
      },
      variation: {
        id: 'var-amb-liver-before',
        node_id: 'node-amb-liver',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Clean conversion into excretable polar metabolites.',
      },
    },
    {
      id: 'node-amb-kidneys',
      pathway_id: 'pathway-ambroxol-fasting',
      node_order: 8,
      name: 'Kidneys',
      anatomical_location: 'Renal Elimination',
      organ_system: 'Renal Excretory System',
      estimated_time_minutes: 120,
      camera_focus_x: 0,
      camera_focus_y: 0.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-amb-kidneys',
        node_id: 'node-amb-kidneys',
        general_description: 'Approximately 83% of the dose is excreted in urine as glucuronides and free ambroxol (~10% unchanged).',
        physiological_role: 'Renal clearance with elimination half-life of ~10 hours.',
        micro_environment_ph: 6.0,
      },
      variation: {
        id: 'var-amb-kidneys-before',
        node_id: 'node-amb-kidneys',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Safe urinary excretion over 24 hours.',
      },
    },
  ],
  edges: [
    { id: 'edge-amb-1-2', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-mouth', to_node_id: 'node-amb-esophagus' },
    { id: 'edge-amb-2-3', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-esophagus', to_node_id: 'node-amb-stomach' },
    { id: 'edge-amb-3-4', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-stomach', to_node_id: 'node-amb-small-intestine' },
    { id: 'edge-amb-4-5', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-small-intestine', to_node_id: 'node-amb-bloodstream' },
    { id: 'edge-amb-5-6', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-bloodstream', to_node_id: 'node-amb-respiratory-tissues' },
    { id: 'edge-amb-6-7', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-respiratory-tissues', to_node_id: 'node-amb-liver' },
    { id: 'edge-amb-7-8', pathway_id: 'pathway-ambroxol-fasting', from_node_id: 'node-amb-liver', to_node_id: 'node-amb-kidneys' },
  ],
};

export const MOCK_AMBROXOL_PATHWAY_AFTER_FOOD: PathwayGraphResponse = {
  ...MOCK_AMBROXOL_PATHWAY_BEFORE_FOOD,
  drug: {
    ...MOCK_DRUGS[2],
    tmax_hours: 2.5,
  },
  pathway: {
    id: 'pathway-ambroxol-fed',
    drug_id: 'drug-ambroxol-003',
    name: 'Ambroxol Syrup Secretolytic Pathway (After Food)',
    description: 'Syrup gastric transit moderately buffered by meal, maintaining total mucolytic therapeutic efficacy.',
    condition: 'AFTER_FOOD',
  },
};

// ==========================================
// Mock Pathway: Insulin Injection
// ==========================================

export const MOCK_INSULIN_PATHWAY_BEFORE_FOOD: PathwayGraphResponse = {
  drug: MOCK_DRUGS[3],
  pathway: {
    id: 'pathway-insulin-fasting',
    drug_id: 'drug-insulin-004',
    name: 'Subcutaneous Insulin Parenteral Pathway',
    description: 'Direct subcutaneous adipose depot dissolution, rapid capillary entry bypassing GI tract and hepatic first-pass.',
    condition: 'BEFORE_FOOD',
  },
  nodes: [
    {
      id: 'node-ins-injection-site',
      pathway_id: 'pathway-insulin-fasting',
      node_order: 1,
      name: 'Injection Site',
      anatomical_location: 'Subcutaneous Adipose Tissue',
      organ_system: 'Integumentary & Subcutaneous Depot',
      estimated_time_minutes: 10,
      camera_focus_x: -0.6,
      camera_focus_y: 0.5,
      camera_focus_z: 0.5,
      content: {
        id: 'content-ins-site',
        node_id: 'node-ins-injection-site',
        general_description: 'Administered parenterally into abdominal subcutaneous adipose tissue. Self-associated zinc-insulin hexamers dissociate into absorbable monomers and dimers.',
        physiological_role: 'Subcutaneous depot bypassing gastrointestinal peptidase degradation and stomach acid.',
        micro_environment_ph: 7.35,
      },
      variation: {
        id: 'var-ins-site-before',
        node_id: 'node-ins-injection-site',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Administered 15-30 min before meals to synchronize peak insulin with postprandial glucose surge.',
      },
    },
    {
      id: 'node-ins-bloodstream',
      pathway_id: 'pathway-insulin-fasting',
      node_order: 2,
      name: 'Bloodstream',
      anatomical_location: 'Systemic Microcirculation & Plasma Delivery',
      organ_system: 'Cardiovascular System',
      estimated_time_minutes: 15,
      camera_focus_x: 0.4,
      camera_focus_y: 1.4,
      camera_focus_z: 0.8,
      content: {
        id: 'content-ins-bloodstream',
        node_id: 'node-ins-bloodstream',
        general_description: 'Absorbed directly through capillary fenestrations into venous systemic circulation without first-pass hepatic metabolism.',
        physiological_role: 'Circulates as unbound monomer with short biological half-life (5–10 minutes).',
        micro_environment_ph: 7.4,
      },
      variation: {
        id: 'var-ins-blood-before',
        node_id: 'node-ins-bloodstream',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Rapid rise in circulating plasma insulin.',
      },
    },
    {
      id: 'node-ins-body-tissues',
      pathway_id: 'pathway-insulin-fasting',
      node_order: 3,
      name: 'Body Tissues',
      anatomical_location: 'Skeletal Muscle & Adipose Target Receptors',
      organ_system: 'Peripheral Metabolic Tissues',
      estimated_time_minutes: 45,
      camera_focus_x: 0,
      camera_focus_y: 0.2,
      camera_focus_z: 0.5,
      content: {
        id: 'content-ins-tissues',
        node_id: 'node-ins-body-tissues',
        general_description: 'Binds to the alpha subunits of the insulin receptor, activating tyrosine kinase autophosphorylation and mobilizing GLUT4 transporters to the plasma membrane.',
        physiological_role: 'Stimulates cellular uptake of glucose for glycogen synthesis, glycolysis, and lipogenesis while inhibiting proteolysis.',
        micro_environment_ph: 7.35,
      },
      variation: {
        id: 'var-ins-tissues-before',
        node_id: 'node-ins-body-tissues',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Prompt reduction in systemic blood glucose levels.',
      },
    },
    {
      id: 'node-ins-liver',
      pathway_id: 'pathway-insulin-fasting',
      node_order: 4,
      name: 'Liver',
      anatomical_location: 'Hepatic Insulin Receptors & Clearance',
      organ_system: 'Hepatic System',
      estimated_time_minutes: 20,
      camera_focus_x: 0.5,
      camera_focus_y: 1.1,
      camera_focus_z: 0.6,
      content: {
        id: 'content-ins-liver',
        node_id: 'node-ins-liver',
        general_description: 'Suppresses hepatic gluconeogenesis and glycogenolysis, stimulating glycogen synthase. Approximately 50% of circulating insulin is degraded by hepatic insulin-degrading enzyme (IDE).',
        physiological_role: 'Restores hepatic glucose homeostasis and clears active hormone.',
        micro_environment_ph: 7.2,
      },
      variation: {
        id: 'var-ins-liver-before',
        node_id: 'node-ins-liver',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Immediate downregulation of endogenous hepatic glucose output.',
      },
    },
    {
      id: 'node-ins-kidneys',
      pathway_id: 'pathway-insulin-fasting',
      node_order: 5,
      name: 'Kidneys',
      anatomical_location: 'Renal Glomerular Filtration & Degradation',
      organ_system: 'Renal Excretory System',
      estimated_time_minutes: 30,
      camera_focus_x: 0,
      camera_focus_y: 0.8,
      camera_focus_z: 0.2,
      content: {
        id: 'content-ins-kidneys',
        node_id: 'node-ins-kidneys',
        general_description: 'Filtered through glomeruli and reabsorbed in the proximal tubules where it is enzymatically degraded into constituent amino acids. Less than 1% excreted intact.',
        physiological_role: 'Accounts for ~30–40% of systemic insulin clearance.',
        micro_environment_ph: 6.0,
      },
      variation: {
        id: 'var-ins-kidneys-before',
        node_id: 'node-ins-kidneys',
        condition: 'BEFORE_FOOD',
        transit_time_modifier_pct: 0,
        absorption_modifier_pct: 0,
        clinical_observation: 'Renal impairment significantly prolongs insulin half-life, requiring dose titration.',
      },
    },
  ],
  edges: [
    { id: 'edge-ins-1-2', pathway_id: 'pathway-insulin-fasting', from_node_id: 'node-ins-injection-site', to_node_id: 'node-ins-bloodstream' },
    { id: 'edge-ins-2-3', pathway_id: 'pathway-insulin-fasting', from_node_id: 'node-ins-bloodstream', to_node_id: 'node-ins-body-tissues' },
    { id: 'edge-ins-3-4', pathway_id: 'pathway-insulin-fasting', from_node_id: 'node-ins-body-tissues', to_node_id: 'node-ins-liver' },
    { id: 'edge-ins-4-5', pathway_id: 'pathway-insulin-fasting', from_node_id: 'node-ins-liver', to_node_id: 'node-ins-kidneys' },
  ],
};

export const MOCK_INSULIN_PATHWAY_AFTER_FOOD: PathwayGraphResponse = {
  ...MOCK_INSULIN_PATHWAY_BEFORE_FOOD,
  drug: {
    ...MOCK_DRUGS[3],
    tmax_hours: 0.5,
  },
  pathway: {
    id: 'pathway-insulin-fed',
    drug_id: 'drug-insulin-004',
    name: 'Subcutaneous Insulin Parenteral Pathway (Postprandial Response)',
    description: 'Parenteral absorption profile operates independently of gastrointestinal contents, countering postprandial glycemic excursions.',
    condition: 'AFTER_FOOD',
  },
};

// Mock Quiz Data (Confidential questions & options strictly omitting answers and explanations)
export const MOCK_IBUPROFEN_QUIZ: QuizResponse = {
  id: 'quiz-ibuprofen-001',
  drug_id: 'drug-ibuprofen-001',
  title: 'Ibuprofen Pharmacokinetics & Mechanism Assessment',
  description: 'Test your understanding of physiological transit, chiral inversion, and food effects on Ibuprofen.',
  pass_percentage: 70.0,
  questions: [
    {
      id: 'q1',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 1,
      question_text:
        'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?',
      options: [
        { id: 'opt1-a', question_id: 'q1', option_text: 'Stomach mucosa' },
        { id: 'opt1-b', question_id: 'q1', option_text: 'Liver (hepatic epimerase & CYP2C9)' },
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
        { id: 'opt2-b', question_id: 'q2', option_text: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC' },
        { id: 'opt2-c', question_id: 'q2', option_text: 'It converts Ibuprofen into an irreversible enzyme blocker' },
        { id: 'opt2-d', question_id: 'q2', option_text: 'It increases peak plasma concentration tenfold' },
      ],
    },
    {
      id: 'q3',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 3,
      question_text: 'What is the primary molecular mechanism responsible for the analgesic and anti-inflammatory activity of (S)-ibuprofen?',
      options: [
        { id: 'opt3-a', question_id: 'q3', option_text: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)' },
        { id: 'opt3-b', question_id: 'q3', option_text: 'Irreversible acetylation of platelet cyclooxygenase serine residues' },
        { id: 'opt3-c', question_id: 'q3', option_text: 'Agonism of peripheral opioid mu-receptors' },
        { id: 'opt3-d', question_id: 'q3', option_text: 'Selective allosteric opening of voltage-gated chloride channels' },
      ],
    },
    {
      id: 'q4',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 4,
      question_text: 'In systemic circulation, how is Ibuprofen predominantly transported within human blood plasma?',
      options: [
        { id: 'opt4-a', question_id: 'q4', option_text: 'Extensively bound to serum albumin (>99% protein binding)' },
        { id: 'opt4-b', question_id: 'q4', option_text: 'Freely dissolved as an unbound neutral molecule' },
        { id: 'opt4-c', question_id: 'q4', option_text: 'Bound to red blood cell hemoglobin beta-chains' },
        { id: 'opt4-d', question_id: 'q4', option_text: 'Encapsulated inside chylomicrons and low-density lipoproteins' },
      ],
    },
    {
      id: 'q5',
      quiz_id: 'quiz-ibuprofen-001',
      question_order: 5,
      question_text: 'What is the principal elimination pathway for Ibuprofen in healthy human physiology?',
      options: [
        { id: 'opt5-a', question_id: 'q5', option_text: 'Biliary excretion of unchanged parent compound into feces' },
        { id: 'opt5-b', question_id: 'q5', option_text: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine' },
        { id: 'opt5-c', question_id: 'q5', option_text: 'Direct pulmonary evaporation via alveolar expiration' },
        { id: 'opt5-d', question_id: 'q5', option_text: 'Metabolism by intestinal brush-border peptidases' },
      ],
    },
  ],
};

export const MOCK_AMOXICILLIN_QUIZ: QuizResponse = {
  id: 'quiz-amoxicillin-002',
  drug_id: 'drug-amoxicillin-002',
  title: 'Amoxicillin Pharmacokinetics & Antibacterial Mechanism Assessment',
  description: 'Test your understanding of beta-lactam bactericidal activity, PEPT1 active transport, food independence, and renal clearance.',
  pass_percentage: 70.0,
  questions: [
    {
      id: 'amox-q1',
      quiz_id: 'quiz-amoxicillin-002',
      question_order: 1,
      question_text: 'What is the primary bactericidal mechanism of action of Amoxicillin?',
      options: [
        { id: 'amox-opt1-a', question_id: 'amox-q1', option_text: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding' },
        { id: 'amox-opt1-b', question_id: 'amox-q1', option_text: 'Binding to the 30S ribosomal subunit to block bacterial protein translation' },
        { id: 'amox-opt1-c', question_id: 'amox-q1', option_text: 'Inhibition of topoisomerase II (DNA gyrase) preventing DNA replication' },
        { id: 'amox-opt1-d', question_id: 'amox-q1', option_text: 'Disruption of outer bacterial membrane lipid A integrity' },
      ],
    },
    {
      id: 'amox-q2',
      quiz_id: 'quiz-amoxicillin-002',
      question_order: 2,
      question_text: 'How is Amoxicillin primarily absorbed from the lumen of the proximal small intestine into enterocytes?',
      options: [
        { id: 'amox-opt2-a', question_id: 'amox-q2', option_text: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)' },
        { id: 'amox-opt2-b', question_id: 'amox-q2', option_text: 'Passive transcellular diffusion governed solely by high lipophilicity' },
        { id: 'amox-opt2-c', question_id: 'amox-q2', option_text: 'Receptor-mediated endocytosis via sodium-glucose cotransporter 1 (SGLT1)' },
        { id: 'amox-opt2-d', question_id: 'amox-q2', option_text: 'Paracellular filtration through tight junctions in the descending colon' },
      ],
    },
    {
      id: 'amox-q3',
      quiz_id: 'quiz-amoxicillin-002',
      question_order: 3,
      question_text: 'What is the established clinical effect of food intake on the oral bioavailability of Amoxicillin?',
      options: [
        { id: 'amox-opt3-a', question_id: 'amox-q3', option_text: 'Food causes a dramatic 80% decrease in systemic AUC, requiring strict fasting' },
        { id: 'amox-opt3-b', question_id: 'amox-q3', option_text: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals' },
        { id: 'amox-opt3-c', question_id: 'amox-q3', option_text: 'High-fat meals double the bioavailability through lipid micellar solubilization' },
        { id: 'amox-opt3-d', question_id: 'amox-q3', option_text: 'Gastric food contents irreversibly cleave the beta-lactam ring prior to emptying' },
      ],
    },
    {
      id: 'amox-q4',
      quiz_id: 'quiz-amoxicillin-002',
      question_order: 4,
      question_text: 'Through which physiological mechanism is the majority of active Amoxicillin eliminated from systemic circulation?',
      options: [
        { id: 'amox-opt4-a', question_id: 'amox-q4', option_text: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion' },
        { id: 'amox-opt4-b', question_id: 'amox-q4', option_text: 'Extensive hepatic cytochrome P450 CYP3A4 oxidation into inactive quinones' },
        { id: 'amox-opt4-c', question_id: 'amox-q4', option_text: 'Sequestration and degradation within pulmonary alveolar macrophages' },
        { id: 'amox-opt4-d', question_id: 'amox-q4', option_text: 'Excretion in sweat and tears via exocrine eccrine glands' },
      ],
    },
    {
      id: 'amox-q5',
      quiz_id: 'quiz-amoxicillin-002',
      question_order: 5,
      question_text: 'What is the primary mechanism of bacterial resistance that inactivates Amoxicillin monotherapy?',
      options: [
        { id: 'amox-opt5-a', question_id: 'amox-q5', option_text: 'Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring' },
        { id: 'amox-opt5-b', question_id: 'amox-q5', option_text: 'Downregulation of mammalian PEPT1 transporters in host enterocytes' },
        { id: 'amox-opt5-c', question_id: 'amox-q5', option_text: 'Accelerated renal clearance induced by bacterial endotoxins' },
        { id: 'amox-opt5-d', question_id: 'amox-q5', option_text: 'Efflux exclusively mediated by host P-glycoprotein across the blood-brain barrier' },
      ],
    },
  ],
};

export const MOCK_AMBROXOL_QUIZ: QuizResponse = {
  id: 'quiz-ambroxol-003',
  drug_id: 'drug-ambroxol-003',
  title: 'Ambroxol Syrup Secretolytic & Pharmacokinetic Assessment',
  description: 'Test your understanding of respiratory surfactant stimulation, lysosomal tissue distribution, hepatic CYP3A4 metabolism, and polar renal elimination.',
  pass_percentage: 70.0,
  questions: [
    {
      id: 'amb-q1',
      quiz_id: 'quiz-ambroxol-003',
      question_order: 1,
      question_text: 'What is the primary pharmacodynamic secretolytic mechanism of Ambroxol in the respiratory tract?',
      options: [
        { id: 'amb-opt1-a', question_id: 'amb-q1', option_text: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion' },
        { id: 'amb-opt1-b', question_id: 'amb-q1', option_text: 'Direct chemical cleavage of disulfide bonds across cross-linked mucin fibers' },
        { id: 'amb-opt1-c', question_id: 'amb-q1', option_text: 'Central inhibition of the medullary brainstem cough center' },
        { id: 'amb-opt1-d', question_id: 'amb-q1', option_text: 'Beta-2 adrenergic bronchodilation of bronchial smooth muscle cells' },
      ],
    },
    {
      id: 'amb-q2',
      quiz_id: 'quiz-ambroxol-003',
      question_order: 2,
      question_text: 'Following oral administration of Ambroxol syrup, how does its tissue distribution profile characterize its respiratory efficacy?',
      options: [
        { id: 'amb-opt2-a', question_id: 'amb-q2', option_text: 'High volume of distribution with significant tissue accumulation in lung parenchyma (lung-to-plasma ratio > 2.5)' },
        { id: 'amb-opt2-b', question_id: 'amb-q2', option_text: 'Strict limitation to intravascular plasma volume with zero tissue penetration' },
        { id: 'amb-opt2-c', question_id: 'amb-q2', option_text: 'Selective accumulation in subcutaneous adipose tissue with minimal pulmonary access' },
        { id: 'amb-opt2-d', question_id: 'amb-q2', option_text: 'Complete blood-brain barrier sequestration with rapid central nervous system toxicity' },
      ],
    },
    {
      id: 'amb-q3',
      quiz_id: 'quiz-ambroxol-003',
      question_order: 3,
      question_text: 'What are the verified clinical pharmacokinetic absorption parameters for oral Ambroxol syrup in fasting adults?',
      options: [
        { id: 'amb-opt3-a', question_id: 'amb-q3', option_text: 'Rapid systemic absorption with peak plasma concentration (Tmax) achieved at 1.0 to 2.5 hours and absolute bioavailability of ~70–80%' },
        { id: 'amb-opt3-b', question_id: 'amb-q3', option_text: 'Delayed systemic peak requiring 24 to 48 hours for detection in bloodstream' },
        { id: 'amb-opt3-c', question_id: 'amb-q3', option_text: 'Near-zero oral bioavailability (<2%) requiring intravenous injection exclusively' },
        { id: 'amb-opt3-d', question_id: 'amb-q3', option_text: 'Immediate peak at 60 seconds with total clearance completed within 5 minutes' },
      ],
    },
    {
      id: 'amb-q4',
      quiz_id: 'quiz-ambroxol-003',
      question_order: 4,
      question_text: 'Which enzymatic pathway accounts for the major hepatic first-pass metabolism of Ambroxol?',
      options: [
        { id: 'amb-opt4-a', question_id: 'amb-q4', option_text: 'CYP3A4-mediated oxidation and glucuronidation into dibromoanthranilic acid and polar conjugates' },
        { id: 'amb-opt4-b', question_id: 'amb-q4', option_text: 'Exclusive plasma butyrylcholinesterase hydrolysis' },
        { id: 'amb-opt4-c', question_id: 'amb-q4', option_text: 'Bacterial beta-glucuronidase activation inside the cecum' },
        { id: 'amb-opt4-d', question_id: 'amb-q4', option_text: 'Monoamine oxidase type B oxidative deamination' },
      ],
    },
    {
      id: 'amb-q5',
      quiz_id: 'quiz-ambroxol-003',
      question_order: 5,
      question_text: 'How are Ambroxol and its biotransformation products cleared from the human body?',
      options: [
        { id: 'amb-opt5-a', question_id: 'amb-q5', option_text: 'Renal excretion of polar water-soluble metabolites (~85–90%), with less than 10% cleared as unchanged parent drug' },
        { id: 'amb-opt5-b', question_id: 'amb-q5', option_text: 'Exclusively via exhalation of gaseous volatile breakdown products' },
        { id: 'amb-opt5-c', question_id: 'amb-q5', option_text: 'Complete precipitation as insoluble biliary stones in the gallbladder' },
        { id: 'amb-opt5-d', question_id: 'amb-q5', option_text: 'Dermal sequestration and elimination through epidermal desquamation' },
      ],
    },
  ],
};

export const MOCK_INSULIN_QUIZ: QuizResponse = {
  id: 'quiz-insulin-004',
  drug_id: 'drug-insulin-004',
  title: 'Regular Human Insulin Receptor Signalling & Clearance Assessment',
  description: 'Test your understanding of tyrosine kinase autophosphorylation, hexamer dissociation, lack of oral bioavailability, and dual hepatic/renal clearance.',
  pass_percentage: 70.0,
  questions: [
    {
      id: 'ins-q1',
      quiz_id: 'quiz-insulin-004',
      question_order: 1,
      question_text: 'What is the initial molecular event triggered by Regular Human Insulin binding to target cells?',
      options: [
        { id: 'ins-opt1-a', question_id: 'ins-q1', option_text: 'Binding to extracellular alpha-subunits activating beta-subunit tyrosine kinase auto-phosphorylation and IRS recruitment' },
        { id: 'ins-opt1-b', question_id: 'ins-q1', option_text: 'Direct passive entry through nuclear pore complexes to regulate mRNA transcription' },
        { id: 'ins-opt1-c', question_id: 'ins-q1', option_text: 'Opening of ligand-gated calcium channels across the mitochondrial inner membrane' },
        { id: 'ins-opt1-d', question_id: 'ins-q1', option_text: 'Allosteric degradation of circulating glucagon molecules in blood plasma' },
      ],
    },
    {
      id: 'ins-q2',
      quiz_id: 'quiz-insulin-004',
      question_order: 2,
      question_text: 'Why does subcutaneously administered Regular Human Insulin exhibit an onset of 30–60 minutes rather than immediate action?',
      options: [
        { id: 'ins-opt2-a', question_id: 'ins-q2', option_text: 'Zinc-stabilized hexamers in the formulation must dissociate into dimers and monomers before entering capillary fenestrations' },
        { id: 'ins-opt2-b', question_id: 'ins-q2', option_text: 'Subcutaneous adipocytes irreversibly destroy 95% of injected insulin molecules' },
        { id: 'ins-opt2-c', question_id: 'ins-q2', option_text: 'Insulin requires activation by gastric acid before becoming biologically active' },
        { id: 'ins-opt2-d', question_id: 'ins-q2', option_text: 'The drug must first be converted into a prodrug in the spleen' },
      ],
    },
    {
      id: 'ins-q3',
      quiz_id: 'quiz-insulin-004',
      question_order: 3,
      question_text: 'Which two primary organs account for the physiological clearance and degradation of circulating Insulin?',
      options: [
        { id: 'ins-opt3-a', question_id: 'ins-q3', option_text: 'Liver (receptor-mediated endocytosis and IDE) and Kidneys (glomerular filtration and proximal tubular degradation)' },
        { id: 'ins-opt3-b', question_id: 'ins-q3', option_text: 'Spleen red pulp and bone marrow osteoclasts' },
        { id: 'ins-opt3-c', question_id: 'ins-q3', option_text: 'Small intestine brush border and colonic microbiota' },
        { id: 'ins-opt3-d', question_id: 'ins-q3', option_text: 'Pulmonary alveoli and tracheal cilia' },
      ],
    },
    {
      id: 'ins-q4',
      quiz_id: 'quiz-insulin-004',
      question_order: 4,
      question_text: 'Why is Regular Human Insulin ineffective when administered via the oral gastrointestinal route?',
      options: [
        { id: 'ins-opt4-a', question_id: 'ins-q4', option_text: 'Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability' },
        { id: 'ins-opt4-b', question_id: 'ins-q4', option_text: 'Immediate volatilization in the oral cavity due to body temperature' },
        { id: 'ins-opt4-c', question_id: 'ins-q4', option_text: 'Selective binding to dietary fiber resulting in total fecal precipitation' },
        { id: 'ins-opt4-d', question_id: 'ins-q4', option_text: 'Inactivation by salivary amylase before reaching the pharynx' },
      ],
    },
    {
      id: 'ins-q5',
      quiz_id: 'quiz-insulin-004',
      question_order: 5,
      question_text: 'In the visualizer catalog, tmax_hours for Regular Insulin is recorded as 0.5 hours. How does this model parameter relate to clinical pharmacodynamics?',
      options: [
        { id: 'ins-opt5-a', question_id: 'ins-q5', option_text: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours' },
        { id: 'ins-opt5-b', question_id: 'ins-q5', option_text: 'The 0.5-hour value represents total elimination from human physiology' },
        { id: 'ins-opt5-c', question_id: 'ins-q5', option_text: 'Clinical peak action is guaranteed to occur at exactly 30 minutes in all patients' },
        { id: 'ins-opt5-d', question_id: 'ins-q5', option_text: 'The 0.5-hour value indicates that insulin acts as an oral disintegrating tablet' },
      ],
    },
  ],
};

export const MOCK_QUIZZES_BY_DRUG: Record<string, QuizResponse> = {
  'drug-ibuprofen-001': MOCK_IBUPROFEN_QUIZ,
  'drug-amoxicillin-002': MOCK_AMOXICILLIN_QUIZ,
  'drug-ambroxol-003': MOCK_AMBROXOL_QUIZ,
  'drug-insulin-004': MOCK_INSULIN_QUIZ,
  ibuprofen: MOCK_IBUPROFEN_QUIZ,
  amoxicillin: MOCK_AMOXICILLIN_QUIZ,
  ambroxol: MOCK_AMBROXOL_QUIZ,
  insulin: MOCK_INSULIN_QUIZ,
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

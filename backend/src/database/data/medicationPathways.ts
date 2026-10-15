/**
 * Drug Path Visualiser - Canonical Pathway Data for all Four Medications
 *
 * Traceable Scientific Sources:
 * - Ibuprofen: FDA Motrin NDA 017463; Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW
 * - Amoxicillin: FDA Amoxil NDA 050542; Westphal et al., Clin Pharmacokinet 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW
 * - Ambroxol Syrup: EMA/SmPC Mucosolvan; Malerba & Ragnoli, Expert Opin Drug Metab Toxicol 2008; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW
 * - Insulin: Goodman & Gilman 14th Ed; Saltiel & Kahn, Nature 2001; Kang et al., Diabetes Care 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW
 */

export interface SeedPathway {
  id: string;
  drug_id: string;
  name: string;
  description: string;
}

export interface SeedPathwayVariation {
  id: string;
  pathway_id: string;
  condition: 'BEFORE_FOOD' | 'AFTER_FOOD';
  name: string;
  description: string;
}

export interface SeedNode {
  id: string;
  pathway_id: string;
  node_order: number;
  name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: number;
  camera_focus_x?: number;
  camera_focus_y?: number;
  camera_focus_z?: number;
}

export interface SeedContent {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_cellular_mechanisms: string[];
  micro_environment_ph?: number;
}

export interface SeedNodeVariation {
  id: string;
  node_id: string;
  condition: 'BEFORE_FOOD' | 'AFTER_FOOD';
  transit_time_modifier_pct: number;
  absorption_modifier_pct: number;
  clinical_observation: string;
  notes?: string;
}

export interface SeedEdge {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  transition_description?: string;
  transition_duration_minutes?: number;
}

// =========================================================================
// 1. PATHWAYS & PATHWAY VARIATIONS
// =========================================================================

export const SEED_PATHWAYS: SeedPathway[] = [
  {
    id: 'pathway-ibuprofen-fasting',
    drug_id: 'drug-ibuprofen-001',
    name: 'Oral Absorption Pathway',
    description: 'Standard oral absorption and systemic pharmacokinetics pathway.'
  },
  {
    id: 'pathway-amox-fasting',
    drug_id: 'drug-amoxicillin-002',
    name: 'Amoxicillin Oral Absorption Pathway',
    description: 'Rapid gastric capsule shell dissolution with saturable transcellular small intestinal absorption.'
  },
  {
    id: 'pathway-ambroxol-fasting',
    drug_id: 'drug-ambroxol-003',
    name: 'Ambroxol Syrup Secretolytic Pathway',
    description: 'Rapid liquid oral deglutition, rapid small intestinal absorption, high bronchial tissue affinity.'
  },
  {
    id: 'pathway-insulin-fasting',
    drug_id: 'drug-insulin-004',
    name: 'Subcutaneous Insulin Parenteral Pathway',
    description: 'Direct subcutaneous adipose depot dissolution, rapid capillary entry bypassing GI tract and hepatic first-pass.'
  }
];

export const SEED_PATHWAY_VARIATIONS: SeedPathwayVariation[] = [
  // Ibuprofen
  {
    id: 'pvar-ibup-before',
    pathway_id: 'pathway-ibuprofen-fasting',
    condition: 'BEFORE_FOOD',
    name: 'Oral Absorption Pathway (Fasting / Before Food)',
    description: 'Rapid gastric emptying and accelerated small intestinal passive transcellular absorption.'
  },
  {
    id: 'pvar-ibup-after',
    pathway_id: 'pathway-ibuprofen-fasting',
    condition: 'AFTER_FOOD',
    name: 'Oral Absorption Pathway (Fed State / After Food)',
    description: 'Delayed gastric emptying leading to broadened absorption window and delayed peak plasma concentration.'
  },
  // Amoxicillin
  {
    id: 'pvar-amox-before',
    pathway_id: 'pathway-amox-fasting',
    condition: 'BEFORE_FOOD',
    name: 'Amoxicillin Oral Absorption Pathway (Fasting / Before Food)',
    description: 'Rapid unhindered gastric emptying and peak uptake via proton-coupled oligopeptide transporter PEPT1.'
  },
  {
    id: 'pvar-amox-after',
    pathway_id: 'pathway-amox-fasting',
    condition: 'AFTER_FOOD',
    name: 'Amoxicillin Oral Absorption Pathway (After Food)',
    description: 'Food delays gastric emptying but total antibiotic absorption AUC remains unchanged.'
  },
  // Ambroxol Syrup
  {
    id: 'pvar-amb-before',
    pathway_id: 'pathway-ambroxol-fasting',
    condition: 'BEFORE_FOOD',
    name: 'Ambroxol Syrup Secretolytic Pathway (Fasting / Before Food)',
    description: 'Direct liquid oral deglutition without solid disintegration, leading to fast absorption.'
  },
  {
    id: 'pvar-amb-after',
    pathway_id: 'pathway-ambroxol-fasting',
    condition: 'AFTER_FOOD',
    name: 'Ambroxol Syrup Secretolytic Pathway (After Food)',
    description: 'Syrup gastric transit moderately buffered by meal, maintaining total mucolytic therapeutic efficacy.'
  },
  // Insulin
  {
    id: 'pvar-ins-before',
    pathway_id: 'pathway-insulin-fasting',
    condition: 'BEFORE_FOOD',
    name: 'Subcutaneous Insulin Parenteral Pathway (Preprandial Administration)',
    description: 'Administered 15-30 min before meals to synchronize peak circulating insulin with enteral glucose absorption.'
  },
  {
    id: 'pvar-ins-after',
    pathway_id: 'pathway-insulin-fasting',
    condition: 'AFTER_FOOD',
    name: 'Subcutaneous Insulin Parenteral Pathway (Postprandial Response)',
    description: 'Parenteral absorption profile operates independently of gastrointestinal contents, countering postprandial glycemic excursions.'
  }
];

// =========================================================================
// 2. PATHWAY NODES (All 27 Milestones across 4 drugs)
// =========================================================================

export const SEED_NODES: SeedNode[] = [
  // --- 1. Ibuprofen (7 nodes) ---
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
    camera_focus_z: 1.0
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.5
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
    camera_focus_z: 0.6
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
    camera_focus_z: 0.2
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
    camera_focus_z: 0.2
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
    camera_focus_z: 0.2
  },

  // --- 2. Amoxicillin (7 nodes) ---
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
    camera_focus_z: 1.0
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
    camera_focus_z: 1.0
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.2
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
    camera_focus_z: 0.2
  },

  // --- 3. Ambroxol Syrup (8 nodes) ---
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
    camera_focus_z: 1.0
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
    camera_focus_z: 1.0
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.9
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
    camera_focus_z: 0.6
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
    camera_focus_z: 0.2
  },

  // --- 4. Insulin (5 nodes) ---
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
    camera_focus_z: 0.5
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
    camera_focus_z: 0.8
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
    camera_focus_z: 0.5
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
    camera_focus_z: 0.6
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
    camera_focus_z: 0.2
  }
];

// =========================================================================
// 3. NODE CONTENTS (All 27 nodes)
// =========================================================================

export const SEED_CONTENTS: SeedContent[] = [
  // --- Ibuprofen (7 nodes) ---
  {
    id: 'content-oral-cavity',
    node_id: 'node-oral-cavity',
    general_description:
      'The solid ibuprofen tablet enters the oral cavity, lubricated by saliva. Minimal to zero drug dissolution occurs during this transit phase before peristaltic transport through the esophagus.',
    physiological_role:
      'Acts strictly as an intake gateway. Because ibuprofen is poorly soluble in acidic to neutral saliva and transit is rapid, mucosal absorption here contributes less than 0.1% of systemic dosage.',
    key_cellular_mechanisms: [
      'Saliva produces ~1.5 liters daily containing salivary amylase and mucins that safeguard the oral mucosa from solid tablet friction.'
    ],
    micro_environment_ph: 6.8
  },
  {
    id: 'content-stomach',
    node_id: 'node-stomach',
    general_description:
      'Gastric acid (pH 1.5-2.0) causes tablet coat disintegration. Ibuprofen remains in an un-ionized lipophilic form due to its pKa of ~4.4, limiting gastric dissolution while preparing for intestinal entry.',
    physiological_role:
      'Gastric motility governs the gastric emptying rate, which serves as the principal rate-limiting step for onset of analgesic action.',
    key_cellular_mechanisms: [
      'Taking ibuprofen after a meal delays gastric transit from 15 minutes to over an hour, flattening the plasma peak curve.'
    ],
    micro_environment_ph: 1.8
  },
  {
    id: 'content-intestine',
    node_id: 'node-small-intestine',
    general_description:
      'Elevated pH (6.0-7.4) enhances drug ionization and massive surface area provided by microvilli facilitates passive transcellular absorption across the enterocyte lipid bilayer.',
    physiological_role:
      'Over 80-90% of the active molecule permeates the systemic portal system right here through high-capacity mesenteric capillaries.',
    key_cellular_mechanisms: [
      'The intestinal villi expand the total absorbent surface area to approximately that of a standard badminton court!'
    ],
    micro_environment_ph: 6.5
  },
  {
    id: 'content-liver',
    node_id: 'node-liver',
    general_description:
      'Portal venous blood carries the absorbed drug directly into hepatic lobules. Cytochrome P450 enzymes (mainly CYP2C9) catalyze oxidation into inactive metabolites.',
    physiological_role:
      'Ibuprofen undergoes modest hepatic extraction (~15%), leaving ~85% of intact active molecule available for widespread systemic delivery.',
    key_cellular_mechanisms: [
      'Genetic polymorphism in CYP2C9 can significantly extend ibuprofen half-life in up to 5% of diverse patient demographics.'
    ],
    micro_environment_ph: 7.2
  },
  {
    id: 'content-bloodstream',
    node_id: 'node-bloodstream',
    general_description:
      'Upon emerging from hepatic veins, over 99% of circulating ibuprofen binds reversibly to human serum albumin (HSA) at designated Sudlow Site II cavities.',
    physiological_role:
      'Plasma protein binding functions as a circulating reservoir, keeping active free drug concentration balanced while preventing premature clearance.',
    key_cellular_mechanisms: [
      'Only the unbound (free) fraction (<1%) can diffuse across the vascular endothelium to reach extravascular nociceptive target sites.'
    ],
    micro_environment_ph: 7.4
  },
  {
    id: 'content-target-sites',
    node_id: 'node-target-sites',
    general_description:
      'Free ibuprofen diffuses into inflamed peripheral synovial and muscular tissues. It enters the catalytic hydrophobic channel of COX-1 and COX-2 enzymes.',
    physiological_role:
      'Competitively halts prostaglandin H2 (PGH2) synthesis, suppressing downstream PGE2 and PGI2 mediators to stop pain signaling and fever.',
    key_cellular_mechanisms: [
      'COX inhibition directly attenuates sensitization of peripheral nociceptors and resets hypothalamic thermoregulatory set-points.'
    ],
    micro_environment_ph: 7.1
  },
  {
    id: 'content-kidneys',
    node_id: 'node-kidneys',
    general_description:
      'Hydrophilic Phase I & Phase II oxidative and glucuronide metabolites enter the renal glomerulus for filtration and tubular excretion.',
    physiological_role:
      'More than 95% of the administered dose is cleared in urine as hydroxy- and carboxy-ibuprofen within 24 hours of ingestion.',
    key_cellular_mechanisms: [
      'Glomerular filtration rate (GFR) and renal blood flow determine metabolite clearance without active tubular reabsorption.'
    ],
    micro_environment_ph: 6.0
  },

  // --- Amoxicillin (7 nodes) ---
  {
    id: 'content-amox-mouth',
    node_id: 'node-amox-mouth',
    general_description:
      'The gelatin capsule containing amoxicillin trihydrate powder is swallowed whole with water, passing through the oral cavity.',
    physiological_role:
      'Acts strictly as an intake portal with negligible sublingual dissolution or mucosal absorption.',
    key_cellular_mechanisms: [
      'Mucin-rich saliva provides hydrodynamic lubrication minimizing friction along the oral mucosa.'
    ],
    micro_environment_ph: 6.8
  },
  {
    id: 'content-amox-esophagus',
    node_id: 'node-amox-esophagus',
    general_description:
      'Primary peristaltic contractions propel the capsule down the muscular tubular esophagus through the relaxed lower esophageal sphincter.',
    physiological_role:
      'Rapid transit conduit shielding the drug from premature degradation.',
    key_cellular_mechanisms: [
      'Esophageal transit of a gelatin capsule swallowed with water occurs in under 10 seconds.'
    ],
    micro_environment_ph: 7.0
  },
  {
    id: 'content-amox-stomach',
    node_id: 'node-amox-stomach',
    general_description:
      'The gelatin capsule hydrates and ruptures in the acidic gastric juice (pH 1.5–2.0), dispersing amoxicillin trihydrate powder. Unlike benzylpenicillin, the amino side chain protects the beta-lactam core from acid hydrolysis.',
    physiological_role:
      'Dissolution and gastric emptying regulator. Amoxicillin does not undergo significant gastric absorption but is prepared for downstream intestinal transit.',
    key_cellular_mechanisms: [
      'Acid stability ensures that >90% of intact active beta-lactam antibiotic reaches the small intestine unharmed.'
    ],
    micro_environment_ph: 1.8
  },
  {
    id: 'content-amox-intestine',
    node_id: 'node-amox-small-intestine',
    general_description:
      'Primary site of absorption. Amoxicillin is transported across the apical brush border membrane of duodenal and jejunal enterocytes predominantly via the proton-coupled oligopeptide transporter 1 (PEPT1 / SLC15A1) and passive transcellular diffusion.',
    physiological_role:
      'Delivers high, consistent systemic bioavailability (~75–80%) across enterocyte microvilli into the mesenteric circulation.',
    key_cellular_mechanisms: [
      'PEPT1 carrier-mediated transport is saturable at very high oral doses, but supports high bioavailability at standard clinical therapeutic dosing.'
    ],
    micro_environment_ph: 6.5
  },
  {
    id: 'content-amox-bloodstream',
    node_id: 'node-amox-bloodstream',
    general_description:
      'Absorbed amoxicillin enters systemic circulation with low plasma protein binding (only ~17–20% bound to albumin), leaving >80% as free active bactericidal antibiotic.',
    physiological_role:
      'Circulates and distributes rapidly into extracellular body fluids, middle ear effusions, sputum, tonsils, and peritoneal fluid.',
    key_cellular_mechanisms: [
      'Low plasma protein binding allows high free-drug equilibrium into target infected extravascular compartments.'
    ],
    micro_environment_ph: 7.4
  },
  {
    id: 'content-amox-infected-tissues',
    node_id: 'node-amox-infected-tissues',
    general_description:
      'Free amoxicillin diffuses into bacterial infection foci and covalently acylates the active site serine of Penicillin-Binding Proteins (PBP-1A, 1B, 2, 3), inhibiting transpeptidation during peptidoglycan cell wall synthesis.',
    physiological_role:
      'Bactericidal cell wall disruption. Loss of peptidoglycan structural integrity causes osmotic cell lysis and autolytic bacterial death in susceptible pathogens.',
    key_cellular_mechanisms: [
      'Efficacy is time-dependent (T > MIC): antimicrobial effect depends on the duration that free serum concentrations remain above the pathogen minimum inhibitory concentration.'
    ],
    micro_environment_ph: 7.35
  },
  {
    id: 'content-amox-kidneys',
    node_id: 'node-amox-kidneys',
    general_description:
      'Amoxicillin is predominantly cleared by renal mechanisms: approximately 60%–70% of the active dose is excreted unchanged in urine within 6 hours by glomerular filtration and active organic anion tubular secretion (OAT3).',
    physiological_role:
      'Renal elimination yields high therapeutic concentrations in urine while maintaining a short systemic elimination half-life (~1.0–1.2 hours).',
    key_cellular_mechanisms: [
      'Coadministration with probenecid competitively blocks OAT3 renal tubular secretion, significantly elevating amoxicillin peak and sustaining plasma levels.'
    ],
    micro_environment_ph: 6.0
  },

  // --- Ambroxol Syrup (8 nodes) ---
  {
    id: 'content-amb-mouth',
    node_id: 'node-amb-mouth',
    general_description:
      'Oral administration of aromatic viscous syrup containing dissolved ambroxol hydrochloride. The liquid vehicle coats and soothes irritated pharyngeal mucosa immediately upon deglutition.',
    physiological_role:
      'Ingestion gateway providing demulcent soothing and instant liquid swallowing without solid tablet disintegration latency.',
    key_cellular_mechanisms: [
      'Liquid formulations require zero dissolution latency, facilitating prompt gastric transfer.'
    ],
    micro_environment_ph: 6.8
  },
  {
    id: 'content-amb-esophagus',
    node_id: 'node-amb-esophagus',
    general_description:
      'Rapid gravity- and peristalsis-driven transit through the esophagus into the cardiac orifice of the stomach in under 5 seconds.',
    physiological_role:
      'Unimpeded liquid transfer conduit.',
    key_cellular_mechanisms: [
      'Liquid bolus dynamics minimize esophageal mucosal residence time.'
    ],
    micro_environment_ph: 7.0
  },
  {
    id: 'content-amb-stomach',
    node_id: 'node-amb-stomach',
    general_description:
      'Because ambroxol is pre-dissolved in the syrup vehicle, it does not require disintegrative dissolution and passes rapidly through the gastric antrum and pyloric sphincter.',
    physiological_role:
      'Facilitates rapid gastric emptying compared to solid dosage forms, shortening the onset of therapeutic absorption.',
    key_cellular_mechanisms: [
      'Liquid gastric emptying half-life is substantially shorter than solid food or compact tablets.'
    ],
    micro_environment_ph: 2.0
  },
  {
    id: 'content-amb-intestine',
    node_id: 'node-amb-small-intestine',
    general_description:
      'Ambroxol is rapidly and almost completely absorbed across the duodenal and jejunal mucosal epithelium via passive transcellular diffusion into mesenteric capillaries.',
    physiological_role:
      'Achieves systemic bioavailability of ~79% (attenuated primarily by hepatic first-pass metabolism).',
    key_cellular_mechanisms: [
      'Lipophilic basic properties (pKa ~8.0) favor mucosal permeation across enteric enterocyte membranes.'
    ],
    micro_environment_ph: 6.8
  },
  {
    id: 'content-amb-bloodstream',
    node_id: 'node-amb-bloodstream',
    general_description:
      'Circulates in plasma with ~90% binding to serum proteins. Displays a large volume of distribution (~552 L) indicating extensive extravascular tissue distribution.',
    physiological_role:
      'Circulatory distribution carrier delivering molecule with selective affinity into pulmonary and respiratory tissues.',
    key_cellular_mechanisms: [
      'Extensive tissue distribution maintains steady plasma-to-tissue concentration equilibria.'
    ],
    micro_environment_ph: 7.4
  },
  {
    id: 'content-amb-respiratory-tissues',
    node_id: 'node-amb-respiratory-tissues',
    general_description:
      'Ambroxol concentrates selectively in bronchial mucosa and lung parenchyma (tissue-to-serum concentration ratio reaching up to 15:1 to 20:1). It stimulates alveolar type II pneumocytes to synthesize and secrete pulmonary surfactant.',
    physiological_role:
      'Decreases mucus viscosity, stimulates ciliary beat frequency, improves mucociliary clearance, and relieves productive cough.',
    key_cellular_mechanisms: [
      'Pulmonary surfactant secretion reduces alveolar surface tension and prevents mucus adhesion to bronchial walls.'
    ],
    micro_environment_ph: 7.2
  },
  {
    id: 'content-amb-liver',
    node_id: 'node-amb-liver',
    general_description:
      'Undergoes hepatic metabolism via glucuronidation and CYP3A4-mediated oxidation into dibromoanthranilic acid and glucuronide conjugates (~30% first-pass effect).',
    physiological_role:
      'Converts lipophilic parent molecule into inactive water-soluble polar metabolites for subsequent excretory clearance.',
    key_cellular_mechanisms: [
      'Hepatic CYP3A4 and glucuronyltransferase systems mediate primary metabolic transformation.'
    ],
    micro_environment_ph: 7.2
  },
  {
    id: 'content-amb-kidneys',
    node_id: 'node-amb-kidneys',
    general_description:
      'Approximately 83% of the administered dose is excreted in urine, predominantly as glucuronides and polar metabolites (with ~10% excreted as parent drug).',
    physiological_role:
      'Renal elimination with a terminal elimination half-life of ~10 hours.',
    key_cellular_mechanisms: [
      'Glomerular filtration and tubular excretion mediate steady renal elimination over 24–48 hours.'
    ],
    micro_environment_ph: 6.0
  },

  // --- Insulin (5 nodes) ---
  {
    id: 'content-ins-site',
    node_id: 'node-ins-injection-site',
    general_description:
      'Injected subcutaneously into abdominal or thigh adipose tissue. Self-associated zinc-insulin hexamers in pharmaceutical solution slowly dissociate into dimers and absorbable monomers within the interstitial interstitial fluid.',
    physiological_role:
      'Parenteral subcutaneous depot that completely bypasses the gastrointestinal tract and stomach acid, preventing peptidase degradation.',
    key_cellular_mechanisms: [
      'Zinc-insulin hexamer dissociation into monomeric insulin is the principal rate-limiting step governing subcutaneous absorption kinetics.'
    ],
    micro_environment_ph: 7.35
  },
  {
    id: 'content-ins-bloodstream',
    node_id: 'node-ins-bloodstream',
    general_description:
      'Monomeric insulin diffuses across capillary endothelial fenestrations directly into systemic venous circulation, completely bypassing the portal first-pass hepatic extraction that occurs with endogenous pancreatic insulin.',
    physiological_role:
      'Rapid systemic delivery. Circulates as an unbound active peptide monomer with a short biological half-life of ~5–10 minutes.',
    key_cellular_mechanisms: [
      'Unbound monomeric insulin rapidly equilibriums with peripheral interstitial fluid to engage target cell-surface receptors.'
    ],
    micro_environment_ph: 7.4
  },
  {
    id: 'content-ins-tissues',
    node_id: 'node-ins-body-tissues',
    general_description:
      'Binds with high affinity to alpha subunits of cell-surface insulin receptors (tyrosine kinase), activating beta-subunit autophosphorylation and the PI3K-Akt cascade to mobilize GLUT4 glucose transporter vesicles to the plasma membrane.',
    physiological_role:
      'Drives cellular glucose uptake into skeletal muscle and adipose tissue, stimulating glycogen synthesis and lipogenesis while halting catabolic proteolysis.',
    key_cellular_mechanisms: [
      'GLUT4 translocation increases cellular glucose clearance from circulation up to 20- to 30-fold within target tissues.'
    ],
    micro_environment_ph: 7.35
  },
  {
    id: 'content-ins-liver',
    node_id: 'node-ins-liver',
    general_description:
      'Binds hepatic insulin receptors, suppressing gluconeogenesis and glycogenolysis while promoting glycogen storage. Approximately 50% of circulating insulin is bound, internalized, and degraded by hepatic insulin-degrading enzyme (IDE).',
    physiological_role:
      'Suppresses endogenous hepatic glucose output to basal levels and accounts for approximately half of systemic hormone degradation.',
    key_cellular_mechanisms: [
      'Receptor-mediated endocytosis followed by lysosomal and IDE degradation clears active hormone from circulation.'
    ],
    micro_environment_ph: 7.2
  },
  {
    id: 'content-ins-kidneys',
    node_id: 'node-ins-kidneys',
    general_description:
      'Insulin is filtered freely at the renal glomerulus and reabsorbed in the proximal convoluted tubules via receptor-mediated endocytosis, where it is degraded into amino acids. Less than 1% is excreted intact.',
    physiological_role:
      'Renal tubular catabolism accounts for ~30–40% of systemic insulin clearance.',
    key_cellular_mechanisms: [
      'Severe renal impairment diminishes tubular degradation, prolonging insulin half-life and increasing hypoglycemia risk.'
    ],
    micro_environment_ph: 6.0
  }
];

// =========================================================================
// 4. NODE VARIATIONS (54 variations across 27 nodes)
// =========================================================================

export const SEED_NODE_VARIATIONS: SeedNodeVariation[] = [
  // --- Ibuprofen (7 nodes x 2 conditions = 14) ---
  {
    id: 'var-oral-cavity-before',
    node_id: 'node-oral-cavity',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Standard rapid bolus transit through the esophagus (5 - 10 sec).',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-oral-cavity-after',
    node_id: 'node-oral-cavity',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Bolus swallow accompanied by meal contents, transit remains under 15 seconds.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-stomach-before',
    node_id: 'node-stomach',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid unhindered gastric emptying (~15 min) directly into the duodenum.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-stomach-after',
    node_id: 'node-stomach',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 300,
    absorption_modifier_pct: 0,
    clinical_observation: 'Food content delays gastric emptying from 15 minutes to over an hour, holding the drug in the stomach and flattening the plasma concentration peak curve.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-intestine-before',
    node_id: 'node-small-intestine',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Peak absorption occurs within 30-45 minutes resulting in sharp rise to Tmax.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-intestine-after',
    node_id: 'node-small-intestine',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 25,
    absorption_modifier_pct: -5,
    clinical_observation: 'Total bioavailability (AUC) remains preserved (~88%), but the rate of absorption is slowed, delaying Tmax to 2.5–3.0 hours while reducing gastric irritation.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-liver-before',
    node_id: 'node-liver',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'CYP2C9 oxidation and chiral inversion occur during initial portal transit.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-liver-after',
    node_id: 'node-liver',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Hepatic first-pass conversion remains unperturbed with standard fed state enzyme kinetics.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-bloodstream-before',
    node_id: 'node-bloodstream',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Sharp plasma concentration rise reaches Cmax (25 ug/mL) in ~45 minutes.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-bloodstream-after',
    node_id: 'node-bloodstream',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Plasma concentration curve demonstrates reduced Cmax with a broader, more gradual therapeutic plateau.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-target-before',
    node_id: 'node-target-sites',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Analgesic onset observed within 20 to 30 minutes in fasting conditions.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-target-after',
    node_id: 'node-target-sites',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Analgesic onset is delayed by ~1 hour due to broadened absorption, but therapeutic duration is sustained.',
    notes: '[Reference: FDA Motrin NDA 017463; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-kidneys-before',
    node_id: 'node-kidneys',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Elimination half-life averages ~2 hours, with rapid metabolite excretion.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-kidneys-after',
    node_id: 'node-kidneys',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Renal clearance of metabolites proceeds steadily over normal 24-hour excretory cycle.',
    notes: '[Reference: Davies NM, Clin Pharmacokinet 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },

  // --- Amoxicillin (7 nodes x 2 conditions = 14) ---
  {
    id: 'var-amox-mouth-before',
    node_id: 'node-amox-mouth',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Quick esophageal transit.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-mouth-after',
    node_id: 'node-amox-mouth',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Swallowed with meal bolus without oral disintegration.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-esophagus-before',
    node_id: 'node-amox-esophagus',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Direct bolus transit in <10 seconds.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-esophagus-after',
    node_id: 'node-amox-esophagus',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Unimpeded peristaltic transit into stomach.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-stomach-before',
    node_id: 'node-amox-stomach',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid unhindered gastric emptying (~20 min).',
    notes: '[Reference: Westphal et al., Clin Pharmacokinet 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-stomach-after',
    node_id: 'node-amox-stomach',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 150,
    absorption_modifier_pct: 0,
    clinical_observation: 'Food presence delays gastric emptying rate (~50 min) without reducing total antibiotic absorption extent (AUC).',
    notes: '[Reference: Westphal et al., Clin Pharmacokinet 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-intestine-before',
    node_id: 'node-amox-small-intestine',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid uptake via proton-coupled oligopeptide transporter PEPT1.',
    notes: '[Reference: Bretschneider et al., J Med Chem 1999; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-intestine-after',
    node_id: 'node-amox-small-intestine',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 20,
    absorption_modifier_pct: 0,
    clinical_observation: 'Total bioavailability (AUC) remains ~75–80%, but absorption rate is slowed.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-bloodstream-before',
    node_id: 'node-amox-bloodstream',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Peak serum level ~8.5 ug/mL achieved at 1.0–1.5 hours.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-bloodstream-after',
    node_id: 'node-amox-bloodstream',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Tmax delayed to ~1.8 hours with lower, broader peak plateau.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-infected-before',
    node_id: 'node-amox-infected-tissues',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Time-dependent killing: efficacy correlates with time above minimum inhibitory concentration (T > MIC).',
    notes: '[Reference: Goodman & Gilman 14th Ed; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-infected-after',
    node_id: 'node-amox-infected-tissues',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Broader plasma curve sustains effective tissue concentrations over dosing interval.',
    notes: '[Reference: Goodman & Gilman 14th Ed; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-kidneys-before',
    node_id: 'node-amox-kidneys',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid renal elimination; clearance can be prolonged competitively with probenecid.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amox-kidneys-after',
    node_id: 'node-amox-kidneys',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Renal clearance proceeds normally over 6–8 hour elimination window.',
    notes: '[Reference: FDA Amoxil Label NDA 050542; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },

  // --- Ambroxol Syrup (8 nodes x 2 conditions = 16) ---
  {
    id: 'var-amb-mouth-before',
    node_id: 'node-amb-mouth',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Instant swallow without tablet disintegration requirement.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-mouth-after',
    node_id: 'node-amb-mouth',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Syrup passes smoothly following meal intake.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-esophagus-before',
    node_id: 'node-amb-esophagus',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid gravity-assisted flow into stomach.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-esophagus-after',
    node_id: 'node-amb-esophagus',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Smooth liquid transit into gastric fundus.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-stomach-before',
    node_id: 'node-amb-stomach',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Liquid empties substantially faster than solid tablets (~10 min).',
    notes: '[Reference: Malerba & Ragnoli, Expert Opin Drug Metab Toxicol 2008; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-stomach-after',
    node_id: 'node-amb-stomach',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 100,
    absorption_modifier_pct: 0,
    clinical_observation: 'Gastric emptying moderately buffered by meal (~20 min), reducing any potential gastric intolerance.',
    notes: '[Reference: Malerba & Ragnoli, Expert Opin Drug Metab Toxicol 2008; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-intestine-before',
    node_id: 'node-amb-small-intestine',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Peak therapeutic plasma concentration onset.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-intestine-after',
    node_id: 'node-amb-small-intestine',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 15,
    absorption_modifier_pct: 0,
    clinical_observation: 'Intestinal absorption proceeds completely with preserved ~79% bioavailability.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-bloodstream-before',
    node_id: 'node-amb-bloodstream',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid tissue partition coefficient from blood into lungs.',
    notes: '[Reference: Malerba & Ragnoli, Expert Opin Drug Metab Toxicol 2008; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-bloodstream-after',
    node_id: 'node-amb-bloodstream',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Steady plasma distribution with prolonged respiratory delivery.',
    notes: '[Reference: Malerba & Ragnoli, Expert Opin Drug Metab Toxicol 2008; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-respiratory-before',
    node_id: 'node-amb-respiratory-tissues',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Pulmonary concentration is up to 15 times higher than blood serum.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-respiratory-after',
    node_id: 'node-amb-respiratory-tissues',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Effective bronchial concentration maintained across the full therapeutic cycle.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-liver-before',
    node_id: 'node-amb-liver',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Clean conversion into excretable polar metabolites via glucuronidation and CYP3A4.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-liver-after',
    node_id: 'node-amb-liver',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Hepatic metabolism remains consistent with standard first-pass extraction.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-kidneys-before',
    node_id: 'node-amb-kidneys',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Safe urinary excretion over 24 hours (~10 hr elimination half-life).',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-amb-kidneys-after',
    node_id: 'node-amb-kidneys',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Metabolites excreted primarily as glucuronides in urine.',
    notes: '[Reference: EMA SmPC Mucosolvan; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },

  // --- Insulin (5 nodes x 2 conditions = 10) ---
  {
    id: 'var-ins-site-before',
    node_id: 'node-ins-injection-site',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Administered 15-30 min before meals to synchronize peak insulin with postprandial glucose surge.',
    notes: '[Reference: Kang et al., Diabetes Care 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-site-after',
    node_id: 'node-ins-injection-site',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Subcutaneous absorption proceeds independently of gastrointestinal contents.',
    notes: '[Reference: Kang et al., Diabetes Care 1991; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-blood-before',
    node_id: 'node-ins-bloodstream',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Rapid rise in circulating plasma insulin peaking at ~30–60 minutes.',
    notes: '[Reference: Goodman & Gilman 14th Ed; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-blood-after',
    node_id: 'node-ins-bloodstream',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Circulating insulin rapidly clears postprandial glucose from blood.',
    notes: '[Reference: Goodman & Gilman 14th Ed; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-tissues-before',
    node_id: 'node-ins-body-tissues',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Prompt reduction in systemic blood glucose levels via GLUT4 translocation.',
    notes: '[Reference: Saltiel & Kahn, Nature 2001; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-tissues-after',
    node_id: 'node-ins-body-tissues',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Suppresses postprandial hyperglycemia and facilitates cellular energy storage.',
    notes: '[Reference: Saltiel & Kahn, Nature 2001; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-liver-before',
    node_id: 'node-ins-liver',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Immediate downregulation of endogenous hepatic glucose output.',
    notes: '[Reference: Duckworth et al., Endocr Rev 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-liver-after',
    node_id: 'node-ins-liver',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Stimulates glycogen synthase and blocks glycogenolysis and gluconeogenesis.',
    notes: '[Reference: Duckworth et al., Endocr Rev 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-kidneys-before',
    node_id: 'node-ins-kidneys',
    condition: 'BEFORE_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Renal proximal tubular catabolism accounts for ~30–40% of systemic clearance.',
    notes: '[Reference: Duckworth et al., Endocr Rev 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  },
  {
    id: 'var-ins-kidneys-after',
    node_id: 'node-ins-kidneys',
    condition: 'AFTER_FOOD',
    transit_time_modifier_pct: 0,
    absorption_modifier_pct: 0,
    clinical_observation: 'Renal impairment significantly prolongs insulin half-life, requiring dose titration.',
    notes: '[Reference: Duckworth et al., Endocr Rev 1998; review_status: FLAGGED_FOR_SCIENTIFIC_REVIEW]'
  }
];

// =========================================================================
// 5. PATHWAY EDGES (All 23 Directed Edges across 4 drugs)
// =========================================================================

export const SEED_EDGES: SeedEdge[] = [
  // --- Ibuprofen (6 edges) ---
  {
    id: 'edge-1-2',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-oral-cavity',
    to_node_id: 'node-stomach',
    transition_description: 'Esophageal deglutition peristalsis',
    transition_duration_minutes: 0.1
  },
  {
    id: 'edge-2-3',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-stomach',
    to_node_id: 'node-small-intestine',
    transition_description: 'Pyloric sphincter gastroduodenal transfer',
    transition_duration_minutes: 5.0
  },
  {
    id: 'edge-3-4',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-small-intestine',
    to_node_id: 'node-liver',
    transition_description: 'Mesenteric venous drainage into portal vein',
    transition_duration_minutes: 10.0
  },
  {
    id: 'edge-4-5',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-liver',
    to_node_id: 'node-bloodstream',
    transition_description: 'Hepatic vein drainage into inferior vena cava',
    transition_duration_minutes: 15.0
  },
  {
    id: 'edge-5-6',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-bloodstream',
    to_node_id: 'node-target-sites',
    transition_description: 'Arterial perfusion of peripheral inflamed tissues',
    transition_duration_minutes: 20.0
  },
  {
    id: 'edge-6-7',
    pathway_id: 'pathway-ibuprofen-fasting',
    from_node_id: 'node-target-sites',
    to_node_id: 'node-kidneys',
    transition_description: 'Systemic venous return and renal arterial filtration',
    transition_duration_minutes: 60.0
  },

  // --- Amoxicillin (6 edges) ---
  {
    id: 'edge-amox-1-2',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-mouth',
    to_node_id: 'node-amox-esophagus',
    transition_description: 'Oral deglutition through oropharynx',
    transition_duration_minutes: 0.1
  },
  {
    id: 'edge-amox-2-3',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-esophagus',
    to_node_id: 'node-amox-stomach',
    transition_description: 'Lower esophageal sphincter transit into stomach',
    transition_duration_minutes: 0.2
  },
  {
    id: 'edge-amox-3-4',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-stomach',
    to_node_id: 'node-amox-small-intestine',
    transition_description: 'Gastric chyme transfer via pyloric sphincter',
    transition_duration_minutes: 5.0
  },
  {
    id: 'edge-amox-4-5',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-small-intestine',
    to_node_id: 'node-amox-bloodstream',
    transition_description: 'Enteral PEPT1 and transcellular uptake into mesenteric venules',
    transition_duration_minutes: 10.0
  },
  {
    id: 'edge-amox-5-6',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-bloodstream',
    to_node_id: 'node-amox-infected-tissues',
    transition_description: 'Systemic capillary extravasation into infection foci',
    transition_duration_minutes: 15.0
  },
  {
    id: 'edge-amox-6-7',
    pathway_id: 'pathway-amox-fasting',
    from_node_id: 'node-amox-infected-tissues',
    to_node_id: 'node-amox-kidneys',
    transition_description: 'Venous return and renal arterial delivery',
    transition_duration_minutes: 60.0
  },

  // --- Ambroxol Syrup (7 edges) ---
  {
    id: 'edge-amb-1-2',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-mouth',
    to_node_id: 'node-amb-esophagus',
    transition_description: 'Liquid swallowing through pharyngeal mucosa',
    transition_duration_minutes: 0.1
  },
  {
    id: 'edge-amb-2-3',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-esophagus',
    to_node_id: 'node-amb-stomach',
    transition_description: 'Gravity-assisted flow into stomach',
    transition_duration_minutes: 0.1
  },
  {
    id: 'edge-amb-3-4',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-stomach',
    to_node_id: 'node-amb-small-intestine',
    transition_description: 'Rapid liquid gastric emptying into duodenum',
    transition_duration_minutes: 5.0
  },
  {
    id: 'edge-amb-4-5',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-small-intestine',
    to_node_id: 'node-amb-bloodstream',
    transition_description: 'Passive transcellular absorption into portal and systemic circulation',
    transition_duration_minutes: 10.0
  },
  {
    id: 'edge-amb-5-6',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-bloodstream',
    to_node_id: 'node-amb-respiratory-tissues',
    transition_description: 'High-affinity pulmonary tissue partitioning',
    transition_duration_minutes: 15.0
  },
  {
    id: 'edge-amb-6-7',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-respiratory-tissues',
    to_node_id: 'node-amb-liver',
    transition_description: 'Systemic circulation delivery to hepatic lobules',
    transition_duration_minutes: 30.0
  },
  {
    id: 'edge-amb-7-8',
    pathway_id: 'pathway-ambroxol-fasting',
    from_node_id: 'node-amb-liver',
    to_node_id: 'node-amb-kidneys',
    transition_description: 'Renal arterial transport of glucuronide and polar metabolites',
    transition_duration_minutes: 60.0
  },

  // --- Insulin (4 edges) ---
  {
    id: 'edge-ins-1-2',
    pathway_id: 'pathway-insulin-fasting',
    from_node_id: 'node-ins-injection-site',
    to_node_id: 'node-ins-bloodstream',
    transition_description: 'Subcutaneous capillary entry bypassing GI tract and hepatic first pass',
    transition_duration_minutes: 5.0
  },
  {
    id: 'edge-ins-2-3',
    pathway_id: 'pathway-insulin-fasting',
    from_node_id: 'node-ins-bloodstream',
    to_node_id: 'node-ins-body-tissues',
    transition_description: 'Microvascular capillary diffusion to skeletal muscle and adipose tissue',
    transition_duration_minutes: 10.0
  },
  {
    id: 'edge-ins-3-4',
    pathway_id: 'pathway-insulin-fasting',
    from_node_id: 'node-ins-body-tissues',
    to_node_id: 'node-ins-liver',
    transition_description: 'Hepatic artery delivery to liver insulin receptors and IDE clearance',
    transition_duration_minutes: 10.0
  },
  {
    id: 'edge-ins-4-5',
    pathway_id: 'pathway-insulin-fasting',
    from_node_id: 'node-ins-liver',
    to_node_id: 'node-ins-kidneys',
    transition_description: 'Renal filtration and proximal tubular degradation',
    transition_duration_minutes: 15.0
  }
];

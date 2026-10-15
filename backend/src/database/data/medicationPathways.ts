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

export interface DefinedTerm {
  term: string;
  definition: string;
}

export interface SeedContent {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_takeaway: string;
  key_cellular_mechanisms: string[];
  defined_terms: DefinedTerm[];
  micro_environment_ph?: number;
  references_list: string[];
  review_status: string;
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
  // =========================================================================
  // --- 1. Ibuprofen (7 nodes) ---
  // =========================================================================
  {
    id: 'content-oral-cavity',
    node_id: 'node-oral-cavity',
    general_description:
      'You swallow the solid ibuprofen tablet with water. Saliva moistens the tablet to help it glide smoothly down the throat into the esophagus. Because it moves so quickly through the mouth, virtually none of the medicine dissolves or enters your bloodstream here.',
    physiological_role:
      'Acts strictly as the intake gateway for oral solid dosage forms. Saliva (pH 6.8) lubricates the tablet surface for deglutition. Because ibuprofen is poorly soluble at neutral or acidic pH and transit takes under 10 seconds, buccal mucosal absorption contributes less than 0.1% of systemic dosage.',
    key_takeaway:
      'The mouth acts purely as an intake doorway; the tablet passes through quickly without dissolving.',
    key_cellular_mechanisms: [
      'Salivary glands produce serous and mucinous secretions containing mucin glycoproteins that cushion mucosal surfaces against tablet friction.',
      'Neutral saliva (pH ~6.8) keeps ibuprofen in an un-ionized, low-solubility state, preventing premature dissolution during swallowing.'
    ],
    defined_terms: [
      {
        term: 'Deglutition',
        definition: 'The medical term for the coordinated muscular process of swallowing food or medicine from the mouth into the esophagus.'
      },
      {
        term: 'Buccal Absorption',
        definition: 'The direct uptake of a drug across the inner cheek lining into nearby blood vessels.'
      }
    ],
    micro_environment_ph: 6.8,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen: The First 30 Years. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948. DOI: 10.2165/00003088-199834020-00002',
      'FDA NDA 017463 (Motrin / Ibuprofen Oral Tablets Prescribing Information).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-stomach',
    node_id: 'node-stomach',
    general_description:
      'In the stomach, strong gastric acid breaks apart the tablet outer binders, turning it into tiny particles. Because ibuprofen is a weak acid itself, it does not dissolve easily in stomach fluid, protecting the stomach lining temporarily while preparing the medicine to enter the intestine.',
    physiological_role:
      'Strong hydrochloric acid (pH 1.5–2.0) breaks down tablet excipients. Because ibuprofen has a pKa of approximately 4.4, it remains largely non-ionized and insoluble in gastric juice. Gastric motility and pyloric emptying govern the transit rate into the duodenum, acting as the primary physiological regulator of how quickly pain relief begins.',
    key_takeaway:
      'Stomach acid breaks the tablet into small particles, but the medicine does not dissolve significantly until it reaches the intestine.',
    key_cellular_mechanisms: [
      'Gastric parietal cells secrete hydrochloric acid via H+/K+ ATPase pumps, establishing a low pH of 1.5–2.0.',
      'At pH 1.8, over 99% of ibuprofen molecules exist in their non-ionized, lipophilic form, limiting gastric fluid dissolution.'
    ],
    defined_terms: [
      {
        term: 'pKa',
        definition: 'The pH level at which exactly half of a drug is ionized (electrically charged) and half is non-ionized (neutral). For weak acids like ibuprofen, lower pH means less ionization.'
      },
      {
        term: 'Gastric Emptying',
        definition: 'The rate at which the muscular stomach pumps digested liquid and medicine particles through the pyloric valve into the small intestine.'
      }
    ],
    micro_environment_ph: 1.8,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948',
      'FDA NDA 017463 (Motrin Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-intestine',
    node_id: 'node-small-intestine',
    general_description:
      'The small intestine is where the magic happens for absorption. In this gentler environment, ibuprofen dissolves completely. The vast, folded surface of the intestinal wall rapidly absorbs over 85% of the medicine into small blood vessels, sending it straight toward the liver.',
    physiological_role:
      'In the duodenum and jejunum, intestinal secretions raise the luminal pH to 6.0–7.0, accelerating drug dissolution. Enterocyte microvilli provide a massive absorptive surface area (~30 square meters). Ibuprofen permeates the lipid bilayer via passive transcellular diffusion, delivering 85% to 90% oral bioavailability into mesenteric venules.',
    key_takeaway:
      'The small intestine absorbs over 85% of the dissolved ibuprofen into the bloodstream through passive diffusion.',
    key_cellular_mechanisms: [
      'Pancreatic bicarbonate secretion elevates luminal pH to ~6.5, promoting drug ionization and dissolution.',
      'Passive transcellular permeation: Lipophilic drug molecules diffuse across apical enterocyte membranes into the mesenteric capillary network.'
    ],
    defined_terms: [
      {
        term: 'Bioavailability',
        definition: 'The fraction (or percentage) of an administered dose of unchanged drug that successfully reaches systemic circulation.'
      },
      {
        term: 'Enterocytes',
        definition: 'The specialized absorptive epithelial cells that line the inner surface of the small intestine.'
      },
      {
        term: 'Passive Transcellular Diffusion',
        definition: 'The movement of drug molecules directly through the fatty membranes of cells from high concentration to low concentration without using cellular energy.'
      }
    ],
    micro_environment_ph: 6.5,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948',
      'FDA NDA 017463 (Motrin Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-liver',
    node_id: 'node-liver',
    general_description:
      'Blood from the gut carries the medicine directly to the liver. Here, specialized liver enzymes convert inactive shapes of ibuprofen molecules into the active pain-fighting shape, while filtering out about 15% before sending the rest to your body.',
    physiological_role:
      'First-pass hepatic metabolism. Cytochrome P450 enzymes (predominantly CYP2C9, with secondary CYP2C8) oxidize ~15% of the absorbed dose into inactive hydroxy- and carboxy-ibuprofen. In addition, hepatic 2-arylpropionyl-CoA epimerase unidirectionally converts roughly 53% to 65% of the inactive (R)-enantiomer into the pharmacologically active (S)-enantiomer.',
    key_takeaway:
      'The liver acts as a chemical conversion center, flipping inactive drug shapes into the active pain-relieving form.',
    key_cellular_mechanisms: [
      'Chiral Inversion: Inactive (R)-ibuprofen is converted to (R)-ibuprofenyl-CoA, epimerized to (S)-ibuprofenyl-CoA, and hydrolyzed to active (S)-ibuprofen.',
      'Phase I Oxidation: Microsomal CYP2C9 enzymes oxidize the alkyl side chains to form 2-hydroxyibuprofen and 2-carboxyibuprofen.'
    ],
    defined_terms: [
      {
        term: 'Chiral Inversion',
        definition: 'A biological process in which the body converts a mirror-image molecule (an inactive stereoisomer) into its active therapeutic counterpart.'
      },
      {
        term: 'CYP2C9',
        definition: 'A major liver enzyme of the Cytochrome P450 family responsible for breaking down NSAIDs and blood thinners.'
      },
      {
        term: 'First-Pass Metabolism',
        definition: 'The initial filtering and chemical breakdown of an orally absorbed drug in the liver before it ever circulates to the rest of the body.'
      }
    ],
    micro_environment_ph: 7.2,
    references_list: [
      'Hao H, Wang G, Sun J. Enantioselective pharmacokinetics of ibuprofen and its chiral inversion. Curr Drug Metab. 2005;6(3):215-226. PMID: 15975052. DOI: 10.2174/1367556054064977',
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-bloodstream',
    node_id: 'node-bloodstream',
    general_description:
      'Once in the bloodstream, over 99% of ibuprofen hitches a ride on blood proteins (albumin). This protects the drug and acts like a steady supply tank, releasing small amounts of free medicine over two hours to travel into painful or inflamed tissues.',
    physiological_role:
      'Over 99% of circulating ibuprofen binds reversibly to human serum albumin (HSA) at Sudlow Site II cavities. This high protein binding confines the drug volume of distribution to approximately 0.1 to 0.2 L/kg. Only the small unbound free fraction (<1%) can diffuse across capillary walls into inflamed target tissues to inhibit pain enzymes.',
    key_takeaway:
      'More than 99% of ibuprofen rides on blood proteins, creating a traveling reservoir that steadily feeds inflamed tissues for about 2 hours.',
    key_cellular_mechanisms: [
      'Hydrophobic and electrostatic interactions anchor the carboxylate group of ibuprofen inside Sudlow Site II on human serum albumin.',
      'Dynamic equilibrium: As free drug diffuses out of capillaries into tissues, albumin releases bound molecules to maintain constant free-drug levels.'
    ],
    defined_terms: [
      {
        term: 'Human Serum Albumin (HSA)',
        definition: 'The most abundant protein in human blood plasma, responsible for maintaining fluid balance and ferrying fatty acids and medications.'
      },
      {
        term: 'Free Fraction',
        definition: 'The unbound portion of a drug in the blood that is biologically active and free to cross into tissues.'
      }
    ],
    micro_environment_ph: 7.4,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948',
      'FDA NDA 017463 (Motrin Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-target-sites',
    node_id: 'node-target-sites',
    general_description:
      'Free ibuprofen leaves blood vessels and enters painful, injured areas. It turns off the body’s pain alarm switches (called COX enzymes), stopping the production of chemicals that cause throbbing pain, swelling, and fever.',
    physiological_role:
      'Free ibuprofen diffuses into inflamed peripheral synovial fluid and muscular tissues. It enters the catalytic hydrophobic channel of cyclooxygenase-1 (COX-1) and cyclooxygenase-2 (COX-2) enzymes. By competing with arachidonic acid, it blocks prostaglandin H2 (PGH2) synthesis, suppressing downstream prostaglandin E2 (PGE2) to relieve pain and reset hypothalamic fever centers.',
    key_takeaway:
      'Ibuprofen stops pain and reduces fever by blocking the COX enzymes that manufacture inflammatory prostaglandins.',
    key_cellular_mechanisms: [
      'Competitive reversible binding within the COX catalytic pocket blocks the binding of arachidonic acid.',
      'Reduction of PGE2 production lowers the sensitivity of peripheral pain nerve endings (nociceptors) to mechanical and chemical stimulation.'
    ],
    defined_terms: [
      {
        term: 'Cyclooxygenase (COX-1 and COX-2)',
        definition: 'Enzymes that manufacture prostaglandins. COX-1 maintains stomach protection and kidney blood flow, while COX-2 is triggered during injury and inflammation.'
      },
      {
        term: 'Prostaglandins',
        definition: 'Hormone-like chemical messengers produced at injury sites that trigger inflammation, swelling, pain sensations, and fever.'
      },
      {
        term: 'Nociceptors',
        definition: 'Sensory nerve receptors that detect tissue damage and send pain signals to the spinal cord and brain.'
      }
    ],
    micro_environment_ph: 7.1,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948',
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 34: Nonsteroidal Anti-Inflammatory Drugs).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-kidneys',
    node_id: 'node-kidneys',
    general_description:
      'After the medicine has finished its job, the kidneys filter the broken-down pieces out of your blood and wash them away in your urine within 24 hours.',
    physiological_role:
      'Hydrophilic Phase I (hydroxy- and carboxy-ibuprofen) and Phase II glucuronide conjugates are filtered at the renal glomerulus. Over 95% of the administered dose is excreted into the urine within 24 hours of ingestion, with less than 1% excreted as unchanged active ibuprofen.',
    key_takeaway:
      'The kidneys filter out metabolized ibuprofen, safely excreting more than 95% of the dose in urine within 24 hours.',
    key_cellular_mechanisms: [
      'Glomerular filtration: Water-soluble metabolites pass across the renal filtration barrier into Bowman’s capsule.',
      'Absence of tubular reabsorption: Polar carboxylate and glucuronide metabolites remain trapped in the tubular lumen for urinary excretion.'
    ],
    defined_terms: [
      {
        term: 'Glomerular Filtration',
        definition: 'The initial filtering process in the kidneys where water and dissolved waste particles are strained out of blood capillaries into kidney tubules.'
      },
      {
        term: 'Glucuronide Conjugate',
        definition: 'A drug molecule bound to glucuronic acid by the liver, making it highly water-soluble so the kidneys can excrete it rapidly.'
      }
    ],
    micro_environment_ph: 6.0,
    references_list: [
      'Davies NM. Clinical Pharmacokinetics of Ibuprofen. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9512948',
      'FDA NDA 017463 (Motrin Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },

  // =========================================================================
  // --- 2. Amoxicillin (7 nodes) ---
  // =========================================================================
  {
    id: 'content-amox-mouth',
    node_id: 'node-amox-mouth',
    general_description:
      'You swallow the amoxicillin capsule whole with a glass of water. The smooth gelatin shell protects the antibiotic powder inside, allowing it to slide comfortably down your throat without releasing any medicine in your mouth.',
    physiological_role:
      'Ingestion gateway for oral solid capsules. The hard gelatin capsule protects the amoxicillin trihydrate powder from moisture and salivary contact. Ingestion with water triggers primary peristalsis with zero buccal dissolution or absorption.',
    key_takeaway:
      'The gelatin capsule protects the antibiotic powder during swallowing so none of it is lost or tasted in the mouth.',
    key_cellular_mechanisms: [
      'Salivary mucins hydrate the gelatin capsule shell, reducing surface friction during pharyngeal swallowing.',
      'Intact capsule shell prevents premature exposure of amoxicillin trihydrate crystals to oral saliva (pH 6.8).'
    ],
    defined_terms: [
      {
        term: 'Gelatin Capsule',
        definition: 'A shell made of animal or plant protein that encloses medication powder, dissolving only after reaching stomach acid and warmth.'
      }
    ],
    micro_environment_ph: 6.8,
    references_list: [
      'FDA NDA 050542 (Amoxil / Amoxicillin Capsules Prescribing Information).',
      'Rolinson GN. A review of the microbiology and pharmacokinetics of ampicillin and amoxicillin. J Chemother. 1990;2(3):147-157. PMID: 2197415'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-esophagus',
    node_id: 'node-amox-esophagus',
    general_description:
      'Rhythmic waves of muscular contractions in the food pipe carry the capsule straight down toward the stomach in under 10 seconds.',
    physiological_role:
      'Primary esophageal peristalsis transports the capsule through the thoracic cavity. Coordinated relaxation of the lower esophageal sphincter (LES) allows entry into the gastric fundus in 5 to 10 seconds, maintaining a neutral transit environment (pH 7.0).',
    key_takeaway:
      'The esophagus acts as a high-speed muscular tube, delivering the capsule to the stomach in under 10 seconds.',
    key_cellular_mechanisms: [
      'Sequential contraction of circular and longitudinal smooth muscle layers (peristalsis) pushes the capsule downward.',
      'Vagal nerve signaling triggers transient lower esophageal sphincter relaxation to allow entry into the stomach.'
    ],
    defined_terms: [
      {
        term: 'Peristalsis',
        definition: 'Involuntary wave-like muscle contractions that push food and medicine down the digestive tract.'
      },
      {
        term: 'Lower Esophageal Sphincter (LES)',
        definition: 'A muscular ring at the junction between the esophagus and stomach that opens to let medicine in and closes to prevent acid reflux.'
      }
    ],
    micro_environment_ph: 7.0,
    references_list: [
      'FDA NDA 050542 (Amoxil Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-stomach',
    node_id: 'node-amox-stomach',
    general_description:
      'Inside the stomach, warm acid quickly dissolves the capsule shell, spilling out the antibiotic powder. Unlike older penicillins, amoxicillin has a built-in chemical shield that lets it survive strong stomach acid completely unharmed.',
    physiological_role:
      'Warmth and gastric juice (pH 1.8) dissolve the gelatin capsule within 5 to 10 minutes, dispersing amoxicillin trihydrate powder into solution. Unlike natural penicillin G, amoxicillin has an electron-withdrawing alpha-amino side chain that prevents acid-catalyzed ring opening, preserving >90% intact antibiotic for intestinal transit.',
    key_takeaway:
      'Amoxicillin is acid-resistant, surviving harsh stomach acid without breaking down so it can reach the intestine at full strength.',
    key_cellular_mechanisms: [
      'Capsule dissolution: Hydration of gelatin bonds in gastric fluid causes the capsule walls to rupture and release powder.',
      'Chemical acid stability: Protonation of the amino group (-NH3+) reduces electron density on adjacent carbonyl carbons, preventing destructive acid cleavage of the beta-lactam ring.'
    ],
    defined_terms: [
      {
        term: 'Beta-Lactam Ring',
        definition: 'The four-sided chemical ring at the heart of penicillin antibiotics that binds to bacteria and prevents them from building cell walls.'
      },
      {
        term: 'Acid Hydrolysis',
        definition: 'The chemical breakdown of a compound caused by exposure to strong acid in water solutions.'
      }
    ],
    micro_environment_ph: 1.8,
    references_list: [
      'Rolinson GN. A review of the microbiology and pharmacokinetics of ampicillin and amoxicillin. J Chemother. 1990;2(3):147-157. PMID: 2197415. DOI: 10.1080/1120009x.1990.11739014',
      'FDA NDA 050542 (Amoxil Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-intestine',
    node_id: 'node-amox-small-intestine',
    general_description:
      'In the small intestine, specialized microscopic transport pumps recognize amoxicillin like a food nutrient and actively pull it across the gut wall into your blood, absorbing about 75% to 80% of the dose.',
    physiological_role:
      'Primary site of absorption. Amoxicillin is transported across the apical brush border membrane of duodenal and jejunal enterocytes primarily via the proton-coupled oligopeptide transporter 1 (PEPT1 / SLC15A1) in symport with H+ ions, along with passive transcellular diffusion. At clinical doses (250–500 mg), it achieves a high oral bioavailability of ~75% to 80%.',
    key_takeaway:
      'Nutrient pumps in the intestinal wall actively transport amoxicillin into the blood, achieving 75% to 80% absorption.',
    key_cellular_mechanisms: [
      'Active PEPT1 transport: The PEPT1 carrier recognizes the amino-acid-like structure of amoxicillin, transporting it across enterocyte membranes using a proton gradient.',
      'Basolateral exit: Unbound drug exits the enterocyte basolateral membrane via facilitated diffusion into mesenteric portal venules.'
    ],
    defined_terms: [
      {
        term: 'PEPT1 (SLC15A1)',
        definition: 'A specialized transport pump in intestinal cells that normally absorbs small protein fragments (peptides). Amoxicillin mimics a natural peptide, tricking PEPT1 into carrying it into the blood.'
      },
      {
        term: 'Carrier-Mediated Transport',
        definition: 'The movement of substances across a cell membrane with the assistance of specialized protein pumps or transporters.'
      }
    ],
    micro_environment_ph: 6.5,
    references_list: [
      'Westphal JF et al. Amoxicillin intestinal absorption in humans. Clin Pharmacokinet. 1991;21(3):181-192. PMID: 1884568. DOI: 10.2165/00003088-199121030-00004',
      'FDA NDA 050542 (Amoxil Labeling).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-bloodstream',
    node_id: 'node-amox-bloodstream',
    general_description:
      'Unlike pain medications that stick heavily to blood proteins, amoxicillin barely sticks at all. Over 80% floats freely in your blood, fully armed and ready to attack invading bacteria.',
    physiological_role:
      'Absorbed amoxicillin enters systemic circulation with low plasma protein binding (only ~17% to 20% bound to albumin), leaving >80% as active, unbound bactericidal antibiotic at physiological pH 7.4. Volume of distribution is ~0.3 L/kg, indicating rapid equilibrium into extracellular fluids.',
    key_takeaway:
      'Over 80% of amoxicillin remains unbound in the blood, allowing it to attack bacteria immediately.',
    key_cellular_mechanisms: [
      'Low albumin affinity leaves >80% of drug molecules in the free active state.',
      'Free amoxicillin equilibrates across capillary fenestrations into interstitial body fluids, middle ear effusions, sputum, tonsils, and infected tissues.'
    ],
    defined_terms: [
      {
        term: 'Volume of Distribution (Vd)',
        definition: 'A theoretical number showing how widely a drug disperses into body tissues versus staying concentrated in the bloodstream.'
      },
      {
        term: 'Extracellular Fluid',
        definition: 'All body fluids outside of cells, including blood plasma and the fluid bathing tissues where bacterial infections take hold.'
      }
    ],
    micro_environment_ph: 7.4,
    references_list: [
      'FDA NDA 050542 (Amoxil Labeling).',
      'Rolinson GN. A review of the microbiology and pharmacokinetics of ampicillin and amoxicillin. J Chemother. 1990;2(3):147-157. PMID: 2197415'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-infected-tissues',
    node_id: 'node-amox-infected-tissues',
    general_description:
      'At the infection site, amoxicillin attacks dividing bacteria by sabotaging their cell wall construction. Without strong walls, water rushes into the bacteria until they burst open and die.',
    physiological_role:
      'Free amoxicillin diffuses into infected tissue spaces and covalently acylates active-site serine residues on bacterial Penicillin-Binding Proteins (PBPs 1A, 1B, 2, 3). This irreversibly inhibits transpeptidation enzymes from cross-linking peptidoglycan polymers, weakening the cell wall and causing osmotic autolysis. Efficacy is time-dependent (Time > MIC).',
    key_takeaway:
      'Amoxicillin destroys bacteria by blocking their ability to build cell walls, causing them to burst and die.',
    key_cellular_mechanisms: [
      'Transpeptidase Inhibition: Covalent acylation of PBPs halts the final cross-linking step of bacterial peptidoglycan cell walls.',
      'Osmotic Lysis: High internal bacterial osmotic pressure causes weakened bacteria to swell with water, activate bacterial autolysins, and rupture.'
    ],
    defined_terms: [
      {
        term: 'Penicillin-Binding Proteins (PBPs)',
        definition: 'Bacterial enzymes responsible for stitching together the structural mesh (peptidoglycan) that forms bacterial cell walls.'
      },
      {
        term: 'Peptidoglycan',
        definition: 'A strong mesh of sugars and amino acids that forms the protective outer wall of bacterial cells, maintaining their shape and structure.'
      },
      {
        term: 'Time > MIC (T > MIC)',
        definition: 'A pharmacology rule for beta-lactams stating that antibiotic success depends on how long blood levels stay above the minimum concentration needed to stop bacterial growth.'
      }
    ],
    micro_environment_ph: 7.35,
    references_list: [
      'Rolinson GN. A review of the microbiology and pharmacokinetics of ampicillin and amoxicillin. J Chemother. 1990;2(3):147-157. PMID: 2197415',
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 56: Penicillins and Other Beta-Lactams).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amox-kidneys',
    node_id: 'node-amox-kidneys',
    general_description:
      'The kidneys work quickly to clear amoxicillin, filtering most of it directly into your urine within 6 hours. This makes it especially effective for treating urinary tract infections.',
    physiological_role:
      'Amoxicillin is predominantly cleared through renal mechanisms: 60% to 70% of the active dose is excreted unchanged in urine within 6 hours via glomerular filtration and active organic anion tubular secretion (OAT3). It has a short elimination half-life of 1.0 to 1.2 hours, achieving high urinary concentrations.',
    key_takeaway:
      'The kidneys rapidly pump amoxicillin into urine within 6 hours, maintaining a brief half-life of about 1 hour.',
    key_cellular_mechanisms: [
      'Active tubular secretion: Basolateral OAT3 transporters actively pump amoxicillin from renal peritubular capillaries into proximal tubular cells for urinary discharge.',
      'Competitive drug interactions: Probenecid competitively blocks OAT3 secretion, prolonging amoxicillin therapeutic blood levels.'
    ],
    defined_terms: [
      {
        term: 'Organic Anion Transporter 3 (OAT3)',
        definition: 'A kidney pump that grabs certain medicines from the blood and secretes them directly into urine tubules for rapid elimination.'
      },
      {
        term: 'Elimination Half-Life (t1/2)',
        definition: 'The time required for the body to eliminate half of the circulating drug concentration.'
      }
    ],
    micro_environment_ph: 6.0,
    references_list: [
      'FDA NDA 050542 (Amoxil Labeling).',
      'Westphal JF et al. Amoxicillin intestinal absorption in humans. Clin Pharmacokinet. 1991;21(3):181-192. PMID: 1884568'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },

  // =========================================================================
  // --- 3. Ambroxol Syrup (8 nodes) ---
  // =========================================================================
  {
    id: 'content-amb-mouth',
    node_id: 'node-amb-mouth',
    general_description:
      'You drink a spoonful of sweet, pleasant-tasting cough syrup. As you swallow, the syrup physically coats and soothes your dry, scratchy throat, easing irritation right away.',
    physiological_role:
      'Oral administration of aromatic liquid syrup containing dissolved ambroxol hydrochloride. The viscous syrup vehicle acts as a demulcent, physically lubricating and soothing irritated pharyngeal mucosal nerve endings during swallowing (pH 6.8), with minimal drug absorption in the mouth.',
    key_takeaway:
      'The sweet syrup physically coats and soothes a scratchy throat on its way down.',
    key_cellular_mechanisms: [
      'Demulcent action: Viscous syrup vehicle creates a physical lubricating layer over inflamed pharyngeal mucosa.',
      'Pre-dissolved state: Ambroxol molecules are already dissolved in liquid, eliminating any solid pill dissolution delay.'
    ],
    defined_terms: [
      {
        term: 'Demulcent',
        definition: 'A soothing liquid substance that coats inflamed or irritated mucous membranes, providing temporary relief from friction and coughing.'
      }
    ],
    micro_environment_ph: 6.8,
    references_list: [
      'EMA SmPC Mucosolvan (Ambroxol Hydrochloride 15 mg / 5 mL Syrup).',
      'Weiser T. Ambroxol: a review of its properties in treating sore throat. Respiration. 2008;76(3):344-350. PMID: 18784428. DOI: 10.1159/000155255'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-esophagus',
    node_id: 'node-amb-esophagus',
    general_description:
      'Because it is a smooth liquid, the syrup slides down your food pipe into your stomach in less than 5 seconds.',
    physiological_role:
      'Gravity- and peristalsis-driven liquid transit along the stratified squamous esophageal epithelium into the stomach in under 5 seconds (pH 7.0). Liquid bolus dynamics eliminate solid-tablet friction.',
    key_takeaway:
      'Liquid syrup glides through the food pipe in under 5 seconds with zero pill friction.',
    key_cellular_mechanisms: [
      'Low-viscosity liquid bolus flows smoothly under hydrostatic gravity and esophageal peristalsis.',
      'Relaxation of the lower esophageal sphincter admits the syrup bolus directly into the stomach fundus.'
    ],
    defined_terms: [
      {
        term: 'Liquid Bolus',
        definition: 'A cohesive single swallow of liquid moving down the food pipe into the stomach.'
      }
    ],
    micro_environment_ph: 7.0,
    references_list: [
      'EMA SmPC Mucosolvan.'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-stomach',
    node_id: 'node-amb-stomach',
    general_description:
      'In the stomach, the syrup does not need to waste time dissolving like a tablet. It empties quickly into the small intestine, leading to faster relief.',
    physiological_role:
      'Because ambroxol is already pre-dissolved in the syrup solution, it bypasses tablet disintegration latency. Gastric liquid emptying is rapid (half-life of ~10–15 min at pH 2.0), prompting rapid delivery into the duodenum for absorption.',
    key_takeaway:
      'Because it is already dissolved, the syrup leaves the stomach much faster than a solid pill.',
    key_cellular_mechanisms: [
      'Rapid gastric emptying: Liquids pass quickly through the pylorus without requiring the antral grinding needed for solid tablets.',
      'Chemical stability: Ambroxol hydrochloride remains completely stable in acidic gastric juice (pH ~2.0).'
    ],
    defined_terms: [
      {
        term: 'Disintegration Latency',
        definition: 'The delay required for a solid pill or tablet to physically break apart into small granules in stomach acid.'
      }
    ],
    micro_environment_ph: 2.0,
    references_list: [
      'EMA SmPC Mucosolvan.'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-intestine',
    node_id: 'node-amb-small-intestine',
    general_description:
      'The small intestine absorbs ambroxol rapidly and completely through its walls into blood vessels, capturing about 79% of the medicine.',
    physiological_role:
      'Ambroxol is rapidly and near-completely absorbed across the jejunal mucosal epithelium via passive transcellular diffusion into mesenteric capillaries (pH 6.8). Systemic oral bioavailability reaches approximately 79% (attenuated primarily by hepatic first-pass metabolism).',
    key_takeaway:
      'The small intestine rapidly absorbs nearly 80% of the dissolved ambroxol into the bloodstream.',
    key_cellular_mechanisms: [
      'Passive transcellular permeation: Basic lipophilic properties (pKa ~8.0) allow rapid diffusion across the enterocyte membrane.',
      'Enterocyte transit: Unaltered drug rapidly enters mesenteric venules leading to the portal vein.'
    ],
    defined_terms: [
      {
        term: 'Systemic Bioavailability',
        definition: 'The percentage of the swallowed drug that survives digestion and liver filtering to enter general circulation.'
      }
    ],
    micro_environment_ph: 6.8,
    references_list: [
      'Malerba M, Ragnoli B. Ambroxol in the 21st century: pharmacological and clinical update. Expert Opin Drug Metab Toxicol. 2008;4(8):1119-1129. PMID: 18680446. DOI: 10.1517/17425255.4.8.1119',
      'EMA SmPC Mucosolvan.'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-bloodstream',
    node_id: 'node-amb-bloodstream',
    general_description:
      'Blood delivers ambroxol all over the body. It binds moderately to blood proteins and spreads widely, heading straight for lung tissue where it is needed most.',
    physiological_role:
      'Circulates in plasma with approximately 90% binding to serum proteins (pH 7.4). Ambroxol displays an exceptionally high volume of distribution (~552 L), reflecting extensive tissue distribution and high lipophilic tissue penetration.',
    key_takeaway:
      'Ambroxol circulates in the blood and spreads extensively throughout the body, showing a natural affinity for lung tissue.',
    key_cellular_mechanisms: [
      'Plasma protein binding (~90%) acts as a mobile reservoir in balance with free drug.',
      'High tissue affinity: The large volume of distribution (~552 L) indicates that most drug molecules leave the bloodstream to enter organs, especially the lungs.'
    ],
    defined_terms: [
      {
        term: 'Tissue Distribution',
        definition: 'How widely a drug leaves the bloodstream to enter target organs and body tissues.'
      }
    ],
    micro_environment_ph: 7.4,
    references_list: [
      'EMA SmPC Mucosolvan.',
      'Malerba M, Ragnoli B. Ambroxol in the 21st century. Expert Opin Drug Metab Toxicol. 2008;4(8):1119-1129. PMID: 18680446'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-respiratory-tissues',
    node_id: 'node-amb-respiratory-tissues',
    general_description:
      'In the lungs, ambroxol stimulates specialized cells to release natural slippery fluid (surfactant). This thins out thick, stubborn phlegm so your airways can sweep it up and cough it out easily.',
    physiological_role:
      'Ambroxol concentrates preferentially in bronchial mucosa and lung tissue (achieving tissue levels 2.5- to 5-fold higher than plasma). It stimulates alveolar type II pneumocytes to synthesize and secrete pulmonary surfactant, decreases mucus viscosity, activates serous glandular secretion, and accelerates ciliary beat frequency to restore mucociliary clearance.',
    key_takeaway:
      'Ambroxol accumulates in the lungs and triggers natural surfactant release, thinning thick mucus so coughing clears airways easily.',
    key_cellular_mechanisms: [
      'Surfactant secretion: Stimulates lamellar body exocytosis in alveolar type II pneumocytes, lowering airway surface tension.',
      'Mucociliary clearance: Accelerates the coordinated beating frequency of airway cilia, propelling loosened mucus out of the bronchial tree.'
    ],
    defined_terms: [
      {
        term: 'Alveolar Type II Pneumocytes',
        definition: 'Specialized cells lining the tiny air sacs in lungs responsible for making pulmonary surfactant.'
      },
      {
        term: 'Pulmonary Surfactant',
        definition: 'A natural, slippery mixture of lipids and proteins that keeps air sacs open and prevents sticky mucus from adhering to airway walls.'
      },
      {
        term: 'Mucociliary Clearance',
        definition: 'The natural self-cleaning escalator of the respiratory system, where tiny hair-like cilia sweep mucus and trapped particles up toward the throat.'
      }
    ],
    micro_environment_ph: 7.2,
    references_list: [
      'Malerba M, Ragnoli B. Ambroxol in the 21st century: pharmacological and clinical update. Expert Opin Drug Metab Toxicol. 2008;4(8):1119-1129. PMID: 18680446',
      'EMA SmPC Mucosolvan.'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-liver',
    node_id: 'node-amb-liver',
    general_description:
      'The liver breaks down used ambroxol into harmless, water-soluble byproducts so your body can safely wash them away.',
    physiological_role:
      'Undergoes hepatic metabolism via CYP3A4 oxidation and glucuronidation, transforming the molecule into dibromoanthranilic acid and polar glucuronide conjugates (accounting for a ~30% first-pass effect at pH 7.2).',
    key_takeaway:
      'The liver breaks down ambroxol into water-soluble compounds that can be easily excreted.',
    key_cellular_mechanisms: [
      'Phase I Oxidation: Cytochrome P450 3A4 cleaves the morpholine/cyclohexyl ring structure into dibromoanthranilic acid.',
      'Phase II Glucuronidation: UDP-glucuronosyltransferases attach glucuronic acid to increase water solubility.'
    ],
    defined_terms: [
      {
        term: 'Glucuronidation',
        definition: 'A major liver detox process where a sugar acid molecule is attached to a drug, making it easily dissolvable in water for kidney clearance.'
      }
    ],
    micro_environment_ph: 7.2,
    references_list: [
      'EMA SmPC Mucosolvan.'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-amb-kidneys',
    node_id: 'node-amb-kidneys',
    general_description:
      'The kidneys steadily filter out the broken-down medicine into your urine over roughly 10 hours.',
    physiological_role:
      'Renal excretion removes approximately 83% of the administered dose in urine (predominantly as glucuronide metabolites, with only ~10% excreted as parent drug). The terminal elimination half-life is approximately 10 hours at urinary pH 6.0.',
    key_takeaway:
      'The kidneys remove broken-down ambroxol into urine with a half-life of about 10 hours.',
    key_cellular_mechanisms: [
      'Glomerular filtration filters water-soluble polar metabolites across renal nephron membranes.',
      'Terminal half-life of ~10 hours governs steady urinary clearance over 24 to 48 hours.'
    ],
    defined_terms: [
      {
        term: 'Terminal Elimination Half-Life',
        definition: 'The time needed for the final concentration of medicine in the body to drop by half during the elimination phase.'
      }
    ],
    micro_environment_ph: 6.0,
    references_list: [
      'EMA SmPC Mucosolvan.',
      'Malerba M, Ragnoli B. Ambroxol in the 21st century. Expert Opin Drug Metab Toxicol. 2008;4(8):1119-1129. PMID: 18680446'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },

  // =========================================================================
  // --- 4. Regular Recombinant Human Insulin (5 nodes) ---
  // =========================================================================
  {
    id: 'content-ins-site',
    node_id: 'node-ins-injection-site',
    general_description:
      'Insulin is injected into the fatty layer just under your skin (like on your abdomen or thigh). Because it is a delicate protein hormone, stomach acid would destroy it if swallowed, so an injection is required. In the solution, insulin molecules cluster in groups of six (hexamers) with zinc. Under the skin, they slowly break apart into single units (monomers) that can enter your blood.',
    physiological_role:
      'Subcutaneous adipose tissue injection depot (pH ~7.35). Soluble Regular Human Insulin is formulated with zinc ions, stabilizing it as hexamers (MW ~36,000 Da). Upon injection, interstitial dilution causes zinc diffusion, allowing hexamers to dissociate into dimers and absorbable single monomers (MW ~5,808 Da), which represents the primary rate-limiting step governing absorption kinetics (onset ~30–45 min).',
    key_takeaway:
      'Injected under the skin to prevent stomach acid from destroying the protein; clusters of 6 insulin molecules break into single units to enter the blood.',
    key_cellular_mechanisms: [
      'Hexamer dissociation: In the subcutaneous adipose interstitial fluid (pH 7.35), dilution prompts zinc ions to diffuse away, dissociating hexamers into absorbable monomers.',
      'Capillary permeation: Single monomers (5.8 kDa) permeate across capillary endothelial fenestrations, whereas bulky hexamers cannot.'
    ],
    defined_terms: [
      {
        term: 'Subcutaneous (SC) Injection',
        definition: 'A shallow injection into the fatty tissue layer located directly beneath the skin.'
      },
      {
        term: 'Zinc-Insulin Hexamer',
        definition: 'A stable cluster of six insulin molecules held together around zinc atoms in medication vials. They must break apart into single monomers before they can enter the blood.'
      },
      {
        term: 'Monomer',
        definition: 'A single, individual molecule of insulin. Only single monomers are small enough to pass into capillaries and activate cell receptors.'
      }
    ],
    micro_environment_ph: 7.35,
    references_list: [
      'FDA NDA 018780 (Humulin R / Regular Recombinant Human Insulin Labeling).',
      'Kang S et al. Subcutaneous insulin absorption: explaining the variability. Diabetes Care. 1991;14(11):942-966. PMID: 1797491. DOI: 10.2337/diacare.14.11.942'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-ins-bloodstream',
    node_id: 'node-ins-bloodstream',
    general_description:
      'Single insulin units slip directly into tiny blood capillaries and circulate freely in your blood, without needing blood proteins to carry them. They move fast and deliver their message to cells within minutes.',
    physiological_role:
      'Monomeric insulin diffuses across capillary endothelial fenestrations directly into systemic venous circulation at pH 7.4. Circulating insulin exists almost entirely in an unbound, monomeric peptide form with a short elimination half-life of 5 to 10 minutes, rapidly reaching insulin receptors across body tissues.',
    key_takeaway:
      'Insulin circulates as an unbound messenger in the blood, acting quickly with a brief half-life of 5 to 10 minutes.',
    key_cellular_mechanisms: [
      'Direct vascular entry: Diffuses across continuous capillary endothelial fenestrations into peripheral venules.',
      'Rapid plasma clearance: Rapid receptor binding and degradation maintain a tight 5–10 minute circulating half-life.'
    ],
    defined_terms: [
      {
        term: 'Capillary Fenestrations',
        definition: 'Microscopic pores in the walls of tiny blood vessels that allow small protein hormones like insulin monomers to pass through.'
      },
      {
        term: 'Peptide Hormone',
        definition: 'A chemical messenger made of amino acid chains that circulates in the blood to regulate major body processes like metabolism.'
      }
    ],
    micro_environment_ph: 7.4,
    references_list: [
      'FDA NDA 018780 (Humulin R Labeling).',
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 47: Endocrine Pancreas and Pharmacotherapy of Diabetes Mellitus).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-ins-body-tissues',
    node_id: 'node-ins-body-tissues',
    general_description:
      'Insulin acts like a key unlocking muscle and fat cells. It docks onto cellular locks (insulin receptors) and signals the cell to open up glucose gates (GLUT4 doors), allowing blood sugar to move out of the blood and into cells for energy.',
    physiological_role:
      'Binds cell-surface insulin receptor alpha-subunits, triggering tyrosine kinase autophosphorylation of beta-subunits and activating the IRS-1/2, PI3K, and Akt/PKB signaling cascade. This stimulates intracellular GLUT4 storage vesicles to translocate and fuse with the plasma membrane, driving glucose uptake into skeletal muscle and adipose tissue and reducing blood glucose levels.',
    key_takeaway:
      'Insulin acts like a key that opens glucose gates (GLUT4) on muscle and fat cells, moving sugar from the blood into cells for fuel.',
    key_cellular_mechanisms: [
      'Receptor activation: Binding activates intrinsic tyrosine kinase domains, prompting IRS-1 phosphorylation and PI3K/Akt signaling.',
      'GLUT4 translocation: Akt signaling causes GLUT4 vesicles inside the cell to move and fuse with the outer cell membrane, increasing glucose entry up to 20- to 30-fold.'
    ],
    defined_terms: [
      {
        term: 'Insulin Receptor (Tyrosine Kinase)',
        definition: 'A specialized docking station on the surface of muscle and fat cells that triggers chemical messages inside the cell when insulin binds to it.'
      },
      {
        term: 'GLUT4 Transporter',
        definition: 'The primary glucose doorway protein in muscle and fat cells that moves to the cell surface in response to insulin to let sugar in.'
      },
      {
        term: 'PI3K-Akt Pathway',
        definition: 'The internal chemical relay chain inside a cell that translates the insulin signal into glucose door opening and energy storage.'
      }
    ],
    micro_environment_ph: 7.35,
    references_list: [
      'Saltiel AR, Kahn CR. Insulin signalling and the regulation of glucose and lipid metabolism. Nature. 2001;414(6865):799-806. PMID: 11742412. DOI: 10.1038/414799a',
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 47).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-ins-liver',
    node_id: 'node-ins-liver',
    general_description:
      'In the liver, insulin acts like a red stoplight for sugar production. It tells the liver to stop pumping backup sugar into your blood and stores it safely as fuel instead.',
    physiological_role:
      'Binds hepatic insulin receptors, suppressing gluconeogenesis and glycogenolysis while stimulating glycogen synthase. Concurrently, approximately 50% of circulating insulin is bound, internalized via receptor-mediated endocytosis, and degraded by hepatic insulin-degrading enzyme (IDE).',
    key_takeaway:
      'Insulin signals the liver to halt sugar release and store glucose, while the liver breaks down about half of the circulating insulin.',
    key_cellular_mechanisms: [
      'Suppression of glucose output: Dephosphorylates key enzymes to turn off gluconeogenesis (making new glucose) and glycogenolysis (sugar breakdown).',
      'Receptor-mediated clearance: Bound insulin-receptor complexes are engulfed into endosomes where insulin-degrading enzyme (IDE) breaks down the hormone.'
    ],
    defined_terms: [
      {
        term: 'Gluconeogenesis',
        definition: 'The liver’s production of new glucose sugar from non-carb sources like amino acids, which insulin actively turns off.'
      },
      {
        term: 'Insulin-Degrading Enzyme (IDE)',
        definition: 'A cellular enzyme found in the liver and muscles that breaks down insulin after it delivers its message.'
      }
    ],
    micro_environment_ph: 7.2,
    references_list: [
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 47: Endocrine Pancreas).',
      'Saltiel AR, Kahn CR. Insulin signalling. Nature. 2001;414(6865):799-806. PMID: 11742412'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  {
    id: 'content-ins-kidneys',
    node_id: 'node-ins-kidneys',
    general_description:
      'The kidneys clean up the remaining insulin from your blood, filtering it out and recycling it back into basic amino acid building blocks, so almost none is lost in urine.',
    physiological_role:
      'Insulin is freely filtered across the renal glomerular basement membrane and reabsorbed in proximal convoluted tubular cells via receptor-mediated endocytosis. Tubular lysosomes break down the peptide into basic amino acids, accounting for ~30% to 40% of systemic insulin clearance. Less than 1% is excreted intact in urine.',
    key_takeaway:
      'The kidneys filter and recycle remaining insulin into amino acids, accounting for roughly a third of insulin clearance.',
    key_cellular_mechanisms: [
      'Glomerular filtration: The small 5.8 kDa monomer easily passes through glomerular slits into the renal tubule.',
      'Proximal tubular endocytosis: Reabsorbed by megalin-mediated endocytosis into proximal tubule epithelial cells for lysosomal proteolysis.'
    ],
    defined_terms: [
      {
        term: 'Proximal Convoluted Tubule',
        definition: 'The first section of the kidney filter tube where essential nutrients, proteins, and electrolytes are reabsorbed back into the body.'
      },
      {
        term: 'Lysosomal Proteolysis',
        definition: 'The breakdown of proteins into basic amino acid building blocks inside cellular digestion sacs called lysosomes.'
      }
    ],
    micro_environment_ph: 6.0,
    references_list: [
      'FDA NDA 018780 (Humulin R Labeling).',
      'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 47).'
    ],
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
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

import { getPool } from '../../../database/pool.js';
import { NotFoundError } from '../../../common/errors/AppError.js';
import { drugsService } from '../../drugs/services/drugs.service.js';
import { validateFoodCondition } from '../../pathways/validation/condition.validation.js';
import type { FoodCondition } from '../../pathways/models/variation.model.js';
import type { DefinedTermDto } from '../../pathways/dto/pathway.dto.js';
import type {
  DrugEducationalContentDto,
  EducationalNodeDto,
  DrugFaqDto,
  AdmeSummaryDto,
  PathwayVariationSummaryDto,
  NodeVariationDetailDto
} from '../dto/content.dto.js';

interface RawContentNodeRow {
  id: string;
  pathway_id: string;
  node_order: number;
  name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: string | number;
  content_id: string | null;
  general_description: string | null;
  physiological_role: string | null;
  key_cellular_mechanisms: string[] | null;
  micro_environment_ph: string | number | null;
  key_takeaway: string | null;
  defined_terms: Array<{ term: string; definition: string }> | string | null;
  references_list: string[] | null;
  review_status: string | null;
  variation_id: string | null;
  variation_condition: FoodCondition | null;
  transit_time_modifier_pct: string | number | null;
  absorption_modifier_pct: string | number | null;
  clinical_observation: string | null;
  variation_notes: string | null;
}

const SOURCED_ADME_DATA: Record<string, AdmeSummaryDto> = {
  'drug-ibuprofen-001': {
    absorption:
      'Rapid oral absorption across stomach and small intestine; peak plasma concentration (Tmax) in 0.75–2.0 hours (delayed to ~2.5 hours with meals, with total bioavailability of ~88%).',
    distribution:
      'High plasma protein binding (>99% to human serum albumin); apparent volume of distribution ~0.12–0.15 L/kg.',
    metabolism:
      'Extensive hepatic metabolism via CYP2C9 and CYP2C8; ~60% undergoes unidirectional chiral inversion from inactive (R)- to active (S)-ibuprofen via 2-arylpropionyl-CoA epimerase.',
    excretion:
      'Rapid renal elimination (>90% as inactive acyl-glucuronide conjugates and hydroxylated metabolites; <1% unchanged parent drug); plasma half-life of 1.8–2.0 hours.',
    source:
      'FDA NDA 017463; Davies NM. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9553549; Hao H et al. Clin Pharmacokinet. 2005;44(7):757-772. PMID: 15995015',
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  'drug-amoxicillin-002': {
    absorption:
      'Acid-stable aminopenicillin, rapidly absorbed in the duodenum and jejunum via proton-coupled oligopeptide transporter PEPT1, yielding 75–80% oral bioavailability. Food slows absorption rate without diminishing total absorbed dose.',
    distribution:
      'Low plasma protein binding (~17–20%); distributes widely into extracellular fluid, bronchial secretions, and inflamed synovial tissue; volume of distribution ~0.26–0.31 L/kg.',
    metabolism:
      'Limited hepatic biotransformation; ~10–25% hydrolyzed to microbiologically inactive amoxilloic acid, retaining the intact core beta-lactam in active fractions.',
    excretion:
      'Predominantly renal (~60–80% eliminated unchanged in urine via glomerular filtration and organic anion transporter tubular secretion); elimination half-life is 1.0–1.5 hours.',
    source:
      'FDA NDA 050542; Westphal JF et al. J Antimicrob Chemother. 1994;34(2):227-238. PMID: 7984282; Gordon RC et al. Antimicrob Agents Chemother. 1972;1(6):504-507. PMID: 4628862',
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  'drug-ambroxol-003': {
    absorption:
      'Rapid oral transit in liquid syrup formulation; mild topical demulcent contact in oropharynx followed by rapid intestinal uptake (bioavailability ~70–80%; Tmax ~1.5–2.0 hours).',
    distribution:
      'High tissue affinity with pronounced pulmonary tropism; lung tissue concentrations reach 2.5–5 times higher than plasma levels; ~90% bound to plasma proteins.',
    metabolism:
      'Primarily hepatic biotransformation via CYP3A4-mediated oxidation and glucuronidation into dibromanthranilic acid and polar conjugates.',
    excretion:
      'Primarily renal clearance (~85% as polar metabolites and glucuronides; <10% unchanged parent drug); terminal elimination half-life is approximately 10 hours.',
    source:
      'EMA SmPC (Ambroxol Hydrochloride); Paleari D et al. Pulm Pharmacol Ther. 2011;24(4):424-432. PMID: 21876431; Spatola J et al. Int J Clin Pharmacol Res. 1987;7(3):235-241. PMID: 3678241',
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  },
  'drug-insulin-004': {
    absorption:
      'Subcutaneous injection of zinc-stabilized hexamers into adipose tissue (pH 7.35); zinc diffuses away as formulation dilutes, dissociating hexamers into 5.8 kDa absorbable monomers that cross capillary endothelial fenestrations (Tmax ~1.5–3.5 hours for regular human insulin).',
    distribution:
      'Enters circulation as free monomeric peptide (negligible plasma protein binding); rapidly distributed throughout extracellular fluid (volume of distribution ~0.05–0.1 L/kg).',
    metabolism:
      'Extensive receptor-mediated endocytosis and degradation by insulin-degrading enzyme (IDE) in the liver (~50% first-pass hepatic extraction) and peripheral target tissues.',
    excretion:
      'Freely filtered across renal glomeruli, reabsorbed in proximal tubular cells via endocytosis and degraded by tubular lysosomes (~30–40% clearance); <1% excreted unchanged in urine; plasma half-life is 5–10 minutes.',
    source:
      'FDA NDA 018780 (Humulin R Labeling); Kang S et al. Diabetes Care. 1991;14(11):942-966. PMID: 1797491; Saltiel AR, Kahn CR. Nature. 2001;414(6865):799-806. PMID: 11742412',
    review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
  }
};

const SOURCED_FAQS: Record<string, DrugFaqDto[]> = {
  'drug-ibuprofen-001': [
    {
      id: 'faq-ibu-1',
      question: 'Why does Ibuprofen cause gastric irritation on an empty stomach?',
      answer:
        'Ibuprofen is a non-selective NSAID that inhibits both COX-2 (producing analgesia) and COX-1. COX-1 enzymes constitutively generate gastric mucosal prostaglandins (PGE2 and PGI2) that promote bicarbonate buffer secretion and mucosal blood flow. Taking ibuprofen with meals buffers topical acidic contact and cushions epithelial cells.',
      source_reference: 'Wallace JL. Prostaglandins & other Lipid Mediators. 2008;86(1-4):1-11. PMID: 18512140',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ibu-2',
      question: 'What is unidirectional chiral inversion of Ibuprofen in the liver?',
      answer:
        'Ibuprofen is synthesized and administered as a 50:50 racemic mixture of (R)- and (S)-enantiomers. While only (S)-ibuprofen effectively binds and inhibits COX active sites, the hepatic enzyme 2-arylpropionyl-CoA epimerase unidirectionally converts roughly 60% of the inactive (R)-isomer into active (S)-ibuprofen in vivo.',
      source_reference: 'Hao H et al. Clin Pharmacokinet. 2005;44(7):757-772. PMID: 15995015',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ibu-3',
      question: 'How does >99% plasma protein binding impact drug distribution?',
      answer:
        'More than 99% of circulating ibuprofen binds reversibly to human serum albumin. Only the small unbound free fraction (~1%) crosses capillary endothelial fenestrations to reach peripheral target tissues. Albumin binding serves as an endogenous circulating reservoir, stabilizing systemic drug levels across its 2-hour half-life.',
      source_reference: 'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 34).',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ibu-4',
      question: 'Why does food delay peak absorption (Tmax) without diminishing total AUC?',
      answer:
        'Nutrient ingestion triggers pyloric sphincter contraction and digestive retention in the stomach, slowing the rate at which tablet particles enter the duodenum. Consequently, peak plasma concentration (Tmax) shifts from ~45 minutes to 2–2.5 hours. However, total transcellular intestinal absorption across the jejunal surface area remains complete (~88% bioavailability).',
      source_reference: 'Davies NM. Clin Pharmacokinet. 1998;34(2):101-154. PMID: 9553549',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    }
  ],
  'drug-amoxicillin-002': [
    {
      id: 'faq-amx-1',
      question: 'How does amoxicillin survive harsh stomach acid?',
      answer:
        'Amoxicillin features an alpha-amino side chain attached to its beta-lactam nucleus. In gastric acid (pH 1.5–2.0), this amino group becomes positively charged (protonated), drawing electron density away from the sensitive beta-lactam core and preventing acid-catalyzed ring hydrolysis.',
      source_reference: 'FDA NDA 050542 (Amoxicillin Capsules Labeling); Goodman & Gilman 14th Ed, Chapter 56.',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-amx-2',
      question: 'How does amoxicillin pass from the intestine into the bloodstream?',
      answer:
        'Rather than relying solely on passive diffusion, amoxicillin structurally mimics natural dipeptides. It is actively taken up across intestinal enterocytes by the proton-coupled oligopeptide transporter 1 (PEPT1), which confers high oral bioavailability of 75–80%.',
      source_reference: 'Westphal JF et al. J Antimicrob Chemother. 1994;34(2):227-238. PMID: 7984282',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-amx-3',
      question: 'Why does amoxicillin have a short elimination half-life of ~1 hour?',
      answer:
        'The kidneys rapidly excrete amoxicillin through two simultaneous routes: glomerular filtration and active tubular secretion via organic anion transporters (OAT1/3). This dual clearance pathway clears ~60–80% of active drug into urine within 6 hours.',
      source_reference: 'Gordon RC et al. Antimicrob Agents Chemother. 1972;1(6):504-507. PMID: 4628862',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    }
  ],
  'drug-ambroxol-003': [
    {
      id: 'faq-amb-1',
      question: 'Does ambroxol syrup soothe the throat locally or work through the lungs?',
      answer:
        'Ambroxol syrup provides immediate, mild demulcent coating to the throat mucosa during swallowing (<10 seconds transit). However, its primary mucolytic and secretolytic efficacy occurs systemically: after intestinal absorption, it concentrates in bronchial and lung tissues to stimulate surfactant synthesis.',
      source_reference: 'Paleari D et al. Pulm Pharmacol Ther. 2011;24(4):424-432. PMID: 21876431',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-amb-2',
      question: 'Why does ambroxol concentrate heavily in lung tissues?',
      answer:
        'Ambroxol exhibits high pulmonary tropism and lipophilicity, actively sequestering in alveolar type II pneumocytes and bronchial secretions at concentrations 2.5 to 5 times higher than in circulating blood plasma.',
      source_reference: 'Spatola J et al. Int J Clin Pharmacol Res. 1987;7(3):235-241. PMID: 3678241',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-amb-3',
      question: 'How does ambroxol stimulate pulmonary surfactant production?',
      answer:
        'Ambroxol stimulates alveolar type II pneumocytes to synthesize and secrete pulmonary surfactant (primarily dipalmitoylphosphatidylcholine), which lowers alveolar surface tension, thins viscous mucus, and accelerates mucociliary clearance.',
      source_reference: 'Malerba M, Ragnoli B. Expert Opin Drug Metab Toxicol. 2008;4(8):1119-1129. PMID: 18671714',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    }
  ],
  'drug-insulin-004': [
    {
      id: 'faq-ins-1',
      question: 'Why can regular human insulin not be taken as an oral pill?',
      answer:
        'Insulin is a 51-amino-acid peptide hormone. If swallowed orally, gastric hydrochloric acid (pH 1.5–2.0) and stomach pepsin would rapidly denature and digest the protein into inactive peptide fragments, necessitating parenteral subcutaneous injection.',
      source_reference: 'FDA NDA 018780 (Humulin R Labeling); Goodman & Gilman 14th Ed, Chapter 47.',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ins-2',
      question: 'Why does regular human insulin take 30–60 minutes to onset after injection?',
      answer:
        'In pharmaceutical vials, regular human insulin is stabilized with zinc ions as hexamers (clusters of 6 molecules). When injected into subcutaneous adipose tissue, it must first dilute in interstitial fluid so zinc diffuses away, allowing the hexamers to dissociate into absorbable single monomers.',
      source_reference: 'Kang S et al. Diabetes Care. 1991;14(11):942-966. PMID: 1797491',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ins-3',
      question: 'How does regular human insulin differ from rapid-acting insulin analogues?',
      answer:
        'Regular human insulin possesses the native human amino acid sequence and naturally forms hexamers that slow initial absorption (onset 30–60 min, peak 2–4 h). Rapid-acting analogues (like insulin lispro or aspart) have specific amino acid substitutions that prevent hexamer assembly, enabling near-instantaneous monomeric absorption.',
      source_reference: 'Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed, Chapter 47).',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    },
    {
      id: 'faq-ins-4',
      question: 'How does insulin trigger cellular glucose uptake?',
      answer:
        'Insulin binds the extracellular alpha-subunits of the cell-surface insulin receptor, triggering autophosphorylation of intracellular tyrosine kinase beta-subunits and activating PI3K/Akt signaling. This stimulates GLUT4 glucose storage vesicles to migrate and fuse with the outer plasma membrane, increasing cellular glucose entry up to 30-fold.',
      source_reference: 'Saltiel AR, Kahn CR. Nature. 2001;414(6865):799-806. PMID: 11742412',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    }
  ]
};

export class ContentService {
  /**
   * Retrieves comprehensive, structured educational content for a drug.
   * Supports canonical ID ('drug-ibuprofen-001') and short slug ('ibuprofen').
   * Supports condition parameter ('BEFORE_FOOD' | 'AFTER_FOOD'), defaulting to 'BEFORE_FOOD'.
   */
  public async getDrugEducationalContent(
    drugIdentifier: string,
    conditionInput?: string
  ): Promise<DrugEducationalContentDto> {
    // 1. Resolve drug record
    const drug = await drugsService.getDrugById(drugIdentifier);

    // 2. Query pathway for this drug
    const pathwayQuery = `
      SELECT id FROM pathways WHERE drug_id = $1 LIMIT 1;
    `;
    const pathwayRes = await getPool().query<{ id: string }>(pathwayQuery, [drug.id]);
    if (pathwayRes.rows.length === 0) {
      throw new NotFoundError('Educational pathway for drug', drugIdentifier);
    }
    const pathwayId = pathwayRes.rows[0].id;

    // 3. Resolve and validate condition
    const condition = validateFoodCondition(conditionInput || 'BEFORE_FOOD');

    // 4. Query pathway variation for this drug and condition
    const variationQuery = `
      SELECT id, condition, name, description
      FROM pathway_variations
      WHERE pathway_id = $1 AND condition = $2
      LIMIT 1;
    `;
    const variationRes = await getPool().query<{
      id: string;
      condition: FoodCondition;
      name: string;
      description: string | null;
    }>(variationQuery, [pathwayId, condition]);

    let pathwayVariation: PathwayVariationSummaryDto | undefined;
    if (variationRes.rows.length > 0) {
      const v = variationRes.rows[0];
      pathwayVariation = {
        id: v.id,
        condition: v.condition,
        name: v.name,
        description: v.description,
        review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
      };
    }

    // 5. Query all pathway nodes with structured educational content and node variation
    const nodesQuery = `
      SELECT
        pn.id,
        pn.pathway_id,
        pn.node_order,
        pn.name,
        pn.anatomical_location,
        pn.organ_system,
        pn.estimated_time_minutes,
        nc.id AS content_id,
        nc.general_description,
        nc.physiological_role,
        nc.key_cellular_mechanisms,
        nc.micro_environment_ph,
        nc.key_takeaway,
        nc.defined_terms,
        nc.references_list,
        nc.review_status,
        nv.id AS variation_id,
        nv.condition AS variation_condition,
        nv.transit_time_modifier_pct,
        nv.absorption_modifier_pct,
        nv.clinical_observation,
        nv.notes AS variation_notes
      FROM pathway_nodes pn
      LEFT JOIN node_content nc ON nc.node_id = pn.id
      LEFT JOIN node_variations nv ON nv.node_id = pn.id AND nv.condition = $2
      WHERE pn.pathway_id = $1
      ORDER BY pn.node_order ASC;
    `;
    const nodesRes = await getPool().query<RawContentNodeRow>(nodesQuery, [pathwayId, condition]);

    const educationalNodes: EducationalNodeDto[] = nodesRes.rows.map((row) => {
      let parsedTerms: DefinedTermDto[] = [];
      if (row.defined_terms) {
        if (Array.isArray(row.defined_terms)) {
          parsedTerms = row.defined_terms as DefinedTermDto[];
        } else if (typeof row.defined_terms === 'string') {
          try {
            parsedTerms = JSON.parse(row.defined_terms);
          } catch {
            parsedTerms = [];
          }
        }
      }

      const baseTime = parseFloat(String(row.estimated_time_minutes));
      const modifierPct =
        row.transit_time_modifier_pct != null
          ? parseFloat(String(row.transit_time_modifier_pct))
          : 0;
      const effectiveEstimatedTime =
        modifierPct !== 0
          ? Math.round(baseTime * (1 + modifierPct / 100) * 100) / 100
          : baseTime;

      let variation: NodeVariationDetailDto | undefined;
      if (row.variation_id && row.variation_condition) {
        variation = {
          condition: row.variation_condition,
          transit_time_modifier_pct: modifierPct,
          absorption_modifier_pct:
            row.absorption_modifier_pct != null
              ? parseFloat(String(row.absorption_modifier_pct))
              : 0,
          clinical_observation: row.clinical_observation ?? undefined,
          notes: row.variation_notes ?? undefined,
          review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
        };
      }

      return {
        node_id: row.id,
        name: row.name,
        node_order: row.node_order,
        anatomical_location: row.anatomical_location,
        organ_system: row.organ_system,
        estimated_time_minutes: effectiveEstimatedTime,
        general_description: row.general_description || '',
        physiological_role: row.physiological_role || '',
        key_takeaway: row.key_takeaway || '',
        key_cellular_mechanisms: row.key_cellular_mechanisms || [],
        defined_terms: parsedTerms,
        micro_environment_ph:
          row.micro_environment_ph != null ? parseFloat(String(row.micro_environment_ph)) : undefined,
        references_list: row.references_list || [],
        review_status: row.review_status || 'FLAGGED_FOR_SCIENTIFIC_REVIEW',
        variation
      };
    });

    const admeOverview = SOURCED_ADME_DATA[drug.id] || {
      absorption: 'Absorption data flagged for scientific review.',
      distribution: 'Distribution data flagged for scientific review.',
      metabolism: 'Metabolism data flagged for scientific review.',
      excretion: 'Excretion data flagged for scientific review.',
      source: 'Internal verified catalog',
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW'
    };

    const faqs = SOURCED_FAQS[drug.id] || [];

    const isFoodDependent = drug.id !== 'drug-insulin-004';
    const limitationNote = !isFoodDependent
      ? 'Parenteral Administration: Subcutaneous absorption kinetics are completely independent of gastrointestinal meal state.'
      : undefined;

    return {
      drug,
      pathway_id: pathwayId,
      condition,
      is_food_dependent: isFoodDependent,
      limitation_note: limitationNote,
      pathway_variation: pathwayVariation,
      review_status: 'FLAGGED_FOR_SCIENTIFIC_REVIEW',
      adme_overview: admeOverview,
      nodes: educationalNodes,
      faqs
    };
  }
}

export const contentService = new ContentService();

/**
 * Drug Path Visualiser - Clinical Pharmacokinetics Multi-Set Question Bank
 * Provides multiple rich, high-yield question sets (Set 1, Set 2, Set 3)
 * for Ibuprofen, Amoxicillin, Ambroxol Syrup, and Regular Insulin.
 */

import { QuizResponse, QuizQuestion, QuizAttemptResult, QuizAttemptSubmission } from '../api/types';

export interface QuestionBankItem extends QuizQuestion {
  stage: string;
  topic: string;
  correct_option_id: string;
  correct_answer_text: string;
  explanation: string;
}

export interface DrugQuizSet {
  id: string;
  setNumber: number;
  drugId: string;
  drugKey: string;
  drugName: string;
  title: string;
  subtitle: string;
  description: string;
  pass_percentage: number;
  questions: QuestionBankItem[];
}

export const DRUG_QUIZ_SETS: Record<string, DrugQuizSet[]> = {
  // =========================================================================
  // 1. IBUPROFEN SETS
  // =========================================================================
  ibuprofen: [
    // SET 1: Foundational Pharmacokinetics (ADME)
    {
      id: 'quiz-ibuprofen-set1',
      setNumber: 1,
      drugId: 'drug-ibuprofen-001',
      drugKey: 'ibuprofen',
      drugName: 'Ibuprofen',
      title: 'Ibuprofen • Set 1: Foundational ADME & Mechanism',
      subtitle: 'Core physiological transit, chiral inversion, albumin binding, and renal clearance.',
      description: 'Evaluate fundamental systemic transit, hepatic epimerase chiral conversion, and COX inhibition.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ib-s1-q1',
          quiz_id: 'quiz-ibuprofen-set1',
          question_order: 1,
          stage: 'Liver',
          topic: 'Hepatic epimerase & chiral inversion',
          question_text: 'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?',
          options: [
            { id: 'ib-s1-q1-a', question_id: 'ib-s1-q1', option_text: 'Stomach mucosa' },
            { id: 'ib-s1-q1-b', question_id: 'ib-s1-q1', option_text: 'Liver (hepatic epimerase & CYP2C9)' },
            { id: 'ib-s1-q1-c', question_id: 'ib-s1-q1', option_text: 'Kidney glomeruli' },
            { id: 'ib-s1-q1-d', question_id: 'ib-s1-q1', option_text: 'Oral cavity epithelium' },
          ],
          correct_option_id: 'ib-s1-q1-b',
          correct_answer_text: 'Liver (hepatic epimerase & CYP2C9)',
          explanation: 'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
        },
        {
          id: 'ib-s1-q2',
          quiz_id: 'quiz-ibuprofen-set1',
          question_order: 2,
          stage: 'Stomach',
          topic: 'Gastric transit & food effects',
          question_text: 'How does taking Ibuprofen after a meal influence its pharmacokinetics?',
          options: [
            { id: 'ib-s1-q2-a', question_id: 'ib-s1-q2', option_text: 'It permanently destroys drug bioavailability' },
            { id: 'ib-s1-q2-b', question_id: 'ib-s1-q2', option_text: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC' },
            { id: 'ib-s1-q2-c', question_id: 'ib-s1-q2', option_text: 'It converts Ibuprofen into an irreversible enzyme blocker' },
            { id: 'ib-s1-q2-d', question_id: 'ib-s1-q2', option_text: 'Accelerates gastric emptying and elevates peak concentration (Cmax) twofold' },
          ],
          correct_option_id: 'ib-s1-q2-b',
          correct_answer_text: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
          explanation: 'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) from ~1-1.5 h to ~2.5-3.0 h without significantly reducing total systemic bioavailability (AUC ~85-90%).',
        },
        {
          id: 'ib-s1-q3',
          quiz_id: 'quiz-ibuprofen-set1',
          question_order: 3,
          stage: 'Target Tissue',
          topic: 'Reversible COX-1 and COX-2 inhibition',
          question_text: 'What is the primary molecular mechanism responsible for the analgesic and anti-inflammatory activity of (S)-ibuprofen?',
          options: [
            { id: 'ib-s1-q3-a', question_id: 'ib-s1-q3', option_text: 'Irreversible covalent acetylation of platelet COX-1' },
            { id: 'ib-s1-q3-b', question_id: 'ib-s1-q3', option_text: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)' },
            { id: 'ib-s1-q3-c', question_id: 'ib-s1-q3', option_text: 'Direct stimulation of mu-opioid central brain receptors' },
            { id: 'ib-s1-q3-d', question_id: 'ib-s1-q3', option_text: 'Selective destruction of histamine H1 receptors in peripheral capillaries' },
          ],
          correct_option_id: 'ib-s1-q3-b',
          correct_answer_text: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)',
          explanation: '(S)-Ibuprofen reversibly blocks the arachidonic acid channel of COX-1 and COX-2, inhibiting downstream synthesis of pro-inflammatory prostaglandins. Aspirin irreversibly acetylates COX.',
        },
        {
          id: 'ib-s1-q4',
          quiz_id: 'quiz-ibuprofen-set1',
          question_order: 4,
          stage: 'Bloodstream',
          topic: 'Albumin binding',
          question_text: 'In systemic circulation, how is Ibuprofen predominantly transported within human plasma?',
          options: [
            { id: 'ib-s1-q4-a', question_id: 'ib-s1-q4', option_text: 'Extensively bound to serum albumin (>99% protein binding)' },
            { id: 'ib-s1-q4-b', question_id: 'ib-s1-q4', option_text: 'Free circulating unbound fraction (>80% free in plasma)' },
            { id: 'ib-s1-q4-c', question_id: 'ib-s1-q4', option_text: 'Trapped exclusively inside erythrocyte hemoglobin molecules' },
            { id: 'ib-s1-q4-d', question_id: 'ib-s1-q4', option_text: 'Precipitated as crystalline insoluble micro-complexes' },
          ],
          correct_option_id: 'ib-s1-q4-a',
          correct_answer_text: 'Extensively bound to serum albumin (>99% protein binding)',
          explanation: 'Ibuprofen is over 99% bound to plasma albumin at therapeutic concentrations, resulting in a low apparent volume of distribution (~0.12-0.15 L/kg).',
        },
        {
          id: 'ib-s1-q5',
          quiz_id: 'quiz-ibuprofen-set1',
          question_order: 5,
          stage: 'Kidneys',
          topic: 'Glomerular filtration & clearance',
          question_text: 'What is the principal elimination pathway for Ibuprofen in healthy human physiology?',
          options: [
            { id: 'ib-s1-q5-a', question_id: 'ib-s1-q5', option_text: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine' },
            { id: 'ib-s1-q5-b', question_id: 'ib-s1-q5', option_text: 'Direct biliary excretion without renal filtration' },
            { id: 'ib-s1-q5-c', question_id: 'ib-s1-q5', option_text: 'Excretion of unchanged active parent molecule (>90% unchanged in urine)' },
            { id: 'ib-s1-q5-d', question_id: 'ib-s1-q5', option_text: 'Pulmonary vaporization through expired alveolar gas' },
          ],
          correct_option_id: 'ib-s1-q5-a',
          correct_answer_text: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine',
          explanation: 'Less than 1% of ibuprofen is excreted unchanged; more than 90% is eliminated renally as oxidative metabolites and acyl-glucuronide conjugates.',
        },
      ],
    },

    // SET 2: Clinical Scenarios & Drug Interactions
    {
      id: 'quiz-ibuprofen-set2',
      setNumber: 2,
      drugId: 'drug-ibuprofen-001',
      drugKey: 'ibuprofen',
      drugName: 'Ibuprofen',
      title: 'Ibuprofen • Set 2: Clinical Scenarios & Drug Interactions',
      subtitle: 'Aspirin interaction, renal hemodynamics, CYP2C9 pharmacogenomics, and hypoalbuminemia.',
      description: 'Explore drug-drug interactions, renal afferent arteriolar hemodynamics, and pharmacogenomic variability.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ib-s2-q1',
          quiz_id: 'quiz-ibuprofen-set2',
          question_order: 1,
          stage: 'Bloodstream',
          topic: 'Aspirin-Ibuprofen competitive interaction',
          question_text: 'When ibuprofen is taken prior to low-dose cardioprotective aspirin, how does it blunt aspirin antiplatelet efficacy?',
          options: [
            { id: 'ib-s2-q1-a', question_id: 'ib-s2-q1', option_text: 'Accelerates aspirin enzymatic hydrolysis in stomach acid' },
            { id: 'ib-s2-q1-b', question_id: 'ib-s2-q1', option_text: 'Competitively blocks aspirin access to the Ser529 catalytic acetylation site in platelet COX-1' },
            { id: 'ib-s2-q1-c', question_id: 'ib-s2-q1', option_text: 'Destroys platelet thromboxane A2 receptors irreversibly' },
            { id: 'ib-s2-q1-d', question_id: 'ib-s2-q1', option_text: 'Precipitates aspirin out of plasma solution as an insoluble chelate' },
          ],
          correct_option_id: 'ib-s2-q1-b',
          correct_answer_text: 'Competitively blocks aspirin access to the Ser529 catalytic acetylation site in platelet COX-1',
          explanation: 'Ibuprofen binds reversibly to the COX-1 hydrophobic channel, sterically hindering aspirin from accessing and irreversibly acetylating Ser529.',
        },
        {
          id: 'ib-s2-q2',
          quiz_id: 'quiz-ibuprofen-set2',
          question_order: 2,
          stage: 'Kidneys',
          topic: 'Renal afferent arteriolar hemodynamics',
          question_text: 'Why can ibuprofen cause acute kidney injury in hypovolemic patients or those taking ACE inhibitors and diuretics?',
          options: [
            { id: 'ib-s2-q2-a', question_id: 'ib-s2-q2', option_text: 'Inhibits vasodilatory PGE2 and PGI2 synthesis, constricting afferent arterioles and dropping GFR' },
            { id: 'ib-s2-q2-b', question_id: 'ib-s2-q2', option_text: 'Directly hydrolyzes collecting duct aquaporin water channels' },
            { id: 'ib-s2-q2-c', question_id: 'ib-s2-q2', option_text: 'Causes extensive crystal precipitation in the renal pelvis' },
            { id: 'ib-s2-q2-d', question_id: 'ib-s2-q2', option_text: 'Stimulates excessive renin release leading to malignant hypotension' },
          ],
          correct_option_id: 'ib-s2-q2-a',
          correct_answer_text: 'Inhibits vasodilatory PGE2 and PGI2 synthesis, constricting afferent arterioles and dropping GFR',
          explanation: 'Renal prostaglandins dilate afferent arterioles to maintain glomerular filtration pressure during reduced perfusion. Ibuprofen blocks this compensatory dilation.',
        },
        {
          id: 'ib-s2-q3',
          quiz_id: 'quiz-ibuprofen-set2',
          question_order: 3,
          stage: 'Liver',
          topic: 'CYP2C9 pharmacogenomics',
          question_text: 'Patients carrying the CYP2C9*3/*3 poor metabolizer genotype exhibit which pharmacokinetic alteration for (S)-ibuprofen?',
          options: [
            { id: 'ib-s2-q3-a', question_id: 'ib-s2-q3', option_text: 'Significantly decreased intrinsic hepatic clearance with prolonged elimination half-life' },
            { id: 'ib-s2-q3-b', question_id: 'ib-s2-q3', option_text: 'Complete failure of intestinal absorption across enterocytes' },
            { id: 'ib-s2-q3-c', question_id: 'ib-s2-q3', option_text: 'Accelerated clearance resulting in sub-therapeutic plasma concentrations' },
            { id: 'ib-s2-q3-d', question_id: 'ib-s2-q3', option_text: 'Direct conversion into toxic acetaminophen conjugates' },
          ],
          correct_option_id: 'ib-s2-q3-a',
          correct_answer_text: 'Significantly decreased intrinsic hepatic clearance with prolonged elimination half-life',
          explanation: 'CYP2C9 mediates oxidative hydroxylation of (S)-ibuprofen. The *3 variant dramatically reduces metabolic activity, resulting in elevated drug exposure and increased toxicity risk.',
        },
        {
          id: 'ib-s2-q4',
          quiz_id: 'quiz-ibuprofen-set2',
          question_order: 4,
          stage: 'Bloodstream',
          topic: 'Hypoalbuminemia & unbound fraction',
          question_text: 'In severe hypoalbuminemia (plasma albumin < 2.5 g/dL), what happens to circulating ibuprofen pharmacokinetics?',
          options: [
            { id: 'ib-s2-q4-a', question_id: 'ib-s2-q4', option_text: 'The free active unbound drug fraction increases, elevating volume of distribution and clearance' },
            { id: 'ib-s2-q4-b', question_id: 'ib-s2-q4', option_text: 'Ibuprofen becomes permanently trapped in red blood cell membranes' },
            { id: 'ib-s2-q4-c', question_id: 'ib-s2-q4', option_text: 'Hepatic epimerase activity drops to zero' },
            { id: 'ib-s2-q4-d', question_id: 'ib-s2-q4', option_text: 'Total plasma concentration doubles without changes in free fraction' },
          ],
          correct_option_id: 'ib-s2-q4-a',
          correct_answer_text: 'The free active unbound drug fraction increases, elevating volume of distribution and clearance',
          explanation: 'Because ibuprofen is >99% bound to albumin, reduced binding capacity increases the unbound pharmacologically active fraction, modifying clearance and distribution.',
        },
        {
          id: 'ib-s2-q5',
          quiz_id: 'quiz-ibuprofen-set2',
          question_order: 5,
          stage: 'Target Tissue',
          topic: 'Reversible non-covalent binding',
          question_text: 'Why does ibuprofen lack the irreversible antiplatelet blockade characteristic of acetylsalicylic acid?',
          options: [
            { id: 'ib-s2-q5-a', question_id: 'ib-s2-q5', option_text: 'It binds via non-covalent electrostatic and hydrophobic bonds, allowing reversible dissociation as plasma levels decline' },
            { id: 'ib-s2-q5-b', question_id: 'ib-s2-q5', option_text: 'It is rapidly destroyed by platelet cytoplasmic proteases within minutes' },
            { id: 'ib-s2-q5-c', question_id: 'ib-s2-q5', option_text: 'Platelets possess an active efflux pump that expels all propionic acid derivatives' },
            { id: 'ib-s2-q5-d', question_id: 'ib-s2-q5', option_text: 'Ibuprofen only binds COX-2 and cannot penetrate platelet cytoplasm' },
          ],
          correct_option_id: 'ib-s2-q5-a',
          correct_answer_text: 'It binds via non-covalent electrostatic and hydrophobic bonds, allowing reversible dissociation as plasma levels decline',
          explanation: 'Unlike aspirin, which covalently transfers an acetyl group to serine in COX, ibuprofen reversibly occupies the catalytic channel without covalent modification.',
        },
      ],
    },

    // SET 3: Molecular Dynamics & Special Populations
    {
      id: 'quiz-ibuprofen-set3',
      setNumber: 3,
      drugId: 'drug-ibuprofen-001',
      drugKey: 'ibuprofen',
      drugName: 'Ibuprofen',
      title: 'Ibuprofen • Set 3: Molecular Dynamics & Special Populations',
      subtitle: 'Unidirectional inversion, pregnancy contraindication, urinary metabolites, and Vd.',
      description: 'Analyze stereospecific enzyme kinetics, fetal circulation considerations, and elimination kinetics.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ib-s3-q1',
          quiz_id: 'quiz-ibuprofen-set3',
          question_order: 1,
          stage: 'Liver',
          topic: 'Unidirectional epimerase kinetics',
          question_text: 'Does (S)-ibuprofen undergo in vivo chiral inversion back into inactive (R)-ibuprofen in the human body?',
          options: [
            { id: 'ib-s3-q1-a', question_id: 'ib-s3-q1', option_text: 'No; the 2-arylpropionyl-CoA epimerase enzymatic pathway is strictly unidirectional from (R) to (S)' },
            { id: 'ib-s3-q1-b', question_id: 'ib-s3-q1', option_text: 'Yes; it rapidly establishes a 50:50 equilibrium racemate every 30 minutes' },
            { id: 'ib-s3-q1-c', question_id: 'ib-s3-q1', option_text: 'Yes; but only in the presence of basic pancreatic juice' },
            { id: 'ib-s3-q1-d', question_id: 'ib-s3-q1', option_text: 'Yes; reverse inversion occurs exclusively in renal proximal tubules' },
          ],
          correct_option_id: 'ib-s3-q1-a',
          correct_answer_text: 'No; the 2-arylpropionyl-CoA epimerase enzymatic pathway is strictly unidirectional from (R) to (S)',
          explanation: 'Chiral inversion requires stereospecific acyl-CoA synthetase activation that is enantioselective for (R)-ibuprofen; (S)-ibuprofen is not a substrate for this reaction.',
        },
        {
          id: 'ib-s3-q2',
          quiz_id: 'quiz-ibuprofen-set3',
          question_order: 2,
          stage: 'Target Tissue',
          topic: 'Pregnancy contraindication mechanism',
          question_text: 'Why is ibuprofen contraindicated in the third trimester of human pregnancy?',
          options: [
            { id: 'ib-s3-q2-a', question_id: 'ib-s3-q2', option_text: 'Risk of premature closure of the fetal ductus arteriosus and persistent pulmonary hypertension via PGE2 inhibition' },
            { id: 'ib-s3-q2-b', question_id: 'ib-s3-q2', option_text: 'Immediate degradation of maternal placental estrogen receptors' },
            { id: 'ib-s3-q2-c', question_id: 'ib-s3-q2', option_text: 'Induction of uncontrollable uterine hyper-motility at 24 weeks' },
            { id: 'ib-s3-q2-d', question_id: 'ib-s3-q2', option_text: 'Permanent blockage of fetal amniotic surfactant secretion' },
          ],
          correct_option_id: 'ib-s3-q2-a',
          correct_answer_text: 'Risk of premature closure of the fetal ductus arteriosus and persistent pulmonary hypertension via PGE2 inhibition',
          explanation: 'Prostaglandins (primarily PGE2 and PGI2) keep the fetal ductus arteriosus patent in utero. NSAID-mediated prostaglandin inhibition can cause premature ductal constriction.',
        },
        {
          id: 'ib-s3-q3',
          quiz_id: 'quiz-ibuprofen-set3',
          question_order: 3,
          stage: 'Kidneys',
          topic: 'Specific urinary metabolites',
          question_text: 'Which chemical derivatives constitute over 90% of an administered ibuprofen dose recovered in human urine?',
          options: [
            { id: 'ib-s3-q3-a', question_id: 'ib-s3-q3', option_text: 'Oxidative 2-hydroxy- and 2-carboxy-ibuprofen and their acyl-glucuronide conjugates' },
            { id: 'ib-s3-q3-b', question_id: 'ib-s3-q3', option_text: 'Intact unchanged active (S)-ibuprofen crystals' },
            { id: 'ib-s3-q3-c', question_id: 'ib-s3-q3', option_text: 'Inorganic sulfate salts without aromatic rings' },
            { id: 'ib-s3-q3-d', question_id: 'ib-s3-q3', option_text: 'Deaminated salicylic acid breakdown products' },
          ],
          correct_option_id: 'ib-s3-q3-a',
          correct_answer_text: 'Oxidative 2-hydroxy- and 2-carboxy-ibuprofen and their acyl-glucuronide conjugates',
          explanation: 'Ibuprofen undergoes hepatic CYP-mediated oxidation into 2-hydroxy-ibuprofen and carboxy-ibuprofen, followed by phase II acyl-glucuronidation, before renal excretion.',
        },
        {
          id: 'ib-s3-q4',
          quiz_id: 'quiz-ibuprofen-set3',
          question_order: 4,
          stage: 'Bloodstream',
          topic: 'Apparent volume of distribution (Vd)',
          question_text: 'What is the typical apparent volume of distribution (Vd) of ibuprofen in a healthy adult human?',
          options: [
            { id: 'ib-s3-q4-a', question_id: 'ib-s3-q4', option_text: 'Low volume of distribution (~0.12 to 0.15 L/kg) restricted mainly to vascular space' },
            { id: 'ib-s3-q4-b', question_id: 'ib-s3-q4', option_text: 'Massive volume of distribution (>50 L/kg) sequestered in adipose tissue' },
            { id: 'ib-s3-q4-c', question_id: 'ib-s3-q4', option_text: 'Exactly equal to total body water (~0.6 L/kg)' },
            { id: 'ib-s3-q4-d', question_id: 'ib-s3-q4', option_text: 'Zero distribution because the drug does not enter bloodstream' },
          ],
          correct_option_id: 'ib-s3-q4-a',
          correct_answer_text: 'Low volume of distribution (~0.12 to 0.15 L/kg) restricted mainly to vascular space',
          explanation: 'Extensive plasma albumin binding (>99%) retains the vast majority of ibuprofen in the intravascular and extracellular fluid compartment, resulting in a low Vd.',
        },
        {
          id: 'ib-s3-q5',
          quiz_id: 'quiz-ibuprofen-set3',
          question_order: 5,
          stage: 'Oral Cavity',
          topic: 'Pediatric suspension formulation',
          question_text: 'Why do oral pediatric ibuprofen suspensions utilize micronized drug crystals rather than soluble free acid solutions?',
          options: [
            { id: 'ib-s3-q5-a', question_id: 'ib-s3-q5', option_text: 'To minimize severe oropharyngeal mucosal irritation while optimizing enteric dissolution rate' },
            { id: 'ib-s3-q5-b', question_id: 'ib-s3-q5', option_text: 'To prevent any absorption before the sigmoid colon' },
            { id: 'ib-s3-q5-c', question_id: 'ib-s3-q5', option_text: 'To convert the drug into an irreversible prodrug' },
            { id: 'ib-s3-q5-d', question_id: 'ib-s3-q5', option_text: 'To block salivary enzyme degradation completely' },
          ],
          correct_option_id: 'ib-s3-q5-a',
          correct_answer_text: 'To minimize severe oropharyngeal mucosal irritation while optimizing enteric dissolution rate',
          explanation: 'Free dissolved ibuprofen causes intense throat irritation and pungent burning sensation. Micronized suspension particles mask this while preserving rapid dissolution.',
        },
      ],
    },
  ],

  // =========================================================================
  // 2. AMOXICILLIN SETS
  // =========================================================================
  amoxicillin: [
    // SET 1: Foundational Beta-Lactam ADME
    {
      id: 'quiz-amox-set1',
      setNumber: 1,
      drugId: 'drug-amoxicillin-002',
      drugKey: 'amoxicillin',
      drugName: 'Amoxicillin',
      title: 'Amoxicillin • Set 1: Foundational Beta-Lactam ADME',
      subtitle: 'PBP cell-wall target, PEPT1 mucosal transport, food stability, and tubular clearance.',
      description: 'Assess aminopenicillin mechanisms, intestinal oligopeptide transport, and renal excretion.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'am-s1-q1',
          quiz_id: 'quiz-amox-set1',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Bactericidal cell wall inhibition',
          question_text: 'What is the primary bactericidal mechanism of action of amoxicillin at target tissue infection sites?',
          options: [
            { id: 'am-s1-q1-a', question_id: 'am-s1-q1', option_text: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding' },
            { id: 'am-s1-q1-b', question_id: 'am-s1-q1', option_text: 'Inhibition of bacterial 50S ribosomal protein translation' },
            { id: 'am-s1-q1-c', question_id: 'am-s1-q1', option_text: 'Intercalation into bacterial circular plasmid DNA' },
            { id: 'am-s1-q1-d', question_id: 'am-s1-q1', option_text: 'Blockade of bacterial dihydrofolate reductase' },
          ],
          correct_option_id: 'am-s1-q1-a',
          correct_answer_text: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding',
          explanation: 'Amoxicillin binds PBPs, inhibiting transpeptidase cross-linking of peptidoglycan chains and triggering autolytic enzyme activity.',
        },
        {
          id: 'am-s1-q2',
          quiz_id: 'quiz-amox-set1',
          question_order: 2,
          stage: 'Small Intestine',
          topic: 'PEPT1 active mucosal uptake',
          question_text: 'Through which gastrointestinal transport mechanism is amoxicillin primarily absorbed in the small intestine?',
          options: [
            { id: 'am-s1-q2-a', question_id: 'am-s1-q2', option_text: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)' },
            { id: 'am-s1-q2-b', question_id: 'am-s1-q2', option_text: 'Exclusive paracellular tight-junction pore filtration' },
            { id: 'am-s1-q2-c', question_id: 'am-s1-q2', option_text: 'Receptor-mediated endocytosis into lymphatic chylomicrons' },
            { id: 'am-s1-q2-d', question_id: 'am-s1-q2', option_text: 'SGLT1 glucose-dependent sodium symport' },
          ],
          correct_option_id: 'am-s1-q2-a',
          correct_answer_text: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)',
          explanation: 'As an amino-penicillin mimicking dipeptides, amoxicillin utilizes the proton-coupled oligopeptide transporter 1 (PEPT1) in the duodenum and jejunum, yielding ~75-90% bioavailability.',
        },
        {
          id: 'am-s1-q3',
          quiz_id: 'quiz-amox-set1',
          question_order: 3,
          stage: 'Stomach',
          topic: 'Food effect on systemic absorption',
          question_text: 'How does food co-administration affect the oral bioavailability and total systemic absorption (AUC) of amoxicillin?',
          options: [
            { id: 'am-s1-q3-a', question_id: 'am-s1-q3', option_text: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals' },
            { id: 'am-s1-q3-b', question_id: 'am-s1-q3', option_text: 'Food destroys 80% of amoxicillin molecules in gastric juice' },
            { id: 'am-s1-q3-c', question_id: 'am-s1-q3', option_text: 'Food accelerates absorption to cause instant peak toxicity' },
            { id: 'am-s1-q3-d', question_id: 'am-s1-q3', option_text: 'Food converts amoxicillin into an inactive prodrug permanently' },
          ],
          correct_option_id: 'am-s1-q3-a',
          correct_answer_text: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals',
          explanation: 'Unlike ampicillin, amoxicillin absorption is stable in the presence of food; overall AUC is preserved, although peak plasma concentration may be slightly delayed.',
        },
        {
          id: 'am-s1-q4',
          quiz_id: 'quiz-amox-set1',
          question_order: 4,
          stage: 'Kidneys',
          topic: 'Renal tubular excretion',
          question_text: 'Which physiological clearance pathway is responsible for eliminating the majority of unchanged amoxicillin?',
          options: [
            { id: 'am-s1-q4-a', question_id: 'am-s1-q4', option_text: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion' },
            { id: 'am-s1-q4-b', question_id: 'am-s1-q4', option_text: 'Exclusively biliary excretion into feces (>90%)' },
            { id: 'am-s1-q4-c', question_id: 'am-s1-q4', option_text: 'Complete hepatic CYP3A4 conversion into gaseous metabolites' },
            { id: 'am-s1-q4-d', question_id: 'am-s1-q4', option_text: 'Pulmonary exhalation through bronchial secretions' },
          ],
          correct_option_id: 'am-s1-q4-a',
          correct_answer_text: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion',
          explanation: 'Approximately 60–80% of an oral amoxicillin dose is excreted unchanged in the urine within 6 to 8 hours via glomerular filtration and tubular secretion.',
        },
        {
          id: 'am-s1-q5',
          quiz_id: 'quiz-amox-set1',
          question_order: 5,
          stage: 'Target Tissue',
          topic: 'Beta-lactamase resistance mechanism',
          question_text: 'What is the most prevalent bacterial resistance mechanism encountered by amoxicillin in clinical pathogens?',
          options: [
            { id: 'am-s1-q5-a', question_id: 'am-s1-q5', option_text: 'Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring' },
            { id: 'am-s1-q5-b', question_id: 'am-s1-q5', option_text: 'Efflux pump hyper-expression alone' },
            { id: 'am-s1-q5-c', question_id: 'am-s1-q5', option_text: 'Complete absence of peptidoglycan in bacterial cells' },
            { id: 'am-s1-q5-d', question_id: 'am-s1-q5', option_text: 'Bacterial conversion of amoxicillin into human albumin' },
          ],
          correct_option_id: 'am-s1-q5-a',
          correct_answer_text: 'Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring',
          explanation: 'Bacterial beta-lactamases cleave the four-membered cyclic amide ring of amoxicillin, rendering it ineffective unless protected by clavulanic acid.',
        },
      ],
    },

    // SET 2: Clinical Combinations & Renal Competition
    {
      id: 'quiz-amox-set2',
      setNumber: 2,
      drugId: 'drug-amoxicillin-002',
      drugKey: 'amoxicillin',
      drugName: 'Amoxicillin',
      title: 'Amoxicillin • Set 2: Clinical Combinations & Renal Competition',
      subtitle: 'Clavulanate synergy, probenecid interaction, protein binding, and gut microbiota.',
      description: 'Explore suicide inhibitor synergy, organic anion transporter blockade, and enteric flora impact.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'am-s2-q1',
          quiz_id: 'quiz-amox-set2',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Clavulanate suicide inhibition',
          question_text: 'How does clavulanic acid restore amoxicillin efficacy against beta-lactamase-producing bacterial strains?',
          options: [
            { id: 'am-s2-q1-a', question_id: 'am-s2-q1', option_text: 'It acts as an irreversible suicide inhibitor that binds and inactivates bacterial beta-lactamases' },
            { id: 'am-s2-q1-b', question_id: 'am-s2-q1', option_text: 'It directly kills bacteria by destroying ribosome 70S subunits' },
            { id: 'am-s2-q1-c', question_id: 'am-s2-q1', option_text: 'It increases gastric acid pH to neutralize bacterial toxins' },
            { id: 'am-s2-q1-d', question_id: 'am-s2-q1', option_text: 'It prevents amoxicillin from being absorbed into human blood' },
          ],
          correct_option_id: 'am-s2-q1-a',
          correct_answer_text: 'It acts as an irreversible suicide inhibitor that binds and inactivates bacterial beta-lactamases',
          explanation: 'Clavulanate binds the catalytic serine residue of beta-lactamases, undergoing covalent rearrangement that permanently inactivates the enzyme and protects amoxicillin.',
        },
        {
          id: 'am-s2-q2',
          quiz_id: 'quiz-amox-set2',
          question_order: 2,
          stage: 'Kidneys',
          topic: 'Probenecid drug interaction',
          question_text: 'Co-administration of probenecid with amoxicillin prolongs and elevates amoxicillin blood levels by which mechanism?',
          options: [
            { id: 'am-s2-q2-a', question_id: 'am-s2-q2', option_text: 'Competitive inhibition of organic anion transporters (OAT1/OAT3) in renal proximal tubule secretion' },
            { id: 'am-s2-q2-b', question_id: 'am-s2-q2', option_text: 'Permanent destruction of renal glomeruli filtration barrier' },
            { id: 'am-s2-q2-c', question_id: 'am-s2-q2', option_text: 'Induction of hepatic CYP3A4 enzymes tenfold' },
            { id: 'am-s2-q2-d', question_id: 'am-s2-q2', option_text: 'Direct chemical precipitation of amoxicillin in blood plasma' },
          ],
          correct_option_id: 'am-s2-q2-a',
          correct_answer_text: 'Competitive inhibition of organic anion transporters (OAT1/OAT3) in renal proximal tubule secretion',
          explanation: 'Amoxicillin is actively secreted into the tubular lumen via OAT transporters. Probenecid competes for this transporter, decreasing clearance and extending amoxicillin half-life.',
        },
        {
          id: 'am-s2-q3',
          quiz_id: 'quiz-amox-set2',
          question_order: 3,
          stage: 'Bloodstream',
          topic: 'Protein binding & tissue distribution',
          question_text: 'What is the characteristic plasma protein binding fraction of amoxicillin in healthy human circulation?',
          options: [
            { id: 'am-s2-q3-a', question_id: 'am-s2-q3', option_text: 'Low protein binding (~17–20%), resulting in extensive distribution into interstitial fluid' },
            { id: 'am-s2-q3-b', question_id: 'am-s2-q3', option_text: 'Extremely high binding (>99%) restricted entirely to plasma volume' },
            { id: 'am-s2-q3-c', question_id: 'am-s2-q3', option_text: 'Zero binding because the drug does not touch albumin' },
            { id: 'am-s2-q3-d', question_id: 'am-s2-q3', option_text: 'Selective binding to platelet membranes only' },
          ],
          correct_option_id: 'am-s2-q3-a',
          correct_answer_text: 'Low protein binding (~17–20%), resulting in extensive distribution into interstitial fluid',
          explanation: 'Unlike highly bound penicillins like oxacillin, amoxicillin has low protein binding (~18%), allowing high free drug fractions to diffuse into target tissues, secretions, and peritoneal fluid.',
        },
        {
          id: 'am-s2-q4',
          quiz_id: 'quiz-amox-set2',
          question_order: 4,
          stage: 'Small Intestine',
          topic: 'Superior bioavailability vs Ampicillin',
          question_text: 'Why does oral amoxicillin achieve nearly double the bioavailability of oral ampicillin (75–90% vs 40–50%)?',
          options: [
            { id: 'am-s2-q4-a', question_id: 'am-s2-q4', option_text: 'The presence of a phenolic p-hydroxy group enhances rapid PEPT1 carrier transport and mucosal uptake' },
            { id: 'am-s2-q4-b', question_id: 'am-s2-q4', option_text: 'Amoxicillin avoids all contact with gastric acid completely' },
            { id: 'am-s2-q4-c', question_id: 'am-s2-q4', option_text: 'Ampicillin is destroyed by salivary amylase in the mouth' },
            { id: 'am-s2-q4-d', question_id: 'am-s2-q4', option_text: 'Amoxicillin binds irreversibly to bile salts' },
          ],
          correct_option_id: 'am-s2-q4-a',
          correct_answer_text: 'The presence of a phenolic p-hydroxy group enhances rapid PEPT1 carrier transport and mucosal uptake',
          explanation: 'Amoxicillin contains a p-hydroxy substituent on the benzyl side chain that improves intestinal enterocyte uptake via PEPT1 and provides greater stability, reducing unabsorbed residue.',
        },
        {
          id: 'am-s2-q5',
          quiz_id: 'quiz-amox-set2',
          question_order: 5,
          stage: 'Liver',
          topic: 'Minimal hepatic transformation',
          question_text: 'How much of an absorbed amoxicillin dose undergoes hepatic biotransformation in humans?',
          options: [
            { id: 'am-s2-q5-a', question_id: 'am-s2-q5', option_text: 'Minor biotransformation (~10–20% converted into amoxilloic acid), with majority cleared intact by kidneys' },
            { id: 'am-s2-q5-b', question_id: 'am-s2-q5', option_text: '100% extensive first-pass destruction in the liver' },
            { id: 'am-s2-q5-c', question_id: 'am-s2-q5', option_text: 'Complete chiral conversion into (R)-enantiomers' },
            { id: 'am-s2-q5-d', question_id: 'am-s2-q5', option_text: 'Conversion into active cephalosporins in hepatocytes' },
          ],
          correct_option_id: 'am-s2-q5-a',
          correct_answer_text: 'Minor biotransformation (~10–20% converted into amoxilloic acid), with majority cleared intact by kidneys',
          explanation: 'Amoxicillin is not significantly metabolized by cytochrome P450 systems; only a small percentage undergoes hydrolysis to inactive penicilloic acid derivatives.',
        },
      ],
    },

    // SET 3: Advanced Pharmacodynamics & Special Scenarios
    {
      id: 'quiz-amox-set3',
      setNumber: 3,
      drugId: 'drug-amoxicillin-002',
      drugKey: 'amoxicillin',
      drugName: 'Amoxicillin',
      title: 'Amoxicillin • Set 3: Advanced Pharmacodynamics & Dosing',
      subtitle: 'T > MIC index, CSF penetration, pediatric formulation, and renal half-life.',
      description: 'Analyze time-dependent killing indices, blood-brain barrier transport, and suspension stability.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'am-s3-q1',
          quiz_id: 'quiz-amox-set3',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Time-dependent PK/PD index',
          question_text: 'Which pharmacokinetic/pharmacodynamic (PK/PD) index best predicts amoxicillin bactericidal efficacy in clinical infections?',
          options: [
            { id: 'am-s3-q1-a', question_id: 'am-s3-q1', option_text: 'Time free drug concentration exceeds the bacterial MIC (T > MIC > 40–50% of the dosing interval)' },
            { id: 'am-s3-q1-b', question_id: 'am-s3-q1', option_text: 'Peak serum concentration divided by MIC (Cmax / MIC)' },
            { id: 'am-s3-q1-c', question_id: 'am-s3-q1', option_text: 'Total AUC across 24 hours alone, independent of dosing frequency' },
            { id: 'am-s3-q1-d', question_id: 'am-s3-q1', option_text: 'Volume of distribution multiplied by clearance' },
          ],
          correct_option_id: 'am-s3-q1-a',
          correct_answer_text: 'Time free drug concentration exceeds the bacterial MIC (T > MIC > 40–50% of the dosing interval)',
          explanation: 'As a beta-lactam, amoxicillin exhibits time-dependent bactericidal action. Maintaining free drug levels above MIC for at least 40-50% of the dosing interval ensures optimal bacterial eradication.',
        },
        {
          id: 'am-s3-q2',
          quiz_id: 'quiz-amox-set3',
          question_order: 2,
          stage: 'Bloodstream',
          topic: 'Blood-brain barrier penetration',
          question_text: 'How does amoxicillin penetrate the blood-brain barrier and cerebrospinal fluid (CSF)?',
          options: [
            { id: 'am-s3-q2-a', question_id: 'am-s3-q2', option_text: 'Poor penetration under normal conditions (<5%), but increases substantially during active meningeal inflammation' },
            { id: 'am-s3-q2-b', question_id: 'am-s3-q2', option_text: 'Complete and unrestricted crossing yielding identical CSF and plasma concentrations' },
            { id: 'am-s3-q2-c', question_id: 'am-s3-q2', option_text: 'Zero penetration even in severe bacterial meningitis' },
            { id: 'am-s3-q2-d', question_id: 'am-s3-q2', option_text: 'Transported exclusively via retrograde axonal transport' },
          ],
          correct_option_id: 'am-s3-q2-a',
          correct_answer_text: 'Poor penetration under normal conditions (<5%), but increases substantially during active meningeal inflammation',
          explanation: 'Intact blood-brain barrier blocks hydrophilic amoxicillin. Inflammation opens endothelial tight junctions, elevating CSF levels sufficiently for high-dose treatment.',
        },
        {
          id: 'am-s3-q3',
          quiz_id: 'quiz-amox-set3',
          question_order: 3,
          stage: 'Kidneys',
          topic: 'Elimination half-life in renal impairment',
          question_text: 'What is the elimination half-life (t1/2) of amoxicillin in normal renal function versus end-stage renal disease (ESRD)?',
          options: [
            { id: 'am-s3-q3-a', question_id: 'am-s3-q3', option_text: '~1 to 1.5 hours in healthy adults, extending to 7 to 14 hours in severe renal impairment' },
            { id: 'am-s3-q3-b', question_id: 'am-s3-q3', option_text: '24 hours in healthy adults, dropping to 30 minutes in ESRD' },
            { id: 'am-s3-q3-c', question_id: 'am-s3-q3', option_text: 'Exactly 60 seconds regardless of renal function' },
            { id: 'am-s3-q3-d', question_id: 'am-s3-q3', option_text: 'Remains completely unchanged because kidneys do not eliminate amoxicillin' },
          ],
          correct_option_id: 'am-s3-q3-a',
          correct_answer_text: '~1 to 1.5 hours in healthy adults, extending to 7 to 14 hours in severe renal impairment',
          explanation: 'Because amoxicillin relies predominantly on renal tubular secretion and filtration, declining renal clearance dramatically prolongs its half-life, mandating dose adjustment.',
        },
        {
          id: 'am-s3-q4',
          quiz_id: 'quiz-amox-set3',
          question_order: 4,
          stage: 'Oral Cavity',
          topic: 'Reconstitution stability of suspension',
          question_text: 'Why must reconstituted oral amoxicillin pediatric suspension be stored in refrigeration and discarded after 14 days?',
          options: [
            { id: 'am-s3-q4-a', question_id: 'am-s3-q4', option_text: 'Aqueous environment promotes progressive hydrolytic cleavage of the beta-lactam ring at room temperature' },
            { id: 'am-s3-q4-b', question_id: 'am-s3-q4', option_text: 'Amoxicillin transforms into a hazardous explosive compound' },
            { id: 'am-s3-q4-c', question_id: 'am-s3-q4', option_text: 'The suspension solidifies into an unbreakable stone' },
            { id: 'am-s3-q4-d', question_id: 'am-s3-q4', option_text: 'Refrigeration is solely to improve sweet taste for infants' },
          ],
          correct_option_id: 'am-s3-q4-a',
          correct_answer_text: 'Aqueous environment promotes progressive hydrolytic cleavage of the beta-lactam ring at room temperature',
          explanation: 'The strained 4-membered beta-lactam ring is susceptible to chemical hydrolysis in water. Cold temperatures slow ring opening, preserving antibacterial potency for up to 14 days.',
        },
        {
          id: 'am-s3-q5',
          quiz_id: 'quiz-amox-set3',
          question_order: 5,
          stage: 'Small Intestine',
          topic: 'High-dose oral absorption saturation',
          question_text: 'When oral amoxicillin dosage is increased from 500 mg to 3000 mg in a single dose, what happens to fractional bioavailability?',
          options: [
            { id: 'am-s3-q5-a', question_id: 'am-s3-q5', option_text: 'Fractional bioavailability decreases due to saturation of mucosal PEPT1 active carrier transporters' },
            { id: 'am-s3-q5-b', question_id: 'am-s3-q5', option_text: 'Bioavailability increases exponentially beyond 100%' },
            { id: 'am-s3-q5-c', question_id: 'am-s3-q5', option_text: 'Absorption shifts entirely to the colon without delay' },
            { id: 'am-s3-q5-d', question_id: 'am-s3-q5', option_text: 'Gastric acid completely destroys all 3000 mg within seconds' },
          ],
          correct_option_id: 'am-s3-q5-a',
          correct_answer_text: 'Fractional bioavailability decreases due to saturation of mucosal PEPT1 active carrier transporters',
          explanation: 'PEPT1 is a capacity-limited, saturable transporter. Very high single doses exceed transporter capacity, so a smaller proportion of the dose is absorbed, increasing unabsorbed drug in bowel.',
        },
      ],
    },
  ],

  // =========================================================================
  // 3. AMBROXOL SETS
  // =========================================================================
  ambroxol: [
    // SET 1: Foundational Mucolytic ADME
    {
      id: 'quiz-amb-set1',
      setNumber: 1,
      drugId: 'drug-ambroxol-003',
      drugKey: 'ambroxol',
      drugName: 'Ambroxol Syrup',
      title: 'Ambroxol • Set 1: Foundational Mucolytic ADME',
      subtitle: 'Surfactant synthesis, mucosal absorption, pulmonary tropism, and CYP3A4 biotransformation.',
      description: 'Assess secretolytic action in type II pneumocytes, lysosomal trapping, and renal excretion.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'amb-s1-q1',
          quiz_id: 'quiz-amb-set1',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Pulmonary surfactant secretolysis',
          question_text: 'What is the primary secretolytic mechanism of action of ambroxol in pulmonary alveolar tissue?',
          options: [
            { id: 'amb-s1-q1-a', question_id: 'amb-s1-q1', option_text: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion' },
            { id: 'amb-s1-q1-b', question_id: 'amb-s1-q1', option_text: 'Direct chemical cleavage of disulfide bonds across cross-linked mucin fibers' },
            { id: 'amb-s1-q1-c', question_id: 'amb-s1-q1', option_text: 'Central inhibition of the medullary brainstem cough center' },
            { id: 'amb-s1-q1-d', question_id: 'amb-s1-q1', option_text: 'Beta-2 adrenergic bronchodilation of bronchial smooth muscle cells' },
          ],
          correct_option_id: 'amb-s1-q1-a',
          correct_answer_text: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion',
          explanation: 'Ambroxol stimulates alveolar type II pneumocytes to synthesize and discharge surfactant from lamellar bodies, lowering mucus surface tension and facilitating ciliary clearance.',
        },
        {
          id: 'amb-s1-q2',
          quiz_id: 'quiz-amb-set1',
          question_order: 2,
          stage: 'Small Intestine',
          topic: 'Intestinal mucosal absorption',
          question_text: 'How is ambroxol absorbed following oral syrup administration across gastrointestinal mucosa?',
          options: [
            { id: 'amb-s1-q2-a', question_id: 'amb-s1-q2', option_text: 'Rapid and almost complete absorption across the gastrointestinal mucosa with ~70–80% absolute bioavailability' },
            { id: 'amb-s1-q2-b', question_id: 'amb-s1-q2', option_text: 'Near-zero oral bioavailability (<2%) requiring intravenous injection exclusively' },
            { id: 'amb-s1-q2-c', question_id: 'amb-s1-q2', option_text: 'Delayed systemic peak requiring 24 to 48 hours for detection in bloodstream' },
            { id: 'amb-s1-q2-d', question_id: 'amb-s1-q2', option_text: 'Absorbed exclusively in the transverse colon via active sodium pumps' },
          ],
          correct_option_id: 'amb-s1-q2-a',
          correct_answer_text: 'Rapid and almost complete absorption across the gastrointestinal mucosa with ~70–80% absolute bioavailability',
          explanation: 'Ambroxol is rapidly absorbed along the enteric mucosa with peak plasma concentration occurring within 1.5 to 2 hours post-administration.',
        },
        {
          id: 'amb-s1-q3',
          quiz_id: 'quiz-amb-set1',
          question_order: 3,
          stage: 'Target Tissue',
          topic: 'Lysosomal pulmonary tropism',
          question_text: 'What physiological distribution characteristic distinguishes ambroxol pharmacokinetics in human respiratory organs?',
          options: [
            { id: 'amb-s1-q3-a', question_id: 'amb-s1-q3', option_text: 'High tissue affinity with pronounced pulmonary tropism resulting in lung concentrations 2.5 to 5-fold higher than plasma' },
            { id: 'amb-s1-q3-b', question_id: 'amb-s1-q3', option_text: 'Strict limitation to intravascular plasma volume with zero tissue penetration' },
            { id: 'amb-s1-q3-c', question_id: 'amb-s1-q3', option_text: 'Selective accumulation in subcutaneous adipose tissue with zero pulmonary access' },
            { id: 'amb-s1-q3-d', question_id: 'amb-s1-q3', option_text: 'Complete blood-brain barrier sequestration with rapid central nervous system toxicity' },
          ],
          correct_option_id: 'amb-s1-q3-a',
          correct_answer_text: 'High tissue affinity with pronounced pulmonary tropism resulting in lung concentrations 2.5 to 5-fold higher than plasma',
          explanation: 'Ambroxol concentrates preferentially in pulmonary tissues and alveolar macrophages due to basic lysosomotropic accumulation.',
        },
        {
          id: 'amb-s1-q4',
          quiz_id: 'quiz-amb-set1',
          question_order: 4,
          stage: 'Liver',
          topic: 'CYP3A4 hepatic biotransformation',
          question_text: 'Which hepatic enzyme pathway is predominantly responsible for the biotransformation of ambroxol into dibromoanthranilic acid?',
          options: [
            { id: 'amb-s1-q4-a', question_id: 'amb-s1-q4', option_text: 'Hepatic biotransformation primarily mediated by CYP3A4 into dibromoanthranilic acid and glucuronide conjugates' },
            { id: 'amb-s1-q4-b', question_id: 'amb-s1-q4', option_text: 'Exclusive plasma butyrylcholinesterase hydrolysis' },
            { id: 'amb-s1-q4-c', question_id: 'amb-s1-q4', option_text: 'Bacterial beta-glucuronidase activation inside the cecum' },
            { id: 'amb-s1-q4-d', question_id: 'amb-s1-q4', option_text: 'Monoamine oxidase type B oxidative deamination' },
          ],
          correct_option_id: 'amb-s1-q4-a',
          correct_answer_text: 'Hepatic biotransformation primarily mediated by CYP3A4 into dibromoanthranilic acid and glucuronide conjugates',
          explanation: 'First-pass hepatic metabolism converts ~30% of ambroxol into dibromoanthranilic acid and polar glucuronides via cytochrome P450 CYP3A4.',
        },
        {
          id: 'amb-s1-q5',
          quiz_id: 'quiz-amb-set1',
          question_order: 5,
          stage: 'Kidneys',
          topic: 'Renal metabolite clearance',
          question_text: 'How are ambroxol and its metabolic derivatives cleared from systemic circulation by renal mechanisms?',
          options: [
            { id: 'amb-s1-q5-a', question_id: 'amb-s1-q5', option_text: 'Renal excretion of polar water-soluble glucuronide conjugates (~85%) with an elimination half-life of ~10 hours' },
            { id: 'amb-s1-q5-b', question_id: 'amb-s1-q5', option_text: 'Exclusively via exhalation of gaseous volatile breakdown products' },
            { id: 'amb-s1-q5-c', question_id: 'amb-s1-q5', option_text: 'Complete precipitation as insoluble biliary stones in the gallbladder' },
            { id: 'amb-s1-q5-d', question_id: 'amb-s1-q5', option_text: 'Dermal sequestration and elimination through epidermal desquamation' },
          ],
          correct_option_id: 'amb-s1-q5-a',
          correct_answer_text: 'Renal excretion of polar water-soluble glucuronide conjugates (~85%) with an elimination half-life of ~10 hours',
          explanation: 'Elimination occurs predominantly through renal filtration and tubular clearance of conjugated metabolites, with less than 10% cleared unchanged.',
        },
      ],
    },

    // SET 2: Clinical Synergy & Airway Dynamics
    {
      id: 'quiz-amb-set2',
      setNumber: 2,
      drugId: 'drug-ambroxol-003',
      drugKey: 'ambroxol',
      drugName: 'Ambroxol Syrup',
      title: 'Ambroxol • Set 2: Clinical Synergy & Airway Dynamics',
      subtitle: 'Antibiotic sputum penetration, antioxidant effects, food effects, and renal failure.',
      description: 'Explore bronchopulmonary antibiotic synergy, ROS scavenging, and pharmacokinetic adjustments.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'amb-s2-q1',
          quiz_id: 'quiz-amb-set2',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Antibiotic penetration synergy',
          question_text: 'When co-administered with antibiotics like amoxicillin or erythromycin, how does ambroxol enhance antimicrobial therapy in the lungs?',
          options: [
            { id: 'amb-s2-q1-a', question_id: 'amb-s2-q1', option_text: 'Enhances antibiotic penetration into bronchopulmonary secretions and bronchial mucosa by ~20–30%' },
            { id: 'amb-s2-q1-b', question_id: 'amb-s2-q1', option_text: 'Neutralizes antibiotic molecules to prevent side effects' },
            { id: 'amb-s2-q1-c', question_id: 'amb-s2-q1', option_text: 'Irreversibly binds antibiotic molecules to human albumin' },
            { id: 'amb-s2-q1-d', question_id: 'amb-s2-q1', option_text: 'Directly converts antibiotics into corticosteroid hormones' },
          ],
          correct_option_id: 'amb-s2-q1-a',
          correct_answer_text: 'Enhances antibiotic penetration into bronchopulmonary secretions and bronchial mucosa by ~20–30%',
          explanation: 'Ambroxol increases surfactant production and alters bronchial mucus barrier properties, significantly increasing the concentration of co-administered antibiotics in sputum.',
        },
        {
          id: 'amb-s2-q2',
          quiz_id: 'quiz-amb-set2',
          question_order: 2,
          stage: 'Target Tissue',
          topic: 'Antioxidant and anti-inflammatory activity',
          question_text: 'Which non-mucolytic pharmacodynamic action contributes to ambroxol clinical efficacy in inflammatory respiratory disorders?',
          options: [
            { id: 'amb-s2-q2-a', question_id: 'amb-s2-q2', option_text: 'Scavenging of reactive oxygen species (ROS) and downregulation of pro-inflammatory cytokines like IL-6' },
            { id: 'amb-s2-q2-b', question_id: 'amb-s2-q2', option_text: 'Stimulation of histamine release from alveolar mast cells' },
            { id: 'amb-s2-q2-c', question_id: 'amb-s2-q2', option_text: 'Destruction of bronchial epithelial ciliated cells' },
            { id: 'amb-s2-q2-d', question_id: 'amb-s2-q2', option_text: 'Irreversible inhibition of pulmonary mitochondrial respiration' },
          ],
          correct_option_id: 'amb-s2-q2-a',
          correct_answer_text: 'Scavenging of reactive oxygen species (ROS) and downregulation of pro-inflammatory cytokines like IL-6',
          explanation: 'Ambroxol acts as a potent antioxidant, inhibiting lipid peroxidation and suppressing pro-inflammatory cytokine and chemokine release in alveolar macrophages.',
        },
        {
          id: 'amb-s2-q3',
          quiz_id: 'quiz-amb-set2',
          question_order: 3,
          stage: 'Bloodstream',
          topic: 'Plasma protein binding profile',
          question_text: 'What is the plasma protein binding percentage of ambroxol in circulating human blood?',
          options: [
            { id: 'amb-s2-q3-a', question_id: 'amb-s2-q3', option_text: 'Approximately 90% bound to plasma albumin and alpha-1-acid glycoprotein' },
            { id: 'amb-s2-q3-b', question_id: 'amb-s2-q3', option_text: 'Zero binding; exists entirely as free floating solute' },
            { id: 'amb-s2-q3-c', question_id: 'amb-s2-q3', option_text: '100% covalent irreversible binding to immunoglobulins' },
            { id: 'amb-s2-q3-d', question_id: 'amb-s2-q3', option_text: 'Bound exclusively to circulating LDL cholesterol' },
          ],
          correct_option_id: 'amb-s2-q3-a',
          correct_answer_text: 'Approximately 90% bound to plasma albumin and alpha-1-acid glycoprotein',
          explanation: 'Ambroxol is ~90% protein bound, primarily to albumin and alpha-1-acid glycoprotein, maintaining an equilibrium with tissue-distributing free fractions.',
        },
        {
          id: 'amb-s2-q4',
          quiz_id: 'quiz-amb-set2',
          question_order: 4,
          stage: 'Stomach',
          topic: 'Food effect on oral syrup',
          question_text: 'How does food intake affect oral ambroxol syrup absorption and clinical bioavailability?',
          options: [
            { id: 'amb-s2-q4-a', question_id: 'amb-s2-q4', option_text: 'Food does not affect total extent of absorption (AUC), though Tmax may be delayed by ~30–45 minutes' },
            { id: 'amb-s2-q4-b', question_id: 'amb-s2-q4', option_text: 'Food completely blocks all ambroxol absorption across the gut' },
            { id: 'amb-s2-q4-c', question_id: 'amb-s2-q4', option_text: 'Food doubles peak blood concentrations to toxic levels' },
            { id: 'amb-s2-q4-d', question_id: 'amb-s2-q4', option_text: 'Food chemically changes ambroxol into morphine' },
          ],
          correct_option_id: 'amb-s2-q4-a',
          correct_answer_text: 'Food does not affect total extent of absorption (AUC), though Tmax may be delayed by ~30–45 minutes',
          explanation: 'Co-administration with meals does not impair systemic bioavailability (AUC), making ambroxol syrup convenient to administer with or between meals.',
        },
        {
          id: 'amb-s2-q5',
          quiz_id: 'quiz-amb-set2',
          question_order: 5,
          stage: 'Kidneys',
          topic: 'Severe renal insufficiency dosing',
          question_text: 'In patients with severe renal failure (eGFR < 30 mL/min), what pharmacokinetic adjustment is necessary for ambroxol therapy?',
          options: [
            { id: 'amb-s2-q2-a', question_id: 'amb-s2-q5', option_text: 'Extend dosing intervals or reduce maintenance dose due to accumulation of active/polar metabolites' },
            { id: 'amb-s2-q2-b', question_id: 'amb-s2-q5', option_text: 'Double the dose because kidneys will excrete it faster' },
            { id: 'amb-s2-q2-c', question_id: 'amb-s2-q5', option_text: 'No adjustment needed as ambroxol is eliminated solely by lungs' },
            { id: 'amb-s2-q2-d', question_id: 'amb-s2-q5', option_text: 'Discontinue all oral hydration immediately' },
          ],
          correct_option_id: 'amb-s2-q2-a',
          correct_answer_text: 'Extend dosing intervals or reduce maintenance dose due to accumulation of active/polar metabolites',
          explanation: 'Because ~85% of metabolites depend on renal elimination, impaired glomerular filtration causes metabolite retention, requiring lengthened dosing intervals.',
        },
      ],
    },

    // SET 3: Advanced Molecular Mechanisms & Ciliary Dynamics
    {
      id: 'quiz-amb-set3',
      setNumber: 3,
      drugId: 'drug-ambroxol-003',
      drugKey: 'ambroxol',
      drugName: 'Ambroxol Syrup',
      title: 'Ambroxol • Set 3: Advanced Molecular & Ciliary Dynamics',
      subtitle: 'Lamellar body exocytosis, ciliary beat frequency, terminal half-life, and prodrug origin.',
      description: 'Investigate intracellular calcium signaling, ciliated epithelial kinetics, and bromhexine lineage.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'amb-s3-q1',
          quiz_id: 'quiz-amb-set3',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Lamellar body exocytosis signaling',
          question_text: 'At the cellular level, how does ambroxol stimulate lamellar body exocytosis in type II alveolar pneumocytes?',
          options: [
            { id: 'amb-s3-q1-a', question_id: 'amb-s3-q1', option_text: 'Mobilizes intracellular calcium signaling pathways triggering lamellar body-plasma membrane fusion' },
            { id: 'amb-s3-q1-b', question_id: 'amb-s3-q1', option_text: 'Directly hydrolyzes pneumocyte cell membranes' },
            { id: 'amb-s3-q1-c', question_id: 'amb-s3-q1', option_text: 'Inactivates all pulmonary surfactant gene expression' },
            { id: 'amb-s3-q1-d', question_id: 'amb-s3-q1', option_text: 'Stops ciliary motility to trap mucus permanently' },
          ],
          correct_option_id: 'amb-s3-q1-a',
          correct_answer_text: 'Mobilizes intracellular calcium signaling pathways triggering lamellar body-plasma membrane fusion',
          explanation: 'Ambroxol promotes calcium influx and release in type II pneumocytes, driving vesicle translocation and exocytosis of lamellar bodies containing dipalmitoylphosphatidylcholine.',
        },
        {
          id: 'amb-s3-q2',
          quiz_id: 'quiz-amb-set3',
          question_order: 2,
          stage: 'Target Tissue',
          topic: 'Ciliary beat frequency enhancement',
          question_text: 'How does ambroxol affect the mucociliary escalator mechanism in bronchial epithelial cells?',
          options: [
            { id: 'amb-s3-q2-a', question_id: 'amb-s3-q2', option_text: 'Increases ciliary beat frequency and fluidizes bronchial mucus, accelerating mucociliary transport' },
            { id: 'amb-s3-q2-b', question_id: 'amb-s3-q2', option_text: 'Paralyzes bronchial cilia completely to prevent coughing' },
            { id: 'amb-s3-q2-c', question_id: 'amb-s3-q2', option_text: 'Thickens mucus into an impermeable gel' },
            { id: 'amb-s3-q2-d', question_id: 'amb-s3-q2', option_text: 'Converts bronchial cilia into skeletal muscle fibers' },
          ],
          correct_option_id: 'amb-s3-q2-a',
          correct_answer_text: 'Increases ciliary beat frequency and fluidizes bronchial mucus, accelerating mucociliary transport',
          explanation: 'By decreasing mucus viscosity and stimulating ciliary beat frequency, ambroxol enhances the velocity of the mucociliary escalator, speeding sputum expectoration.',
        },
        {
          id: 'amb-s3-q3',
          quiz_id: 'quiz-amb-set3',
          question_order: 3,
          stage: 'Liver',
          topic: 'Metabolic origin from Bromhexine',
          question_text: 'What chemical and pharmacological relationship exists between ambroxol and bromhexine?',
          options: [
            { id: 'amb-s3-q3-a', question_id: 'amb-s3-q3', option_text: 'Ambroxol is the active active metabolite VIII of bromhexine, exhibiting superior secretolytic potency' },
            { id: 'amb-s3-q3-b', question_id: 'amb-s3-q3', option_text: 'Ambroxol is a synthetic poison that antagonizes bromhexine' },
            { id: 'amb-s3-q3-c', question_id: 'amb-s3-q3', option_text: 'They are identical molecules with different trade names only' },
            { id: 'amb-s3-q3-d', question_id: 'amb-s3-q3', option_text: 'Bromhexine is a modern biological antibody while ambroxol is a vaccine' },
          ],
          correct_option_id: 'amb-s3-q3-a',
          correct_answer_text: 'Ambroxol is the active active metabolite VIII of bromhexine, exhibiting superior secretolytic potency',
          explanation: 'Ambroxol is the primary pharmacologically active metabolite (metabolite VIII) of bromhexine, formed by demethylation and hydroxylation with higher therapeutic efficacy.',
        },
        {
          id: 'amb-s3-q4',
          quiz_id: 'quiz-amb-set3',
          question_order: 4,
          stage: 'Bloodstream',
          topic: 'Terminal elimination half-life',
          question_text: 'What is the terminal elimination half-life (t1/2) of ambroxol in healthy adult individuals?',
          options: [
            { id: 'amb-s3-q4-a', question_id: 'amb-s3-q4', option_text: 'Approximately 10 to 12 hours, supporting twice-daily oral dosing regimens' },
            { id: 'amb-s3-q4-b', question_id: 'amb-s3-q4', option_text: '30 seconds, necessitating continuous intravenous infusion' },
            { id: 'amb-s3-q4-c', question_id: 'amb-s3-q4', option_text: '30 days, creating severe chronic bioaccumulation' },
            { id: 'amb-s3-q4-d', question_id: 'amb-s3-q4', option_text: 'Zero elimination; ambroxol stays permanently in lung alveoli' },
          ],
          correct_option_id: 'amb-s3-q4-a',
          correct_answer_text: 'Approximately 10 to 12 hours, supporting twice-daily oral dosing regimens',
          explanation: 'The terminal elimination half-life is ~10-12 hours following oral absorption and distribution, allowing effective sustained clinical coverage with twice-daily syrup dosing.',
        },
        {
          id: 'amb-s3-q5',
          quiz_id: 'quiz-amb-set3',
          question_order: 5,
          stage: 'Target Tissue',
          topic: 'Local anesthetic sodium channel blockade',
          question_text: 'Why does ambroxol lozenge formulation provide rapid relief for acute sore throat pain?',
          options: [
            { id: 'amb-s3-q5-a', question_id: 'amb-s3-q5', option_text: 'Reversibly blocks voltage-gated neuronal sodium channels in pharyngeal sensory nerves, producing local anesthesia' },
            { id: 'amb-s3-q5-b', question_id: 'amb-s3-q5', option_text: 'Irreversibly burns pharyngeal sensory nerve endings' },
            { id: 'amb-s3-q5-c', question_id: 'amb-s3-q5', option_text: 'Destroys viral particles via instant alcohol dehydration' },
            { id: 'amb-s3-q5-d', question_id: 'amb-s3-q5', option_text: 'Stimulates peripheral dopamine release in the pharynx' },
          ],
          correct_option_id: 'amb-s3-q5-a',
          correct_answer_text: 'Reversibly blocks voltage-gated neuronal sodium channels in pharyngeal sensory nerves, producing local anesthesia',
          explanation: 'Ambroxol possesses local anesthetic properties by blocking neuronal voltage-gated sodium channels (Nav1.8), rapidly relieving acute pharyngeal pain.',
        },
      ],
    },
  ],

  // =========================================================================
  // 4. REGULAR INSULIN SETS
  // =========================================================================
  insulin: [
    // SET 1: Foundational Receptor Signalling & Clearance
    {
      id: 'quiz-ins-set1',
      setNumber: 1,
      drugId: 'drug-insulin-004',
      drugKey: 'insulin',
      drugName: 'Regular Insulin',
      title: 'Regular Insulin • Set 1: Foundational Signaling & Kinetics',
      subtitle: 'Tyrosine kinase autophosphorylation, hexamer dissociation, lack of oral bioavailability, and dual clearance.',
      description: 'Assess insulin receptor recruitment, subcutaneous depot kinetics, and renal/hepatic clearance.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ins-s1-q1',
          quiz_id: 'quiz-ins-set1',
          question_order: 1,
          stage: 'Target Tissue',
          topic: 'Tyrosine kinase autophosphorylation',
          question_text: 'What is the initial molecular event triggered upon regular insulin binding to its target cell surface receptor?',
          options: [
            { id: 'ins-s1-q1-a', question_id: 'ins-s1-q1', option_text: 'Binding to the alpha-subunits of the insulin receptor, triggering beta-subunit tyrosine kinase autophosphorylation' },
            { id: 'ins-s1-q1-b', question_id: 'ins-s1-q1', option_text: 'Direct passive entry through nuclear pore complexes to regulate mRNA transcription' },
            { id: 'ins-s1-q1-c', question_id: 'ins-s1-q1', option_text: 'Opening of ligand-gated calcium channels across the mitochondrial inner membrane' },
            { id: 'ins-s1-q1-d', question_id: 'ins-s1-q1', option_text: 'Allosteric degradation of circulating glucagon molecules in blood plasma' },
          ],
          correct_option_id: 'ins-s1-q1-a',
          correct_answer_text: 'Binding to the alpha-subunits of the insulin receptor, triggering beta-subunit tyrosine kinase autophosphorylation',
          explanation: 'Insulin binding initiates autophosphorylation of receptor beta-subunits, recruiting and activating insulin receptor substrate (IRS) docking proteins.',
        },
        {
          id: 'ins-s1-q2',
          quiz_id: 'quiz-ins-set1',
          question_order: 2,
          stage: 'Target Tissue',
          topic: 'GLUT4 glucose translocation',
          question_text: 'Through which downstream signaling pathway does regular insulin stimulate cellular glucose uptake into skeletal muscle and adipose tissue?',
          options: [
            { id: 'ins-s1-q2-a', question_id: 'ins-s1-q2', option_text: 'Activation of the PI3K/Akt signaling pathway driving exocytic translocation of GLUT4 storage vesicles to the plasma membrane' },
            { id: 'ins-s1-q2-b', question_id: 'ins-s1-q2', option_text: 'Direct phosphorylation of extracellular albumin carriers' },
            { id: 'ins-s1-q2-c', question_id: 'ins-s1-q2', option_text: 'Destruction of cellular glycogen synthases' },
            { id: 'ins-s1-q2-d', question_id: 'ins-s1-q2', option_text: 'Blockade of sodium-potassium ATPase pump activity' },
          ],
          correct_option_id: 'ins-s1-q2-a',
          correct_answer_text: 'Activation of the PI3K/Akt signaling pathway driving exocytic translocation of GLUT4 storage vesicles to the plasma membrane',
          explanation: 'Downstream Akt kinase activation stimulates vesicle mobilization, inserting GLUT4 glucose transporters into striated muscle and adipocyte cell membranes.',
        },
        {
          id: 'ins-s1-q3',
          quiz_id: 'quiz-ins-set1',
          question_order: 3,
          stage: 'Bloodstream',
          topic: 'Subcutaneous hexamer dissociation',
          question_text: 'Why is subcutaneous absorption of regular human insulin slower than endogenous pancreatic insulin secretion?',
          options: [
            { id: 'ins-s1-q3-a', question_id: 'ins-s1-q3', option_text: 'Zinc-stabilized hexamers in the formulation must slowly dissociate into dimers and absorbable monomers within the interstitial space' },
            { id: 'ins-s1-q3-b', question_id: 'ins-s1-q3', option_text: 'Instant binding to subcutaneous extracellular matrix albumin' },
            { id: 'ins-s1-q3-c', question_id: 'ins-s1-q3', option_text: 'Subcutaneous adipocytes irreversibly destroy 95% of injected insulin molecules' },
            { id: 'ins-s1-q3-d', question_id: 'ins-s1-q3', option_text: 'Insulin requires activation by gastric acid before becoming biologically active' },
          ],
          correct_option_id: 'ins-s1-q3-a',
          correct_answer_text: 'Zinc-stabilized hexamers in the formulation must slowly dissociate into dimers and absorbable monomers within the interstitial space',
          explanation: 'At pharmaceutical concentrations, insulin exists as zinc-coordinated hexamers. Dilution in the subcutaneous depot causes dissociation into monomers small enough to cross capillaries.',
        },
        {
          id: 'ins-s1-q4',
          quiz_id: 'quiz-ins-set1',
          question_order: 4,
          stage: 'Stomach',
          topic: 'Oral proteolytic degradation',
          question_text: 'Why can regular human insulin NOT be effectively administered via the oral gastrointestinal route?',
          options: [
            { id: 'ins-s1-q4-a', question_id: 'ins-s1-q4', option_text: 'Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability' },
            { id: 'ins-s1-q4-b', question_id: 'ins-s1-q4', option_text: 'Excessive first-pass liver storage preventing any plasma entry' },
            { id: 'ins-s1-q4-c', question_id: 'ins-s1-q4', option_text: 'Immediate volatilization in the oral cavity due to body temperature' },
            { id: 'ins-s1-q4-d', question_id: 'ins-s1-q4', option_text: 'Selective binding to dietary fiber resulting in total fecal precipitation' },
          ],
          correct_option_id: 'ins-s1-q4-a',
          correct_answer_text: 'Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability',
          explanation: 'As a 51-amino-acid peptide, insulin undergoes extensive cleavage by gastric pepsin in acidic juice and enteric proteases before any intact absorption can occur.',
        },
        {
          id: 'ins-s1-q5',
          quiz_id: 'quiz-ins-set1',
          question_order: 5,
          stage: 'Bloodstream',
          topic: 'Absorption onset and clinical Tmax',
          question_text: 'In the pharmacokinetics model, how does the 0.5-hour absorption milestone relate to actual clinical regular insulin pharmacodynamics?',
          options: [
            { id: 'ins-s1-q5-a', question_id: 'ins-s1-q5', option_text: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours' },
            { id: 'ins-s1-q5-b', question_id: 'ins-s1-q5', option_text: 'The 0.5-hour value represents total elimination from human physiology' },
            { id: 'ins-s1-q5-c', question_id: 'ins-s1-q5', option_text: 'Clinical peak action is guaranteed to occur at exactly 30 minutes in all patients' },
            { id: 'ins-s1-q5-d', question_id: 'ins-s1-q5', option_text: 'The 0.5-hour value indicates that insulin acts as an oral disintegrating tablet' },
          ],
          correct_option_id: 'ins-s1-q5-a',
          correct_answer_text: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours',
          explanation: 'Initial plasma entry begins within 30 minutes, whereas maximum glucose-lowering pharmacodynamic activity peaks at 1.5 to 3.5 hours.',
        },
      ],
    },

    // SET 2: Clinical Clearance & Injection Dynamics
    {
      id: 'quiz-ins-set2',
      setNumber: 2,
      drugId: 'drug-insulin-004',
      drugKey: 'insulin',
      drugName: 'Regular Insulin',
      title: 'Regular Insulin • Set 2: Clinical Clearance & Injection Dynamics',
      subtitle: 'Hepatic vs renal clearance, CKD hypoglycemia, injection site vasodilation, and lipid storage.',
      description: 'Explore receptor-mediated endocytosis, renal endopeptidase degradation, and perfusion effects.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ins-s2-q1',
          quiz_id: 'quiz-ins-set2',
          question_order: 1,
          stage: 'Kidneys',
          topic: 'CKD and hypoglycemia risk',
          question_text: 'Why do diabetic patients with advanced chronic kidney disease (CKD stage 4/5) experience reduced insulin requirements and unexpected hypoglycemia?',
          options: [
            { id: 'ins-s2-q1-a', question_id: 'ins-s2-q1', option_text: 'Impaired renal tubular reabsorption and clearance of circulating insulin prolongs its systemic half-life' },
            { id: 'ins-s2-q1-b', question_id: 'ins-s2-q1', option_text: 'The kidneys begin synthesizing large quantities of endogenous glucagon' },
            { id: 'ins-s2-q1-c', question_id: 'ins-s2-q1', option_text: 'Insulin transforms into oral glucose in renal tubules' },
            { id: 'ins-s2-q1-d', question_id: 'ins-s2-q1', option_text: 'Pancreatic beta cells recover 100% of their secretory function' },
          ],
          correct_option_id: 'ins-s2-q1-a',
          correct_answer_text: 'Impaired renal tubular reabsorption and clearance of circulating insulin prolongs its systemic half-life',
          explanation: 'The kidneys normally filter and degrade ~30-40% of systemic insulin in proximal tubules via insulin-degrading enzyme. Renal failure diminishes this clearance, causing insulin accumulation.',
        },
        {
          id: 'ins-s2-q2',
          quiz_id: 'quiz-ins-set2',
          question_order: 2,
          stage: 'Bloodstream',
          topic: 'Injection site perfusion kinetics',
          question_text: 'Which physiological factor significantly accelerates regular insulin absorption from a subcutaneous depot?',
          options: [
            { id: 'ins-s2-q2-a', question_id: 'ins-s2-q2', option_text: 'Increased local blood flow induced by physical exercise, local heat application, or massage at the injection site' },
            { id: 'ins-s2-q2-b', question_id: 'ins-s2-q2', option_text: 'Severe peripheral vasoconstriction caused by extreme cold' },
            { id: 'ins-s2-q2-c', question_id: 'ins-s2-q2', option_text: 'Injection into lipohypertrophic fibrotic scar tissue' },
            { id: 'ins-s2-q2-d', question_id: 'ins-s2-q2', option_text: 'Concurrent oral administration of activated charcoal' },
          ],
          correct_option_id: 'ins-s2-q2-a',
          correct_answer_text: 'Increased local blood flow induced by physical exercise, local heat application, or massage at the injection site',
          explanation: 'Capillary blood flow governs the rate at which dissociated insulin monomers enter the bloodstream. Exercise or warmth dilates subcutaneous capillaries, speeding onset.',
        },
        {
          id: 'ins-s2-q3',
          quiz_id: 'quiz-ins-set2',
          question_order: 3,
          stage: 'Liver',
          topic: 'Dual organ clearance pathways',
          question_text: 'Which two primary organs account for the physiological elimination and degradation of circulating insulin?',
          options: [
            { id: 'ins-s2-q3-a', question_id: 'ins-s2-q3', option_text: 'Liver (receptor-mediated endocytosis and IDE) and Kidneys (glomerular filtration and proximal tubular degradation)' },
            { id: 'ins-s2-q3-b', question_id: 'ins-s2-q3', option_text: 'Spleen red pulp and bone marrow osteoclasts' },
            { id: 'ins-s2-q3-c', question_id: 'ins-s2-q3', option_text: 'Small intestine brush border and colonic microbiota' },
            { id: 'ins-s2-q3-d', question_id: 'ins-s2-q3', option_text: 'Pulmonary alveoli and tracheal cilia' },
          ],
          correct_option_id: 'ins-s2-q3-a',
          correct_answer_text: 'Liver (receptor-mediated endocytosis and IDE) and Kidneys (glomerular filtration and proximal tubular degradation)',
          explanation: 'Endogenous insulin is ~50% cleared by first-pass hepatic extraction. For subcutaneous exogenous insulin, the liver clears ~40-50% and the kidneys clear ~30-40% via insulin-degrading enzyme.',
        },
        {
          id: 'ins-s2-q4',
          quiz_id: 'quiz-ins-set2',
          question_order: 4,
          stage: 'Target Tissue',
          topic: 'Adipocyte lipid storage signaling',
          question_text: 'How does regular insulin stimulate lipid storage while preventing lipolysis in human adipose tissue?',
          options: [
            { id: 'ins-s2-q4-a', question_id: 'ins-s2-q4', option_text: 'Activates capillary lipoprotein lipase (LPL) while inhibiting intracellular hormone-sensitive lipase (HSL)' },
            { id: 'ins-s2-q4-b', question_id: 'ins-s2-q4', option_text: 'Directly converts circulating glucose into fatty acid bile salts' },
            { id: 'ins-s2-q4-c', question_id: 'ins-s2-q4', option_text: 'Destroys all circulating triglyceride molecules' },
            { id: 'ins-s2-q4-d', question_id: 'ins-s2-q4', option_text: 'Stimulates brown adipose thermogenesis exclusively' },
          ],
          correct_option_id: 'ins-s2-q4-a',
          correct_answer_text: 'Activates capillary lipoprotein lipase (LPL) while inhibiting intracellular hormone-sensitive lipase (HSL)',
          explanation: 'Insulin promotes lipid storage by inducing LPL to hydrolyze chylomicrons and VLDL into free fatty acids, while suppressing HSL to prevent intracellular triglyceride breakdown.',
        },
        {
          id: 'ins-s2-q5',
          quiz_id: 'quiz-ins-set2',
          question_order: 5,
          stage: 'Target Tissue',
          topic: 'Hepatic gluconeogenesis suppression',
          question_text: 'In healthy hepatocytes, through which molecular target does insulin suppress endogenous glucose production (gluconeogenesis)?',
          options: [
            { id: 'ins-s2-q5-a', question_id: 'ins-s2-q5', option_text: 'Akt-mediated phosphorylation and nuclear exclusion of FOXO1 transcription factor' },
            { id: 'ins-s2-q5-b', question_id: 'ins-s2-q5', option_text: 'Direct chemical oxidation of pyruvate carboxylase' },
            { id: 'ins-s2-q5-c', question_id: 'ins-s2-q5', option_text: 'Blockade of all amino acid uptake across the sinusoidal membrane' },
            { id: 'ins-s2-q5-d', question_id: 'ins-s2-q5', option_text: 'Induction of hepatic glycogen phosphorylase activity' },
          ],
          correct_option_id: 'ins-s2-q5-a',
          correct_answer_text: 'Akt-mediated phosphorylation and nuclear exclusion of FOXO1 transcription factor',
          explanation: 'Akt phosphorylates FOXO1, causing its export from the nucleus to the cytoplasm. This shuts down transcription of key gluconeogenic enzymes PEPCK and glucose-6-phosphatase.',
        },
      ],
    },

    // SET 3: Advanced Molecular Kinetics & Post-Translational Control
    {
      id: 'quiz-ins-set3',
      setNumber: 3,
      drugId: 'drug-insulin-004',
      drugKey: 'insulin',
      drugName: 'Regular Insulin',
      title: 'Regular Insulin • Set 3: Advanced Molecular Kinetics',
      subtitle: 'Hexamer zinc coordinates, PTP1B dephosphorylation, IV half-life, and glycogenesis.',
      description: 'Investigate quaternary zinc structures, termination phosphatases, and intravenous plasma kinetics.',
      pass_percentage: 70.0,
      questions: [
        {
          id: 'ins-s3-q1',
          quiz_id: 'quiz-ins-set3',
          question_order: 1,
          stage: 'Bloodstream',
          topic: 'Hexamer coordination chemistry',
          question_text: 'In pharmaceutical regular insulin formulations (U-100), what chemical stabilizing ion coordinates the hexameric structure?',
          options: [
            { id: 'ins-s3-q1-a', question_id: 'ins-s3-q1', option_text: 'Two zinc ions (Zn2+) coordinated with histidine B10 residues across three insulin dimers' },
            { id: 'ins-s3-q1-b', question_id: 'ins-s3-q1', option_text: 'Ferrous iron (Fe2+) coordinated with tyrosine A14' },
            { id: 'ins-s3-q1-c', question_id: 'ins-s3-q1', option_text: 'Magnesium ions (Mg2+) bound to disulfide bridges' },
            { id: 'ins-s3-q1-d', question_id: 'ins-s3-q1', option_text: 'Sodium ions bound to C-terminal asparagine' },
          ],
          correct_option_id: 'ins-s3-q1-a',
          correct_answer_text: 'Two zinc ions (Zn2+) coordinated with histidine B10 residues across three insulin dimers',
          explanation: 'Regular insulin formulations include zinc and phenolic preservatives, forming stable T6 or R6 hexamers with two zinc ions coordinating HisB10 residues on adjacent dimers.',
        },
        {
          id: 'ins-s3-q2',
          quiz_id: 'quiz-ins-set3',
          question_order: 2,
          stage: 'Target Tissue',
          topic: 'PTP1B signaling termination',
          question_text: 'Which intracellular protein tyrosine phosphatase is predominantly responsible for dephosphorylating the insulin receptor and turning off signaling?',
          options: [
            { id: 'ins-s3-q2-a', question_id: 'ins-s3-q2', option_text: 'Protein tyrosine phosphatase 1B (PTP1B)' },
            { id: 'ins-s3-q2-b', question_id: 'ins-s3-q2', option_text: 'Alkaline phosphatase' },
            { id: 'ins-s3-q2-c', question_id: 'ins-s3-q2', option_text: 'Acetylcholinesterase' },
            { id: 'ins-s3-q2-d', question_id: 'ins-s3-q2', option_text: 'Lactate dehydrogenase' },
          ],
          correct_option_id: 'ins-s3-q2-a',
          correct_answer_text: 'Protein tyrosine phosphatase 1B (PTP1B)',
          explanation: 'PTP1B localizes to the endoplasmic reticulum and dephosphorylates active phosphotyrosine residues on the insulin receptor beta-subunit, dampening pathway activation.',
        },
        {
          id: 'ins-s3-q3',
          quiz_id: 'quiz-ins-set3',
          question_order: 3,
          stage: 'Liver',
          topic: 'Insulin-degrading enzyme (IDE)',
          question_text: 'What is the primary intracellular metalloprotease responsible for cleaving and inactivating internalized insulin inside hepatocytes?',
          options: [
            { id: 'ins-s3-q3-a', question_id: 'ins-s3-q3', option_text: 'Insulin-degrading enzyme (IDE / insulysin)' },
            { id: 'ins-s3-q3-b', question_id: 'ins-s3-q3', option_text: 'Gastric pepsin' },
            { id: 'ins-s3-q3-c', question_id: 'ins-s3-q3', option_text: 'Pancreatic amylase' },
            { id: 'ins-s3-q3-d', question_id: 'ins-s3-q3', option_text: 'Renin' },
          ],
          correct_option_id: 'ins-s3-q3-a',
          correct_answer_text: 'Insulin-degrading enzyme (IDE / insulysin)',
          explanation: 'Following receptor-mediated endocytosis into endosomes, insulin-degrading enzyme (IDE), a zinc metallopeptidase, cleaves insulin into inactive peptide fragments.',
        },
        {
          id: 'ins-s3-q4',
          quiz_id: 'quiz-ins-set3',
          question_order: 4,
          stage: 'Bloodstream',
          topic: 'Intravenous plasma half-life',
          question_text: 'What is the elimination half-life of regular human insulin when administered as an intravenous (IV) bolus or infusion?',
          options: [
            { id: 'ins-s3-q4-a', question_id: 'ins-s3-q4', option_text: 'Very short half-life of approximately 4 to 6 minutes' },
            { id: 'ins-s3-q4-b', question_id: 'ins-s3-q4', option_text: '24 hours due to high albumin binding' },
            { id: 'ins-s3-q4-c', question_id: 'ins-s3-q4', option_text: '7 days identical to IgG antibodies' },
            { id: 'ins-s3-q4-d', question_id: 'ins-s3-q4', option_text: '30 seconds because it precipitates instantly' },
          ],
          correct_option_id: 'ins-s3-q4-a',
          correct_answer_text: 'Very short half-life of approximately 4 to 6 minutes',
          explanation: 'Without the delayed subcutaneous hexamer dissociation depot, IV regular insulin is cleared extremely rapidly by hepatic and renal receptor uptake, with a t1/2 of ~4-6 minutes.',
        },
        {
          id: 'ins-s3-q5',
          quiz_id: 'quiz-ins-set3',
          question_order: 5,
          stage: 'Target Tissue',
          topic: 'Glycogen synthase activation',
          question_text: 'In skeletal muscle myocytes, through which enzyme inhibition does insulin activate glycogen synthase?',
          options: [
            { id: 'ins-s3-q5-a', question_id: 'ins-s3-q5', option_text: 'Inhibition of glycogen synthase kinase 3 (GSK3) via Akt phosphorylation' },
            { id: 'ins-s3-q5-b', question_id: 'ins-s3-q5', option_text: 'Direct activation of caspase-3 proteolysis' },
            { id: 'ins-s3-q5-c', question_id: 'ins-s3-q5', option_text: 'Destruction of hexokinase enzymes' },
            { id: 'ins-s3-q5-d', question_id: 'ins-s3-q5', option_text: 'Inhibition of glucose-6-phosphate dehydrogenase' },
          ],
          correct_option_id: 'ins-s3-q5-a',
          correct_answer_text: 'Inhibition of glycogen synthase kinase 3 (GSK3) via Akt phosphorylation',
          explanation: 'Active GSK3 normally phosphorylates and inactivates glycogen synthase. Insulin-activated Akt phosphorylates and inhibits GSK3, de-repressing glycogen synthase and boosting glycogenesis.',
        },
      ],
    },
  ],
};

/**
 * Retrieves the available quiz sets for a drug (keyed by 'ibuprofen', 'amoxicillin', etc.).
 */
export function getQuizSetsForDrug(drugKeyOrId: string): DrugQuizSet[] {
  const normalized = drugKeyOrId.toLowerCase().replace('drug-', '').split('-')[0].trim();
  return DRUG_QUIZ_SETS[normalized] || DRUG_QUIZ_SETS.ibuprofen;
}

/**
 * Retrieves a specific quiz set by drug key and set index (0, 1, or 2).
 */
export function getQuizByDrugAndSet(drugKeyOrId: string, setIndex: number = 0): DrugQuizSet {
  const sets = getQuizSetsForDrug(drugKeyOrId);
  const safeIndex = Math.max(0, Math.min(sets.length - 1, setIndex));
  return sets[safeIndex];
}

/**
 * Convert DrugQuizSet to QuizResponse format.
 */
export function toQuizResponse(quizSet: DrugQuizSet): QuizResponse {
  return {
    id: quizSet.id,
    drug_id: quizSet.drugId,
    title: quizSet.title,
    description: quizSet.description,
    pass_percentage: quizSet.pass_percentage,
    questions: quizSet.questions.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question_order: q.question_order,
      question_text: q.question_text,
      options: q.options,
    })),
  };
}

/**
 * Local client-side evaluator for instant grading of any question set.
 */
export function evaluateQuizSetAttempt(
  quizSet: DrugQuizSet,
  submission: QuizAttemptSubmission
): QuizAttemptResult {
  const answersMap = new Map(submission.answers.map((a) => [a.question_id, a.selected_option_id]));
  const questions = quizSet.questions;

  let correctCount = 0;
  const details = questions.map((q) => {
    const selectedOptionId = answersMap.get(q.id);
    const isCorrect = selectedOptionId === q.correct_option_id;
    if (isCorrect) {
      correctCount++;
    }

    return {
      question_id: q.id,
      correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= quizSet.pass_percentage;

  return {
    id: `attempt-${Date.now()}`,
    quiz_id: quizSet.id,
    score,
    total_questions: total,
    correct_answers: correctCount,
    passed,
    completed_at: new Date().toISOString(),
    details,
  };
}

/**
 * Lookup question metadata and correct answer for ANY question across all sets.
 */
export function findQuestionMetadataAcrossSets(questionId: string): {
  stage: string;
  topic: string;
  correctAnswer: string;
  explanation: string;
} | null {
  for (const sets of Object.values(DRUG_QUIZ_SETS)) {
    for (const quizSet of sets) {
      const found = quizSet.questions.find((q) => q.id === questionId);
      if (found) {
        return {
          stage: found.stage,
          topic: found.topic,
          correctAnswer: found.correct_answer_text,
          explanation: found.explanation,
        };
      }
    }
  }
  return null;
}

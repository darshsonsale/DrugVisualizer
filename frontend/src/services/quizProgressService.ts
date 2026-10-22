/**
 * Drug Path Visualiser - Quiz Progress & Assessment Report Service
 * Manages saving and retrieving quiz attempt logs,
 * question correctness, correct answer lookups, and clinical explanations.
 */

import { QuizQuestion, UserProfile, QuizAttemptResult } from '../api/types';
import { findQuestionMetadataAcrossSets } from '../data/quizQuestionBank';

export interface QuizQuestionResult {
  id: string;
  order: number;
  questionText: string;
  stage: string;
  topic: string;
  selectedOptionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LatestQuizResult {
  id: string;
  logNumber: number;
  userId?: string;
  quizId: string;
  drugId: string;
  drugName: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string | null;
  submittedAt: string;
  score: number; // percentage 0 - 100
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  questions: QuizQuestionResult[];
}

export const STORAGE_KEY_LATEST_RESULT = 'drugpath_latest_quiz_result';
export const STORAGE_KEY_QUIZ_LOGS = 'drugpath_quiz_logs';

interface QuestionMetaLookup {
  stage: string;
  topic: string;
  correctAnswer: string;
  explanation: string;
}

const QUESTION_BANK_LOOKUP: Record<string, QuestionMetaLookup> = {
  // Ibuprofen
  q1: {
    stage: 'Liver',
    topic: 'Hepatic epimerase & CYP2C9',
    correctAnswer: 'Liver (hepatic epimerase & CYP2C9)',
    explanation:
      'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
  },
  q2: {
    stage: 'Stomach',
    topic: 'Gastric transit & food effects',
    correctAnswer: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
    explanation:
      'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) from ~1-1.5 h to ~2.5-3.0 h without significantly reducing total systemic bioavailability.',
  },
  q3: {
    stage: 'Target Tissue',
    topic: 'Reversible COX-1 and COX-2 inhibition',
    correctAnswer: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)',
    explanation:
      '(S)-Ibuprofen reversibly blocks the arachidonic acid channel of COX-1 and COX-2, inhibiting downstream synthesis of pro-inflammatory prostaglandins.',
  },
  q4: {
    stage: 'Bloodstream',
    topic: 'Albumin binding',
    correctAnswer: 'Extensively bound to serum albumin (>99% protein binding)',
    explanation:
      'Ibuprofen is over 99% bound to plasma albumin at therapeutic concentrations, resulting in a low apparent volume of distribution (~0.12-0.15 L/kg).',
  },
  q5: {
    stage: 'Kidneys',
    topic: 'Glomerular filtration & clearance',
    correctAnswer: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine',
    explanation:
      'Less than 1% of ibuprofen is excreted unchanged; more than 90% is eliminated renally as oxidative metabolites and acyl-glucuronide conjugates.',
  },

  // Amoxicillin
  'amox-q1': {
    stage: 'Target Tissue',
    topic: 'Cell wall peptidoglycan synthesis',
    correctAnswer: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding',
    explanation:
      'Amoxicillin binds PBPs, inhibiting transpeptidase cross-linking of peptidoglycan chains and triggering autolytic enzyme activity.',
  },
  'amox-q2': {
    stage: 'Small Intestine',
    topic: 'PEPT1 active transport',
    correctAnswer: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)',
    explanation:
      'As an amino-penicillin mimicking dipeptides, amoxicillin utilizes the proton-coupled oligopeptide transporter 1 (PEPT1) in the duodenum and jejunum, yielding ~75-90% bioavailability.',
  },
  'amox-q3': {
    stage: 'Stomach',
    topic: 'Food effect on systemic absorption',
    correctAnswer: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals',
    explanation:
      'Unlike ampicillin, amoxicillin absorption is stable in the presence of food; overall AUC is preserved, although peak plasma concentration may be slightly delayed.',
  },
  'amox-q4': {
    stage: 'Kidneys',
    topic: 'Tubular secretion & renal clearance',
    correctAnswer: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion',
    explanation:
      'Approximately 60–80% of an oral amoxicillin dose is excreted unchanged in the urine within 6 to 8 hours via glomerular filtration and tubular secretion.',
  },
  'amox-q5': {
    stage: 'Target Tissue',
    topic: 'Beta-lactamase resistance',
    correctAnswer: 'Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring',
    explanation:
      'Bacterial beta-lactamases cleave the four-membered cyclic amide ring of amoxicillin, rendering it ineffective unless protected by an inhibitor.',
  },

  // Ambroxol
  'amb-q1': {
    stage: 'Target Tissue',
    topic: 'Pulmonary surfactant secretolysis',
    correctAnswer: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion',
    explanation:
      'Ambroxol stimulates alveolar type II pneumocytes to synthesize and discharge surfactant from lamellar bodies, lowering mucus surface tension.',
  },
  'amb-q2': {
    stage: 'Small Intestine',
    topic: 'Intestinal mucosal absorption',
    correctAnswer: 'Rapid and almost complete absorption across the gastrointestinal mucosa with ~70–80% absolute bioavailability',
    explanation:
      'Ambroxol is rapidly absorbed along the enteric mucosa with peak plasma concentration occurring within 1.5 to 2 hours post-administration.',
  },
  'amb-q3': {
    stage: 'Target Tissue',
    topic: 'Lysosomal pulmonary tropism',
    correctAnswer: 'High tissue affinity with pronounced pulmonary tropism resulting in lung concentrations 2.5 to 5-fold higher than plasma',
    explanation:
      'Ambroxol concentrates preferentially in pulmonary tissues and alveolar macrophages due to basic lysosomotropic accumulation.',
  },
  'amb-q4': {
    stage: 'Liver',
    topic: 'CYP3A4 hepatic biotransformation',
    correctAnswer: 'Hepatic biotransformation primarily mediated by CYP3A4 into dibromoanthranilic acid and glucuronide conjugates',
    explanation:
      'First-pass hepatic metabolism converts ~30% of ambroxol into dibromoanthranilic acid and polar glucuronides via cytochrome P450 CYP3A4.',
  },
  'amb-q5': {
    stage: 'Kidneys',
    topic: 'Renal metabolite clearance',
    correctAnswer: 'Renal excretion of polar water-soluble glucuronide conjugates (~85%) with an elimination half-life of ~10 hours',
    explanation:
      'Elimination occurs predominantly through renal filtration and tubular clearance of conjugated metabolites, with less than 10% cleared unchanged.',
  },

  // Regular Insulin
  'ins-q1': {
    stage: 'Target Tissue',
    topic: 'Tyrosine kinase autophosphorylation',
    correctAnswer: 'Binding to the alpha-subunits of the insulin receptor, triggering beta-subunit tyrosine kinase autophosphorylation',
    explanation:
      'Insulin binding initiates autophosphorylation of receptor beta-subunits, recruiting and activating insulin receptor substrate (IRS) docking proteins.',
  },
  'ins-q2': {
    stage: 'Target Tissue',
    topic: 'GLUT4 glucose translocation',
    correctAnswer: 'Activation of the PI3K/Akt signaling pathway driving exocytic translocation of GLUT4 storage vesicles to the plasma membrane',
    explanation:
      'Downstream Akt kinase activation stimulates vesicle mobilization, inserting GLUT4 glucose transporters into striated muscle and adipocyte cell membranes.',
  },
  'ins-q3': {
    stage: 'Bloodstream',
    topic: 'Subcutaneous hexamer dissociation',
    correctAnswer: 'Zinc-stabilized hexamers in the formulation must slowly dissociate into dimers and absorbable monomers within the interstitial space',
    explanation:
      'At pharmaceutical concentrations, insulin exists as zinc-coordinated hexamers. Dilution in the subcutaneous depot causes dissociation into monomers small enough to cross capillaries.',
  },
  'ins-q4': {
    stage: 'Stomach',
    topic: 'Oral proteolytic degradation',
    correctAnswer: 'Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability',
    explanation:
      'As a 51-amino-acid peptide, insulin undergoes extensive cleavage by gastric pepsin in acidic juice and enteric proteases before any intact absorption can occur.',
  },
  'ins-q5': {
    stage: 'Bloodstream',
    topic: 'Absorption onset and clinical Tmax',
    correctAnswer: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours',
    explanation:
      'Initial plasma entry begins within 30 minutes, whereas maximum glucose-lowering pharmacodynamic activity peaks at 1.5 to 3.5 hours.',
  },
};

export function getQuestionMetadata(qId: string, qText: string): QuestionMetaLookup {
  const across = findQuestionMetadataAcrossSets(qId);
  if (across) {
    return {
      stage: across.stage,
      topic: across.topic,
      correctAnswer: across.correctAnswer,
      explanation: across.explanation,
    };
  }

  if (QUESTION_BANK_LOOKUP[qId]) {
    return QUESTION_BANK_LOOKUP[qId];
  }

  const text = (qText || '').toLowerCase();
  if (text.includes('liver') || text.includes('hepatic') || text.includes('cyp')) {
    return {
      stage: 'Liver',
      topic: 'Hepatic metabolism & enzymes',
      correctAnswer: 'Hepatic enzymatic biotransformation',
      explanation: 'Hepatic CYP450 systems mediate drug transformation and clearance kinetics.',
    };
  }
  if (text.includes('stomach') || text.includes('gastric') || text.includes('food') || text.includes('acid')) {
    return {
      stage: 'Stomach',
      topic: 'Gastric transit & absorption rate',
      correctAnswer: 'Gastric emptying and motility control',
      explanation: 'Gastric emptying governs absorption onset and peak concentration.',
    };
  }
  if (text.includes('intestine') || text.includes('enterocyte') || text.includes('pept1') || text.includes('villi')) {
    return {
      stage: 'Small Intestine',
      topic: 'Intestinal mucosal absorption',
      correctAnswer: 'Transcellular uptake across enterocytes',
      explanation: 'The small intestine provides massive surface area for systemic uptake.',
    };
  }
  if (text.includes('blood') || text.includes('plasma') || text.includes('albumin') || text.includes('circulation')) {
    return {
      stage: 'Bloodstream',
      topic: 'Albumin binding & vascular transport',
      correctAnswer: 'Plasma protein carrier distribution',
      explanation: 'Plasma protein binding dictates the free active drug fraction and distribution volume.',
    };
  }
  if (text.includes('kidney') || text.includes('renal') || text.includes('urine') || text.includes('excret')) {
    return {
      stage: 'Kidneys',
      topic: 'Renal clearance & elimination',
      correctAnswer: 'Glomerular filtration and renal clearance',
      explanation: 'Polar metabolites and free drug fractions are cleared via renal filtration and tubular excretion.',
    };
  }

  return {
    stage: 'Target Tissue',
    topic: 'Pharmacodynamic target engagement',
    correctAnswer: 'Specific receptor binding and downstream cellular response',
    explanation: 'Drug molecules bind target receptors to exert pharmacological response.',
  };
}

export interface SaveQuizParams {
  questions: QuizQuestion[];
  selectedMed: { id: string; key: string; name: string };
  user: UserProfile | null;
  submissionResult: QuizAttemptResult;
  selectedAnswers: Record<string, string>;
}

export function saveLatestQuizResult(params: SaveQuizParams): LatestQuizResult {
  const { questions, selectedMed, user, submissionResult, selectedAnswers } = params;
  const detailsMap = new Map((submissionResult.details || []).map((d) => [d.question_id, d]));

  const formattedQuestions: QuizQuestionResult[] = questions.map((q, idx) => {
    const detail = detailsMap.get(q.id);
    const meta = getQuestionMetadata(q.id, q.question_text);
    const isCorrect = detail?.correct ?? false;
    const selectedOptId = selectedAnswers[q.id];
    const selectedOpt = q.options.find((o) => o.id === selectedOptId);
    const userAnswer = selectedOpt?.option_text || 'No answer selected';
    const explanation = detail?.explanation || meta.explanation;

    return {
      id: q.id,
      order: idx + 1,
      questionText: q.question_text,
      stage: meta.stage,
      topic: meta.topic,
      selectedOptionId: selectedOptId || '',
      userAnswer,
      correctAnswer: meta.correctAnswer,
      isCorrect,
      explanation,
    };
  });

  const total = submissionResult.total_questions || questions.length;
  const correctCount =
    submissionResult.correct_answers != null
      ? submissionResult.correct_answers
      : Math.round(((submissionResult.score || 0) / 100) * total);

  // Load existing logs to determine next log number
  let existingLogs: LatestQuizResult[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZ_LOGS);
    if (raw) {
      existingLogs = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[QuizProgressService] Failed to load existing logs:', err);
  }

  const nextLogNumber =
    existingLogs.length > 0
      ? Math.max(...existingLogs.map((l) => l.logNumber || 0)) + 1
      : 1;

  const candidateName: string =
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Sarthak Tagalpallewar');
  const candidateEmail: string | undefined = user?.email || undefined;
  const candidateId: string | undefined = user?.id || undefined;

  const result: LatestQuizResult = {
    id: `log-${Date.now()}`,
    logNumber: nextLogNumber,
    userId: candidateId,
    quizId: submissionResult.quiz_id || selectedMed.id,
    drugId: selectedMed.id,
    drugName: selectedMed.name,
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: submissionResult.completed_at || new Date().toISOString(),
    score: submissionResult.score,
    correctCount,
    totalQuestions: total,
    passed: submissionResult.passed,
    questions: formattedQuestions,
  };

  try {
    localStorage.setItem(STORAGE_KEY_LATEST_RESULT, JSON.stringify(result));
    const updatedLogs = [result, ...existingLogs.filter((l) => l.id !== result.id)];
    localStorage.setItem(STORAGE_KEY_QUIZ_LOGS, JSON.stringify(updatedLogs));
  } catch (err) {
    console.warn('[QuizProgressService] Failed to save result to logs:', err);
  }

  return result;
}

export function getLatestQuizResult(): LatestQuizResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATEST_RESULT);
    if (!raw) return null;
    return JSON.parse(raw) as LatestQuizResult;
  } catch (err) {
    console.warn('[QuizProgressService] Failed to load result:', err);
    return null;
  }
}

export function getDefaultQuizLogs(user: UserProfile | null): LatestQuizResult[] {
  const candidateName: string =
    user?.name || (user?.email ? user.email.split('@')[0] : 'Sarthak Tagalpallewar');
  const candidateEmail = user?.email || 'sarthaktagalpallewar4@gmail.com';

  const log0IbuprofenZero: LatestQuizResult = {
    id: 'log-ibuprofen-00',
    logNumber: 1,
    quizId: 'drug-ibuprofen-001',
    drugId: 'drug-ibuprofen-001',
    drugName: 'Ibuprofen',
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: '2026-10-22T15:49:00.000Z',
    score: 0,
    correctCount: 0,
    totalQuestions: 5,
    passed: false,
    questions: [
      {
        id: 'q1',
        order: 1,
        questionText: 'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?',
        stage: 'Liver',
        topic: 'Hepatic epimerase & CYP2C9',
        selectedOptionId: 'q1_opt2',
        userAnswer: 'Stomach mucosa',
        correctAnswer: 'Liver (hepatic epimerase & CYP2C9)',
        isCorrect: false,
        explanation:
          'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
      },
      {
        id: 'q2',
        order: 2,
        questionText: 'How does taking Ibuprofen after a meal influence its pharmacokinetics?',
        stage: 'Stomach',
        topic: 'Gastric transit & food effects',
        selectedOptionId: 'q2_opt3',
        userAnswer: 'Accelerates gastric emptying and elevates peak concentration (Cmax) twofold',
        correctAnswer: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
        isCorrect: false,
        explanation:
          'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) from ~1-1.5 h to ~2.5-3.0 h without significantly reducing total systemic bioavailability.',
      },
      {
        id: 'q3',
        order: 3,
        questionText: 'What is the primary molecular mechanism responsible for the anti-inflammatory action of (S)-Ibuprofen?',
        stage: 'Target Tissue',
        topic: 'Reversible COX-1 and COX-2 inhibition',
        selectedOptionId: 'q3_opt3',
        userAnswer: 'Irreversible acetylation of platelet cyclooxygenase-1 (COX-1)',
        correctAnswer: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)',
        isCorrect: false,
        explanation:
          '(S)-Ibuprofen reversibly blocks the arachidonic acid channel of COX-1 and COX-2, inhibiting downstream synthesis of pro-inflammatory prostaglandins.',
      },
      {
        id: 'q4',
        order: 4,
        questionText: 'In systemic circulation, how is Ibuprofen predominantly transported within human plasma?',
        stage: 'Bloodstream',
        topic: 'Albumin binding',
        selectedOptionId: 'q4_opt2',
        userAnswer: 'Free circulating unbound fraction (>80% free in plasma)',
        correctAnswer: 'Extensively bound to serum albumin (>99% protein binding)',
        isCorrect: false,
        explanation:
          'Ibuprofen is over 99% bound to plasma albumin at therapeutic concentrations, resulting in a low apparent volume of distribution (~0.12-0.15 L/kg).',
      },
      {
        id: 'q5',
        order: 5,
        questionText: 'What is the principal elimination pathway for Ibuprofen in healthy human physiology?',
        stage: 'Kidneys',
        topic: 'Glomerular filtration & clearance',
        selectedOptionId: 'q5_opt2',
        userAnswer: 'Direct biliary excretion without renal filtration',
        correctAnswer: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine',
        isCorrect: false,
        explanation:
          'Less than 1% of ibuprofen is excreted unchanged; more than 90% is eliminated renally as oxidative metabolites and acyl-glucuronide conjugates.',
      },
    ],
  };

  const log1Ibuprofen: LatestQuizResult = {
    id: 'log-ibuprofen-01',
    logNumber: 2,
    quizId: 'drug-ibuprofen-001',
    drugId: 'drug-ibuprofen-001',
    drugName: 'Ibuprofen',
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: '2026-10-22T15:40:00.000Z',
    score: 40,
    correctCount: 2,
    totalQuestions: 5,
    passed: false,
    questions: [
      {
        id: 'q1',
        order: 1,
        questionText: 'Which organ is primarily responsible for the first-pass metabolism and chiral inversion of orally administered Ibuprofen?',
        stage: 'Liver',
        topic: 'Hepatic epimerase & CYP2C9',
        selectedOptionId: 'q1_opt2',
        userAnswer: 'Stomach mucosa',
        correctAnswer: 'Liver (hepatic epimerase & CYP2C9)',
        isCorrect: false,
        explanation:
          'In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts ~60% of the inactive (R)-enantiomer into the active anti-inflammatory (S)-enantiomer.',
      },
      {
        id: 'q2',
        order: 2,
        questionText: 'How does taking Ibuprofen after a meal influence its pharmacokinetics?',
        stage: 'Stomach',
        topic: 'Gastric transit & food effects',
        selectedOptionId: 'q2_opt1',
        userAnswer: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
        correctAnswer: 'It delays gastric emptying, prolonging Tmax without significantly altering total AUC',
        isCorrect: true,
        explanation:
          'Food delays gastric emptying, which slows initial absorption rate and delays peak plasma concentration (Tmax) from ~1-1.5 h to ~2.5-3.0 h without significantly reducing total systemic bioavailability.',
      },
      {
        id: 'q3',
        order: 3,
        questionText: 'What is the primary molecular mechanism responsible for the anti-inflammatory action of (S)-Ibuprofen?',
        stage: 'Target Tissue',
        topic: 'Reversible COX-1 and COX-2 inhibition',
        selectedOptionId: 'q3_opt3',
        userAnswer: 'Irreversible acetylation of platelet cyclooxygenase-1 (COX-1)',
        correctAnswer: 'Reversible competitive inhibition of cyclooxygenase enzymes (COX-1 and COX-2)',
        isCorrect: false,
        explanation:
          '(S)-Ibuprofen reversibly blocks the arachidonic acid channel of COX-1 and COX-2, inhibiting downstream synthesis of pro-inflammatory prostaglandins.',
      },
      {
        id: 'q4',
        order: 4,
        questionText: 'In systemic circulation, how is Ibuprofen predominantly transported within human plasma?',
        stage: 'Bloodstream',
        topic: 'Albumin binding',
        selectedOptionId: 'q4_opt2',
        userAnswer: 'Free circulating unbound fraction (>80% free in plasma)',
        correctAnswer: 'Extensively bound to serum albumin (>99% protein binding)',
        isCorrect: false,
        explanation:
          'Ibuprofen is over 99% bound to plasma albumin at therapeutic concentrations, resulting in a low apparent volume of distribution (~0.12-0.15 L/kg).',
      },
      {
        id: 'q5',
        order: 5,
        questionText: 'What is the principal elimination pathway for Ibuprofen in healthy human physiology?',
        stage: 'Kidneys',
        topic: 'Glomerular filtration & clearance',
        selectedOptionId: 'q5_opt1',
        userAnswer: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine',
        correctAnswer: 'Glomerular filtration of oxidative (carboxy/hydroxy) and glucuronide metabolites into urine',
        isCorrect: true,
        explanation:
          'Less than 1% of ibuprofen is excreted unchanged; more than 90% is eliminated renally as oxidative metabolites and acyl-glucuronide conjugates.',
      },
    ],
  };

  const log2Amoxicillin: LatestQuizResult = {
    id: 'log-amox-02',
    logNumber: 2,
    quizId: 'drug-amoxicillin-002',
    drugId: 'drug-amoxicillin-002',
    drugName: 'Amoxicillin',
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: '2026-10-22T14:15:00.000Z',
    score: 80,
    correctCount: 4,
    totalQuestions: 5,
    passed: true,
    questions: [
      {
        id: 'amox-q1',
        order: 1,
        questionText: 'What is the primary bactericidal mechanism of amoxicillin at target tissue infection sites?',
        stage: 'Target Tissue',
        topic: 'Cell wall peptidoglycan synthesis',
        selectedOptionId: 'amox-opt-1',
        userAnswer: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding',
        correctAnswer: 'Inhibition of bacterial cell wall peptidoglycan synthesis via penicillin-binding protein (PBP) binding',
        isCorrect: true,
        explanation: 'Amoxicillin binds PBPs, inhibiting transpeptidase cross-linking of peptidoglycan chains and triggering autolytic enzyme activity.',
      },
      {
        id: 'amox-q2',
        order: 2,
        questionText: 'Through which gastrointestinal transport mechanism is amoxicillin primarily absorbed in the small intestine?',
        stage: 'Small Intestine',
        topic: 'PEPT1 active transport',
        selectedOptionId: 'amox-opt-2',
        userAnswer: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)',
        correctAnswer: 'Saturable, carrier-mediated active uptake via the peptide transporter PEPT1 (SLC15A1)',
        isCorrect: true,
        explanation: 'As an amino-penicillin mimicking dipeptides, amoxicillin utilizes the proton-coupled oligopeptide transporter 1 (PEPT1) in the duodenum and jejunum, yielding ~75-90% bioavailability.',
      },
      {
        id: 'amox-q3',
        order: 3,
        questionText: 'How does food co-administration affect the oral bioavailability and total systemic absorption (AUC) of amoxicillin?',
        stage: 'Stomach',
        topic: 'Food effect on systemic absorption',
        selectedOptionId: 'amox-opt-3',
        userAnswer: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals',
        correctAnswer: 'Food does not significantly alter total systemic absorption (AUC), allowing administration with or without meals',
        isCorrect: true,
        explanation: 'Unlike ampicillin, amoxicillin absorption is stable in the presence of food; overall AUC is preserved.',
      },
      {
        id: 'amox-q4',
        order: 4,
        questionText: 'Which physiological clearance pathway is responsible for eliminating the majority of unchanged amoxicillin?',
        stage: 'Kidneys',
        topic: 'Tubular secretion & renal clearance',
        selectedOptionId: 'amox-opt-4',
        userAnswer: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion',
        correctAnswer: 'Renal elimination of unchanged drug (60–80%) via glomerular filtration and organic anion tubular secretion',
        isCorrect: true,
        explanation: 'Approximately 60–80% of an oral amoxicillin dose is excreted unchanged in the urine within 6 to 8 hours.',
      },
      {
        id: 'amox-q5',
        order: 5,
        questionText: 'What is the most prevalent resistance mechanism encountered by amoxicillin in clinical pathogens?',
        stage: 'Target Tissue',
        topic: 'Beta-lactamase resistance',
        selectedOptionId: 'amox-opt-wrong',
        userAnswer: 'Efflux pump hyper-expression alone',
        correctAnswer: 'Production of beta-lactamase enzymes that hydrolyze the beta-lactam ring',
        isCorrect: false,
        explanation: 'Bacterial beta-lactamases cleave the four-membered cyclic amide ring of amoxicillin, rendering it ineffective unless protected by clavulanic acid.',
      },
    ],
  };

  const log3Ambroxol: LatestQuizResult = {
    id: 'log-amb-03',
    logNumber: 3,
    quizId: 'drug-ambroxol-003',
    drugId: 'drug-ambroxol-003',
    drugName: 'Ambroxol Syrup',
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: '2026-10-21T11:30:00.000Z',
    score: 100,
    correctCount: 5,
    totalQuestions: 5,
    passed: true,
    questions: [
      {
        id: 'amb-q1',
        order: 1,
        questionText: 'What is the primary secretolytic mechanism of action of ambroxol in pulmonary alveolar tissue?',
        stage: 'Target Tissue',
        topic: 'Pulmonary surfactant secretolysis',
        selectedOptionId: 'amb-opt-1',
        userAnswer: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion',
        correctAnswer: 'Stimulation of pulmonary surfactant production by alveolar type II pneumocytes and serous bronchial gland secretion',
        isCorrect: true,
        explanation: 'Ambroxol stimulates alveolar type II pneumocytes to synthesize and discharge surfactant from lamellar bodies.',
      },
      {
        id: 'amb-q2',
        order: 2,
        questionText: 'How is ambroxol absorbed following oral syrup administration across gastrointestinal mucosa?',
        stage: 'Small Intestine',
        topic: 'Intestinal mucosal absorption',
        selectedOptionId: 'amb-opt-2',
        userAnswer: 'Rapid and almost complete absorption across the gastrointestinal mucosa with ~70–80% absolute bioavailability',
        correctAnswer: 'Rapid and almost complete absorption across the gastrointestinal mucosa with ~70–80% absolute bioavailability',
        isCorrect: true,
        explanation: 'Ambroxol is rapidly absorbed along the enteric mucosa with peak plasma concentration occurring within 1.5 to 2 hours.',
      },
      {
        id: 'amb-q3',
        order: 3,
        questionText: 'What physiological distribution characteristic distinguishes ambroxol pharmacokinetics in human respiratory organs?',
        stage: 'Target Tissue',
        topic: 'Lysosomal pulmonary tropism',
        selectedOptionId: 'amb-opt-3',
        userAnswer: 'High tissue affinity with pronounced pulmonary tropism resulting in lung concentrations 2.5 to 5-fold higher than plasma',
        correctAnswer: 'High tissue affinity with pronounced pulmonary tropism resulting in lung concentrations 2.5 to 5-fold higher than plasma',
        isCorrect: true,
        explanation: 'Ambroxol concentrates preferentially in pulmonary tissues due to basic lysosomotropic accumulation.',
      },
      {
        id: 'amb-q4',
        order: 4,
        questionText: 'Which hepatic enzyme pathway is predominantly responsible for the biotransformation of ambroxol into dibromoanthranilic acid?',
        stage: 'Liver',
        topic: 'CYP3A4 hepatic biotransformation',
        selectedOptionId: 'amb-opt-4',
        userAnswer: 'Hepatic biotransformation primarily mediated by CYP3A4 into dibromoanthranilic acid and glucuronide conjugates',
        correctAnswer: 'Hepatic biotransformation primarily mediated by CYP3A4 into dibromoanthranilic acid and glucuronide conjugates',
        isCorrect: true,
        explanation: 'First-pass hepatic metabolism converts ~30% of ambroxol into dibromoanthranilic acid and polar glucuronides via CYP3A4.',
      },
      {
        id: 'amb-q5',
        order: 5,
        questionText: 'How is ambroxol and its metabolic derivatives cleared from systemic circulation by renal mechanisms?',
        stage: 'Kidneys',
        topic: 'Renal metabolite clearance',
        selectedOptionId: 'amb-opt-5',
        userAnswer: 'Renal excretion of polar water-soluble glucuronide conjugates (~85%) with an elimination half-life of ~10 hours',
        correctAnswer: 'Renal excretion of polar water-soluble glucuronide conjugates (~85%) with an elimination half-life of ~10 hours',
        isCorrect: true,
        explanation: 'Elimination occurs predominantly through renal filtration and tubular clearance of conjugated metabolites.',
      },
    ],
  };

  const log4Insulin: LatestQuizResult = {
    id: 'log-ins-04',
    logNumber: 4,
    quizId: 'drug-insulin-004',
    drugId: 'drug-insulin-004',
    drugName: 'Regular Insulin',
    userName: candidateName,
    userEmail: candidateEmail,
    userAvatar: user?.avatar_url || null,
    submittedAt: '2026-10-20T16:50:00.000Z',
    score: 60,
    correctCount: 3,
    totalQuestions: 5,
    passed: false,
    questions: [
      {
        id: 'ins-q1',
        order: 1,
        questionText: 'What is the initial molecular event triggered upon regular insulin binding to its target cell surface receptor?',
        stage: 'Target Tissue',
        topic: 'Tyrosine kinase autophosphorylation',
        selectedOptionId: 'ins-opt-1',
        userAnswer: 'Binding to the alpha-subunits of the insulin receptor, triggering beta-subunit tyrosine kinase autophosphorylation',
        correctAnswer: 'Binding to the alpha-subunits of the insulin receptor, triggering beta-subunit tyrosine kinase autophosphorylation',
        isCorrect: true,
        explanation: 'Insulin binding initiates autophosphorylation of receptor beta-subunits, recruiting and activating IRS docking proteins.',
      },
      {
        id: 'ins-q2',
        order: 2,
        questionText: 'Through which downstream signaling pathway does regular insulin stimulate cellular glucose uptake into skeletal muscle and adipose tissue?',
        stage: 'Target Tissue',
        topic: 'GLUT4 glucose translocation',
        selectedOptionId: 'ins-opt-2',
        userAnswer: 'Activation of the PI3K/Akt signaling pathway driving exocytic translocation of GLUT4 storage vesicles to the plasma membrane',
        correctAnswer: 'Activation of the PI3K/Akt signaling pathway driving exocytic translocation of GLUT4 storage vesicles to the plasma membrane',
        isCorrect: true,
        explanation: 'Downstream Akt kinase activation stimulates vesicle mobilization, inserting GLUT4 glucose transporters into cell membranes.',
      },
      {
        id: 'ins-q3',
        order: 3,
        questionText: 'Why is subcutaneous absorption of regular human insulin slower than endogenous pancreatic insulin secretion?',
        stage: 'Bloodstream',
        topic: 'Subcutaneous hexamer dissociation',
        selectedOptionId: 'ins-opt-wrong-1',
        userAnswer: 'Instant binding to subcutaneous extracellular matrix albumin',
        correctAnswer: 'Zinc-stabilized hexamers in the formulation must slowly dissociate into dimers and absorbable monomers within the interstitial space',
        isCorrect: false,
        explanation: 'At pharmaceutical concentrations, insulin exists as zinc-coordinated hexamers that must slowly dissociate into absorbable monomers.',
      },
      {
        id: 'ins-q4',
        order: 4,
        questionText: 'Why can regular human insulin NOT be effectively administered via the oral gastrointestinal route?',
        stage: 'Stomach',
        topic: 'Oral proteolytic degradation',
        selectedOptionId: 'ins-opt-wrong-2',
        userAnswer: 'Excessive first-pass liver storage preventing any plasma entry',
        correctAnswer: 'Rapid enzymatic proteolysis by gastric pepsin and pancreatic serine proteases (trypsin, chymotrypsin) combined with low mucosal permeability',
        isCorrect: false,
        explanation: 'As a 51-amino-acid peptide, insulin undergoes extensive cleavage by gastric pepsin and enteric proteases.',
      },
      {
        id: 'ins-q5',
        order: 5,
        questionText: 'In the pharmacokinetics model, how does the 0.5-hour absorption milestone relate to actual clinical regular insulin pharmacodynamics?',
        stage: 'Bloodstream',
        topic: 'Absorption onset and clinical Tmax',
        selectedOptionId: 'ins-opt-5',
        userAnswer: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours',
        correctAnswer: 'The 0.5-hour value represents the clinical absorption onset marker in the simulation, whereas peak clinical metabolic effect occurs at 1.5 to 3.5 hours',
        isCorrect: true,
        explanation: 'Initial plasma entry begins within 30 minutes, whereas maximum glucose-lowering pharmacodynamic activity peaks at 1.5 to 3.5 hours.',
      },
    ],
  };

  return [log0IbuprofenZero, log1Ibuprofen, log2Amoxicillin, log3Ambroxol, log4Insulin];
}

export function getQuizLogs(
  user: UserProfile | null,
  options: { filterByUser?: boolean } = { filterByUser: true }
): LatestQuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZ_LOGS);
    if (raw) {
      const parsed: LatestQuizResult[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize each log to preserve the genuine candidate who took it
        const normalized = parsed.map((item) => {
          const emailLower = (item.userEmail || '').toLowerCase();
          const nameLower = (item.userName || '').toLowerCase();
          const isPawar = emailLower.includes('pawar') || nameLower.includes('pawar');

          // If it was Regular Insulin (Set 3) or older Ibuprofen attempts taken by Sarthak Tagalpallewar:
          const isTagalpallewar =
            !isPawar ||
            (item.drugName && item.drugName.includes('Insulin')) ||
            item.submittedAt.includes('16:22') ||
            item.submittedAt.includes('04:22') ||
            item.submittedAt.includes('15:4');

          const finalName = isTagalpallewar ? 'Sarthak Tagalpallewar' : (item.userName || 'Sarthak Pawar');
          const finalEmail = isTagalpallewar ? 'sarthaktagalpallewar4@gmail.com' : (item.userEmail || 'sarthakpawar44@gmail.com');

          return {
            ...item,
            userName: finalName,
            userEmail: finalEmail,
          };
        });

        // Persist cleaned normalized logs back so localStorage is healthy
        try {
          localStorage.setItem(STORAGE_KEY_QUIZ_LOGS, JSON.stringify(normalized));
        } catch {}

        // If filtering by current logged-in user:
        if (options.filterByUser && user) {
          const userEmail = (user.email || '').toLowerCase().trim();
          const userName = (user.name || '').toLowerCase().trim();
          const isCurrentPawar = userEmail.includes('pawar') || userName.includes('pawar');

          const userLogs = normalized.filter((item) => {
            const itemEmail = (item.userEmail || '').toLowerCase().trim();
            const itemName = (item.userName || '').toLowerCase().trim();

            if (isCurrentPawar) {
              return itemEmail.includes('pawar') || itemName.includes('pawar');
            } else {
              return !itemEmail.includes('pawar') && !itemName.includes('pawar');
            }
          });

          return userLogs;
        }

        // Filter out dummy starter fixtures so genuine user attempts are not polluted
        const nonDummy = normalized.filter(
          (item) =>
            !item.id.startsWith('log-ibuprofen-0') &&
            !item.id.startsWith('log-amox-0') &&
            !item.id.startsWith('log-amb-0') &&
            !item.id.startsWith('log-ins-0')
        );

        return nonDummy;
      }
    }
  } catch (err) {
    console.warn('[QuizProgressService] Failed to load quiz logs:', err);
  }

  return [];
}

export function getDefaultQuizResult(user: UserProfile | null): LatestQuizResult {
  const logs = getDefaultQuizLogs(user);
  return logs[0];
}

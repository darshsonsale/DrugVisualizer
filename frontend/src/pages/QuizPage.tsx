import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveLatestQuizResult } from '../services/quizProgressService';
import {
  getQuizSetsForDrug,
  evaluateQuizSetAttempt,
  DrugQuizSet,
} from '../data/quizQuestionBank';
import { QuizAttemptSubmission, QuizAttemptResult } from '../api/types';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Button } from '../components/ui/Button';
import '../styles/quiz.css';

interface MedicationMeta {
  id: string;
  key: string;
  name: string;
  badge: string;
  icon: string;
}

const MEDICATIONS: MedicationMeta[] = [
  { id: 'drug-ibuprofen-001', key: 'ibuprofen', name: 'Ibuprofen', badge: 'Oral NSAID', icon: 'medication' },
  { id: 'drug-amoxicillin-002', key: 'amoxicillin', name: 'Amoxicillin', badge: 'Beta-Lactam', icon: 'vaccines' },
  { id: 'drug-ambroxol-003', key: 'ambroxol', name: 'Ambroxol Syrup', badge: 'Oral Liquid', icon: 'water_drop' },
  { id: 'drug-insulin-004', key: 'insulin', name: 'Regular Insulin', badge: 'Subcutaneous', icon: 'colorize' },
];

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // 1. Resolve selected medication from query params
  const rawDrugParam = (searchParams.get('drug') || 'ibuprofen').toLowerCase().trim();
  const selectedMed =
    MEDICATIONS.find((m) => m.key === rawDrugParam || m.id === rawDrugParam) || MEDICATIONS[0];

  // 2. Resolve available quiz sets for this medicine (Set 1, Set 2, Set 3, etc.)
  const availableSets: DrugQuizSet[] = useMemo(() => {
    return getQuizSetsForDrug(selectedMed.key);
  }, [selectedMed.key]);

  // Read set index from query param (?set=1, ?set=2, etc.)
  const rawSetParam = parseInt(searchParams.get('set') || '1', 10);
  const initialSetIndex = !isNaN(rawSetParam) && rawSetParam >= 1 && rawSetParam <= availableSets.length
    ? rawSetParam - 1
    : 0;

  const [currentSetIndex, setCurrentSetIndex] = useState<number>(initialSetIndex);

  // Sync set index if searchParams changes
  useEffect(() => {
    const setParam = parseInt(searchParams.get('set') || '1', 10);
    if (!isNaN(setParam) && setParam >= 1 && setParam <= availableSets.length) {
      setCurrentSetIndex(setParam - 1);
    } else {
      setCurrentSetIndex(0);
    }
  }, [selectedMed.key, searchParams, availableSets.length]);

  // Active quiz set & questions
  const activeQuizSet: DrugQuizSet = availableSets[currentSetIndex] || availableSets[0];
  const questions = activeQuizSet.questions;

  // 3. Quiz workstation interactive state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Timer countdown simulation (14:28 minutes per session)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(14 * 60 + 28);
  const savedAttemptKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setSecondsRemaining(14 * 60 + 28);
  }, [selectedMed.id, currentSetIndex]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  // Persist quiz attempt to progress report service upon submission
  useEffect(() => {
    if (submitted && submissionResult && questions.length > 0) {
      const attemptKey = `${selectedMed.id}-${activeQuizSet.id}-${submissionResult.score}-${submissionResult.completed_at || ''}`;
      if (savedAttemptKeyRef.current === attemptKey) {
        return;
      }
      savedAttemptKeyRef.current = attemptKey;
      saveLatestQuizResult({
        questions,
        selectedMed: {
          id: selectedMed.id,
          key: selectedMed.key,
          name: `${selectedMed.name} (Set ${activeQuizSet.setNumber})`,
        },
        user,
        submissionResult,
        selectedAnswers,
      });
    }
  }, [submitted, submissionResult, questions, selectedMed, activeQuizSet, user, selectedAnswers]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handlers for switching medication & question sets
  const handleSelectMedication = (med: MedicationMeta) => {
    if (med.key === selectedMed.key) return;
    setCurrentSetIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setSubmitted(false);
    setSubmissionResult(null);
    setSecondsRemaining(14 * 60 + 28);
    setSearchParams({ drug: med.key, set: '1' });
  };

  const handleSelectSet = (index: number) => {
    const safeIndex = Math.max(0, Math.min(availableSets.length - 1, index));
    setCurrentSetIndex(safeIndex);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setSubmitted(false);
    setSubmissionResult(null);
    setSecondsRemaining(14 * 60 + 28);
    setSearchParams({ drug: selectedMed.key, set: String(safeIndex + 1) });
  };

  const handleCycleQuestionSet = () => {
    const nextIndex = (currentSetIndex + 1) % availableSets.length;
    handleSelectSet(nextIndex);
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const goToPrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setSubmitted(false);
    setSubmissionResult(null);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(14 * 60 + 28);
  };

  const handleSubmitQuiz = () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const submission: QuizAttemptSubmission = {
        answers: Object.entries(selectedAnswers).map(([question_id, selected_option_id]) => ({
          question_id,
          selected_option_id,
        })),
      };

      // Genuine clinical grading against the active question set
      const evaluated = evaluateQuizSetAttempt(activeQuizSet, submission);

      saveLatestQuizResult({
        questions,
        selectedMed: {
          id: selectedMed.id,
          key: selectedMed.key,
          name: `${selectedMed.name} (Set ${activeQuizSet.setNumber})`,
        },
        user,
        submissionResult: evaluated,
        selectedAnswers,
      });

      setSubmissionResult(evaluated);
      setSubmitted(true);
    } catch (err) {
      console.error('[QuizPage] Submission grading error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  const isCurrentFlagged = currentQ ? flaggedQuestions.has(currentQ.id) : false;

  // =========================================================================
  // RESULTS STATE VIEW (Post-submission with verified scientific feedback)
  // =========================================================================
  if (submitted && submissionResult) {
    const detailsMap = new Map((submissionResult.details || []).map((d) => [d.question_id, d]));

    return (
      <div className="quiz-container">
        {/* Medication Selector Tabs in Result View */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {MEDICATIONS.map((med) => {
            const isSelected = med.key === selectedMed.key;
            return (
              <button
                key={med.id}
                type="button"
                onClick={() => handleSelectMedication(med)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: isSelected
                    ? '1px solid var(--color-primary-container, #00e5ff)'
                    : '1px solid var(--color-surface-container-highest, #2e353f)',
                  background: isSelected
                    ? 'rgba(0, 229, 255, 0.12)'
                    : 'var(--color-surface-container-low, #131922)',
                  color: isSelected ? 'var(--color-primary, #c3f5ff)' : 'var(--color-on-surface-variant, #bac9cc)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.825rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {med.icon}
                </span>
                <span>{med.name}</span>
              </button>
            );
          })}
        </div>

        {/* Set Selector Bar in Result View */}
        <div className="quiz-set-selector-bar" style={{ maxWidth: '840px', width: '100%', margin: '0 auto 1.5rem' }}>
          <div className="quiz-set-pills-group">
            <span className="quiz-set-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
                layers
              </span>
              Question Set:
            </span>
            {availableSets.map((s, idx) => {
              const isSelected = currentSetIndex === idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`quiz-set-pill ${isSelected ? 'quiz-set-pill--active' : ''}`}
                  onClick={() => handleSelectSet(idx)}
                >
                  Set {s.setNumber}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="quiz-change-set-btn"
            onClick={handleCycleQuestionSet}
            title="Load the next set of 5 questions for this medication"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              autorenew
            </span>
            <span>Change Question Set</span>
          </button>
        </div>

        <div className="quiz-results-card" style={{ maxWidth: '840px', width: '100%', margin: '0 auto' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: submissionResult.passed ? 'rgba(78, 222, 163, 0.15)' : 'rgba(255, 180, 171, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: submissionResult.passed ? 'var(--color-secondary, #4edea3)' : 'var(--color-error, #ffb4ab)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              {submissionResult.passed ? 'verified' : 'cancel'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary-container, #00e5ff)' }}>
              {selectedMed.name} • Set {activeQuizSet.setNumber} Assessment Completed
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
              {submissionResult.passed ? 'Proficiency Verified!' : 'Review Recommended'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
              {submissionResult.passed
                ? `You have demonstrated clinical comprehension of ${selectedMed.name} (${activeQuizSet.title}) parameters.`
                : `Review the detailed feedback below to strengthen your grasp of ${selectedMed.name} Set ${activeQuizSet.setNumber} questions.`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', margin: '1rem 0' }}>
            <CircularGauge
              percentage={submissionResult.score}
              size={110}
              strokeWidth={6}
              sublabel="Score"
              color={submissionResult.passed ? 'var(--color-secondary, #4edea3)' : 'var(--color-tertiary-container, #ffc589)'}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Result Status:{' '}
                <strong style={{ color: submissionResult.passed ? 'var(--color-secondary, #4edea3)' : 'var(--color-error, #ffb4ab)' }}>
                  {submissionResult.passed ? 'PASSED (Mastery High)' : 'NEEDS PRACTICE'}
                </strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Correct Answers: <strong style={{ color: 'var(--color-on-surface, #dce3f0)' }}>{submissionResult.correct_answers ?? Math.round((submissionResult.score / 100) * submissionResult.total_questions)} / {submissionResult.total_questions}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Passing Threshold: <strong>70%</strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Button variant="outline" onClick={resetQuiz} icon="replay">
              Retake Set {activeQuizSet.setNumber}
            </Button>
            <Button variant="secondary" onClick={handleCycleQuestionSet} icon="autorenew">
              Try Next Question Set
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/progress');
              }}
              icon="arrow_forward"
            >
              View Learning Progress
            </Button>
          </div>

          {/* Post-Submission Question Review Section */}
          <div style={{ width: '100%', textAlign: 'left', marginTop: '1rem', borderTop: '1px solid var(--color-surface-container-highest, #2e353f)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', marginBottom: '1rem' }}>
              Detailed Question Review & Scientific Feedback (Set {activeQuizSet.setNumber})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {questions.map((q, qIndex) => {
                const detail = detailsMap.get(q.id);
                const isCorrect = detail?.correct ?? false;
                const selectedOptId = selectedAnswers[q.id];
                const selectedOpt = q.options.find((o) => o.id === selectedOptId);

                return (
                  <div
                    key={q.id}
                    style={{
                      background: 'var(--color-surface-container-low, #131922)',
                      border: isCorrect
                        ? '1px solid rgba(78, 222, 163, 0.3)'
                        : '1px solid rgba(255, 180, 171, 0.3)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-container, #00e5ff)' }}>
                        Question {qIndex + 1} • {q.stage}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          background: isCorrect ? 'rgba(78, 222, 163, 0.15)' : 'rgba(255, 180, 171, 0.15)',
                          color: isCorrect ? 'var(--color-secondary, #4edea3)' : 'var(--color-error, #ffb4ab)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
                      {q.question_text}
                    </p>

                    <div style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                      Your Answer: <strong style={{ color: isCorrect ? 'var(--color-secondary, #4edea3)' : 'var(--color-error, #ffb4ab)' }}>{selectedOpt?.option_text || 'None selected'}</strong>
                    </div>

                    {!isCorrect && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary, #4edea3)' }}>
                        Correct Answer: <strong>{q.correct_answer_text}</strong>
                      </div>
                    )}

                    {q.explanation && (
                      <div
                        style={{
                          background: 'rgba(0, 229, 255, 0.05)',
                          borderLeft: '3px solid var(--color-primary-container, #00e5ff)',
                          padding: '0.75rem 1rem',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '0.825rem',
                          lineHeight: 1.5,
                          color: 'var(--color-on-surface-variant, #bac9cc)',
                        }}
                      >
                        <strong style={{ color: 'var(--color-primary, #c3f5ff)', display: 'block', marginBottom: '0.25rem' }}>
                          Scientific Rationale:
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE QUESTION WORKSTATION VIEW
  // =========================================================================
  return (
    <div className="quiz-container">
      <div className="quiz-glow-1" aria-hidden="true" />
      <div className="quiz-glow-2" aria-hidden="true" />

      {/* Medication Selector Tab Bar */}
      <nav aria-label="Select Medication Assessment" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {MEDICATIONS.map((med) => {
          const isSelected = med.key === selectedMed.key;
          return (
            <button
              key={med.id}
              type="button"
              onClick={() => handleSelectMedication(med)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '9999px',
                border: isSelected
                  ? '1px solid var(--color-primary-container, #00e5ff)'
                  : '1px solid var(--color-surface-container-highest, #2e353f)',
                background: isSelected
                  ? 'rgba(0, 229, 255, 0.15)'
                  : 'var(--color-surface-container-low, #131922)',
                color: isSelected ? 'var(--color-primary, #c3f5ff)' : 'var(--color-on-surface-variant, #bac9cc)',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {med.icon}
              </span>
              <span>{med.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Question Set Selector Bar (New Set Options per Medicine) */}
      <section
        className="quiz-set-selector-bar"
        aria-label="Question Set Selector"
      >
        <div className="quiz-set-pills-group">
          <span className="quiz-set-label">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>
              layers
            </span>
            Question Set:
          </span>
          {availableSets.map((s, idx) => {
            const isSelected = currentSetIndex === idx;
            return (
              <button
                key={s.id}
                type="button"
                className={`quiz-set-pill ${isSelected ? 'quiz-set-pill--active' : ''}`}
                onClick={() => handleSelectSet(idx)}
                aria-pressed={isSelected}
                aria-label={`Select Question Set ${s.setNumber}: ${s.title}`}
              >
                <span>Set {s.setNumber}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="quiz-change-set-btn"
          onClick={handleCycleQuestionSet}
          aria-label="Change Question Set to load a new set of 5 questions"
          title="Click to load a new set of 5 questions for this medicine"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            autorenew
          </span>
          <span>Change Question Set</span>
        </button>
      </section>

      {/* Header & Telemetry Pills */}
      <header className="quiz-header">
        <div className="quiz-header__top">
          <div>
            <div className="quiz-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                biotech
              </span>
              <span>
                {selectedMed.name} • Set {activeQuizSet.setNumber} Assessment
              </span>
            </div>
            <h1 className="quiz-title">{activeQuizSet.title}</h1>
            <p className="quiz-subtitle">
              {activeQuizSet.subtitle || activeQuizSet.description}
            </p>
          </div>

          {/* Telemetry Pills */}
          <div className="quiz-telemetry-pill">
            <div className="quiz-telemetry-item">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary-container, #00e5ff)' }}>
                timer
              </span>
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-surface-container-highest, #2e353f)' }} />

            <div className="quiz-telemetry-item">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-tertiary-container, #ffc589)' }}>
                flag
              </span>
              <span>{flaggedQuestions.size} Flagged</span>
            </div>
          </div>
        </div>

        {/* Question Progress Bar */}
        <div className="quiz-progress-card">
          <div className="quiz-progress-labels">
            <span style={{ fontWeight: 700, color: 'var(--color-primary, #c3f5ff)' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span style={{ color: 'var(--color-on-surface-variant, #bac9cc)' }}>
              {progressPercent}% Complete
            </span>
          </div>

          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </header>

      {/* Main 2-Column Assessment Workstation */}
      {currentQ && (
        <div className="quiz-workstation">
          {/* Left Column: Active Question Card */}
          <article className="quiz-question-card" aria-label={`Question ${currentQuestionIndex + 1}`}>
            <div className="quiz-question-card__header">
              <span className="quiz-stage-tag">
                STAGE {currentQuestionIndex + 1} • {currentQ.stage.toUpperCase()}
              </span>

              <button
                type="button"
                className={`quiz-flag-btn ${isCurrentFlagged ? 'quiz-flag-btn--active' : ''}`}
                onClick={() => toggleFlagQuestion(currentQ.id)}
                aria-pressed={isCurrentFlagged}
                aria-label={isCurrentFlagged ? 'Unflag question' : 'Flag question for review'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isCurrentFlagged ? 'bookmark' : 'bookmark_border'}
                </span>
                <span>{isCurrentFlagged ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            <h2 className="quiz-question-text">{currentQ.question_text}</h2>

            {/* Answer Options Radio Group */}
            <div className="quiz-options-group" role="radiogroup" aria-label="Answer options">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === option.id;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`quiz-option-card ${isSelected ? 'quiz-option-card--selected' : ''}`}
                    onClick={() => selectAnswer(currentQ.id, option.id)}
                  >
                    <div className="quiz-option-badge">
                      {isSelected ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          check
                        </span>
                      ) : (
                        letter
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: isSelected ? 'var(--color-primary, #c3f5ff)' : 'var(--color-on-surface, #dce3f0)',
                          }}
                        >
                          {option.option_text}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: 'rgba(0, 229, 255, 0.15)',
                              color: 'var(--color-primary-container, #00e5ff)',
                              border: '1px solid rgba(0, 229, 255, 0.3)',
                            }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Neutral Examination Tip Box (Zero Answer Leakage) */}
            <div className="quiz-didactic-box">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '22px', color: 'var(--color-primary-container, #00e5ff)', flexShrink: 0, marginTop: '2px' }}
              >
                lightbulb
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #c3f5ff)',
                  }}
                >
                  Examination Guidance • {currentQ.topic}
                </span>
                <p style={{ fontSize: '0.825rem', lineHeight: 1.55, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                  Evaluate physiological transit parameters, metabolic transformation, and carrier interactions. Verified scientific explanations unlock upon submission.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <footer className="quiz-action-footer">
              <button
                type="button"
                className="quiz-btn-prev"
                disabled={currentQuestionIndex === 0}
                onClick={goToPrevQuestion}
                style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_back
                </span>
                <span>Previous Question</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="quiz-btn-prev"
                  onClick={() => toggleFlagQuestion(currentQ.id)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    list_alt
                  </span>
                  <span>{isCurrentFlagged ? 'Flagged' : 'Review Flagged'}</span>
                </button>

                {isLastQuestion ? (
                  <button
                    type="button"
                    className="quiz-btn-next"
                    disabled={submitting}
                    onClick={handleSubmitQuiz}
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Assessment'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      verified
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="quiz-btn-next"
                    onClick={goToNextQuestion}
                  >
                    <span>Next Question</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            </footer>
          </article>

          {/* Right Column: Question Matrix & Refresher */}
          <aside className="quiz-sidebar" aria-label="Assessment Navigation and Telemetry">
            {/* Question Matrix Card */}
            <div className="quiz-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                  Question Matrix
                </span>
                <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-secondary, #4edea3)' }}>
                  {selectedMed.name} • Set {activeQuizSet.setNumber}
                </span>
              </div>

              <div className="quiz-matrix-grid">
                {questions.map((q, idx) => {
                  const isActive = idx === currentQuestionIndex;
                  const isAnswered = Boolean(selectedAnswers[q.id]);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className="quiz-matrix-btn"
                      onClick={() => goToQuestion(idx)}
                      aria-label={`Jump to Question ${idx + 1}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <div
                        className={`quiz-matrix-chip ${
                          isActive
                            ? 'quiz-matrix-chip--active'
                            : isAnswered
                            ? 'quiz-matrix-chip--answered'
                            : ''
                        }`}
                      >
                        {isAnswered && !isActive ? (
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            done
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--color-primary, #c3f5ff)' : 'var(--color-on-surface-variant, #bac9cc)',
                        }}
                      >
                        Q{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="quiz-matrix-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary, #4edea3)' }} />
                  <span>Answered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary-container, #00e5ff)' }} />
                  <span>Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-surface-container-highest, #2e353f)' }} />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            {/* Study Refresher Card */}
            <div className="quiz-refresher-box">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-surface-container, #19202a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #c3f5ff)',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  school
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                  Need a refresher?
                </span>
                <Link
                  to={`/learn?drug=${selectedMed.key}`}
                  style={{
                    fontSize: '0.775rem',
                    color: 'var(--color-primary-container, #00e5ff)',
                    marginTop: '0.2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <span>Explore {selectedMed.name} pathway</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    open_in_new
                  </span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default QuizPage;

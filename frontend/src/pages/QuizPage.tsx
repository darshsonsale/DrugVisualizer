import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Button } from '../components/ui/Button';
import '../styles/quiz.css';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    currentQuestionIndex,
    selectedAnswers,
    flaggedQuestions,
    submitted,
    submissionResult,
    submitting,
    selectAnswer,
    toggleFlagQuestion,
    goToNextQuestion,
    goToPrevQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    refetch,
  } = useQuiz('quiz-ibuprofen-001');

  // Timer countdown simulation (15 minutes)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(14 * 60 + 28);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading && !data) {
    return (
      <div className="quiz-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid var(--color-surface-container-highest, #2e353f)',
              borderTopColor: 'var(--color-primary-container, #00e5ff)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
            Loading Pharmacokinetics Assessment...
          </span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="quiz-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="quiz-results-card">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error, #ffb4ab)' }}>
            error
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
            Unable to Load Assessment
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
            {error}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const questions = data?.questions || [];
  const currentQ = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  const isCurrentFlagged = currentQ ? flaggedQuestions.has(currentQ.id) : false;

  // Didactic insight rationale
  const currentCorrectOption = currentQ?.options.find((o) => o.is_correct);
  const didacticInsight =
    currentCorrectOption?.explanation ||
    'Ibuprofen is administered as a racemic 50:50 mixture. In the liver, the stereospecific enzyme 2-arylpropionyl-CoA epimerase converts approximately 60% of the inactive (R)-enantiomer into the anti-inflammatory active (S)-enantiomer.';

  // Results State View
  if (submitted && submissionResult) {
    return (
      <div className="quiz-container">
        <div className="quiz-results-card">
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
              Assessment Completed
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
              {submissionResult.passed ? 'Proficiency Verified!' : 'Review Recommended'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
              {submissionResult.passed
                ? 'You have demonstrated clinical comprehension of physiological transit and pharmacokinetics.'
                : 'Review hepatic clearance and gastric emptying principles to strengthen comprehension.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', margin: '1rem 0' }}>
            <CircularGauge
              percentage={submissionResult.score}
              size={100}
              strokeWidth={5}
              sublabel="Score"
              color={submissionResult.passed ? 'var(--color-secondary, #4edea3)' : 'var(--color-tertiary-container, #ffc589)'}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Result Status:{' '}
                <strong style={{ color: submissionResult.passed ? 'var(--color-secondary, #4edea3)' : 'var(--color-error, #ffb4ab)' }}>
                  {submissionResult.passed ? 'PASSED (Mastery High)' : 'NEEDS PRACTICE'}
                </strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Total Questions Evaluated: <strong style={{ color: 'var(--color-on-surface, #dce3f0)' }}>{submissionResult.total_questions}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Button variant="outline" onClick={resetQuiz} icon="replay">
              Retake Assessment
            </Button>
            <Button variant="primary" onClick={() => navigate('/progress')} icon="arrow_forward">
              View Learning Progress
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-glow-1" aria-hidden="true" />
      <div className="quiz-glow-2" aria-hidden="true" />

      {/* 1. Header & Telemetry Pills */}
      <header className="quiz-header">
        <div className="quiz-header__top">
          <div>
            <div className="quiz-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                biotech
              </span>
              <span>Clinical Pharmacokinetics Exam</span>
            </div>
            <h1 className="quiz-title">Ibuprofen Pathway Quiz</h1>
            <p className="quiz-subtitle">
              Assess your understanding of physiological transit and pharmacokinetics.
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

      {/* 2. Main 2-Column Assessment Workstation */}
      {currentQ && (
        <div className="quiz-workstation">
          {/* Left Column: Active Question Card */}
          <article className="quiz-question-card" aria-label={`Question ${currentQuestionIndex + 1}`}>
            <div className="quiz-question-card__header">
              <span className="quiz-stage-tag">
                STAGE {currentQuestionIndex + 1} • {currentQ.id.toUpperCase()}
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

            {/* Didactic Insight Box */}
            <div className="quiz-didactic-box">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '22px', color: 'var(--color-primary-container, #00e5ff)', flexShrink: 0, marginTop: '2px' }}
              >
                info
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
                  Didactic Insight: Chiral Kinetics
                </span>
                <p style={{ fontSize: '0.825rem', lineHeight: 1.55, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                  {didacticInsight}
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
                    onClick={submitQuiz}
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

          {/* Right Column: Telemetry & Matrix Sidebar */}
          <aside className="quiz-sidebar" aria-label="Assessment Navigation and Telemetry">
            {/* Question Matrix Card */}
            <div className="quiz-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                  Question Matrix
                </span>
                <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-secondary, #4edea3)' }}>
                  Pathway Flow
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

            {/* Proficiency Gauge Card */}
            <div className="quiz-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                  Proficiency Gauge
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary, #c3f5ff)' }}>
                  insights
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <CircularGauge
                  percentage={80}
                  size={76}
                  strokeWidth={4.5}
                  sublabel="INDEX"
                  color="var(--color-primary-container, #00e5ff)"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-secondary, #4edea3)' }}>
                    Mastery High
                  </span>
                  <p style={{ fontSize: '0.775rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0, lineHeight: 1.45 }}>
                    Strong comprehension on Gastric Dissolution and Enteric Permeability.
                  </p>
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'var(--color-surface-container, #19202a)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-on-surface-variant, #bac9cc)' }}>First-Pass Metabolism Concept</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary, #c3f5ff)' }}>Advanced</span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--color-surface-container-highest, #2e353f)', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'var(--color-secondary, #4edea3)', borderRadius: '9999px' }} />
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
                  to="/learn"
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
                  <span>Read Hepatic Clearance notes</span>
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

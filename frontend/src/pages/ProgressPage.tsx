import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularGauge } from '../components/ui/CircularGauge';
import { Button } from '../components/ui/Button';
import {
  getQuizLogs,
  LatestQuizResult,
  QuizQuestionResult,
} from '../services/quizProgressService';
import '../styles/progress.css';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: show only current candidate's attempts by default, allow viewing all attempts
  const [showAllCandidates, setShowAllCandidates] = useState<boolean>(false);

  // Load quiz logs for candidate
  const [logs, setLogs] = useState<LatestQuizResult[]>(() =>
    getQuizLogs(user, { filterByUser: !showAllCandidates })
  );

  // Tracks which quiz card is currently expanded to show Screenshot 2 (Question Review)
  // Defaults to null or the first log so the user can tap to expand any quiz card!
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Active question per quiz attempt
  const [activeQuestionMap, setActiveQuestionMap] = useState<Record<string, string>>({});

  // Sync on user change or mode toggle
  useEffect(() => {
    const freshLogs = getQuizLogs(user, { filterByUser: !showAllCandidates });
    setLogs(freshLogs);
  }, [user, showAllCandidates]);

  const toggleExpand = (quizId: string) => {
    setExpandedQuizId((prev) => (prev === quizId ? null : quizId));
  };

  const handleSelectQuestion = (quizId: string, questionId: string) => {
    setActiveQuestionMap((prev) => ({
      ...prev,
      [quizId]: questionId,
    }));
  };

  const handleNavQuestion = (quizId: string, questions: QuizQuestionResult[], direction: 'prev' | 'next') => {
    const currentQId = activeQuestionMap[quizId] || questions.find((q) => !q.isCorrect)?.id || questions[0]?.id;
    const currentIndex = questions.findIndex((q) => q.id === currentQId);
    if (direction === 'prev' && currentIndex > 0) {
      handleSelectQuestion(quizId, questions[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < questions.length - 1) {
      handleSelectQuestion(quizId, questions[currentIndex + 1].id);
    }
  };

  const formatQuizDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="progress-container">
      <div className="progress-glow-1" aria-hidden="true" />
      <div className="progress-glow-2" aria-hidden="true" />

      {/* 1. Header Block */}
      <header className="progress-header">
        <div>
          <div className="progress-badge">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary, #167D78)' }} />
            <span>Clinical Telemetry • Candidate Examination Audit</span>
          </div>

          <h1 className="progress-title">Your Learning Progress &amp; Assessment Report</h1>

          <p className="progress-subtitle">
            Chronological audit of candidate pharmacokinetics quiz attempts. Review overall metrics
            on front side and click any assessment card to inspect question mistakes and verified solutions.
          </p>
        </div>

        {/* Identity & Admin Access */}
        <div className="progress-identity-bar">
          {user?.role === 'admin' && (
            <Link
              to="/admin/content"
              className="progress-identity-chip"
              style={{
                background: 'var(--color-primary-light, #E6F5F4)',
                border: '1px solid rgba(22, 125, 120, 0.3)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              title="Open Administrative Content Management Portal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary, #167D78)' }}>
                admin_panel_settings
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant, #475569)', lineHeight: 1, fontWeight: 600 }}>
                  ADMIN ACCESS
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary, #167D78)' }}>
                  Admin Portal &rarr;
                </span>
              </div>
            </Link>
          )}

          <div className="progress-identity-chip">
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary, #167D78)' }}>
              account_circle
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant, #475569)', lineHeight: 1, fontWeight: 600 }}>
                LOGGED-IN CANDIDATE
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-on-surface, #1E293B)', letterSpacing: '0.01em' }}>
                {user?.name || logs[0]?.userName || 'Sarthak Tagalpallewar'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Toggle: My Attempts vs All Candidates */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`quiz-set-pill ${!showAllCandidates ? 'quiz-set-pill--active' : ''}`}
            onClick={() => setShowAllCandidates(false)}
            style={{ cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              person
            </span>
            <span>My Quiz Attempts ({!showAllCandidates ? logs.length : getQuizLogs(user, { filterByUser: true }).length})</span>
          </button>

          <button
            type="button"
            className={`quiz-set-pill ${showAllCandidates ? 'quiz-set-pill--active' : ''}`}
            onClick={() => setShowAllCandidates(true)}
            style={{ cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              group
            </span>
            <span>All Candidate Attempts</span>
          </button>
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>
          Showing {logs.length} {logs.length === 1 ? 'assessment attempt' : 'assessment attempts'}
        </span>
      </div>

      {/* 2. LIST OF QUIZ ATTEMPTS */}
      <div className="progress-quiz-logs-stack">
        {logs.length === 0 ? (
          <div className="quiz-results-card" style={{ maxWidth: '640px', width: '100%', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>
              history_edu
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0.5rem 0' }}>
              No Assessment Attempts Found for {user?.name || 'this Account'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              You have not taken any quizzes under this account yet. Take an assessment to see your scores and scientific answers recorded here!
            </p>
            <Button variant="primary" onClick={() => navigate('/quiz')} icon="quiz">
              Take a Quiz Assessment
            </Button>
          </div>
        ) : (
          logs.map((quiz, quizIdx) => {
            const isExpanded = expandedQuizId === quiz.id;
            const questions = quiz.questions || [];
            const activeQId =
              activeQuestionMap[quiz.id] ||
              questions.find((q) => !q.isCorrect)?.id ||
              questions[0]?.id;
            const activeQuestion = questions.find((q) => q.id === activeQId) || questions[0];
            const activeQIndex = questions.findIndex((q) => q.id === activeQuestion?.id);

            // Display the exact candidate who took this specific quiz
            const candidateName = quiz.userName || user?.name || 'Candidate';
            const candidateEmail = quiz.userEmail || user?.email || '';
            const isCurrentCandidate = Boolean(
              user && (
                (user.email && quiz.userEmail && user.email.toLowerCase() === quiz.userEmail.toLowerCase()) ||
                (user.name && quiz.userName && user.name.toLowerCase() === quiz.userName.toLowerCase())
              )
            );

            const scorePercent = quiz.score;
            const correctCount = quiz.correctCount;
            const totalQuestions = quiz.totalQuestions || questions.length;
            const isPassed = quiz.passed ?? scorePercent >= 70;
            const formattedDate = formatQuizDate(quiz.submittedAt);

            return (
              <section
                key={quiz.id}
                className={`progress-quiz-result-card ${isExpanded ? 'progress-quiz-result-card--active' : ''}`}
                aria-label={`Quiz Attempt ${quiz.drugName}`}
              >
                {/* ============================================================== */}
                {/* SCREENSHOT 1: UPPER PART (Always visible on front side)       */}
                {/* ============================================================== */}
                <div
                  className="progress-quiz-header-banner progress-clickable-header"
                  onClick={() => toggleExpand(quiz.id)}
                  title="Click to view question review and correct answers"
                >
                  <div className="progress-candidate-meta">
                    <div className="progress-candidate-avatar">
                      <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ffffff' }}>
                        person
                      </span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="progress-candidate-name">{candidateName}</span>
                        {isCurrentCandidate && (
                          <span className="progress-candidate-badge">ACTIVE CANDIDATE</span>
                        )}
                        {quizIdx === 0 && (
                          <span className="progress-latest-attempt-pill">Latest Quiz Result</span>
                        )}
                      </div>
                      <div className="progress-candidate-submeta">
                        <span>{candidateEmail}</span>
                        <span>•</span>
                        <span>Assessed: <strong>{quiz.drugName}</strong></span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                <div className="progress-score-pill-group" onClick={(e) => e.stopPropagation()}>
                  <div
                    className={`progress-status-badge ${
                      isPassed ? 'progress-status-badge--passed' : 'progress-status-badge--review'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isPassed ? 'verified' : 'pending_actions'}
                    </span>
                    <span>{isPassed ? 'PROFICIENCY VERIFIED' : 'REVIEW RECOMMENDED'}</span>
                  </div>
                  <Link to="/quiz" className="progress-retake-btn">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      replay
                    </span>
                    <span>Take Another Quiz</span>
                  </Link>
                </div>
              </div>

              {/* 3 KPI Metric Boxes (Exact layout from Screenshot 1) */}
              <div
                className="progress-metrics-row progress-clickable-metrics"
                onClick={() => toggleExpand(quiz.id)}
                title="Click to expand/collapse question review"
              >
                {/* Box 1: Assessment Score */}
                <div className="progress-metric-box">
                  <div className="progress-metric-label">ASSESSMENT SCORE</div>
                  <div className="progress-metric-value-row">
                    <span className="progress-metric-large-number">{scorePercent}%</span>
                    <CircularGauge
                      percentage={scorePercent}
                      size={68}
                      strokeWidth={6}
                      sublabel="SCORE"
                      color={isPassed ? 'var(--color-primary, #167D78)' : '#E05D52'}
                      trackColor="var(--color-surface-container-high, #EDF3EF)"
                    />
                  </div>
                  <span className="progress-metric-caption">
                    Passing threshold standard: <strong>70%</strong>
                  </span>
                </div>

                {/* Box 2: Question Accuracy */}
                <div className="progress-metric-box">
                  <div className="progress-metric-label">QUESTION ACCURACY</div>
                  <div style={{ margin: '0.6rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span className="progress-metric-large-number">{correctCount}</span>
                      <span style={{ fontSize: '1.25rem', color: 'var(--color-on-surface-variant, #475569)', fontWeight: 600 }}>
                        / {totalQuestions} Correct
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant, #475569)', marginTop: '0.2rem' }}>
                      {totalQuestions - correctCount} question(s) requiring reinforcement
                    </div>
                  </div>
                  <div className="progress-mini-bar-track">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className={`progress-mini-bar-seg ${
                          q.isCorrect ? 'progress-mini-bar-seg--correct' : 'progress-mini-bar-seg--wrong'
                        }`}
                        title={`Question ${idx + 1}: ${q.isCorrect ? 'Correct' : 'Incorrect'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Box 3: Assessed Medication */}
                <div className="progress-metric-box">
                  <div className="progress-metric-label">ASSESSED MEDICATION</div>
                  <div style={{ margin: '0.6rem 0' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-on-surface, #1E293B)' }}>
                      {quiz.drugName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary, #167D78)', fontWeight: 600, marginTop: '0.15rem' }}>
                      Full Systemic Pharmacokinetic Cycle
                    </div>
                  </div>
                  <span className="progress-metric-caption">
                    ADME (Absorption, Distribution, Metabolism &amp; Excretion)
                  </span>
                </div>
              </div>

              {/* Click Indicator Banner on Front Side */}
              <div className="progress-card-toggle-bar">
                <button
                  type="button"
                  onClick={() => toggleExpand(quiz.id)}
                  className="progress-card-toggle-btn"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {isExpanded ? 'expand_less' : 'quiz'}
                  </span>
                  <span>
                    {isExpanded
                      ? 'Collapse Question Review ▲'
                      : `Click to Inspect Questions, Mistakes & Correct Answers (${questions.length} Questions) ▼`}
                  </span>
                </button>
              </div>

              {/* ============================================================== */}
              {/* SCREENSHOT 2: DETAILED QUESTION REVIEW (Opens on click)        */}
              {/* ============================================================== */}
              {isExpanded && (
                <div className="progress-expanded-review-container">
                  <div className="progress-questions-section">
                    <div className="progress-section-subhead">
                      <div>
                        <h2 className="progress-section-subtitle">
                          Question Performance &amp; Verification
                        </h2>
                        <p className="progress-section-desc">
                          Click any question box below to open its in-page review, verify your response, and view the correct scientific answer.
                        </p>
                      </div>
                      <div className="progress-legend">
                        <span className="progress-legend-item">
                          <span className="progress-legend-dot progress-legend-dot--correct" />
                          <span>Right ({correctCount})</span>
                        </span>
                        <span className="progress-legend-item">
                          <span className="progress-legend-dot progress-legend-dot--wrong" />
                          <span>Wrong ({totalQuestions - correctCount})</span>
                        </span>
                      </div>
                    </div>

                    {/* Question Boxes Grid: Q1, Q2, Q3, Q4, Q5 */}
                    <div className="progress-question-grid">
                      {questions.map((q, index) => {
                        const isQSelected = activeQuestion?.id === q.id;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleSelectQuestion(quiz.id, q.id)}
                            className={`progress-question-box ${
                              q.isCorrect ? 'progress-question-box--correct' : 'progress-question-box--wrong'
                            } ${isQSelected ? 'progress-question-box--selected' : ''}`}
                          >
                            <div className="progress-question-box-header">
                              <span className="progress-question-number">Question {q.order || index + 1}</span>
                              <span
                                className={`progress-question-status-pill ${
                                  q.isCorrect
                                    ? 'progress-question-status-pill--correct'
                                    : 'progress-question-status-pill--wrong'
                                }`}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  {q.isCorrect ? 'check_circle' : 'cancel'}
                                </span>
                                <span>{q.isCorrect ? 'RIGHT' : 'WRONG'}</span>
                              </span>
                            </div>

                            <div className="progress-question-box-stage">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                conversion_path
                              </span>
                              <span>{q.stage}</span>
                            </div>

                            <p className="progress-question-box-text">
                              {q.questionText}
                            </p>

                            <div className="progress-question-box-footer">
                              <span className="progress-click-hint">
                                {isQSelected ? 'Currently Viewing Review ↓' : 'Click to View Review →'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* In-Page Question Review Dialog Box */}
                    {activeQuestion && (
                      <div className="progress-detail-dialog">
                        <div className="progress-detail-dialog-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div
                              className={`progress-dialog-badge ${
                                activeQuestion.isCorrect
                                  ? 'progress-dialog-badge--correct'
                                  : 'progress-dialog-badge--wrong'
                              }`}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {activeQuestion.isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                              <span>
                                {activeQuestion.isCorrect
                                  ? `Question ${activeQuestion.order} Answered Correctly`
                                  : `Question ${activeQuestion.order} Missed (Needs Review)`}
                              </span>
                            </div>

                            <span className="progress-dialog-stage-chip">
                              Anatomical Phase: <strong>{activeQuestion.stage}</strong>
                            </span>
                          </div>

                          <div className="progress-dialog-nav-buttons">
                            <button
                              type="button"
                              onClick={() => handleNavQuestion(quiz.id, questions, 'prev')}
                              disabled={activeQIndex === 0}
                              className="progress-nav-btn"
                              title="Previous question"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                arrow_back
                              </span>
                              <span>Previous</span>
                            </button>
                            <span className="progress-nav-indicator">
                              {activeQIndex + 1} of {questions.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleNavQuestion(quiz.id, questions, 'next')}
                              disabled={activeQIndex === questions.length - 1}
                              className="progress-nav-btn"
                              title="Next question"
                            >
                              <span>Next</span>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Examination Question Prompt */}
                        <div className="progress-dialog-question-prompt">
                          <span className="progress-dialog-section-label">EXAMINATION QUESTION:</span>
                          <p className="progress-dialog-question-text">{activeQuestion.questionText}</p>
                        </div>

                        {/* Answers Comparison: Your Submitted Answer vs Verified Correct Answer */}
                        <div className="progress-dialog-answers-grid">
                          {/* Candidate Submitted Answer */}
                          <div
                            className={`progress-answer-card ${
                              activeQuestion.isCorrect
                                ? 'progress-answer-card--user-correct'
                                : 'progress-answer-card--user-wrong'
                            }`}
                          >
                            <div className="progress-answer-card-header">
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {activeQuestion.isCorrect ? 'check_circle' : 'error'}
                              </span>
                              <span>YOUR SUBMITTED ANSWER:</span>
                            </div>
                            <p className="progress-answer-card-text">{activeQuestion.userAnswer}</p>
                            <div className="progress-answer-card-status">
                              {activeQuestion.isCorrect ? '✓ Mark Earned (Correct)' : '✕ Marked Incorrect'}
                            </div>
                          </div>

                          {/* Verified Right Answer */}
                          <div className="progress-answer-card progress-answer-card--verified">
                            <div className="progress-answer-card-header">
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                verified
                              </span>
                              <span>VERIFIED CORRECT ANSWER:</span>
                            </div>
                            <p className="progress-answer-card-text">{activeQuestion.correctAnswer}</p>
                            <div className="progress-answer-card-status progress-answer-card-status--verified">
                              ✓ Verified Pharmacokinetic Solution
                            </div>
                          </div>
                        </div>

                        {/* Pharmacological Explanation */}
                        <div className="progress-dialog-explanation-box">
                          <div className="progress-dialog-explanation-header">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary, #167D78)' }}>
                              biotech
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-on-surface, #1E293B)' }}>
                              Pharmacological Explanation &amp; Clinical Rationale
                            </span>
                          </div>
                          <p className="progress-dialog-explanation-text">
                            {activeQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
      </div>

      {/* 3. Footer Action Strip */}
      <section className="progress-actions-strip">
        <div className="progress-action-banner">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-on-surface, #1E293B)', margin: 0 }}>
              Ready to Expand Your Pharmacokinetics Knowledge?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #475569)', margin: '0.25rem 0 0' }}>
              Test your clinical comprehension across other active medications or explore the 3D anatomical trajectory.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/explore')}
              icon="view_in_ar"
            >
              Explore 3D Pathway
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/quiz')}
              icon="quiz"
            >
              Take Another Quiz
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgressPage;

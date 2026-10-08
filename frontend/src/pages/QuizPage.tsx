import React from 'react';

export const QuizPage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="pill-badge">
          <span className="pill-dot" />
          Pathway Assessment
        </div>

        <h1 className="placeholder-title">Ibuprofen Pathway Quiz</h1>

        <p className="placeholder-desc">
          Interactive checkpoint diagnostic quiz assessing comprehension of physiological transit
          and pharmacokinetics. Quiz questions and scoring matrix will be integrated in future tasks.
        </p>

        <div className="placeholder-meta">
          <span>Route: <code>/quiz</code></span>
          <span>•</span>
          <span>Status: <strong>Active</strong></span>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

import React from 'react';

export const LearnPage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="pill-badge">
          <span className="pill-dot" />
          Pharmacokinetics Atlas
        </div>

        <h1 className="placeholder-title">Knowledge Base</h1>

        <p className="placeholder-desc">
          Educational guide covering ADME principles, molecular mechanisms, and dietary
          state comparisons. Detailed knowledge articles and clinical FAQs will be populated here.
        </p>

        <div className="placeholder-meta">
          <span>Route: <code>/learn</code></span>
          <span>•</span>
          <span>Status: <strong>Active</strong></span>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;

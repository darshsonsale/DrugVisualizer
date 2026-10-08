import React from 'react';

export const ProgressPage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="pill-badge">
          <span className="pill-dot" />
          Learning Mastery Dashboard
        </div>

        <h1 className="placeholder-title">Your Progress & Mastery</h1>

        <p className="placeholder-desc">
          Telemetry dashboard tracking anatomical exploration, completed milestones, earned badges,
          and authenticated progress persistence across sessions.
        </p>

        <div className="placeholder-meta">
          <span>Route: <code>/progress</code></span>
          <span>•</span>
          <span>Status: <strong>Active</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;

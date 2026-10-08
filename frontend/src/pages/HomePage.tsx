import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="pill-badge">
          <span className="pill-dot" />
          Landing & Launchpad
        </div>

        <h1 className="placeholder-title">Home</h1>

        <p className="placeholder-desc">
          Welcome to the Drug Path Visualiser. Explore the journey of oral medications
          through human physiological systems. Full landing page presentation will be integrated
          in subsequent roadmap stages.
        </p>

        <div className="placeholder-meta">
          <span>Route: <code>/</code></span>
          <span>•</span>
          <span>Status: <strong>Active</strong></span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

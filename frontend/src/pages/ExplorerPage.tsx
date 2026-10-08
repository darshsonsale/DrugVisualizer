import React from 'react';

export const ExplorerPage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="pill-badge">
          <span className="pill-dot" />
          Interactive 3D Workspace
        </div>

        <h1 className="placeholder-title">Pathway Explorer</h1>

        <p className="placeholder-desc">
          Primary 3D anatomical pathway explorer workspace. The 3D canvas, milestone waypoints,
          and node inspection drawers will be implemented in Tasks 06, 07, and 08.
        </p>

        <div className="placeholder-meta">
          <span>Route: <code>/explore</code></span>
          <span>•</span>
          <span>Target Tasks: <strong>Tasks 06 – 08</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ExplorerPage;

import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div
          className="pill-badge"
          style={{
            color: 'var(--color-error)',
            borderColor: 'var(--color-error-container)',
          }}
        >
          <span
            className="pill-dot"
            style={{
              backgroundColor: 'var(--color-error)',
              boxShadow: '0 0 6px var(--color-error)',
            }}
          />
          404 Not Found
        </div>

        <h1 className="placeholder-title">Page Not Found</h1>

        <p className="placeholder-desc">
          The requested route does not exist within the Drug Path Visualiser. Please return
          to the home launchpad or explore the interactive pathway.
        </p>

        <Link to="/" className="btn-primary-action">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

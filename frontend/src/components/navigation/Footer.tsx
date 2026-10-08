import React from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_QUICK_LINKS } from '../../types/navigation';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: 'var(--color-primary-container)' }}
          >
            science
          </span>
          <span>Drug Path Visualiser • Pharmacokinetics Simulation Console</span>
        </div>

        <nav className="footer-links" aria-label="Footer Quick Links">
          {FOOTER_QUICK_LINKS.map((item) => (
            <Link key={item.label} to={item.path} className="footer-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

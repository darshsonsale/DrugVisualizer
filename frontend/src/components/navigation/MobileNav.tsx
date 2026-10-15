import React from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, loading, loginWithGoogle, logout } = useAuth();
  if (!isOpen) return null;

  return (
    <nav className="mobile-nav-menu" aria-label="Mobile Navigation">
      {MAIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onClose}
          className={({ isActive }) =>
            `mobile-nav-link ${isActive ? 'active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}

      <div style={{ padding: '16px', borderTop: '1px solid var(--color-surface-container-highest)', marginTop: '8px' }}>
        {!isAuthenticated ? (
          <button
            type="button"
            className="sign-in-btn"
            style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}
            disabled={loading}
            onClick={() => {
              onClose();
              loginWithGoogle();
            }}
          >
            {loading ? 'Connecting...' : 'Sign In with Google'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                {user?.name || 'Learner'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                {user?.email}
              </span>
            </div>
            <button
              type="button"
              className="profile-sign-out-btn"
              onClick={() => {
                onClose();
                logout();
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                logout
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

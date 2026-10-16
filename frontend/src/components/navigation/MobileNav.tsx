import React from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
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

      {user?.role === 'admin' && (
        <NavLink
          to="/admin/content"
          onClick={onClose}
          className={({ isActive }) =>
            `mobile-nav-link admin-nav-link ${isActive ? 'active' : ''}`
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-primary-container, #00e5ff)',
            fontWeight: 700
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            admin_panel_settings
          </span>
          <span>Admin Portal</span>
        </NavLink>
      )}

      <div style={{ padding: '16px', borderTop: '1px solid var(--color-surface-container-highest)', marginTop: '8px' }}>
        {!isAuthenticated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <NavLink
              to="/login"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'var(--color-surface-container-high, #242a34)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                login
              </span>
              <span>Sign In / Register</span>
            </NavLink>

            <NavLink
              to="/admin/login"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.12)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                color: 'var(--color-primary-container, #00e5ff)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                admin_panel_settings
              </span>
              <span>Administrator Sign In</span>
            </NavLink>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                {user?.name || 'BioLumen User'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                {user?.email} ({user?.role})
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

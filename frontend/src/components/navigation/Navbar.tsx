import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../../types/navigation';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const {
    user,
    isAuthenticated,
    loading,
    error,
    loginWithDemoAccount,
    logout,
    clearError
  } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-navbar">
      {error && (
        <div className="auth-error-banner" role="alert">
          <div className="auth-error-content">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffb4ab' }}>
              error_outline
            </span>
            <span>{error}</span>
            {error.includes('GOOGLE_CLIENT_ID') && (
              <button
                type="button"
                className="auth-error-demo-btn"
                onClick={() => loginWithDemoAccount('learner')}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in with Demo Account'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={clearError}
            className="auth-error-dismiss"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-link" aria-label="Drug Path Visualiser Home">
          <div className="brand-icon-box">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              medication
            </span>
          </div>
          <span className="brand-title">Drug Path Visualiser</span>
        </Link>

        {/* Center Desktop Navigation Pills */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          {MAIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/content"
              className={({ isActive }) =>
                `nav-item-link admin-nav-pill ${isActive ? 'active' : ''}`
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-primary-container, #00e5ff)',
                fontWeight: 700
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                admin_panel_settings
              </span>
              <span>Admin Portal</span>
            </NavLink>
          )}
        </nav>

        {/* Right Utilities */}
        <div className="nav-utilities" ref={profileMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Search Visualizer"
            title="Search"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              search
            </span>
          </button>

          {!isAuthenticated ? (
            <button
              type="button"
              className="sign-in-btn"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              disabled={loading}
              aria-label="Sign In Options"
              title="Sign in options"
            >
              {loading ? 'Connecting...' : 'Sign In'}
            </button>
          ) : (
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary-container)',
                display: 'none',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              className="user-greeting-name"
            >
              {user?.name || user?.email?.split('@')[0]}
            </span>
          )}

          <button
            type="button"
            className={`avatar-badge ${isAuthenticated ? 'authenticated' : ''}`}
            title={
              isAuthenticated
                ? `${user?.name || user?.email} (${user?.role})`
                : 'Sign in to access student progress or administrator portal'
            }
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-label="User Profile"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || 'User'} className="avatar-img" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {user?.role === 'admin' ? 'admin_panel_settings' : isAuthenticated ? 'account_circle' : 'person'}
              </span>
            )}
          </button>

          {/* Profile & Auth Dropdown */}
          {isProfileMenuOpen && (
            <div className="profile-dropdown" role="menu">
              {isAuthenticated ? (
                <>
                  <div className="profile-dropdown-user">
                    <span className="profile-dropdown-name">{user?.name || 'BioLumen User'}</span>
                    <span className="profile-dropdown-email">{user?.email}</span>
                    <span className={`profile-dropdown-role ${user?.role === 'admin' ? 'admin-role' : ''}`}>
                      {user?.role?.toUpperCase() || 'LEARNER'}
                    </span>
                  </div>
                  <div className="profile-dropdown-divider" />
                  {user?.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin/content"
                        className="profile-admin-link"
                        onClick={() => setIsProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          color: 'var(--color-primary-container, #00e5ff)',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          admin_panel_settings
                        </span>
                        <span>Open Admin Portal</span>
                      </Link>
                      <div className="profile-dropdown-divider" />
                    </>
                  ) : (
                    <>
                      <Link
                        to="/admin/login"
                        onClick={() => setIsProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          color: 'var(--color-primary-container, #00e5ff)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          admin_panel_settings
                        </span>
                        <span>Switch to Administrator</span>
                      </Link>
                      <div className="profile-dropdown-divider" />
                    </>
                  )}
                  <button
                    type="button"
                    className="profile-sign-out-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      logout
                    </span>
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '4px 8px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Portal Access
                    </span>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--color-surface-container-high, #242a34)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4edea3' }}>
                      login
                    </span>
                    <span>1. Sign In (Regular User)</span>
                  </Link>

                  <Link
                    to="/login"
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      fontSize: '13px',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>
                      person_add
                    </span>
                    <span>2. Register New Account</span>
                  </Link>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  <Link
                    to="/admin/login"
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(0, 229, 255, 0.12)',
                      border: '1px solid rgba(0, 229, 255, 0.35)',
                      color: 'var(--color-primary-container, #00e5ff)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      admin_panel_settings
                    </span>
                    <span>3. Administrator Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

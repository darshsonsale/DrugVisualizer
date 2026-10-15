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
    loginWithGoogle,
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
                onClick={loginWithDemoAccount}
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
              onClick={loginWithGoogle}
              disabled={loading}
              aria-label="Sign In with Google"
              title="Sign in with your Google account"
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
                ? `${user?.name || user?.email} (Click for profile & logout)`
                : 'Guest Mode — Sign In to persist progress'
            }
            onClick={() => {
              if (isAuthenticated) {
                setIsProfileMenuOpen((prev) => !prev);
              } else {
                loginWithGoogle();
              }
            }}
            aria-label="User Profile"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || 'User'} className="avatar-img" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isAuthenticated ? 'account_circle' : 'person'}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          {isAuthenticated && isProfileMenuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-user">
                <span className="profile-dropdown-name">{user?.name || 'Learner'}</span>
                <span className="profile-dropdown-email">{user?.email}</span>
                <span className="profile-dropdown-role">{user?.role || 'learner'}</span>
              </div>
              <div className="profile-dropdown-divider" />
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

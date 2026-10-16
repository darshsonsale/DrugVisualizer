import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary-container)', fontWeight: 600 }}>
          Verifying administrative permissions...
        </div>
      </div>
    );
  }

  // If not authenticated, provide direct administrative sign-in options
  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: '540px',
        margin: '80px auto',
        padding: '32px',
        borderRadius: '16px',
        background: 'var(--color-surface-container, #19202a)',
        border: '1px solid var(--color-surface-container-highest, #2e353f)',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'rgba(0, 229, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-container, #00e5ff)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
            admin_panel_settings
          </span>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
          BioLumen Admin Portal
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
          This area is restricted to authorized platform administrators for managing pathway descriptions, transit milestones, and question bank clarity.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="/admin/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'var(--color-primary-container, #00e5ff)',
              color: 'var(--color-on-primary-container, #00626e)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              security
            </span>
            <span>Go to Dedicated Administrator Sign-In</span>
          </a>

          <a
            href="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span>Return to Regular Sign In</span>
          </a>
        </div>
      </div>
    );
  }

  // If authenticated but not an admin, show explicit 403 Forbidden state with switch option
  if (user?.role !== 'admin') {
    return (
      <div style={{
        maxWidth: '540px',
        margin: '80px auto',
        padding: '32px',
        borderRadius: '16px',
        background: 'var(--color-surface-container, #19202a)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
            lock
          </span>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
          Administrative Access Denied
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>
          Current session for <strong style={{ color: '#fff' }}>{user?.email}</strong> has role <span style={{ color: '#f59e0b', fontWeight: 700 }}>{user?.role}</span>, which lacks administrative permissions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="/admin/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'var(--color-primary-container, #00e5ff)',
              color: 'var(--color-on-primary-container, #00626e)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              security
            </span>
            <span>Sign In with an Administrator Account</span>
          </a>
          <button
            type="button"
            onClick={() => logout()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

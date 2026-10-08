import React from 'react';

export const ExplorerSkeleton: React.FC = () => {
  return (
    <div className="explorer-workspace" aria-busy="true" aria-label="Loading Pathway Explorer">
      {/* Header skeleton */}
      <div
        className="explorer-header-strip"
        style={{ height: '76px', animation: 'pulse 1.8s ease-in-out infinite' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-surface-raised)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ width: '120px', height: '18px', borderRadius: '4px', background: 'var(--bg-surface-raised)' }} />
            <div style={{ width: '200px', height: '12px', borderRadius: '4px', background: 'var(--bg-surface-raised)' }} />
          </div>
        </div>
      </div>

      {/* Tri-Pane grid skeleton */}
      <div className="explorer-grid">
        {/* Left rail skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: '68px',
                borderRadius: '12px',
                background: 'rgba(21, 28, 38, 0.6)',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            />
          ))}
        </div>

        {/* Center viewport skeleton */}
        <div
          style={{
            height: '600px',
            borderRadius: '20px',
            background: '#080f18',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid rgba(0, 229, 255, 0.2)',
              borderTopColor: 'var(--brand-cyan)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Initialising Pathway Explorer Workspace...
          </span>
        </div>

        {/* Right drawer skeleton */}
        <div
          style={{
            height: '600px',
            borderRadius: '20px',
            background: 'rgba(21, 28, 38, 0.6)',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

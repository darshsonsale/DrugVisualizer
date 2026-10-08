import React from 'react';
import type { AppMetadata } from './types';

const metadata: AppMetadata = {
  name: 'Drug Path Visualiser',
  version: '0.1.0-alpha',
  environment: 'development',
  theme: 'biolumen-pharmacology',
};

export const App: React.FC = () => {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-xl)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: 'var(--space-xl)',
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            padding: '4px 12px',
            marginBottom: 'var(--space-md)',
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-secondary)',
              boxShadow: '0 0 8px var(--color-secondary)',
            }}
          />
          Task 02 Bootstrap Complete
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: 'var(--space-sm)',
            color: 'var(--color-on-surface)',
            letterSpacing: '-0.02em',
          }}
        >
          {metadata.name}
        </h1>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'var(--color-on-surface-variant)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          React + TypeScript frontend application bootstrapped with the BioLumen Pharmacology
          design token architecture. Ready for Task 03 routing and application shell integration.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            fontSize: '12px',
            color: 'var(--color-on-surface-variant)',
            borderTop: '1px solid var(--color-outline-variant)',
            paddingTop: 'var(--space-md)',
          }}
        >
          <span>
            Theme: <strong style={{ color: 'var(--color-primary)' }}>BioLumen</strong>
          </span>
          <span>•</span>
          <span>
            Mode: <strong style={{ color: 'var(--color-primary)' }}>Strict TypeScript</strong>
          </span>
          <span>•</span>
          <span>
            Port: <strong style={{ color: 'var(--color-primary)' }}>5173</strong>
          </span>
        </div>
      </div>
    </main>
  );
};

export default App;

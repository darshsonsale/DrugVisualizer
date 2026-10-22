import React from 'react';
import { DrugSummary, FoodCondition } from '../../api/types';
import { SegmentedToggle } from '../ui';

export interface ExplorerHeaderProps {
  drug: DrugSummary;
  condition: FoodCondition;
  onConditionChange: (condition: FoodCondition) => void;
  loading?: boolean;
  onBackToSelector?: () => void;
  isMockData?: boolean;
}

export const ExplorerHeader: React.FC<ExplorerHeaderProps> = ({
  drug,
  condition,
  onConditionChange,
  loading = false,
  onBackToSelector,
  isMockData = false,
}) => {
  // Scientific telemetry readouts derived directly from the drug data object
  const tmaxDisplay = drug.tmax_hours != null ? `${drug.tmax_hours} hrs` : '—';
  const absorptionIndex = drug.bioavailability_pct != null ? `${drug.bioavailability_pct}%` : '—';

  const isParenteral =
    drug.id === 'drug-insulin-004' ||
    drug.id === 'insulin' ||
    drug.route?.toLowerCase().includes('subcutaneous') ||
    drug.route?.toLowerCase().includes('injection');

  return (
    <header className="explorer-header-strip" aria-label="Pathway Explorer Header Controls">
      {/* Drug Identifier Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {onBackToSelector && (
          <button
            type="button"
            onClick={onBackToSelector}
            className="explorer-back-selector-btn"
            title="Choose a different medicine"
            aria-label="Back to medicine selection"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              background: 'var(--color-primary-light, #E6F5F4)',
              border: '1px solid rgba(22, 125, 120, 0.25)',
              color: 'var(--color-primary, #167D78)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>All Medicines</span>
          </button>
        )}

        <div className="explorer-drug-badge">
          <div className="explorer-drug-icon" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary, #167D78)' }}>
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                {drug.name}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'var(--color-primary-light, #E6F5F4)',
                  color: 'var(--color-primary, #167D78)',
                  border: '1px solid rgba(22, 125, 120, 0.25)',
                }}
              >
                {drug.dosage || '400 mg'}
              </span>
              {isMockData && (
                <span
                  title="Displaying offline mock data fixture"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b' }} />
                  MOCK DATA
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-secondary, #4A7C59)',
                }}
                aria-hidden="true"
              />
              {drug.route || 'Oral Administration'} • {drug.category}
            </span>
          </div>
        </div>
      </div>

      {/* Centered Regimen State Selector with Parenteral Route Notice */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
        <SegmentedToggle<FoodCondition>
          value={condition}
          onChange={onConditionChange}
          options={[
            { value: 'BEFORE_FOOD', label: 'Before Food', icon: 'timer' },
            { value: 'AFTER_FOOD', label: 'After Food', icon: 'restaurant' },
          ]}
          aria-label="Physiological food regimen selector"
        />
        {isParenteral && (
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--color-primary, #167D78)',
              background: 'var(--color-primary-light, #E6F5F4)',
              border: '1px solid rgba(22, 125, 120, 0.25)',
              borderRadius: '9999px',
              padding: '0.15rem 0.6rem',
              letterSpacing: '0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title="Subcutaneous insulin absorption kinetics are unaffected by meal presence in the gastrointestinal tract."
          >
            <span className="material-symbols-outlined text-[13px]">info</span>
            Parenteral: Subcutaneous absorption rate is independent of GI meals
          </span>
        )}
      </div>

      {/* Telemetry Status Pills */}
      <div className="explorer-telemetry-group">
        <div className="explorer-telemetry-item">
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--brand-emerald)',
              boxShadow: '0 0 8px rgba(78, 222, 163, 0.9)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
            aria-hidden="true"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Absorption Index
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {absorptionIndex}
            </span>
          </div>
        </div>

        <div className="explorer-telemetry-divider" aria-hidden="true" />

        <div className="explorer-telemetry-item">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-primary-light, #E6F5F4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #167D78)',
            }}
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[18px]">timelapse</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', cursor: 'help' }}
              title={
                isParenteral
                  ? 'Catalog records preprandial action onset (~30 min). Peak concentration (Tmax) occurs at 1.5–3.5 hours.'
                  : 'Estimated time to peak plasma concentration (Tmax)'
              }
            >
              Estimated T<sub>max</sub>
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {loading ? '...' : tmaxDisplay}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { DrugSummary, FoodCondition } from '../../api/types';
import { SegmentedToggle } from '../ui';

export interface ExplorerHeaderProps {
  drug: DrugSummary;
  condition: FoodCondition;
  onConditionChange: (condition: FoodCondition) => void;
  loading?: boolean;
}

export const ExplorerHeader: React.FC<ExplorerHeaderProps> = ({
  drug,
  condition,
  onConditionChange,
  loading = false,
}) => {
  const isBeforeFood = condition === 'BEFORE_FOOD';

  // Dynamic clinical readouts matching condition state
  const tmaxDisplay = isBeforeFood
    ? `${drug.tmax_hours ?? 1.2} hrs`
    : '2.5 hrs';

  const absorptionIndex = `${drug.bioavailability_pct ?? 85.0}%`;

  return (
    <header className="explorer-header-strip" aria-label="Pathway Explorer Header Controls">
      {/* Drug Identifier Pill */}
      <div className="explorer-drug-badge">
        <div className="explorer-drug-icon" aria-hidden="true">
          <span className="material-symbols-outlined text-[26px]">hevc</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {drug.name}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'var(--bg-surface-raised)',
                color: 'var(--brand-cyan)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
              }}
            >
              400 mg
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--brand-emerald)',
                boxShadow: '0 0 6px rgba(78, 222, 163, 0.8)',
              }}
              aria-hidden="true"
            />
            Oral Administration • Biopharmaceutics Class II
          </span>
        </div>
      </div>

      {/* Centered Regimen State Selector */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SegmentedToggle<FoodCondition>
          value={condition}
          onChange={onConditionChange}
          options={[
            { value: 'BEFORE_FOOD', label: 'Before Food', icon: 'timer' },
            { value: 'AFTER_FOOD', label: 'After Food', icon: 'restaurant' },
          ]}
          aria-label="Physiological food regimen selector"
        />
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
              background: 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-cyan)',
            }}
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[18px]">timelapse</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
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

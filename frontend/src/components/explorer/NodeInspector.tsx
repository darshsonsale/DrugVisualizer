import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PathwayNodeWithDetails } from '../../api/types';
import { Button } from '../ui';

export type InspectorTab = 'overview' | 'role' | 'clinical';

export interface NodeInspectorProps {
  selectedNode: PathwayNodeWithDetails;
  nodes: PathwayNodeWithDetails[];
  onSelectNode: (nodeId: string) => void;
  activeTab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
}

// Stage specific clinical facts and metrics aligned with Google Stitch
const STAGE_METRICS: Record<
  string,
  {
    phLabel: string;
    phValue: string;
    timeLabel: string;
    timeValue: string;
    funFact: string;
    imgUrl: string;
  }
> = {
  'node-oral-cavity': {
    phLabel: 'Salivary pH',
    phValue: '6.8 – 7.2',
    timeLabel: 'Transit Time',
    timeValue: '5 – 10 sec',
    funFact:
      'Saliva produces ~1.5 liters daily containing salivary amylase and mucins that safeguard the oral mucosa from solid tablet friction.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-stomach': {
    phLabel: 'Gastric pH',
    phValue: '1.5 – 2.0',
    timeLabel: 'Transit Time',
    timeValue: '15 – 60 min',
    funFact:
      'Taking ibuprofen after a meal delays gastric transit from 15 minutes to over an hour, flattening the plasma peak curve.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-small-intestine': {
    phLabel: 'Intestinal pH',
    phValue: '6.0 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '1 – 2 hrs',
    funFact:
      'The intestinal villi expand the total absorbent surface area to approximately that of a standard badminton court!',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-liver': {
    phLabel: 'Hepatic pH',
    phValue: '7.2 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '20 – 40 min',
    funFact:
      'Genetic polymorphism in CYP2C9 can significantly extend ibuprofen half-life in up to 5% of diverse patient demographics.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-bloodstream': {
    phLabel: 'Plasma pH',
    phValue: '7.35 – 7.45',
    timeLabel: 'Transit Time',
    timeValue: '45 – 90 min',
    funFact:
      'Only the ~1% unbound fraction of ibuprofen is pharmacologically active and able to cross endothelial barriers into tissues.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-target-sites': {
    phLabel: 'Synovial pH',
    phValue: '7.3 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '1 – 2 hrs',
    funFact:
      'COX-1 inhibition also reduces protective stomach prostaglandins, which is why chronic dosing requires food buffering.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
  'node-kidneys': {
    phLabel: 'Urinary pH',
    phValue: '5.5 – 6.5',
    timeLabel: 'Clearance Time',
    timeValue: '2 – 4 hrs',
    funFact:
      'Less than 1% of parent ibuprofen is eliminated unchanged, underscoring the vital efficiency of prior hepatic conversion.',
    imgUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgGhLVFPQl2OOaTRVSHEGHBfNKsJnfZbPrfAGVIx9GGGWzNpD8D5o9tDQI2XEwKVMmb-oeZeaIWi3W0jjji4TnkQb51MmSCXOqiCHYqrhygWgDRxbE3cjuTCgO2eoCzX6rlumsBMb3sG7gIzC-m39R_87PEOxbR61fKv9ShpXHcQ2bIDOALSj9oGD-JAeo9xL2h7Kc9qpa_4V4XxNJXiw5yxJTvUSxjgNQ9wYVf-Od',
  },
};

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  nodes,
  onSelectNode,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();

  const currentIndex = nodes.findIndex((n) => n.id === selectedNode.id);
  const stageNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalStages = nodes.length;

  const prevNode = currentIndex > 0 ? nodes[currentIndex - 1] : null;
  const nextNode = currentIndex < totalStages - 1 ? nodes[currentIndex + 1] : null;

  const metrics = STAGE_METRICS[selectedNode.id] || STAGE_METRICS['node-oral-cavity'];

  // Body content based on active tab
  let bodyContent = '';
  if (activeTab === 'overview') {
    bodyContent =
      selectedNode.content?.general_description ||
      'The solid ibuprofen tablet enters the physiological transit pathway.';
  } else if (activeTab === 'role') {
    bodyContent =
      selectedNode.content?.physiological_role ||
      'Acts as a physiological transit and molecular absorption station.';
  } else if (activeTab === 'clinical') {
    bodyContent = metrics.funFact;
  }

  const formatMinutes = (mins: number) => {
    if (mins <= 60) return `${mins} min`;
    const hours = (mins / 60).toFixed(1);
    return `~${hours} hrs`;
  };

  const displayedTimeValue = selectedNode.estimated_time_minutes != null
    ? formatMinutes(selectedNode.estimated_time_minutes)
    : metrics.timeValue;

  const displayedPhValue = selectedNode.content?.micro_environment_ph != null
    ? `pH ${selectedNode.content.micro_environment_ph.toFixed(1)}`
    : metrics.phValue;

  return (
    <aside className="inspector-card" aria-label="Waypoint Detailed Inspector">
      {/* Header & Prev/Next Stage Buttons */}
      <div className="inspector-stage-nav">
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--brand-cyan)',
          }}
        >
          Stage {stageNumber} of {totalStages}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            disabled={!prevNode}
            onClick={() => prevNode && onSelectNode(prevNode.id)}
            className="inspector-nav-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-surface-raised)',
              color: prevNode ? 'var(--text-main)' : 'rgba(186, 201, 204, 0.3)',
              border: 'none',
              cursor: prevNode ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            aria-label="Previous pathway stage"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <button
            type="button"
            disabled={!nextNode}
            onClick={() => nextNode && onSelectNode(nextNode.id)}
            className="inspector-nav-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-surface-raised)',
              color: nextNode ? 'var(--text-main)' : 'rgba(186, 201, 204, 0.3)',
              border: 'none',
              cursor: nextNode ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            aria-label="Next pathway stage"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* High-Magnification Organ Focus View */}
      <div className="inspector-organ-view" aria-hidden="true">
        <img
          alt={`${selectedNode.name} Close-up View`}
          className="inspector-organ-img"
          src={metrics.imgUrl}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(21, 28, 38, 0.95) 0%, transparent 60%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(8, 15, 24, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.675rem',
            color: 'var(--brand-cyan)',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--brand-cyan)',
              boxShadow: '0 0 8px var(--brand-cyan)',
            }}
          />
          High-Magnification View
        </div>
      </div>

      {/* Stage Title & Anatomical Coordinates */}
      <div>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: '0 0 0.25rem',
            lineHeight: 1.25,
          }}
        >
          {selectedNode.name}
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {selectedNode.anatomical_location}
        </span>
      </div>

      {/* Context Switcher Tabs */}
      <div
        role="tablist"
        aria-label="Inspector perspectives"
        style={{
          display: 'flex',
          background: '#080f18',
          padding: '0.25rem',
          borderRadius: 'var(--radius-lg, 10px)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {(['overview', 'role', 'clinical'] as InspectorTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'overview' ? 'Overview' : tab === 'role' ? 'Role' : 'Fun Fact';

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab)}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                minHeight: '36px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'center',
                borderRadius: '6px',
                background: isActive ? 'var(--bg-surface-raised)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Text Body */}
      <div style={{ minHeight: '85px' }}>
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          {bodyContent}
        </p>
      </div>

      {/* Condition Variation Clinical Callout (Data-Driven from selectedNode.variation) */}
      {selectedNode.variation && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md, 8px)',
            background:
              selectedNode.variation.condition === 'AFTER_FOOD'
                ? 'rgba(78, 222, 163, 0.08)'
                : 'rgba(0, 229, 255, 0.08)',
            border: `1px solid ${
              selectedNode.variation.condition === 'AFTER_FOOD'
                ? 'rgba(78, 222, 163, 0.28)'
                : 'rgba(0, 229, 255, 0.28)'
            }`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              color:
                selectedNode.variation.condition === 'AFTER_FOOD'
                  ? 'var(--brand-emerald)'
                  : 'var(--brand-cyan)',
            }}
          >
            <span className="material-symbols-outlined text-[15px]">
              {selectedNode.variation.condition === 'AFTER_FOOD' ? 'restaurant' : 'timer'}
            </span>
            {selectedNode.variation.condition === 'AFTER_FOOD' ? 'Fed State Dynamics' : 'Fasting Dynamics'}
            {selectedNode.variation.transit_time_modifier_pct !== undefined &&
              selectedNode.variation.transit_time_modifier_pct !== 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--text-main)',
                  }}
                >
                  Transit {selectedNode.variation.transit_time_modifier_pct > 0 ? `+${selectedNode.variation.transit_time_modifier_pct}%` : `${selectedNode.variation.transit_time_modifier_pct}%`}
                </span>
              )}
          </div>
          <span style={{ fontSize: '0.775rem', lineHeight: 1.45, color: 'var(--text-main)' }}>
            {selectedNode.variation.clinical_observation}
          </span>
        </div>
      )}

      {/* Physiological Telemetry Metric Grid */}
      <div className="inspector-metric-grid">
        <div className="inspector-metric-cell">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--brand-cyan)' }}>
              science
            </span>
            {metrics.phLabel}
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {displayedPhValue}
          </span>
        </div>

        <div className="inspector-metric-cell">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--brand-emerald)' }}>
              timer
            </span>
            {metrics.timeLabel}
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {displayedTimeValue}
          </span>
        </div>
      </div>

      {/* Next Milestone Action Button */}
      {nextNode ? (
        <Button
          variant="primary"
          fullWidth
          icon="arrow_forward"
          onClick={() => onSelectNode(nextNode.id)}
        >
          Next: {nextNode.name}
        </Button>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          icon="replay"
          onClick={() => onSelectNode(nodes[0].id)}
        >
          Restart Transit Tour
        </Button>
      )}

      {/* Quick Assessment Prompt Capsule */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'rgba(21, 28, 38, 0.6)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {selectedNode.name} Stage Check
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              1 Question • Quick verify
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/quiz')}
          style={{
            padding: '0.4rem 0.95rem',
            minHeight: '36px',
            borderRadius: '9999px',
            background: 'var(--bg-surface-raised)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          aria-label={`Verify stage check for ${selectedNode.name}`}
        >
          Verify
        </button>
      </div>
    </aside>
  );
};

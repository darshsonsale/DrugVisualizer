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

// Organ icons mapping for anatomical illustration card
const ORGAN_ICONS: Record<string, string> = {
  'node-oral-cavity': 'medication',
  'node-stomach': 'vital_signs',
  'node-small-intestine': 'grain',
  'node-liver': 'science',
  'node-systemic-circulation': 'cardiology',
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

  // Organ icon
  const iconName = ORGAN_ICONS[selectedNode.id] || 'biotech';

  // Body content based on active tab
  let bodyContent = '';
  if (activeTab === 'overview') {
    bodyContent =
      selectedNode.content?.general_description ||
      'No general physiological description available for this waypoint.';
  } else if (activeTab === 'role') {
    bodyContent =
      selectedNode.content?.physiological_role ||
      'No physiological role notes recorded for this anatomical waypoint.';
  } else if (activeTab === 'clinical') {
    bodyContent =
      selectedNode.variation?.clinical_observation ||
      'Standard pharmacokinetic transit profile under current physiological regimen.';
  }

  // Microenvironment pH display
  const phDisplay =
    selectedNode.content?.micro_environment_ph !== undefined
      ? selectedNode.content.micro_environment_ph.toFixed(1)
      : '7.0';

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
            style={{
              width: '28px',
              height: '28px',
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
            style={{
              width: '28px',
              height: '28px',
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
        <span className="material-symbols-outlined inspector-organ-icon">
          {iconName}
        </span>

        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(8, 15, 24, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '0.2rem 0.5rem',
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
              boxShadow: '0 0 6px var(--brand-cyan)',
            }}
          />
          Anatomical Focus View
        </div>
      </div>

      {/* Stage Title & Anatomical Coordinates */}
      <div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: '0 0 0.25rem',
            lineHeight: 1.3,
          }}
        >
          {selectedNode.name}
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {selectedNode.anatomical_location} • {selectedNode.organ_system}
        </span>
      </div>

      {/* Context Switcher Tabs */}
      <div
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
          const label = tab === 'overview' ? 'Overview' : tab === 'role' ? 'Role' : 'Clinical Note';

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              style={{
                flex: 1,
                padding: '0.4rem 0.25rem',
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
      <div style={{ minHeight: '90px' }}>
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

      {/* Physiological Telemetry Metric Grid */}
      <div className="inspector-metric-grid">
        <div className="inspector-metric-cell">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--brand-cyan)' }}>
              science
            </span>
            Microenvironment pH
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {phDisplay}
          </span>
        </div>

        <div className="inspector-metric-cell">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--brand-emerald)' }}>
              timer
            </span>
            Transit Time
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {selectedNode.estimated_time_minutes} min
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
              Pathway Assessment
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Quick knowledge check
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/quiz')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'var(--bg-surface-raised)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          Take Quiz
        </button>
      </div>
    </aside>
  );
};

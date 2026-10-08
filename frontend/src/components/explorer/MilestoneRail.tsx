import React from 'react';
import { PathwayNodeWithDetails } from '../../api/types';

export interface MilestoneRailProps {
  nodes: PathwayNodeWithDetails[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

const STAGE_SUBTITLES: Record<string, string> = {
  'node-oral-cavity': 'Ingestion & Wetting',
  'node-stomach': 'Disintegration (pH 1.5-2)',
  'node-small-intestine': 'Primary Absorption (pH 6-7)',
  'node-liver': 'Hepatic First Pass (CYP2C9)',
  'node-bloodstream': 'Systemic Distribution & Plasma',
  'node-target-sites': 'COX-1 & COX-2 Inhibition',
  'node-kidneys': 'Renal Clearance & Urine',
};

export const MilestoneRail: React.FC<MilestoneRailProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const activeIndex = nodes.findIndex((n) => n.id === selectedNodeId);
  const activeDisplayNumber = activeIndex >= 0 ? activeIndex + 1 : 1;

  return (
    <aside className="milestone-rail" aria-label="Pathway Milestone Navigation">
      <div className="milestone-rail__header">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Pathway Milestones
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
          {activeDisplayNumber} of {nodes.length} Active
        </span>
      </div>

      <nav
        className="milestone-rail__nav"
        role="tablist"
        aria-label="Milestone stages"
      >
        {nodes.map((node, index) => {
          const isActive = node.id === selectedNodeId;
          const stageNumber = node.node_order || index + 1;
          const subtitle = STAGE_SUBTITLES[node.id] || `${node.estimated_time_minutes} min transit`;

          return (
            <button
              key={node.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`milestone-btn ${isActive ? 'milestone-btn--active' : ''}`}
              onClick={() => onSelectNode(node.id)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Select stage ${stageNumber}: ${node.name}`}
            >
              {isActive && <div className="milestone-btn__accent" aria-hidden="true" />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="milestone-btn__badge" aria-hidden="true">
                  {stageNumber}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                      lineHeight: 1.25,
                    }}
                  >
                    {node.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: isActive ? 'var(--brand-cyan)' : 'rgba(186, 201, 204, 0.65)',
                      marginTop: '0.15rem',
                    }}
                  >
                    {subtitle}
                  </span>
                </div>
              </div>

              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '18px',
                  color: isActive ? 'var(--brand-cyan)' : 'rgba(186, 201, 204, 0.4)',
                  transition: 'color 0.2s ease',
                }}
                aria-hidden="true"
              >
                {isActive ? 'arrow_forward' : 'chevron_right'}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

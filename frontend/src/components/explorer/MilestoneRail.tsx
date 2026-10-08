import React from 'react';
import { PathwayNodeWithDetails } from '../../api/types';

export interface MilestoneRailProps {
  nodes: PathwayNodeWithDetails[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

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
        <span>Pathway Milestones</span>
        <span style={{ color: 'var(--brand-cyan)' }}>
          {activeDisplayNumber} of {nodes.length} Active
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {nodes.map((node, index) => {
          const isActive = node.id === selectedNodeId;
          const stageNumber = node.node_order || index + 1;

          // Short descriptive subtitle for rail
          const subtitle =
            node.content?.micro_environment_ph !== undefined
              ? `pH ${node.content.micro_environment_ph.toFixed(1)} • ${node.estimated_time_minutes}m transit`
              : `${node.estimated_time_minutes} min transit`;

          return (
            <button
              key={node.id}
              type="button"
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
                      fontSize: '0.925rem',
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
                      color: isActive ? 'var(--brand-cyan)' : 'rgba(186, 201, 204, 0.6)',
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

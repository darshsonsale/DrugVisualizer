import React from 'react';
import { FoodCondition, PathwayNodeWithDetails } from '../../api/types';

export interface TimelineBarProps {
  nodes: PathwayNodeWithDetails[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  condition: FoodCondition;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const currentIndex = nodes.findIndex((n) => n.id === selectedNodeId);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  // Calculate cumulative elapsed minutes and total minutes
  let elapsedMinutes = 0;
  let totalMinutes = 0;

  nodes.forEach((n, idx) => {
    totalMinutes += n.estimated_time_minutes;
    if (idx <= activeIdx) {
      elapsedMinutes += n.estimated_time_minutes;
    }
  });

  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);

  // Format minutes into human-readable duration
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = (mins / 60).toFixed(1);
    return `~${hours} hrs`;
  };

  // Percentage for progress fill (clamp 10% to 100%)
  const progressPercent = nodes.length > 1
    ? Math.round(((activeIdx + 1) / nodes.length) * 100)
    : 100;

  const getShortLabel = (name: string) => {
    if (name.toLowerCase().includes('mouth') || name.toLowerCase().includes('oral')) return 'Mouth';
    if (name.toLowerCase().includes('stomach')) return 'Stomach';
    if (name.toLowerCase().includes('intestine')) return 'Intestine';
    if (name.toLowerCase().includes('liver')) return 'Liver';
    if (name.toLowerCase().includes('bloodstream')) return 'Blood';
    if (name.toLowerCase().includes('target')) return 'Target';
    if (name.toLowerCase().includes('kidney')) return 'Kidneys';
    return name.split(' ')[0];
  };

  return (
    <footer className="timeline-strip" aria-label="Pharmacokinetic Progression Timeline">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--brand-cyan)' }} aria-hidden="true">
            linear_scale
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Total Pharmacokinetic Progression
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>
            Transit Elapsed: <strong style={{ color: 'var(--text-main)' }}>{formatDuration(elapsedMinutes)}</strong>
          </span>
          <span>•</span>
          <span>
            Remaining: <strong style={{ color: 'var(--brand-cyan)' }}>{formatDuration(remainingMinutes)}</strong>
          </span>
        </div>
      </div>

      <div className="timeline-track-container">
        {/* Glow Track Bar */}
        <div className="timeline-track-bar">
          <div
            className="timeline-track-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Node Dots Row */}
        <div className="timeline-nodes-row">
          {nodes.map((node, index) => {
            const isActive = node.id === selectedNodeId;
            const isCompleted = index <= activeIdx;
            const stepNumber = node.node_order || index + 1;

            return (
              <button
                key={node.id}
                type="button"
                className={`timeline-node-item ${isActive ? 'timeline-node-item--active' : ''}`}
                onClick={() => onSelectNode(node.id)}
                aria-label={`Jump to stage ${stepNumber}: ${node.name}`}
              >
                <div
                  className={`timeline-node-dot ${isActive ? 'timeline-node-dot--active' : ''}`}
                  style={{
                    background: isActive
                      ? 'var(--brand-cyan)'
                      : isCompleted
                      ? 'var(--bg-surface-raised)'
                      : 'rgba(21, 28, 38, 0.8)',
                    borderColor: isCompleted ? 'rgba(0, 229, 255, 0.4)' : 'var(--border-subtle)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {stepNumber}
                </div>

                <span className="timeline-node-label">
                  {getShortLabel(node.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

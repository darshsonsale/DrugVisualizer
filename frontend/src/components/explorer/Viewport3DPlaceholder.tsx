import React from 'react';
import { PathwayNodeWithDetails } from '../../api/types';

export interface Viewport3DPlaceholderProps {
  nodes: PathwayNodeWithDetails[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isAutoTransitActive?: boolean;
  onToggleAutoTransit?: () => void;
}

// Landmark anatomical hotspot relative coordinates (percentage based)
const HOTSPOT_COORDINATES: Record<string, { top: string; left: string; alignment?: 'left' | 'right' }> = {
  'node-oral-cavity': { top: '16%', left: '50%' },
  'node-stomach': { top: '35%', left: '56%' },
  'node-liver': { top: '43%', left: '30%', alignment: 'left' },
  'node-small-intestine': { top: '56%', left: '52%' },
  'node-systemic-circulation': { top: '76%', left: '50%' },
};

export const Viewport3DPlaceholder: React.FC<Viewport3DPlaceholderProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  isAutoTransitActive = false,
  onToggleAutoTransit,
}) => {
  return (
    <section className="viewport-stage" aria-label="3D Anatomical Visualizer Workspace">
      {/* Background Cybernetic Grid & Depth Vignettes */}
      <div className="viewport-stage__grid" aria-hidden="true" />
      <div className="viewport-stage__vignette" aria-hidden="true" />

      {/* Futuristic Human Anatomical Holographic Silhouette */}
      <svg
        className="viewport-stage__torso-silhouette"
        viewBox="0 0 400 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head outline */}
        <circle cx="200" cy="70" r="38" stroke="var(--brand-cyan)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        {/* Neck */}
        <path d="M188 108 L188 135 M212 108 L212 135" stroke="var(--brand-cyan)" strokeWidth="1.5" opacity="0.4" />
        {/* Shoulders & Torso */}
        <path
          d="M140 150 C160 138, 240 138, 260 150 C290 168, 280 280, 275 350 C270 410, 255 450, 245 490 L155 490 C145 450, 130 410, 125 350 C120 280, 110 168, 140 150 Z"
          stroke="var(--brand-cyan)"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Ribcage / Sternum grid */}
        <line x1="200" y1="135" x2="200" y2="340" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />
        <line x1="160" y1="210" x2="240" y2="210" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
        <line x1="155" y1="250" x2="245" y2="250" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
        <line x1="165" y1="290" x2="235" y2="290" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
      </svg>

      {/* SVG Pharmacokinetic Trajectory Stream Vector */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="trajectory-grad" x1="300" y1="120" x2="300" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="30%" stopColor="#ffb86b" />
            <stop offset="55%" stopColor="#4edea3" />
            <stop offset="85%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#6ffbbe" />
          </linearGradient>
        </defs>

        {/* Dynamic Trajectory Arc Connecting Waypoints */}
        <path
          d="M300 128 L308 190 Q315 250 336 280 Q340 330 240 345 Q260 410 312 448 Q315 520 300 608"
          stroke="url(#trajectory-grad)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          filter="url(#neon-glow)"
          opacity="0.85"
        />

        {/* Traveling Ibuprofen Bolus Glow Particle */}
        <circle cx="300" cy="128" r="4.5" fill="#c3f5ff" filter="url(#neon-glow)">
          <animate
            attributeName="cy"
            dur="5s"
            repeatCount="indefinite"
            values="128;280;345;448;608"
            keyTimes="0;0.25;0.5;0.75;1"
          />
          <animate
            attributeName="cx"
            dur="5s"
            repeatCount="indefinite"
            values="300;336;240;312;300"
            keyTimes="0;0.25;0.5;0.75;1"
          />
        </circle>
      </svg>

      {/* Top-Left Status Pill Badge */}
      <div className="viewport-stage-banner">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(8, 15, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            fontSize: '0.725rem',
            fontWeight: 600,
            color: 'var(--brand-cyan)',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.2)',
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
          3D Viewport Foundation (WebGL Canvas in Tasks 07–08)
        </div>
      </div>

      {/* Top-Right Diagnostic HUD */}
      <div className="viewport-hud" aria-hidden="true">
        <div>FOV: 58° • ORTHO: OFF</div>
        <div>SLICE: CORONAL T2</div>
        <div style={{ color: 'var(--brand-cyan)', fontWeight: 700, marginTop: '0.15rem' }}>
          3D ANATOMICAL STAGE: ACTIVE
        </div>
      </div>

      {/* Interactive Anatomical Landmark Hotspots */}
      {nodes.map((node) => {
        const coords = HOTSPOT_COORDINATES[node.id] || { top: '50%', left: '50%' };
        const isActive = node.id === selectedNodeId;

        return (
          <button
            key={node.id}
            type="button"
            className={`viewport-hotspot ${isActive ? 'viewport-hotspot--active' : ''}`}
            style={{
              top: coords.top,
              left: coords.left,
              flexDirection: coords.alignment === 'left' ? 'row-reverse' : 'row',
            }}
            onClick={() => onSelectNode(node.id)}
            aria-label={`Hotspot milestone: ${node.name} (${isActive ? 'active' : 'inactive'})`}
          >
            {/* Pulsing ring indicator */}
            <div className="viewport-hotspot__ring">
              {isActive && <span className="viewport-hotspot__pulse" />}
              <span className="viewport-hotspot__dot" />
            </div>

            {/* Floating label pill */}
            <div className="viewport-hotspot__pill">
              <span>{node.name}</span>
              {isActive && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    background: 'rgba(0, 229, 255, 0.2)',
                    color: 'var(--brand-cyan)',
                    fontWeight: 700,
                  }}
                >
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}

      {/* Floating Minimal Viewport Controls */}
      <div className="viewport-controls" aria-label="Viewport camera action controls">
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="3D Orbit Rotate (Active in Task 08)"
          aria-label="3D Orbit Rotate"
        >
          <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
        </button>

        <button
          type="button"
          style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="Zoom Viewport (Active in Task 08)"
          aria-label="Zoom Viewport"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>

        <button
          type="button"
          style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="Center on Active Landmark"
          aria-label="Center on Active Landmark"
          onClick={() => {
            // Re-trigger current node selection to emphasize focus
            onSelectNode(selectedNodeId);
          }}
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />

        {onToggleAutoTransit && (
          <button
            type="button"
            onClick={onToggleAutoTransit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: isAutoTransitActive ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
              color: isAutoTransitActive ? 'var(--brand-cyan)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            title={isAutoTransitActive ? 'Pause Auto-Transit Tour' : 'Start Auto-Transit Milestone Tour'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAutoTransitActive ? 'pause_circle' : 'play_circle'}
            </span>
            {isAutoTransitActive ? 'Transit Active' : 'Auto-Transit'}
          </button>
        )}
      </div>
    </section>
  );
};

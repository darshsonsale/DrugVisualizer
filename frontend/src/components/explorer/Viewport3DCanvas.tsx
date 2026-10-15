import React, { useState, useRef, useCallback, useMemo } from 'react';
import { PathwayNodeWithDetails, PathwayEdge, FoodCondition } from '../../api/types';

export interface Viewport3DCanvasProps {
  nodes: PathwayNodeWithDetails[];
  edges?: PathwayEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isAutoTransitActive?: boolean;
  onToggleAutoTransit?: () => void;
  condition?: FoodCondition;
  transitSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  onNextNode?: () => void;
  onPrevNode?: () => void;
  onResetTransit?: () => void;
  drugName?: string;
}

// Highly accurate anatomical coordinates aligned with the 3D human torso visualization
const HOTSPOT_COORDINATES: Record<string, { top: string; left: string; ringColor: string; dotColor: string; defaultLabel: string }> = {
  // Ibuprofen
  'node-oral-cavity': { top: '14%', left: '49%', ringColor: 'var(--brand-cyan, #00e5ff)', dotColor: '#00e5ff', defaultLabel: 'Mouth' },
  'node-stomach': { top: '48%', left: '58%', ringColor: '#ffb86b', dotColor: '#ffb86b', defaultLabel: 'Stomach' },
  'node-small-intestine': { top: '67%', left: '50%', ringColor: '#4edea3', dotColor: '#4edea3', defaultLabel: 'Small Intestine' },
  'node-liver': { top: '47%', left: '38%', ringColor: '#ff9e92', dotColor: '#ff9e92', defaultLabel: 'Liver' },
  'node-bloodstream': { top: '38%', left: '50%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Bloodstream' },
  'node-target-sites': { top: '78%', left: '57%', ringColor: '#ffc589', dotColor: '#ffc589', defaultLabel: 'Target Tissue' },
  'node-kidneys': { top: '59%', left: '38%', ringColor: '#6ffbbe', dotColor: '#6ffbbe', defaultLabel: 'Kidneys' },

  // Amoxicillin
  'node-amox-mouth': { top: '14%', left: '49%', ringColor: 'var(--brand-cyan, #00e5ff)', dotColor: '#00e5ff', defaultLabel: 'Mouth' },
  'node-amox-esophagus': { top: '25%', left: '49%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Esophagus' },
  'node-amox-stomach': { top: '48%', left: '58%', ringColor: '#ffb86b', dotColor: '#ffb86b', defaultLabel: 'Stomach' },
  'node-amox-small-intestine': { top: '67%', left: '50%', ringColor: '#4edea3', dotColor: '#4edea3', defaultLabel: 'Small Intestine' },
  'node-amox-bloodstream': { top: '38%', left: '50%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Bloodstream' },
  'node-amox-infected-tissues': { top: '78%', left: '57%', ringColor: '#ff9e92', dotColor: '#ff9e92', defaultLabel: 'Infected Tissues' },
  'node-amox-kidneys': { top: '59%', left: '38%', ringColor: '#6ffbbe', dotColor: '#6ffbbe', defaultLabel: 'Kidneys' },

  // Ambroxol
  'node-amb-mouth': { top: '14%', left: '49%', ringColor: 'var(--brand-cyan, #00e5ff)', dotColor: '#00e5ff', defaultLabel: 'Mouth' },
  'node-amb-esophagus': { top: '25%', left: '49%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Esophagus' },
  'node-amb-stomach': { top: '48%', left: '58%', ringColor: '#ffb86b', dotColor: '#ffb86b', defaultLabel: 'Stomach' },
  'node-amb-small-intestine': { top: '67%', left: '50%', ringColor: '#4edea3', dotColor: '#4edea3', defaultLabel: 'Small Intestine' },
  'node-amb-bloodstream': { top: '38%', left: '50%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Bloodstream' },
  'node-amb-respiratory-tissues': { top: '35%', left: '38%', ringColor: '#ffc589', dotColor: '#ffc589', defaultLabel: 'Respiratory Tissues' },
  'node-amb-liver': { top: '47%', left: '38%', ringColor: '#ff9e92', dotColor: '#ff9e92', defaultLabel: 'Liver' },
  'node-amb-kidneys': { top: '59%', left: '38%', ringColor: '#6ffbbe', dotColor: '#6ffbbe', defaultLabel: 'Kidneys' },

  // Insulin
  'node-ins-injection-site': { top: '63%', left: '35%', ringColor: '#00e5ff', dotColor: '#00e5ff', defaultLabel: 'Injection Site' },
  'node-ins-bloodstream': { top: '38%', left: '50%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Bloodstream' },
  'node-ins-body-tissues': { top: '78%', left: '57%', ringColor: '#6ffbbe', dotColor: '#6ffbbe', defaultLabel: 'Body Tissues' },
  'node-ins-liver': { top: '48%', left: '41%', ringColor: '#ff9e92', dotColor: '#ff9e92', defaultLabel: 'Liver' },
  'node-ins-kidneys': { top: '59%', left: '39%', ringColor: '#4edea3', dotColor: '#4edea3', defaultLabel: 'Kidneys' },
};

const resolveNodeConfig = (node: PathwayNodeWithDetails, index: number, total: number) => {
  if (HOTSPOT_COORDINATES[node.id]) return HOTSPOT_COORDINATES[node.id];
  const name = node.name.toLowerCase();
  const id = node.id.toLowerCase();

  if (id.includes('mouth') || name.includes('mouth') || name.includes('oral')) return HOTSPOT_COORDINATES['node-oral-cavity'];
  if (id.includes('esophag') || name.includes('esophag')) return HOTSPOT_COORDINATES['node-amox-esophagus'];
  if (id.includes('stomach') || name.includes('stomach') || name.includes('gastric')) return HOTSPOT_COORDINATES['node-stomach'];
  if (id.includes('intestine') || name.includes('intestine')) return HOTSPOT_COORDINATES['node-small-intestine'];
  if (id.includes('liver') || name.includes('hepatic')) return HOTSPOT_COORDINATES['node-liver'];
  if (id.includes('blood') || name.includes('plasma')) return HOTSPOT_COORDINATES['node-bloodstream'];
  if (id.includes('respiratory') || name.includes('lung')) return HOTSPOT_COORDINATES['node-amb-respiratory-tissues'];
  if (id.includes('inject') || name.includes('inject')) return HOTSPOT_COORDINATES['node-ins-injection-site'];
  if (id.includes('kidney') || name.includes('renal')) return HOTSPOT_COORDINATES['node-kidneys'];
  if (id.includes('target') || name.includes('tissue') || id.includes('infect') || name.includes('infect')) {
    return HOTSPOT_COORDINATES['node-target-sites'];
  }

  return {
    top: `${14 + (index / Math.max(1, total - 1)) * 64}%`,
    left: '49%',
    ringColor: 'var(--brand-cyan, #00e5ff)',
    dotColor: '#00e5ff',
    defaultLabel: node.name.split(' ')[0],
  };
};

export const Viewport3DCanvas: React.FC<Viewport3DCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  isAutoTransitActive = false,
  onToggleAutoTransit,
  condition = 'BEFORE_FOOD',
  transitSpeed = 1,
  onSpeedChange,
  onNextNode,
  onPrevNode,
  onResetTransit,
  drugName,
}) => {
  // Interactive 3D Parallax Tilt state
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number; scale: number }>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move creates smooth holographic 3D tilt
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isRotating) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setTilt({
        rotateX: -y * 14,
        rotateY: x * 18,
        scale: 1.02,
      });
    },
    [isRotating]
  );

  const handleMouseLeave = useCallback(() => {
    if (isRotating) return;
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, [isRotating]);

  const handleToggleRotate = useCallback(() => {
    setIsRotating((prev) => !prev);
    if (!isRotating) {
      setTilt({ rotateX: 0, rotateY: 0, scale: 1.03 });
    }
  }, [isRotating]);

  const handleZoom = useCallback(() => {
    setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setIsRotating(false);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  // Active node determination
  const activeIndex = useMemo(() => {
    const idx = nodes.findIndex((n) => n.id === selectedNodeId);
    return idx >= 0 ? idx : 0;
  }, [nodes, selectedNodeId]);

  const activeNode = nodes[activeIndex] || nodes[0];
  const activeConfig = resolveNodeConfig(activeNode, activeIndex, nodes.length);

  // Dynamic SVG trajectory path connecting the exact anatomical coordinates of each organ node
  const trajectoryPath = useMemo(() => {
    if (!nodes.length) return '';
    const points = nodes.map((node, i) => {
      const cfg = resolveNodeConfig(node, i, nodes.length);
      const topVal = parseFloat(cfg.top);
      const leftVal = parseFloat(cfg.left);
      return {
        x: Math.round(600 * (leftVal / 100)),
        y: Math.round(800 * (topVal / 100)),
      };
    });

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [nodes]);

  const getDisplayName = (node: PathwayNodeWithDetails) => {
    const name = node.name.toLowerCase();
    if (name.includes('mouth') || name.includes('oral')) return 'Mouth';
    if (name.includes('esophag')) return 'Esophagus';
    if (name.includes('stomach')) return 'Stomach';
    if (name.includes('small intestine') || name.includes('intestine')) return 'Small Intestine';
    if (name.includes('liver')) return 'Liver';
    if (name.includes('bloodstream')) return 'Bloodstream';
    if (name.includes('kidney')) return 'Kidneys';
    if (name.includes('respiratory') || name.includes('lung')) return 'Respiratory';
    if (name.includes('inject')) return 'Injection Site';
    if (name.includes('target') || name.includes('tissue') || name.includes('infect')) return 'Target Tissue';
    return node.name.split(' ')[0];
  };

  const pillLabel = drugName?.toUpperCase().includes('AMOX')
    ? 'AMOX'
    : drugName?.toUpperCase().includes('AMBR')
    ? 'SYRUP'
    : drugName?.toUpperCase().includes('INSU')
    ? 'INS'
    : 'IBU';

  return (
    <section
      ref={containerRef}
      className="viewport-stage"
      aria-label="Interactive 3D Anatomical Pathway Visualizer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Holographic Parallax Transform Container */}
      <div
        className="viewport-canvas-interactive-wrapper"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale * zoomLevel})`,
          animation: isRotating ? 'subtle-orbit 12s ease-in-out infinite alternate' : undefined,
          transition: isRotating ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Realistic 3D Human Anatomical Torso Background */}
        <img
          alt="High-fidelity 3D human anatomical visualization with glowing pharmacokinetic pathway"
          className="viewport-bg-image"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD68Vpy0gMcK00yUULYpcbE8qKK62JhGJlpSgCTQfg4ch6yXUNa_tlJoNH51lWKIt9pwP_zB-M-esuDmXtvAqLiNjGZBzDoD7wKnx_PSRUCUUcjUDF9EWLT9tCZEvXls9U-DI4Us5qKPOVb7fH-xdF_TS6eaY_llvI4mFX-zQv_Z5E1Hhhrj26A0XT2hDiIdtt7Nj5Z3R1nlV6JqOrPlP4Rp1qWsZafnUZJv2xqfy3z"
        />

        {/* Cybernetic Grid & Depth Vignettes */}
        <div className="viewport-stage__grid" aria-hidden="true" />
        <div className="viewport-stage__vignette" aria-hidden="true" />

        {/* Interactive Pharmacokinetic Flow Overlay SVG */}
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
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="neonTransitGrad" x1="285" y1="105" x2="320" y2="650" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="25%" stopColor="#00daf3" />
              <stop offset="50%" stopColor="#ffb86b" />
              <stop offset="75%" stopColor="#4edea3" />
              <stop offset="100%" stopColor="#6ffbbe" />
            </linearGradient>
          </defs>

          {/* Precision Pharmacokinetic Trajectory Line connecting Organ Hotspots */}
          {trajectoryPath && (
            <path
              d={trajectoryPath}
              fill="none"
              filter="url(#neon-glow)"
              opacity="0.88"
              stroke="url(#neonTransitGrad)"
              strokeDasharray="6 4"
              strokeWidth="2.8"
            />
          )}
        </svg>

        {/* Dynamically Moving 3D Tablet Bolus that continuously glides along organs */}
        {activeConfig && (
          <div
            className="viewport-active-bolus"
            style={{
              top: activeConfig.top,
              left: activeConfig.left,
            }}
            aria-hidden="true"
          >
            <div className="tablet-bolus-body">
              <div className="tablet-bolus-glow-ring" />
              <div className="tablet-bolus-pill">
                <span className="tablet-bolus-label">{pillLabel}</span>
              </div>
            </div>
          </div>
        )}

        {/* Data-Driven Interactive Hotspots Overlaid directly at Anatomical Organ Landmarks */}
        {nodes.map((node, index) => {
          const isActive = node.id === selectedNodeId;
          const config = resolveNodeConfig(node, index, nodes.length);
          const label = getDisplayName(node);

          return (
            <button
              key={node.id}
              type="button"
              className={`viewport-hotspot ${isActive ? 'viewport-hotspot--active' : ''}`}
              style={{
                top: config.top,
                left: config.left,
              }}
              onClick={() => onSelectNode(node.id)}
              aria-label={`Select landmark waypoint: ${label}`}
            >
              {/* Pulsing halo */}
              <div
                className="viewport-hotspot__ring"
                style={{ borderColor: isActive ? 'var(--brand-cyan, #00e5ff)' : config.ringColor }}
              >
                {isActive && <span className="viewport-hotspot__pulse" />}
                <span
                  className="viewport-hotspot__dot"
                  style={{ background: isActive ? 'var(--brand-cyan, #00e5ff)' : config.dotColor }}
                />
              </div>

              {/* Label Pill */}
              <div className="viewport-hotspot__pill">
                <span>{label}</span>
                {isActive && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      background: 'rgba(0, 229, 255, 0.25)',
                      color: 'var(--brand-cyan, #00e5ff)',
                      fontWeight: 800,
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Top Camera & Parallax Controls */}
      <div className="viewport-controls" aria-label="3D Viewport camera controls">
        <button
          type="button"
          onClick={handleToggleRotate}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRotating ? 'var(--brand-cyan, #00e5ff)' : 'var(--text-muted)',
            background: isRotating ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={isRotating ? 'Disable 3D Orbit' : 'Enable 3D Auto-Orbit'}
          aria-label="3D Auto-Orbit"
        >
          <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
        </button>

        <button
          type="button"
          onClick={handleZoom}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: zoomLevel > 1 ? 'var(--brand-cyan, #00e5ff)' : 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={`Zoom (Current: ${zoomLevel}x)`}
          aria-label="Zoom Viewport"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Fit / Center View"
          aria-label="Fit / Center View"
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
        </button>
      </div>

      {/* Floating Center-Bottom High-End Pharmacokinetic Simulation Console */}
      <div className="viewport-simulation-bar" aria-label="Tablet Pharmacokinetic Transit Controls">
        {/* Row 1: Playback Buttons & Speed */}
        <div className="viewport-simulation-controls-row">
          {/* Reset / Restart to Beginning */}
          <button
            type="button"
            onClick={onResetTransit}
            className="viewport-sim-btn"
            title="Restart Tablet to Mouth (Stage 1)"
            aria-label="Restart simulation"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>

          {/* Previous Organ */}
          <button
            type="button"
            onClick={onPrevNode}
            className="viewport-sim-btn"
            title="Previous Organ Waypoint"
            aria-label="Previous organ waypoint"
          >
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>

          {/* Main Play / Pause Simulation Button */}
          {onToggleAutoTransit && (
            <button
              type="button"
              onClick={onToggleAutoTransit}
              className={`viewport-sim-btn-primary ${isAutoTransitActive ? 'viewport-sim-btn-active' : ''}`}
              aria-label={isAutoTransitActive ? 'Pause transit simulation' : 'Start transit simulation'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAutoTransitActive ? 'pause' : 'play_arrow'}
              </span>
              <span>{isAutoTransitActive ? 'Pause Simulation' : 'Start Simulation'}</span>
            </button>
          )}

          {/* Next Organ */}
          <button
            type="button"
            onClick={onNextNode}
            className="viewport-sim-btn"
            title="Next Organ Waypoint"
            aria-label="Next organ waypoint"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>

          {/* Playback Speed Selector */}
          {onSpeedChange && (
            <div className="viewport-sim-speed-group" title="Transit Simulation Speed">
              {[1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onSpeedChange(spd)}
                  className={`viewport-sim-speed-btn ${transitSpeed === spd ? 'viewport-sim-speed-btn--active' : ''}`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Organ Stage Scrubber and Real-time Organ Badge */}
        <div className="viewport-sim-scrubber-row">
          <span className="viewport-sim-stage-label">
            Stage {activeIndex + 1}/{nodes.length}: <span style={{ color: 'var(--brand-cyan, #00e5ff)' }}>{getDisplayName(activeNode)}</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelectNode(node.id)}
                className={`viewport-sim-dot-btn ${node.id === selectedNodeId ? 'viewport-sim-dot-btn--active' : ''}`}
                title={`Transit to ${node.name}`}
                aria-label={`Jump to ${node.name}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Anatomical Crosshair HUD Diagnostic Badges */}
      <div className="viewport-hud" aria-hidden="true">
        <div>FOV: 58° • ORTHO: OFF</div>
        <div>SLICE: CORONAL T2</div>
        <div>REGIMEN: {condition === 'AFTER_FOOD' ? 'FED (BUFFERED)' : 'FASTED (RAPID)'}</div>
        <div style={{ color: 'var(--brand-cyan, #00e5ff)', fontWeight: 700, marginTop: '0.15rem' }}>
          3D REALISTIC MODEL: ACTIVE
        </div>
      </div>

      <style>{`
        @keyframes subtle-orbit {
          0% { transform: perspective(1000px) rotateX(4deg) rotateY(-8deg) scale(1.03); }
          100% { transform: perspective(1000px) rotateX(-4deg) rotateY(8deg) scale(1.03); }
        }
      `}</style>
    </section>
  );
};

export default Viewport3DCanvas;

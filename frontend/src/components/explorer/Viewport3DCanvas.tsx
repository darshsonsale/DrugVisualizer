import React, { useState, useRef, useCallback } from 'react';
import { PathwayNodeWithDetails } from '../../api/types';

export interface Viewport3DCanvasProps {
  nodes: PathwayNodeWithDetails[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isAutoTransitActive?: boolean;
  onToggleAutoTransit?: () => void;
}

// 7 Landmark Coordinates matching the Google Stitch reference
const LANDMARK_HOTSPOTS: Array<{
  id: string;
  name: string;
  top: string;
  left?: string;
  right?: string;
  ringColor: string;
  dotColor: string;
}> = [
  { id: 'node-oral-cavity', name: 'Mouth', top: '14%', left: '48%', ringColor: 'var(--brand-cyan)', dotColor: 'var(--brand-cyan)' },
  { id: 'node-stomach', name: 'Stomach', top: '35%', left: '54%', ringColor: '#ffb86b', dotColor: '#ffb86b' },
  { id: 'node-liver', name: 'Liver', top: '43%', left: '22%', ringColor: '#ff9e92', dotColor: '#ff9e92' },
  { id: 'node-small-intestine', name: 'Small Intestine', top: '58%', left: '53%', ringColor: '#4edea3', dotColor: '#4edea3' },
  { id: 'node-bloodstream', name: 'Bloodstream', top: '50%', left: '28%', ringColor: '#00daf3', dotColor: '#00daf3' },
  { id: 'node-kidneys', name: 'Kidneys', top: '68%', left: '36%', ringColor: '#6ffbbe', dotColor: '#6ffbbe' },
  { id: 'node-target-sites', name: 'Target Tissue', top: '75%', right: '14%', ringColor: '#ffc589', dotColor: '#ffc589' },
];

export const Viewport3DCanvas: React.FC<Viewport3DCanvasProps> = ({
  selectedNodeId,
  onSelectNode,
  isAutoTransitActive = false,
  onToggleAutoTransit,
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
        rotateX: -y * 14, // tilt pitch
        rotateY: x * 18,  // tilt yaw
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
    setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.45 : 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setIsRotating(false);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

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
              <stop offset="20%" stopColor="#00daf3" />
              <stop offset="40%" stopColor="#ffb86b" />
              <stop offset="65%" stopColor="#4edea3" />
              <stop offset="85%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#6ffbbe" />
            </linearGradient>
          </defs>

          {/* Precision Pharmacokinetic Trajectory Line connecting Organ Hotspots */}
          <path
            d="M288 112 L298 198 Q302 245 320 280 Q325 385 305 470 Q292 535 315 595"
            fill="none"
            filter="url(#neon-glow)"
            opacity="0.85"
            stroke="url(#neonTransitGrad)"
            strokeDasharray="6 4"
            strokeWidth="2.5"
          />

          {/* Animated Traveling Ibuprofen Bolus Marker */}
          <circle cx="288" cy="112" r="4.5" fill="#c3f5ff" filter="url(#neon-glow)">
            <animate
              attributeName="cy"
              dur="6s"
              keyTimes="0;0.18;0.45;0.78;1"
              repeatCount="indefinite"
              values="112;198;280;470;595"
            />
            <animate
              attributeName="cx"
              dur="6s"
              keyTimes="0;0.18;0.45;0.78;1"
              repeatCount="indefinite"
              values="288;298;320;305;315"
            />
          </circle>
        </svg>

        {/* Interactive Hotspot Waypoint Nodes Overlaid at Anatomical Landmarks */}
        {LANDMARK_HOTSPOTS.map((spot) => {
          const isActive = spot.id === selectedNodeId;

          return (
            <button
              key={spot.id}
              type="button"
              className={`viewport-hotspot ${isActive ? 'viewport-hotspot--active' : ''}`}
              style={{
                top: spot.top,
                left: spot.left,
                right: spot.right,
              }}
              onClick={() => onSelectNode(spot.id)}
              aria-label={`Select landmark waypoint: ${spot.name}`}
            >
              {/* Pulsing halo */}
              <div
                className="viewport-hotspot__ring"
                style={{ borderColor: isActive ? 'var(--brand-cyan)' : spot.ringColor }}
              >
                {isActive && <span className="viewport-hotspot__pulse" />}
                <span
                  className="viewport-hotspot__dot"
                  style={{ background: isActive ? 'var(--brand-cyan)' : spot.dotColor }}
                />
              </div>

              {/* Label Pill */}
              <div className="viewport-hotspot__pill">
                <span>{spot.name}</span>
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
      </div>

      {/* Floating Minimal 3D Viewport Controls */}
      <div className="viewport-controls" aria-label="3D Viewport interactive controls">
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
            color: isRotating ? 'var(--brand-cyan)' : 'var(--text-muted)',
            background: isRotating ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={isRotating ? 'Disable Auto-Orbit' : 'Enable 3D Auto-Orbit'}
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
            color: zoomLevel > 1 ? 'var(--brand-cyan)' : 'var(--text-muted)',
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

      {/* Anatomical Crosshair HUD Diagnostic Badges */}
      <div className="viewport-hud" aria-hidden="true">
        <div>FOV: 58° • ORTHO: OFF</div>
        <div>SLICE: CORONAL T2</div>
        <div style={{ color: 'var(--brand-cyan)', fontWeight: 700, marginTop: '0.15rem' }}>
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

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

// Standard anatomical organ landmarks exactly calibrated to the 3D human torso visualization (Screenshot 2 reference)
export const ORGAN_LANDMARKS = {
  mouth: { top: '14.1%', left: '50.6%', ringColor: 'var(--brand-cyan, #00e5ff)', dotColor: '#00e5ff', defaultLabel: 'Mouth', alignment: 'right' as const },
  esophagus: { top: '28.1%', left: '53.9%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Esophagus', alignment: 'right' as const },
  respiratory: { top: '41.4%', left: '45.6%', ringColor: '#ffc589', dotColor: '#ffc589', defaultLabel: 'Respiratory', alignment: 'left' as const },
  bloodstream: { top: '44.4%', left: '55.8%', ringColor: '#00daf3', dotColor: '#00daf3', defaultLabel: 'Bloodstream', alignment: 'right' as const },
  liver: { top: '60.5%', left: '50.0%', ringColor: '#ff9e92', dotColor: '#ff9e92', defaultLabel: 'Liver', alignment: 'left' as const },
  stomach: { top: '65.2%', left: '57.5%', ringColor: '#ffb86b', dotColor: '#ffb86b', defaultLabel: 'Stomach', alignment: 'top' as const },
  kidneys: { top: '63.4%', left: '63.9%', ringColor: '#6ffbbe', dotColor: '#6ffbbe', defaultLabel: 'Kidneys', alignment: 'right' as const },
  smallIntestine: { top: '79.8%', left: '49.7%', ringColor: '#4edea3', dotColor: '#4edea3', defaultLabel: 'Small Intestine', alignment: 'right' as const },
  targetSites: { top: '73.0%', left: '62.0%', ringColor: '#ffc589', dotColor: '#ffc589', defaultLabel: 'Target Tissue', alignment: 'right' as const },
  injectionSite: { top: '65.0%', left: '38.0%', ringColor: '#00e5ff', dotColor: '#00e5ff', defaultLabel: 'Injection Site', alignment: 'left' as const },
};

// Highly accurate anatomical coordinates aligned with the 3D human torso visualization
const HOTSPOT_COORDINATES: Record<string, { top: string; left: string; ringColor: string; dotColor: string; defaultLabel: string; alignment?: 'left' | 'right' | 'top' }> = {
  // Ibuprofen
  'node-oral-cavity': ORGAN_LANDMARKS.mouth,
  'node-esophagus': ORGAN_LANDMARKS.esophagus,
  'node-stomach': ORGAN_LANDMARKS.stomach,
  'node-small-intestine': ORGAN_LANDMARKS.smallIntestine,
  'node-liver': ORGAN_LANDMARKS.liver,
  'node-bloodstream': ORGAN_LANDMARKS.bloodstream,
  'node-target-sites': ORGAN_LANDMARKS.respiratory,
  'node-kidneys': ORGAN_LANDMARKS.kidneys,

  // Amoxicillin
  'node-amox-mouth': ORGAN_LANDMARKS.mouth,
  'node-amox-esophagus': ORGAN_LANDMARKS.esophagus,
  'node-amox-stomach': ORGAN_LANDMARKS.stomach,
  'node-amox-small-intestine': ORGAN_LANDMARKS.smallIntestine,
  'node-amox-liver': ORGAN_LANDMARKS.liver,
  'node-amox-bloodstream': ORGAN_LANDMARKS.bloodstream,
  'node-amox-infected-tissues': ORGAN_LANDMARKS.respiratory,
  'node-amox-respiratory-tissues': ORGAN_LANDMARKS.respiratory,
  'node-amox-kidneys': ORGAN_LANDMARKS.kidneys,

  // Ambroxol
  'node-amb-mouth': ORGAN_LANDMARKS.mouth,
  'node-amb-esophagus': ORGAN_LANDMARKS.esophagus,
  'node-amb-stomach': ORGAN_LANDMARKS.stomach,
  'node-amb-small-intestine': ORGAN_LANDMARKS.smallIntestine,
  'node-amb-bloodstream': ORGAN_LANDMARKS.bloodstream,
  'node-amb-respiratory-tissues': ORGAN_LANDMARKS.respiratory,
  'node-amb-liver': ORGAN_LANDMARKS.liver,
  'node-amb-kidneys': ORGAN_LANDMARKS.kidneys,

  // Insulin
  'node-ins-injection-site': ORGAN_LANDMARKS.injectionSite,
  'node-ins-bloodstream': ORGAN_LANDMARKS.bloodstream,
  'node-ins-body-tissues': ORGAN_LANDMARKS.targetSites,
  'node-ins-liver': ORGAN_LANDMARKS.liver,
  'node-ins-kidneys': ORGAN_LANDMARKS.kidneys,

  // Direct Standard Anatomical Landmark Keys
  'landmark-mouth': ORGAN_LANDMARKS.mouth,
  'landmark-esophagus': ORGAN_LANDMARKS.esophagus,
  'landmark-respiratory': ORGAN_LANDMARKS.respiratory,
  'landmark-bloodstream': ORGAN_LANDMARKS.bloodstream,
  'landmark-liver': ORGAN_LANDMARKS.liver,
  'landmark-stomach': ORGAN_LANDMARKS.stomach,
  'landmark-kidneys': ORGAN_LANDMARKS.kidneys,
  'landmark-smallIntestine': ORGAN_LANDMARKS.smallIntestine,
  'landmark-small-intestine': ORGAN_LANDMARKS.smallIntestine,
};

export const STANDARD_ANATOMICAL_LANDMARKS = [
  { key: 'mouth', defaultLabel: 'Mouth', landmark: ORGAN_LANDMARKS.mouth },
  { key: 'esophagus', defaultLabel: 'Esophagus', landmark: ORGAN_LANDMARKS.esophagus },
  { key: 'respiratory', defaultLabel: 'Respiratory', landmark: ORGAN_LANDMARKS.respiratory },
  { key: 'bloodstream', defaultLabel: 'Bloodstream', landmark: ORGAN_LANDMARKS.bloodstream },
  { key: 'liver', defaultLabel: 'Liver', landmark: ORGAN_LANDMARKS.liver },
  { key: 'stomach', defaultLabel: 'Stomach', landmark: ORGAN_LANDMARKS.stomach },
  { key: 'kidneys', defaultLabel: 'Kidneys', landmark: ORGAN_LANDMARKS.kidneys },
  { key: 'smallIntestine', defaultLabel: 'Small Intestine', landmark: ORGAN_LANDMARKS.smallIntestine },
];

export const matchLandmarkToNode = (key: string, nodes: PathwayNodeWithDetails[]) => {
  return nodes.find((n) => {
    const text = `${n.id} ${n.name} ${n.anatomical_location || ''} ${n.organ_system || ''}`.toLowerCase();
    switch (key) {
      case 'mouth':
        return text.includes('mouth') || text.includes('oral') || text.includes('deglutition');
      case 'esophagus':
        return text.includes('esophag');
      case 'respiratory':
        return text.includes('respir') || text.includes('lung') || text.includes('bronch') || text.includes('alveolar') || text.includes('infect') || text.includes('target');
      case 'bloodstream':
        return text.includes('blood') || text.includes('plasma') || text.includes('cardio') || text.includes('circulat') || text.includes('vascular') || text.includes('systemic');
      case 'liver':
        return text.includes('liver') || text.includes('hepatic') || text.includes('cyp2c9') || text.includes('glucuronid');
      case 'stomach':
        return text.includes('stomach') || text.includes('gastric');
      case 'kidneys':
        return text.includes('kidney') || text.includes('renal') || text.includes('tubular') || text.includes('glomerul') || text.includes('urine') || text.includes('excret');
      case 'smallIntestine':
      case 'small-intestine':
        return text.includes('small intestine') || text.includes('duoden') || text.includes('jejun') || text.includes('enteral') || text.includes('enterocyte') || text.includes('intestine');
      default:
        return false;
    }
  });
};

const resolveNodeConfig = (node: PathwayNodeWithDetails, index: number, total: number) => {
  if (HOTSPOT_COORDINATES[node.id]) return HOTSPOT_COORDINATES[node.id];
  const name = node.name.toLowerCase();
  const id = node.id.toLowerCase();
  const location = (node.anatomical_location || '').toLowerCase();
  const system = (node.organ_system || '').toLowerCase();
  const text = `${id} ${name} ${location} ${system}`;

  if (text.includes('mouth') || text.includes('oral') || text.includes('deglutition')) return ORGAN_LANDMARKS.mouth;
  if (text.includes('esophag')) return ORGAN_LANDMARKS.esophagus;
  if (text.includes('stomach') || text.includes('gastric')) return ORGAN_LANDMARKS.stomach;
  if (text.includes('small intestine') || text.includes('duoden') || text.includes('jejun') || text.includes('enteral') || text.includes('enterocyte') || text.includes('intestine')) return ORGAN_LANDMARKS.smallIntestine;
  if (text.includes('liver') || text.includes('hepatic') || text.includes('cyp2c9') || text.includes('glucuronid')) return ORGAN_LANDMARKS.liver;
  if (text.includes('respiratory') || text.includes('lung') || text.includes('bronch') || text.includes('alveolar') || text.includes('infect') || text.includes('target') || text.includes('tissue')) return ORGAN_LANDMARKS.respiratory;
  if (text.includes('blood') || text.includes('plasma') || text.includes('cardio') || text.includes('circulat') || text.includes('vascular') || text.includes('systemic')) return ORGAN_LANDMARKS.bloodstream;
  if (text.includes('kidney') || text.includes('renal') || text.includes('tubular') || text.includes('glomerul') || text.includes('urine') || text.includes('excret')) return ORGAN_LANDMARKS.kidneys;
  if (text.includes('inject') || text.includes('subcutaneous') || text.includes('depot')) return ORGAN_LANDMARKS.injectionSite;

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
  const activeConfig = useMemo(() => {
    if (selectedNodeId) {
      if (HOTSPOT_COORDINATES[selectedNodeId]) return HOTSPOT_COORDINATES[selectedNodeId];
      const matched = STANDARD_ANATOMICAL_LANDMARKS.find((item) => item.key === selectedNodeId.replace('landmark-', ''));
      if (matched) return matched.landmark;
    }
    return resolveNodeConfig(activeNode, activeIndex, nodes.length);
  }, [selectedNodeId, activeNode, activeIndex, nodes.length]);

  // Dynamic SVG trajectory path connecting the exact anatomical coordinates of each organ node
  const trajectoryPath = useMemo(() => {
    if (!nodes.length) return '';

    const hasOral = nodes.some(n => n.name.toLowerCase().includes('mouth') || n.id.includes('oral'));
    const hasStomach = nodes.some(n => n.name.toLowerCase().includes('stomach') || n.id.includes('stomach'));
    const hasEsoph = nodes.some(n => n.name.toLowerCase().includes('esophag') || n.id.includes('esophag'));

    const points: { x: number; y: number }[] = [];
    nodes.forEach((node, i) => {
      const cfg = resolveNodeConfig(node, i, nodes.length);
      points.push({
        x: Math.round(600 * (parseFloat(cfg.left) / 100)),
        y: Math.round(800 * (parseFloat(cfg.top) / 100)),
      });

      // Route smoothly through esophagus landmark if not an explicit node in pathway
      if (hasOral && hasStomach && !hasEsoph && (node.name.toLowerCase().includes('mouth') || node.id.includes('oral'))) {
        const esophCfg = HOTSPOT_COORDINATES['node-esophagus'];
        points.push({
          x: Math.round(600 * (parseFloat(esophCfg.left) / 100)),
          y: Math.round(800 * (parseFloat(esophCfg.top) / 100)),
        });
      }
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
    if (name.includes('respiratory') || name.includes('lung') || name.includes('infect') || name.includes('target') || name.includes('tissue')) return 'Respiratory';
    if (name.includes('inject')) return 'Injection Site';
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

        {/* All 8 Standard Anatomical Organ Landmarks accurately mapped to 3D Torso (Screenshot 2 Reference) */}
        {STANDARD_ANATOMICAL_LANDMARKS.map((item) => {
          const matchedNode = matchLandmarkToNode(item.key, nodes);
          const nodeId = matchedNode ? matchedNode.id : `landmark-${item.key}`;
          const isActive = selectedNodeId === nodeId || (matchedNode && matchedNode.id === selectedNodeId);
          const label = matchedNode ? getDisplayName(matchedNode) : item.defaultLabel;
          const config = item.landmark;

          return (
            <button
              key={nodeId}
              type="button"
              className={`viewport-hotspot ${isActive ? 'viewport-hotspot--active' : ''} ${config.alignment === 'left' ? 'viewport-hotspot--pill-left' : config.alignment === 'top' ? 'viewport-hotspot--pill-top' : ''}`}
              style={{
                top: config.top,
                left: config.left,
              }}
              onClick={() => onSelectNode(nodeId)}
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

        {/* Any extra non-standard pathway waypoint (e.g., Injection Site for Subcutaneous Injections) */}
        {nodes
          .filter(
            (n) =>
              !STANDARD_ANATOMICAL_LANDMARKS.some((item) => matchLandmarkToNode(item.key, [n]))
          )
          .map((extraNode, idx) => {
            const isActive = extraNode.id === selectedNodeId;
            const config = resolveNodeConfig(extraNode, idx, nodes.length);
            const label = getDisplayName(extraNode);

            return (
              <button
                key={extraNode.id}
                type="button"
                className={`viewport-hotspot ${isActive ? 'viewport-hotspot--active' : ''} ${config.alignment === 'left' ? 'viewport-hotspot--pill-left' : config.alignment === 'top' ? 'viewport-hotspot--pill-top' : ''}`}
                style={{
                  top: config.top,
                  left: config.left,
                }}
                onClick={() => onSelectNode(extraNode.id)}
                aria-label={`Select landmark waypoint: ${label}`}
              >
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

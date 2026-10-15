import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  // Ibuprofen
  'node-oral-cavity': {
    phLabel: 'Salivary pH',
    phValue: '6.8 – 7.2',
    timeLabel: 'Transit Time',
    timeValue: '5 – 10 sec',
    funFact:
      'Saliva produces ~1.5 liters daily containing salivary amylase and mucins that safeguard the oral mucosa from solid tablet friction.',
    imgUrl: '/assets/organs/micro/mouth.jpg',
  },
  'node-stomach': {
    phLabel: 'Gastric pH',
    phValue: '1.5 – 2.0',
    timeLabel: 'Transit Time',
    timeValue: '15 – 60 min',
    funFact:
      'Taking ibuprofen after a meal delays gastric transit from 15 minutes to over an hour, flattening the plasma peak curve.',
    imgUrl: '/assets/organs/micro/stomach.jpg',
  },
  'node-small-intestine': {
    phLabel: 'Intestinal pH',
    phValue: '6.0 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '1 – 2 hrs',
    funFact:
      'The intestinal villi expand the total absorbent surface area to approximately that of a standard badminton court!',
    imgUrl: '/assets/organs/micro/small-intestine.jpg',
  },
  'node-liver': {
    phLabel: 'Hepatic pH',
    phValue: '7.2 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '20 – 40 min',
    funFact:
      'Genetic polymorphism in CYP2C9 can significantly extend ibuprofen half-life in up to 5% of diverse patient demographics.',
    imgUrl: '/assets/organs/micro/liver.jpg',
  },
  'node-bloodstream': {
    phLabel: 'Plasma pH',
    phValue: '7.35 – 7.45',
    timeLabel: 'Transit Time',
    timeValue: '45 – 90 min',
    funFact:
      'Only the ~1% unbound fraction of ibuprofen is pharmacologically active and able to cross endothelial barriers into tissues.',
    imgUrl: '/assets/organs/micro/bloodstream.jpg',
  },
  'node-target-sites': {
    phLabel: 'Synovial pH',
    phValue: '7.3 – 7.4',
    timeLabel: 'Transit Time',
    timeValue: '1 – 2 hrs',
    funFact:
      'COX-1 inhibition also reduces protective stomach prostaglandins, which is why chronic dosing requires food buffering.',
    imgUrl: '/assets/organs/micro/target-tissue.jpg',
  },
  'node-kidneys': {
    phLabel: 'Urinary pH',
    phValue: '5.5 – 6.5',
    timeLabel: 'Clearance Time',
    timeValue: '2 – 4 hrs',
    funFact:
      'Less than 1% of parent ibuprofen is eliminated unchanged, underscoring the vital efficiency of prior hepatic conversion.',
    imgUrl: '/assets/organs/micro/kidneys.jpg',
  },

  // Amoxicillin
  'node-amox-mouth': {
    phLabel: 'Salivary pH',
    phValue: '6.8 – 7.2',
    timeLabel: 'Transit Time',
    timeValue: '5 – 10 sec',
    funFact: 'Capsule gelatin shell softens in oral secretions prior to deglutition.',
    imgUrl: '/assets/organs/micro/mouth.jpg',
  },
  'node-amox-esophagus': {
    phLabel: 'Esophageal pH',
    phValue: '6.8 – 7.0',
    timeLabel: 'Transit Time',
    timeValue: '4 – 8 sec',
    funFact: 'Peristaltic muscle contractions rapidly propel the capsule down the esophagus into the stomach.',
    imgUrl: '/assets/organs/micro/mouth.jpg',
  },
  'node-amox-stomach': {
    phLabel: 'Gastric pH',
    phValue: '1.5 – 2.0',
    timeLabel: 'Transit Time',
    timeValue: '30 – 60 min',
    funFact: 'Amoxicillin is remarkably stable against gastric acid breakdown compared to natural penicillins.',
    imgUrl: '/assets/organs/micro/stomach.jpg',
  },
  'node-amox-small-intestine': {
    phLabel: 'Intestinal pH',
    phValue: '6.5 – 7.5',
    timeLabel: 'Absorption Time',
    timeValue: '1 – 2 hrs',
    funFact: 'Absorption occurs primarily in the duodenum and jejunum via carrier-mediated dipeptide transporters.',
    imgUrl: '/assets/organs/micro/small-intestine.jpg',
  },
  'node-amox-bloodstream': {
    phLabel: 'Plasma pH',
    phValue: '7.35 – 7.45',
    timeLabel: 'Distribution Time',
    timeValue: '1 – 2 hrs',
    funFact: 'Only ~20% of amoxicillin binds to plasma proteins, allowing 80% free bactericidal antibiotic circulation.',
    imgUrl: '/assets/organs/micro/bloodstream.jpg',
  },
  'node-amox-infected-tissues': {
    phLabel: 'Tissue pH',
    phValue: '6.8 – 7.2',
    timeLabel: 'Bactericidal Action',
    timeValue: '2 – 4 hrs',
    funFact: 'Inhibits bacterial penicillin-binding proteins (PBPs), causing cell wall autolysis and bacterial destruction.',
    imgUrl: '/assets/organs/micro/infected-tissues.jpg',
  },
  'node-amox-kidneys': {
    phLabel: 'Urinary pH',
    phValue: '5.5 – 6.5',
    timeLabel: 'Excretion Half-life',
    timeValue: '1 – 1.5 hrs',
    funFact: 'Approximately 60% of amoxicillin is excreted unchanged in the urine via active tubular secretion.',
    imgUrl: '/assets/organs/micro/kidneys.jpg',
  },

  // Ambroxol
  'node-amb-mouth': {
    phLabel: 'Salivary pH',
    phValue: '6.8 – 7.2',
    timeLabel: 'Transit Time',
    timeValue: 'Immediate',
    funFact: 'Oral liquid formulation allows instant swallowing without disintegration latency.',
    imgUrl: '/assets/organs/micro/mouth.jpg',
  },
  'node-amb-esophagus': {
    phLabel: 'Esophageal pH',
    phValue: '6.8 – 7.0',
    timeLabel: 'Transit Time',
    timeValue: '2 – 5 sec',
    funFact: 'Liquid syrup flows smoothly coated by protective oral demulcents.',
    imgUrl: '/assets/organs/micro/mouth.jpg',
  },
  'node-amb-stomach': {
    phLabel: 'Gastric pH',
    phValue: '1.5 – 2.0',
    timeLabel: 'Transit Time',
    timeValue: '15 – 30 min',
    funFact: 'Rapid gastric emptying occurs due to the liquid syrup formulation.',
    imgUrl: '/assets/organs/micro/stomach.jpg',
  },
  'node-amb-small-intestine': {
    phLabel: 'Intestinal pH',
    phValue: '6.5 – 7.5',
    timeLabel: 'Absorption Time',
    timeValue: '45 – 90 min',
    funFact: 'Rapid and almost complete gastrointestinal absorption occurs in the proximal small bowel.',
    imgUrl: '/assets/organs/micro/small-intestine.jpg',
  },
  'node-amb-bloodstream': {
    phLabel: 'Plasma pH',
    phValue: '7.35 – 7.45',
    timeLabel: 'Distribution Time',
    timeValue: '1 – 2 hrs',
    funFact: 'High tissue affinity distributes active ambroxol predominantly into bronchial tissue.',
    imgUrl: '/assets/organs/micro/bloodstream.jpg',
  },
  'node-amb-respiratory-tissues': {
    phLabel: 'Bronchial pH',
    phValue: '6.8 – 7.4',
    timeLabel: 'Secretolytic Action',
    timeValue: '2 – 3 hrs',
    funFact: 'Stimulates pulmonary surfactant production and accelerates mucociliary clearance of thick sputum.',
    imgUrl: '/assets/organs/micro/respiratory-tissues.jpg',
  },
  'node-amb-liver': {
    phLabel: 'Hepatic pH',
    phValue: '7.2 – 7.4',
    timeLabel: 'Metabolism',
    timeValue: '1 – 2 hrs',
    funFact: 'Metabolized primarily via CYP3A4 into dibromanthranilic acid and glucuronide conjugates.',
    imgUrl: '/assets/organs/micro/liver.jpg',
  },
  'node-amb-kidneys': {
    phLabel: 'Urinary pH',
    phValue: '5.5 – 6.5',
    timeLabel: 'Renal Clearance',
    timeValue: '10 hrs terminal t1/2',
    funFact: 'Renal elimination accounts for 85% of total ambroxol metabolite excretion.',
    imgUrl: '/assets/organs/micro/kidneys.jpg',
  },

  // Insulin
  'node-ins-injection-site': {
    phLabel: 'Subcutaneous pH',
    phValue: '7.35 – 7.40',
    timeLabel: 'Absorption Onset',
    timeValue: '15 – 30 min',
    funFact: 'Subcutaneous hexameric insulin dissociates into active monomers to cross capillary walls.',
    imgUrl: '/assets/organs/micro/injection-site.jpg',
  },
  'node-ins-bloodstream': {
    phLabel: 'Plasma pH',
    phValue: '7.35 – 7.45',
    timeLabel: 'Circulation Peak',
    timeValue: '1 – 2 hrs',
    funFact: 'Circulating monomeric insulin binds with high affinity to cell-surface tyrosine kinase receptors.',
    imgUrl: '/assets/organs/micro/bloodstream.jpg',
  },
  'node-ins-body-tissues': {
    phLabel: 'Cellular pH',
    phValue: '7.0 – 7.2',
    timeLabel: 'Glucose Uptake',
    timeValue: '2 – 4 hrs',
    funFact: 'Stimulates translocation of GLUT4 glucose transporters to muscle and adipose cell membranes.',
    imgUrl: '/assets/organs/micro/target-tissue.jpg',
  },
  'node-ins-liver': {
    phLabel: 'Hepatic pH',
    phValue: '7.2 – 7.4',
    timeLabel: 'Insulin Clearance',
    timeValue: '4 – 6 min half-life',
    funFact: 'The liver degrades ~50% of circulating insulin via hepatic insulin-degrading enzyme (IDE).',
    imgUrl: '/assets/organs/micro/liver.jpg',
  },
  'node-ins-kidneys': {
    phLabel: 'Renal pH',
    phValue: '5.5 – 6.5',
    timeLabel: 'Renal Degradation',
    timeValue: 'Continuous',
    funFact: 'Kidneys clear and degrade remaining filtered insulin in proximal convoluted tubules.',
    imgUrl: '/assets/organs/micro/kidneys.jpg',
  },
};

// Dynamic helper ensuring all nodes get the proper organ micrograph
const resolveStageImage = (node: PathwayNodeWithDetails): string => {
  if (STAGE_METRICS[node.id]?.imgUrl) {
    return STAGE_METRICS[node.id].imgUrl;
  }
  const id = node.id.toLowerCase();
  const name = node.name.toLowerCase();

  if (id.includes('mouth') || name.includes('mouth') || name.includes('oral')) return '/assets/organs/micro/mouth.jpg';
  if (id.includes('stomach') || name.includes('stomach') || name.includes('gastric')) return '/assets/organs/micro/stomach.jpg';
  if (id.includes('intestine') || name.includes('intestine') || name.includes('enteric')) return '/assets/organs/micro/small-intestine.jpg';
  if (id.includes('liver') || name.includes('liver') || name.includes('hepatic')) return '/assets/organs/micro/liver.jpg';
  if (id.includes('blood') || name.includes('blood') || name.includes('plasma')) return '/assets/organs/micro/bloodstream.jpg';
  if (id.includes('kidney') || name.includes('kidney') || name.includes('renal')) return '/assets/organs/micro/kidneys.jpg';
  if (id.includes('respiratory') || name.includes('respiratory') || name.includes('lung')) return '/assets/organs/micro/respiratory-tissues.jpg';
  if (id.includes('infect') || name.includes('infect') || name.includes('pathogen')) return '/assets/organs/micro/infected-tissues.jpg';
  if (id.includes('inject') || name.includes('inject')) return '/assets/organs/micro/injection-site.jpg';
  if (id.includes('target') || name.includes('target') || name.includes('tissue')) return '/assets/organs/micro/target-tissue.jpg';

  return '/assets/organs/micro/mouth.jpg';
};

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  nodes,
  onSelectNode,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1.5);

  const currentIndex = nodes.findIndex((n) => n.id === selectedNode.id);
  const stageNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalStages = nodes.length;

  const prevNode = currentIndex > 0 ? nodes[currentIndex - 1] : null;
  const nextNode = currentIndex < totalStages - 1 ? nodes[currentIndex + 1] : null;

  const organImgUrl = resolveStageImage(selectedNode);

  const metrics = STAGE_METRICS[selectedNode.id] || {
    phLabel: 'Micro-pH',
    phValue: selectedNode.content?.micro_environment_ph != null ? `pH ${selectedNode.content.micro_environment_ph}` : 'pH 7.0',
    timeLabel: 'Transit Time',
    timeValue: `${selectedNode.estimated_time_minutes} min`,
    funFact: selectedNode.variation?.clinical_observation || selectedNode.content?.physiological_role || 'Physiological transit station.',
    imgUrl: organImgUrl,
  };

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
      <div
        className="inspector-organ-view"
        onClick={() => setIsZoomOpen(true)}
        style={{ cursor: 'pointer', position: 'relative' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsZoomOpen(true);
        }}
        aria-label={`Open high-magnification zoom view of ${selectedNode.name}`}
      >
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

        {/* Click to Zoom In Badge */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(0, 229, 255, 0.2)',
            border: '1px solid rgba(0, 229, 255, 0.5)',
            backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.675rem',
            color: '#00e5ff',
            fontWeight: 700,
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          className="organ-zoom-badge"
        >
          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
          <span>Zoom In</span>
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

      {/* High-Magnification Organ Zoom Modal */}
      {isZoomOpen && createPortal(
        <div
          className="organ-zoom-modal-backdrop"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="organ-zoom-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 10, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="organ-zoom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '920px',
              background: '#09121f',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.18)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 24, 38, 0.9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-cyan, #00e5ff)',
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">biotech</span>
                </div>
                <div>
                  <h3
                    id="organ-zoom-title"
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {selectedNode.name} — High-Magnification View
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                    Stage {stageNumber} of {totalStages} • Microscopic Physiological Cross-Section
                  </p>
                </div>
              </div>

              {/* Zoom Controls & Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.4rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {[1, 1.5, 2, 2.5].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setZoomScale(scale)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: zoomScale === scale ? 'var(--brand-cyan, #00e5ff)' : 'transparent',
                        color: zoomScale === scale ? '#09121f' : '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title="Close Zoom View (Esc)"
                  aria-label="Close zoom modal"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Image Canvas Container */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#040810',
                padding: '1rem',
                minHeight: '380px',
                cursor: 'grab',
              }}
            >
              <img
                src={metrics.imgUrl}
                alt={`${selectedNode.name} Microscopic Cellular Zoom`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '52vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  transform: `scale(${zoomScale})`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
                }}
              />
            </div>

            {/* Modal Bottom Physiological Diagnostics */}
            <div
              style={{
                padding: '1rem 1.5rem',
                background: 'rgba(12, 20, 32, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--brand-cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Micro-Environment
                </span>
                <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>
                  {displayedPhValue} • Transit: {displayedTimeValue}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Physiological & Cellular Mechanism
                </span>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {metrics.funFact}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

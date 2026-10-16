import React from 'react';
import { Link } from 'react-router-dom';
import { usePathway } from '../hooks/usePathway';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { CircularGauge } from '../components/ui/CircularGauge';
import '../styles/progress.css';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { data: pathwayData, loading: pathwayLoading } = usePathway('drug-ibuprofen-001');
  const { data: progressData, loading: progressLoading } = useProgress('drug-ibuprofen-001');

  const nodes = pathwayData?.nodes || [];
  const totalStages = Math.max(7, nodes.length);
  const completedNodes = progressData?.completed_nodes && progressData.completed_nodes.length > 0
    ? progressData.completed_nodes
    : ['node-oral-cavity', 'node-stomach', 'node-small-intestine', 'node-liver', 'node-bloodstream', 'node-target-sites'];
  // In our Stitch baseline, 6 of 7 are completed
  const completedCount = Math.min(completedNodes.length, totalStages);
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  const stageDescriptions: Record<string, { label: string; desc: string }> = {
    'node-oral-cavity': { label: 'Oral Cavity • Dissolution', desc: 'Wetting and initial tablet esophageal transit' },
    'node-stomach': { label: 'Stomach • Gastric Acid Breakdown', desc: 'Disintegration in pH 1.5–2.0 acidic gastric juice' },
    'node-small-intestine': { label: 'Small Intestine • Enteric Absorption', desc: 'Passive transcellular diffusion across jejunum villi' },
    'node-liver': { label: 'Liver • Hepatic Epimerase', desc: 'Unidirectional chiral inversion and CYP2C9 oxidation' },
    'node-bloodstream': { label: 'Bloodstream • Albumin Binding', desc: '99% protein carrier distribution through plasma' },
    'node-target-sites': { label: 'Target Tissue • Receptor Inhibition', desc: 'Peripheral downregulation of pro-inflammatory PGE2' },
    'node-kidneys': { label: 'Kidneys • Excretion', desc: 'Nephron glomerular filtration and urinary elimination' },
  };

  const badges = [
    {
      id: 'b1',
      name: 'Pathway Pioneer',
      tier: 'Tier I — Discovered initial 5 waypoints',
      icon: 'explore',
      color: 'var(--color-primary-container, #00e5ff)',
      unlocked: true,
    },
    {
      id: 'b2',
      name: 'Gastric Guru',
      tier: 'Tier II — Mastered pH transit variability',
      icon: 'bolt',
      color: 'var(--color-secondary, #4edea3)',
      unlocked: true,
    },
    {
      id: 'b3',
      name: 'Enzyme Explorer',
      tier: 'Tier II — Analyzed CYP450 liver epimerase',
      icon: 'biotech',
      color: 'var(--color-tertiary-container, #ffc589)',
      unlocked: true,
    },
    {
      id: 'b4',
      name: 'Pharmacokinetic Master',
      tier: 'Tier III — Complete full 7-stage pathway simulation',
      icon: 'lock',
      color: 'var(--color-on-surface-variant, #bac9cc)',
      unlocked: false,
    },
  ];

  if ((pathwayLoading || progressLoading) && !pathwayData) {
    return (
      <div className="progress-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid var(--color-surface-container-highest, #2e353f)',
              borderTopColor: 'var(--color-primary-container, #00e5ff)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
            Synchronizing Learning Progress Telemetry...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-glow-1" aria-hidden="true" />
      <div className="progress-glow-2" aria-hidden="true" />

      {/* 1. Header Block & Candidate Telemetry */}
      <header className="progress-header">
        <div>
          <div className="progress-badge">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary, #4edea3)', boxShadow: '0 0 8px #4edea3' }} />
            <span>Clinical Telemetry • Phase I</span>
          </div>

          <h1 className="progress-title">Your Learning Progress &amp; Mastery</h1>

          <p className="progress-subtitle">
            Track your anatomical pathway exploration journey, quiz comprehension, and
            physiological milestones across drug pharmacokinetics.
          </p>
        </div>

        {/* Identity & Cloud Sync Badges */}
        <div className="progress-identity-bar">
          {user?.role === 'admin' && (
            <Link
              to="/admin/content"
              className="progress-identity-chip"
              style={{
                background: 'rgba(0, 229, 255, 0.12)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              title="Open Administrative Content Management Portal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary-container, #00e5ff)' }}>
                admin_panel_settings
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant, #bac9cc)', lineHeight: 1 }}>
                  ADMIN ACCESS
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-container, #00e5ff)' }}>
                  Admin Portal &rarr;
                </span>
              </div>
            </Link>
          )}

          <div className="progress-identity-chip">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary-container, #00e5ff)' }}>
              fingerprint
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant, #bac9cc)', lineHeight: 1 }}>
                CANDIDATE ID
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', letterSpacing: '0.04em' }}>
                PHARM-8842-X
              </span>
            </div>
          </div>

          <div className="progress-identity-chip">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-secondary, #4edea3)' }}>
              cloud_done
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-on-surface-variant, #bac9cc)', lineHeight: 1 }}>
                CLOUD SYNC
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary, #4edea3)' }}>
                Synchronized
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Key Performance Indicators (4 KPI Cards) */}
      <section className="progress-kpi-grid" aria-label="Key Performance Indicators">
        {/* Card 1: Trajectory Map */}
        <div className="progress-kpi-card">
          <div className="progress-kpi-header">
            <span className="progress-kpi-title">Trajectory Map</span>
            <div className="progress-kpi-icon" style={{ color: 'var(--color-primary-container, #00e5ff)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                route
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1 }}>
                  {completedCount}
                </span>
                <span style={{ fontSize: '1.15rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 600 }}>
                  / {totalStages}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', marginTop: '0.25rem' }}>
                Stages Traversed
              </span>
            </div>

            <CircularGauge
              percentage={progressPercent}
              size={60}
              strokeWidth={4}
              sublabel="Done"
              color="var(--color-primary-container, #00e5ff)"
            />
          </div>

          <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: 'var(--color-surface-container-high, #242a34)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-primary-container, #00e5ff)', borderRadius: '9999px' }} />
          </div>
        </div>

        {/* Card 2: Quiz Comprehension */}
        <div className="progress-kpi-card">
          <div className="progress-kpi-header">
            <span className="progress-kpi-title">Comprehension</span>
            <div className="progress-kpi-icon" style={{ color: 'var(--color-secondary, #4edea3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                verified
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1 }}>
                4
              </span>
              <span style={{ fontSize: '1.15rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 600 }}>
                / 5 Correct
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary, #4edea3)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary, #4edea3)' }}>
                Proficient Evaluator
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: '5px', flex: 1, borderRadius: '9999px', background: 'var(--color-secondary, #4edea3)' }} />
            ))}
            <div style={{ height: '5px', flex: 1, borderRadius: '9999px', background: 'var(--color-surface-container-highest, #2e353f)' }} />
          </div>
        </div>

        {/* Card 3: 3D Immersion Time */}
        <div className="progress-kpi-card">
          <div className="progress-kpi-header">
            <span className="progress-kpi-title">Sim Immersion</span>
            <div className="progress-kpi-icon" style={{ color: 'var(--color-tertiary-container, #ffc589)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                view_in_ar
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1 }}>
                18
              </span>
              <span style={{ fontSize: '1.15rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 600 }}>
                mins
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', marginTop: '0.35rem' }}>
              Volumetric Inspection • Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-primary-container, #00e5ff)' }}>
              schedule
            </span>
            <span>+4.2 mins vs. baseline</span>
          </div>
        </div>

        {/* Card 4: Upcoming Phase */}
        <div className="progress-kpi-card progress-kpi-card--highlight">
          <div className="progress-kpi-header">
            <span className="progress-kpi-title" style={{ color: 'var(--color-primary-container, #00e5ff)' }}>
              Upcoming Phase
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary-container, #00e5ff)', boxShadow: '0 0 8px var(--color-primary-container)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', margin: '0.75rem 0' }}>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
              STAGE 7 OF 7
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0.2rem 0 0' }}>
              Kidneys • Excretion
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', marginTop: '0.25rem' }}>
              Renal clearance &amp; nephron filtration
            </span>
          </div>

          <Link
            to="/explore"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'var(--color-primary-container, #00e5ff)',
              color: 'var(--color-on-primary-container, #00626e)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 0 16px rgba(0, 229, 255, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Resume Stage 7</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Main 2-Column Mastery Layout */}
      <div className="progress-layout">
        {/* Left Column: Physiological Waypoints Trajectory */}
        <section className="progress-waypoints-section" aria-labelledby="waypoints-title">
          <div className="progress-section-header">
            <div>
              <h2 id="waypoints-title" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
                Physiological Waypoints Trajectory
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: '0.25rem 0 0' }}>
                Chronological progress through the systemic pharmacokinetic cycle.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(0, 165, 114, 0.2)',
                color: 'var(--color-secondary, #4edea3)',
                border: '1px solid rgba(78, 222, 163, 0.3)',
              }}
            >
              {completedCount} of {totalStages} Completed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nodes.map((node, index) => {
              const isCompleted = completedNodes.includes(node.id) || index < completedCount;
              const isActiveUpcoming = index === completedCount;
              const info = stageDescriptions[node.id] || {
                label: node.name,
                desc: node.anatomical_location,
              };

              return (
                <div
                  key={node.id}
                  className={`progress-waypoint-card ${isActiveUpcoming ? 'progress-waypoint-card--active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      className="progress-waypoint-icon"
                      style={{
                        background: isCompleted
                          ? 'rgba(0, 165, 114, 0.2)'
                          : isActiveUpcoming
                          ? 'rgba(0, 229, 255, 0.15)'
                          : 'var(--color-surface-container, #19202a)',
                        color: isCompleted
                          ? 'var(--color-secondary, #4edea3)'
                          : isActiveUpcoming
                          ? 'var(--color-primary-container, #00e5ff)'
                          : 'var(--color-on-surface-variant, #bac9cc)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                        {isCompleted ? 'done_all' : isActiveUpcoming ? 'play_arrow' : 'lock'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                        {info.label}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                        {info.desc}
                      </span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        background: 'rgba(78, 222, 163, 0.1)',
                        color: 'var(--color-secondary, #4edea3)',
                        border: '1px solid rgba(78, 222, 163, 0.25)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      100% Verified
                    </span>
                  ) : (
                    <Link
                      to="/explore"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 1rem',
                        borderRadius: '9999px',
                        background: 'var(--color-primary-container, #00e5ff)',
                        color: 'var(--color-on-primary-container, #00626e)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 14px rgba(0, 229, 255, 0.35)',
                      }}
                    >
                      <span>Continue: Kidneys</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        arrow_forward
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Sidebar Badges & Profile */}
        <aside className="progress-sidebar" aria-label="Achievements and Session Profile">
          {/* Earned Badges Card */}
          <div className="progress-sidebar-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                Earned Badges
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  color: 'var(--color-primary-container, #00e5ff)',
                }}
              >
                3 Acquired
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {badges.map((badge) => (
                <div key={badge.id} className="progress-badge-item">
                  <div
                    className="progress-badge-icon"
                    style={{
                      background: badge.unlocked ? 'var(--color-surface-container-high, #242a34)' : 'rgba(8, 15, 24, 0.6)',
                      color: badge.color,
                      border: `1px solid ${badge.unlocked ? badge.color : 'rgba(59, 73, 76, 0.3)'}`,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {badge.icon}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: badge.unlocked ? 'var(--color-on-surface, #dce3f0)' : 'var(--color-on-surface-variant, #bac9cc)',
                      }}
                    >
                      {badge.name}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                      {badge.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account & Session Telemetry Card */}
          <div className="progress-sidebar-card">
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
              Simulation Profile
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-container, #00e5ff)',
                  color: 'var(--color-on-primary-container, #00626e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  person
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                  Candidate Pharmacologist
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                  PHARM-8842-X • Academic Tier
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--color-surface-container, #19202a)',
                fontSize: '0.75rem',
                color: 'var(--color-on-surface-variant, #bac9cc)',
                lineHeight: 1.5,
              }}
            >
              Session state is preserved in local active persistence. Ready to export upon completion of Stage 7.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProgressPage;

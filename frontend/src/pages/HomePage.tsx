import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      {/* 1. Hero Section & Atmospheric Glowing Backdrops */}
      <section className="home-hero" aria-label="Introduction Hero">
        <div className="home-hero__ambient-glow-1" aria-hidden="true" />
        <div className="home-hero__ambient-glow-2" aria-hidden="true" />

        <div className="home-hero__content">
          <div className="home-hero__badge">
            <span className="home-hero__badge-dot" aria-hidden="true" />
            <span>Interactive 3D Pharmacokinetics Experience</span>
          </div>

          <h1 className="home-hero__title">
            See the Journey of a Medicine{' '}
            <span className="home-hero__highlight">Inside Your Body</span>
          </h1>

          <p className="home-hero__subtitle">
            Trace how everyday medications like Ibuprofen travel from oral ingestion
            through biological barriers, bloodstream distribution, and receptor docking
            to deliver targeted relief.
          </p>

          <div className="home-hero__actions">
            <Link to="/explore" className="home-btn-primary">
              <span>Explore 3D Pathway</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_downward
              </span>
            </Link>

            <Link to="/learn" className="home-btn-secondary">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'var(--color-primary-container, #00e5ff)' }}
              >
                menu_book
              </span>
              <span>Start Learning</span>
            </Link>
          </div>
        </div>

        {/* 2. 3D Simulation Showcase Cockpit Card */}
        <div className="home-showcase" id="pathway-preview">
          <div className="home-showcase__card">
            <div className="home-showcase__viewport">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcxvqAuhfBz7s4dsQn8gU807l38WsKo_W8EzXp7PAGvIfJu29glEirq27pb0o215Z4Lf9GaYD2qJPoahFX8Y-IycTy4kKdQnOWW9V_JQgY_wqe7pv4ZenaA9HN4sVCDRDHBg5-xKgRL_IbGlsPtXwrdydGnNJMSmGzHsXh9dV3mOTRNTLnOZq3tdZE6ChkITdV03ZQgCQ6P9YBoKFbap5KOZjNiyc-60tHBraEWWA1"
                alt="High-fidelity 3D human anatomical visualization showing pharmacokinetic pathway landmarks"
                className="home-showcase__img"
              />
              <div className="home-showcase__vignette" aria-hidden="true" />

              {/* Status Pill Top-Left */}
              <div className="home-showcase__status-pill">
                <span className="home-showcase__status-dot" aria-hidden="true" />
                <span>Simulation Active • Oral Route (Tablet)</span>
              </div>

              {/* Waypoints Summary Bar Bottom */}
              <div className="home-showcase__bottom-bar">
                <div className="home-showcase__waypoints-info">
                  <div className="home-showcase__icon-box" aria-hidden="true">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                      airline_stops
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--color-on-surface, #dce3f0)',
                      }}
                    >
                      7 Key Anatomical Waypoints
                    </p>
                    <p
                      style={{
                        margin: '0.15rem 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--color-on-surface-variant, #bac9cc)',
                      }}
                    >
                      Mouth → Stomach → Intestine → Liver → Circulation → Receptor Sites → Kidneys
                    </p>
                  </div>
                </div>

                <Link to="/explore" className="home-showcase__sim-link">
                  <span>Real-time Simulation</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator prompt */}
        <div className="home-scroll-prompt" aria-hidden="true">
          <span>Scroll down to explore pathway</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
            keyboard_arrow_down
          </span>
        </div>
      </section>

      {/* 3. Core Capabilities Section */}
      <section className="home-section" aria-labelledby="capabilities-title">
        <div className="home-section__header">
          <span className="home-section__tag">Core Capabilities</span>
          <h2 id="capabilities-title" className="home-section__title">
            Designed for Deep Anatomical Clarity
          </h2>
          <p className="home-section__desc">
            High-fidelity 3D modeling combined with calibrated clinical pharmacology.
          </p>
        </div>

        <div className="home-grid-3">
          {/* Card 1: 3D Visualization */}
          <article className="home-capability-card">
            <div>
              <div className="home-capability-card__icon" style={{ color: 'var(--color-primary-container, #00e5ff)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                  view_in_ar
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.75rem' }}>
                Interactive 3D Visualisation
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Freely rotate, zoom, and cross-section anatomical systems. Track molecular
                disintegration step-by-step from esophageal transit to systemic capillary diffusion.
              </p>
            </div>
            <Link to="/explore" className="home-capability-card__action" style={{ color: 'var(--color-primary-container, #00e5ff)' }}>
              <span>Explore 3D Nodes</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </Link>
          </article>

          {/* Card 2: Curated Pharmacokinetics */}
          <article className="home-capability-card">
            <div>
              <div className="home-capability-card__icon" style={{ color: 'var(--color-secondary, #4edea3)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                  biotech
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.75rem' }}>
                Curated Pharmacokinetics
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Deconstruct complex ADME principles (Absorption, Distribution, Metabolism, Excretion)
                into digestible telemetry metrics with zero clinical jargon overload.
              </p>
            </div>
            <Link to="/learn" className="home-capability-card__action" style={{ color: 'var(--color-secondary, #4edea3)' }}>
              <span>Read Bioavailability Docs</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </Link>
          </article>

          {/* Card 3: Interactive Assessment */}
          <article className="home-capability-card">
            <div>
              <div className="home-capability-card__icon" style={{ color: 'var(--color-tertiary-container, #ffc589)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                  quiz
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.75rem' }}>
                Interactive Assessment
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Validate comprehension through checkpoint scenario quizzes, first-pass
                metabolism inquiries, and timing-dependent therapeutic index challenges.
              </p>
            </div>
            <Link to="/quiz" className="home-capability-card__action" style={{ color: 'var(--color-tertiary-container, #ffc589)' }}>
              <span>Take Test Module</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </Link>
          </article>
        </div>
      </section>

      {/* 4. Structured Workflow Section ("How It Works") */}
      <section className="home-workflow-bg" aria-labelledby="workflow-title">
        <div className="home-section">
          <div className="home-section__header">
            <span className="home-section__tag">Structured Workflow</span>
            <h2 id="workflow-title" className="home-section__title">
              How It Works
            </h2>
            <p className="home-section__desc">
              Three intuitive steps to master medicine dynamics inside the human body.
            </p>
          </div>

          <div className="home-grid-3">
            <article className="home-step-card">
              <span className="home-step-card__num" style={{ color: 'rgba(0, 229, 255, 0.4)' }}>
                01
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.5rem' }}>
                Explore
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Navigate the interactive anatomical viewport. Inspect key organ milestones from
                ingestion to filtration with micro-level detail cards.
              </p>
            </article>

            <article className="home-step-card">
              <span className="home-step-card__num" style={{ color: 'rgba(78, 222, 163, 0.4)' }}>
                02
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.5rem' }}>
                Learn
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Toggle between metabolic conditions like 'Before Food' and 'After Food' to discover
                gastric delay effects and absorption curves.
              </p>
            </article>

            <article className="home-step-card">
              <span className="home-step-card__num" style={{ color: 'rgba(255, 197, 137, 0.4)' }}>
                03
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.5rem' }}>
                Test
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Complete quick 5-minute diagnostic checks. Track your score, review misconceptions,
                and solidify your medical pharmacology knowledge.
              </p>
            </article>
          </div>

          {/* Academic & Simulation Notice Callout */}
          <div className="home-disclaimer-card" role="note" aria-label="Educational Notice">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '26px', color: 'var(--color-primary-container, #00e5ff)', flexShrink: 0, marginTop: '2px' }}
            >
              info
            </span>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: '0 0 0.25rem' }}>
                Educational &amp; Academic Simulation Notice
              </h4>
              <p style={{ fontSize: '0.825rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Drug Path Visualiser is an interactive didactic aid intended solely for
                educational, academic, and pharmacological training purposes. It does not
                constitute formal medical diagnosis or personal clinical advice. Always follow
                healthcare provider guidelines when administering medications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

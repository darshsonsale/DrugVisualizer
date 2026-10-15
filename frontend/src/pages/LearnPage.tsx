import React from 'react';
import { Link } from 'react-router-dom';
import { usePathway } from '../hooks/usePathway';
import { Accordion } from '../components/ui';
import '../styles/learn.css';

export const LearnPage: React.FC = () => {
  const { data, loading } = usePathway('drug-ibuprofen-001');

  const drug = data?.drug;
  const nodes = data?.nodes || [];

  const faqItems = [
    {
      id: 'faq-1',
      title: 'Why does Ibuprofen cause gastric irritation on an empty stomach?',
      icon: 'health_and_safety',
      content:
        'Ibuprofen is a non-selective NSAID that inhibits both COX-2 (producing analgesia) and COX-1. COX-1 enzymes constitutively generate gastric mucosal prostaglandins (PGE2 and PGI2) that promote bicarbonate buffer secretion and mucosal blood flow. Taking ibuprofen with meals buffers topical acidic contact and cushions epithelial cells.',
      defaultExpanded: true,
    },
    {
      id: 'faq-2',
      title: 'What is unidirectional chiral inversion of Ibuprofen in the liver?',
      icon: 'change_circle',
      content:
        'Ibuprofen is synthesized and administered as a 50:50 racemic mixture of (R)- and (S)-enantiomers. While only (S)-ibuprofen effectively binds and inhibits COX active sites, the hepatic enzyme 2-arylpropionyl-CoA epimerase unidirectionally converts roughly 60% of the inactive (R)-isomer into active (S)-ibuprofen in vivo.',
    },
    {
      id: 'faq-3',
      title: 'How does 99% plasma protein binding impact drug distribution?',
      icon: 'link',
      content:
        'More than 99% of circulating ibuprofen binds reversibly to human serum albumin. Only the small unbound free fraction (~1%) crosses capillary endothelial fenestrations to reach peripheral target tissues. Albumin binding serves as an endogenous circulating reservoir, stabilizing systemic drug levels across its 2-hour half-life.',
    },
    {
      id: 'faq-4',
      title: 'Why does food delay peak absorption (Tmax) without diminishing total AUC?',
      icon: 'restaurant',
      content:
        'Nutrient ingestion triggers pyloric sphincter contraction and digestive retention in the stomach, slowing the rate at which tablet particles enter the duodenum. Consequently, peak plasma concentration (Tmax) shifts from ~45 minutes to 2–2.5 hours. However, total transcellular intestinal absorption across the vast jejunal surface area remains complete (~88% bioavailability).',
    },
  ];

  return (
    <div className="learn-container">
      {/* 1. Header & ADME Snapshot */}
      <header className="learn-header">
        <div className="learn-header__intro">
          <div className="learn-badge">
            <span className="learn-badge__dot" aria-hidden="true" />
            <span>Pharmacokinetics Guide • Molecular Atlas</span>
          </div>

          <h1 className="learn-title">How Does Ibuprofen Work?</h1>

          <p className="learn-subtitle">
            A clean, didactic walkthrough of drug absorption, distribution, metabolism,
            and excretion (ADME) through human organ systems.
          </p>
        </div>

        {/* 4 Metric Highlights */}
        <div className="learn-metrics-grid">
          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Peak Time</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
                timer
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.tmax_hours != null ? `${drug.tmax_hours} – 2.0` : '0.75 – 2.0'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>hrs</span>
            </div>
            <p className="learn-metric-card__desc">Tmax oral plasma concentration</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Protein Binding</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-secondary, #4edea3)' }}>
                link
              </span>
            </div>
            <div className="learn-metric-card__val">
              99%{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>Albumin</span>
            </div>
            <p className="learn-metric-card__desc">High affinity systemic carrier fraction</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Plasma Elimination</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-tertiary-container, #ffc589)' }}>
                hourglass_empty
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.half_life_hours != null ? `${drug.half_life_hours}` : '2.0'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>hrs</span>
            </div>
            <p className="learn-metric-card__desc">Predictable clearance half-life (t1/2)</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Enzyme Target</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary, #c3f5ff)' }}>
                target
              </span>
            </div>
            <div className="learn-metric-card__val" style={{ fontSize: '1.25rem' }}>
              COX-1 &amp; COX-2
            </div>
            <p className="learn-metric-card__desc">Non-selective reversible inhibition</p>
          </div>
        </div>
      </header>

      {/* 2. Section 01: Molecular Bioenergetics */}
      <section className="learn-section" aria-labelledby="mechanism-heading">
        <div className="learn-section__tag">
          <span>01</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Molecular Bioenergetics</span>
        </div>

        <div className="learn-mechanism-card">
          <div className="learn-mechanism-card__info">
            <h2 id="mechanism-heading" className="learn-section__heading">
              Mechanism of Action: Stopping Pain at Its Source
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
              Ibuprofen is a non-steroidal anti-inflammatory drug (NSAID) that acts as a
              competitive inhibitor of cyclooxygenase enzymes. By reversibly blocking the
              hydrophobic channel of both <strong style={{ color: 'var(--color-on-surface, #dce3f0)' }}>COX-1</strong> and{' '}
              <strong style={{ color: 'var(--color-on-surface, #dce3f0)' }}>COX-2</strong>, it prevents the enzymatic conversion of
              arachidonic acid into pro-inflammatory prostanoids.
            </p>

            <div className="learn-mechanism-card__callouts">
              <div className="learn-mechanism-callout-item">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
                  check_circle
                </span>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                    Prostaglandin E2 Suppression
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: '0.15rem 0 0' }}>
                    Lowers local peripheral nociceptor sensitisation at injury sites
                  </p>
                </div>
              </div>

              <div className="learn-mechanism-callout-item">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-secondary, #4edea3)' }}>
                  check_circle
                </span>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)' }}>
                    Hypothalamic Reset
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: '0.15rem 0 0' }}>
                    Attenuates IL-1 pyrogenic signaling in thermoregulatory centers to reduce fever
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="learn-mechanism-card__media">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC52hIVvDasnp1zX8KFo736MiszI2QDYfUY91j8B21tJZI7eH1iSn3dcRDbpxgMbuAS6HSdm9fO818x7iFbRiafkQ4RKmcS9GfA9p20U33TACq00i7DvMtsX2RlrNi77lQQbAj9n26DzWjvjUHkoMx00T6RST2szbXTBfDCDFyPcJUKqKC6vJ6mwxb5aNnpAIz3LXpSI-t84mJ4ZJ26mAURkB4Dd7pWEvL5QVkeeocr"
              alt="Scientific 3D rendering of cyclooxygenase enzyme COX-2 binding pocket with ibuprofen"
              className="learn-mechanism-card__img"
            />
          </div>
        </div>
      </section>

      {/* 3. Section 02: Pharmacokinetic Trajectory (The 7 Milestones) */}
      <section className="learn-section" aria-labelledby="milestones-heading">
        <div className="learn-section__tag">
          <span>02</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Pharmacokinetic Trajectory</span>
        </div>

        <div>
          <h2 id="milestones-heading" className="learn-section__heading">
            The 7 Physiological Milestones
          </h2>
          <p className="learn-section__desc" style={{ marginTop: '0.35rem' }}>
            Follow the physical journey of a standard 400mg tablet from oral ingestion to
            receptor-mediated resolution and cellular elimination.
          </p>
        </div>

        <div className="learn-milestones-stack">
          {nodes.map((node, index) => {
            const stageNum = String(node.node_order || index + 1).padStart(2, '0');
            const duration = node.estimated_time_minutes <= 60
              ? `${node.estimated_time_minutes} min`
              : `~${(node.estimated_time_minutes / 60).toFixed(1)} hrs`;

            return (
              <div key={node.id} className="learn-milestone-row">
                <div className="learn-milestone-left">
                  <div className="learn-milestone-badge">{stageNum}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
                        {node.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: 'var(--color-surface-container, #19202a)',
                          color: 'var(--color-on-surface-variant, #bac9cc)',
                          border: '1px solid rgba(59, 73, 76, 0.3)',
                        }}
                      >
                        {duration} transit
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                      {node.content?.general_description ||
                        'The solid drug passes through this physiological waypoint station.'}
                    </p>
                  </div>
                </div>

                <Link to="/explore" className="learn-milestone-btn">
                  <span>Inspect in 3D</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    visibility
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section 03: Before Food vs. After Food Dynamics */}
      <section className="learn-section" aria-labelledby="comparison-heading">
        <div className="learn-section__tag">
          <span>03</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Gastrointestinal State Comparison</span>
        </div>

        <div>
          <h2 id="comparison-heading" className="learn-section__heading">
            Before Food vs. After Food Dynamics
          </h2>
          <p className="learn-section__desc" style={{ marginTop: '0.35rem' }}>
            Dietary intake changes gastric emptying rates without significantly diminishing
            overall systemic bioavailability.
          </p>
        </div>

        <div className="learn-comparison-grid">
          {/* Fasted State Card */}
          <div className="learn-comparison-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'var(--color-surface-container, #19202a)',
                    color: 'var(--color-on-surface, #dce3f0)',
                  }}
                >
                  Fasted State
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-primary-container, #00e5ff)' }}>
                  bolt
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
                Accelerated Onset (~30–45 min)
              </h3>

              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                When swallowed on an empty stomach, unimpeded pyloric motility accelerates
                transit straight to the duodenum. Peak plasma levels (Cmax) are reached faster,
                delivering rapid acute relief for episodic cephalalgia or dental pain.
              </p>
            </div>

            <div className="learn-clinical-note">
              <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Clinical Note
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                Higher transient local gastric mucosal contact; not recommended for individuals with peptic ulcer history.
              </span>
            </div>
          </div>

          {/* Fed State Card */}
          <div className="learn-comparison-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'var(--color-surface-container, #19202a)',
                    color: 'var(--color-on-surface, #dce3f0)',
                  }}
                >
                  Fed State
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-secondary, #4edea3)' }}>
                  shield
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
                Buffered Transit (~60–90 min)
              </h3>

              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                Food stimulates gastric chyme retention and delays gastric emptying. While Tmax is
                extended and Cmax slightly blunted, total area under the curve (AUC / total absorbed
                dose) remains essentially unchanged (~88%).
              </p>
            </div>

            <div className="learn-clinical-note">
              <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Clinical Note
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                Cushioned gastric epithelium reduces dyspepsia and mucosal micro-erosions during prolonged therapeutic regimens.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 04: Clinical Inquiries FAQ Accordion */}
      <section className="learn-section" aria-labelledby="faq-heading">
        <div className="learn-section__tag">
          <span>04</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Clinical Inquiries &amp; Pharmacodynamics</span>
        </div>

        <div>
          <h2 id="faq-heading" className="learn-section__heading">
            Frequently Asked Questions
          </h2>
          <p className="learn-section__desc" style={{ marginTop: '0.35rem' }}>
            Authoritative clinical insights into bioavailability, chiral transformation, and metabolic interactions.
          </p>
        </div>

        <Accordion items={faqItems} allowMultiple={false} />
      </section>
    </div>
  );
};

export default LearnPage;

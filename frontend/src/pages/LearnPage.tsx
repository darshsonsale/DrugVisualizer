import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import { Accordion } from '../components/ui';
import '../styles/learn.css';

interface DrugTabOption {
  id: string;
  slug: string;
  label: string;
  form: string;
  icon: string;
}

const DRUG_TABS: DrugTabOption[] = [
  { id: 'drug-ibuprofen-001', slug: 'ibuprofen', label: 'Ibuprofen', form: 'Oral Tablet', icon: 'medication' },
  { id: 'drug-amoxicillin-002', slug: 'amoxicillin', label: 'Amoxicillin', form: 'Oral Capsule', icon: 'pill' },
  { id: 'drug-ambroxol-003', slug: 'ambroxol', label: 'Ambroxol', form: 'Oral Syrup', icon: 'fluid_med' },
  { id: 'drug-insulin-004', slug: 'insulin', label: 'Regular Human Insulin', form: 'SC Injection', icon: 'vaccines' }
];

export const LearnPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDrugParam = searchParams.get('drug') || 'drug-ibuprofen-001';

  // Match canonical ID or short slug
  const activeTab = DRUG_TABS.find(
    (t) => t.id === rawDrugParam || t.slug.toLowerCase() === rawDrugParam.toLowerCase()
  ) || DRUG_TABS[0];

  const { data, loading, error } = useContent(activeTab.id);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleSelectDrug = (tab: DrugTabOption) => {
    setSearchParams({ drug: tab.slug });
  };

  const drug = data?.drug;
  const nodes = data?.nodes || [];
  const faqs = data?.faqs || [];

  const faqItems = faqs.map((f, i) => ({
    id: f.id || `faq-${i}`,
    title: f.question,
    icon: 'help_outline',
    content: `${f.answer}\n\n[Scientific Reference: ${f.source_reference}]`,
    defaultExpanded: i === 0
  }));

  return (
    <div className="learn-container">
      {/* 1. Header & Drug Switcher */}
      <header className="learn-header">
        <div className="learn-header__intro">
          <div className="learn-badge">
            <span className="learn-badge__dot" aria-hidden="true" />
            <span>Pharmacokinetics Guide • Educational Atlas</span>
          </div>

          <h1 className="learn-title">
            How Does {drug?.name || activeTab.label} Work?
          </h1>

          <p className="learn-subtitle">
            A didactic, student-friendly exploration of drug absorption, distribution, metabolism,
            and excretion (ADME) through human organ systems.
          </p>

          {/* Medication Selector Tabs */}
          <div className="learn-drug-tabs" role="tablist" aria-label="Select Medication">
            {DRUG_TABS.map((tab) => {
              const isActive = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`learn-drug-tab ${isActive ? 'learn-drug-tab--active' : ''}`}
                  onClick={() => handleSelectDrug(tab)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({tab.form})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scientific Review Status Notification */}
        <div className="learn-review-banner">
          <span className="material-symbols-outlined" style={{ color: '#ffb800', fontSize: '20px' }}>
            policy
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="learn-review-badge">Flagged For Scientific Review</span>
              <strong style={{ fontSize: '0.85rem' }}>Educational MVP Draft</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
              All 27 pathway nodes, pH values, and kinetic models are annotated with peer-reviewed references (PMIDs/DOIs/FDA NDAs)
              and marked for formal institutional faculty review.
            </p>
          </div>
        </div>

        {/* 4 ADME Metric Highlights */}
        <div className="learn-metrics-grid">
          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Peak Onset (Tmax)</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
                timer
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.tmax_hours != null ? `${drug.tmax_hours}` : '—'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>hrs</span>
            </div>
            <p className="learn-metric-card__desc">Plasma peak absorption time</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Bioavailability</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-secondary, #4edea3)' }}>
                link
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.bioavailability_pct != null ? `${drug.bioavailability_pct}%` : '100%'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>Systemic</span>
            </div>
            <p className="learn-metric-card__desc">Active fraction reaching circulation</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Clearance Half-Life (t½)</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-tertiary-container, #ffc589)' }}>
                hourglass_empty
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.half_life_hours != null ? `${drug.half_life_hours}` : '—'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>hrs</span>
            </div>
            <p className="learn-metric-card__desc">Systemic elimination rate</p>
          </div>

          <div className="learn-metric-card">
            <div className="learn-metric-card__header">
              <span className="learn-metric-card__label">Administration Route</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary, #c3f5ff)' }}>
                vaccines
              </span>
            </div>
            <div className="learn-metric-card__val" style={{ fontSize: '1.2rem' }}>
              {loading ? '...' : drug?.route || activeTab.form}
            </div>
            <p className="learn-metric-card__desc">Formulation &amp; delivery pathway</p>
          </div>
        </div>
      </header>

      {/* 2. ADME Structural Summary */}
      {data?.adme_overview && (
        <section className="learn-section" aria-labelledby="adme-overview-heading">
          <div className="learn-section__tag">
            <span>01</span>
            <div className="learn-section__tag-line" aria-hidden="true" />
            <span>ADME Pharmacokinetics Profile</span>
          </div>

          <div className="learn-mechanism-card">
            <div className="learn-mechanism-card__info">
              <h2 id="adme-overview-heading" className="learn-section__heading">
                Pharmacokinetic Profile of {drug?.name || activeTab.label}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="learn-clinical-note">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-container, #00e5ff)' }}>
                    ABSORPTION
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                    {data.adme_overview.absorption}
                  </span>
                </div>

                <div className="learn-clinical-note">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary, #4edea3)' }}>
                    DISTRIBUTION
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                    {data.adme_overview.distribution}
                  </span>
                </div>

                <div className="learn-clinical-note">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-tertiary-container, #ffc589)' }}>
                    METABOLISM
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                    {data.adme_overview.metabolism}
                  </span>
                </div>

                <div className="learn-clinical-note">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f38ba8' }}>
                    EXCRETION
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface, #dce3f0)', lineHeight: 1.5 }}>
                    {data.adme_overview.excretion}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                <strong>Evidence Sources:</strong> {data.adme_overview.source}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Physiological Milestones Stack (All Nodes with Plain-English + Scientific Drawers) */}
      <section className="learn-section" aria-labelledby="milestones-heading">
        <div className="learn-section__tag">
          <span>02</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Physiological Milestones</span>
        </div>

        <div>
          <h2 id="milestones-heading" className="learn-section__heading">
            The {nodes.length} Physiological Waypoints
          </h2>
          <p className="learn-section__desc" style={{ marginTop: '0.35rem' }}>
            Follow the journey of {drug?.name || activeTab.label} from administration site to systemic resolution and cellular elimination.
          </p>
        </div>

        {error && (
          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255, 100, 100, 0.1)', color: '#ff8080' }}>
            {error}
          </div>
        )}

        <div className="learn-milestones-stack">
          {nodes.map((node, index) => {
            const stageNum = String(node.node_order || index + 1).padStart(2, '0');
            const duration = node.estimated_time_minutes <= 60
              ? `${node.estimated_time_minutes} min`
              : `~${(node.estimated_time_minutes / 60).toFixed(1)} hrs`;
            const isExpanded = !!expandedNodes[node.node_id];

            return (
              <div key={node.node_id} className="learn-milestone-row" style={{ alignItems: 'flex-start' }}>
                <div className="learn-milestone-left" style={{ width: '100%', maxWidth: 'none' }}>
                  <div className="learn-milestone-badge">{stageNum}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-on-surface, #dce3f0)', margin: 0 }}>
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
                      {node.micro_environment_ph != null && (
                        <span className="learn-ph-badge" title="Physiological micro-environment pH">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            science
                          </span>
                          pH {node.micro_environment_ph}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)', margin: 0 }}>
                      <strong>Location:</strong> {node.anatomical_location} • <strong>System:</strong> {node.organ_system}
                    </p>

                    {/* Student-Friendly Explanation */}
                    <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--color-on-surface, #dce3f0)', margin: '0.25rem 0 0' }}>
                      {node.general_description}
                    </p>

                    {/* Distinct Key Takeaway Card */}
                    {node.key_takeaway && (
                      <div className="learn-takeaway-card">
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container, #00e5ff)', fontSize: '20px' }}>
                          lightbulb
                        </span>
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-primary-container, #00e5ff)' }}>
                            Key Takeaway
                          </span>
                          <p className="learn-takeaway-text">
                            {node.key_takeaway}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Scientific Drawer Button */}
                    <button
                      type="button"
                      className="learn-scientific-toggle"
                      onClick={() => toggleNodeExpansion(node.node_id)}
                      aria-expanded={isExpanded}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {isExpanded ? 'expand_less' : 'biotech'}
                      </span>
                      <span>
                        {isExpanded ? 'Hide Scientific Deep Dive' : 'Deep Dive: Cellular Mechanism & Terms'}
                      </span>
                    </button>

                    {/* Collapsible Scientific Deep Dive Drawer */}
                    {isExpanded && (
                      <div className="learn-scientific-drawer">
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-container, #00e5ff)' }}>
                            Physiological Role &amp; Mechanism
                          </span>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-on-surface, #dce3f0)', margin: '0.35rem 0 0' }}>
                            {node.physiological_role}
                          </p>
                        </div>

                        {node.key_cellular_mechanisms && node.key_cellular_mechanisms.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary, #4edea3)' }}>
                              Key Cellular Mechanisms
                            </span>
                            <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                              {node.key_cellular_mechanisms.map((mech, mi) => (
                                <li key={mi}>{mech}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {node.defined_terms && node.defined_terms.length > 0 && (
                          <div className="learn-glossary-section">
                            <h4 className="learn-glossary-title">Defined Scientific Terms &amp; Acronyms</h4>
                            <div className="learn-terms-grid">
                              {node.defined_terms.map((t, ti) => (
                                <div key={ti} className="learn-term-chip">
                                  <span className="learn-term-tag">{t.term}</span>
                                  <p className="learn-term-def">{t.definition}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {node.references_list && node.references_list.length > 0 && (
                          <div className="learn-references-box">
                            <strong>Traceable Scientific Citations:</strong>
                            {node.references_list.map((ref, ri) => (
                              <div key={ri} className="learn-reference-item">• {ref}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={`/explore?drug=${activeTab.slug}&view=3d`}
                  className="learn-milestone-btn"
                  style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                >
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

      {/* 4. Sourced FAQs Accordion */}
      {faqItems.length > 0 && (
        <section className="learn-section" aria-labelledby="faq-heading">
          <div className="learn-section__tag">
            <span>03</span>
            <div className="learn-section__tag-line" aria-hidden="true" />
            <span>Clinical Inquiries &amp; Pharmacodynamics</span>
          </div>

          <div>
            <h2 id="faq-heading" className="learn-section__heading">
              Frequently Asked Questions ({drug?.name || activeTab.label})
            </h2>
            <p className="learn-section__desc" style={{ marginTop: '0.35rem' }}>
              Structured, peer-reviewed clinical answers addressing bioavailability, metabolism, and therapeutic mechanisms.
            </p>
          </div>

          <Accordion items={faqItems} allowMultiple={false} />
        </section>
      )}
    </div>
  );
};

export default LearnPage;

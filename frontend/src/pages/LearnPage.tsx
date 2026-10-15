import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import { Accordion, SegmentedToggle } from '../components/ui';
import type { FoodCondition } from '../api/types';
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
  const [condition, setCondition] = useState<FoodCondition>('BEFORE_FOOD');

  // Match canonical ID or short slug
  const activeTab = DRUG_TABS.find(
    (t) => t.id === rawDrugParam || t.slug.toLowerCase() === rawDrugParam.toLowerCase()
  ) || DRUG_TABS[0];

  const { data, loading, error, refetch } = useContent(activeTab.id, condition);
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
              <span className="learn-metric-card__label">
                {activeTab.id === 'drug-insulin-004' ? 'Onset of Action' : 'Peak Onset (Tmax)'}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
                timer
              </span>
            </div>
            <div className="learn-metric-card__val">
              {loading ? '...' : drug?.tmax_hours != null ? `${drug.tmax_hours}` : '—'}{' '}
              <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant, #bac9cc)', fontWeight: 500 }}>hrs</span>
            </div>
            <p className="learn-metric-card__desc">
              {activeTab.id === 'drug-insulin-004'
                ? 'Clinical action onset (Peak Tmax: 1.5–3.5 hrs)'
                : 'Plasma peak absorption time'}
            </p>
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

      {/* 2.5 Food State & Regimen Dynamics (Data-Driven from database pathway_variations) */}
      <section className="learn-section" aria-labelledby="condition-dynamics-heading">
        <div className="learn-section__tag">
          <span>02</span>
          <div className="learn-section__tag-line" aria-hidden="true" />
          <span>Food State &amp; Meal Timing Dynamics</span>
        </div>

        <div className="learn-mechanism-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 id="condition-dynamics-heading" className="learn-section__heading" style={{ margin: 0 }}>
                Fasted vs. Fed State Dynamics
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                Compare how food presence modulates gastrointestinal transit, mucosal protection, and absorption speed.
              </p>
            </div>

            <SegmentedToggle<FoodCondition>
              value={condition}
              onChange={setCondition}
              options={[
                { value: 'BEFORE_FOOD', label: 'Before Food (Fasted)', icon: 'timer' },
                { value: 'AFTER_FOOD', label: 'After Food (Fed)', icon: 'restaurant' },
              ]}
              aria-label="Physiological food regimen selector"
            />
          </div>

          {data?.limitation_note && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                color: 'var(--color-primary-container, #00e5ff)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>info</span>
              <span>{data.limitation_note}</span>
            </div>
          )}

          {data?.pathway_variation && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--color-surface-container, #19202a)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: condition === 'AFTER_FOOD' ? 'rgba(78, 222, 163, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                    color: condition === 'AFTER_FOOD' ? '#4edea3' : '#00e5ff',
                  }}
                >
                  {data.pathway_variation.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                  Active Condition: <strong>{condition === 'AFTER_FOOD' ? 'Fed State' : 'Fasted State'}</strong>
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-on-surface, #dce3f0)' }}>
                {data.pathway_variation.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Physiological Milestones Stack (All Nodes with Plain-English + Scientific Drawers) */}
      <section className="learn-section" aria-labelledby="milestones-heading">
        <div className="learn-section__tag">
          <span>03</span>
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
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              margin: '1rem 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '24px' }}>
                cloud_off
              </span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#fca5a5', display: 'block' }}>
                  Educational Content Unavailable
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant, #bac9cc)' }}>
                  {error}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fee2e2',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                refresh
              </span>
              Retry
            </button>
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

                    {/* Condition Observation Badge */}
                    {node.variation && (
                      <div
                        style={{
                          fontSize: '0.775rem',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '6px',
                          background: condition === 'AFTER_FOOD' ? 'rgba(78, 222, 163, 0.08)' : 'rgba(0, 229, 255, 0.08)',
                          border: `1px solid ${condition === 'AFTER_FOOD' ? 'rgba(78, 222, 163, 0.2)' : 'rgba(0, 229, 255, 0.2)'}`,
                          color: 'var(--color-on-surface, #dce3f0)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          margin: '0.2rem 0',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px', color: condition === 'AFTER_FOOD' ? '#4edea3' : '#00e5ff' }}>
                          {condition === 'AFTER_FOOD' ? 'restaurant' : 'timer'}
                        </span>
                        <span>
                          <strong>{condition === 'AFTER_FOOD' ? 'Fed State Observation:' : 'Fasting Observation:'}</strong>{' '}
                          {node.variation.clinical_observation}
                        </span>
                      </div>
                    )}

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
            <span>04</span>
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

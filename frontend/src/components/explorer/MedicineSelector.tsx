import React from 'react';
import { Link } from 'react-router-dom';
import { DrugSummary } from '../../api/types';
import './medicineSelector.css';

export interface MedicineSelectorProps {
  drugs: DrugSummary[];
  onSelectDrug: (drugId: string) => void;
}

interface JourneyStep {
  name: string;
  organAsset: string;
  sublabel?: string;
}

export const MedicineSelector: React.FC<MedicineSelectorProps> = ({
  drugs,
  onSelectDrug,
}) => {
  // Predefined structured journey pipelines for the 4 medicines matching the 3D organ pipeline
  const getDrugJourneyLayout = (drugId: string): { row1: JourneyStep[]; row2?: JourneyStep[]; routeName: string } => {
    switch (drugId) {
      case 'drug-amoxicillin-002':
        return {
          routeName: 'Drug Journey (Oral Route)',
          row1: [
            { name: 'Mouth', organAsset: '/assets/organs/mouth.png' },
            { name: 'Esophagus', organAsset: '/assets/organs/esophagus.png' },
            { name: 'Stomach', organAsset: '/assets/organs/stomach.png' },
            { name: 'Small Intestine', organAsset: '/assets/organs/small-intestine.png' },
          ],
          row2: [
            { name: 'Bloodstream', organAsset: '/assets/organs/bloodstream.png' },
            { name: 'Infected Tissues', organAsset: '/assets/organs/infected-tissues.png' },
            { name: 'Kidneys', organAsset: '/assets/organs/kidneys.png' },
          ],
        };

      case 'drug-ambroxol-003':
        return {
          routeName: 'Drug Journey (Oral Route)',
          row1: [
            { name: 'Mouth', organAsset: '/assets/organs/mouth.png' },
            { name: 'Esophagus', organAsset: '/assets/organs/esophagus.png' },
            { name: 'Stomach', organAsset: '/assets/organs/stomach.png' },
            { name: 'Small Intestine', organAsset: '/assets/organs/small-intestine.png' },
          ],
          row2: [
            { name: 'Bloodstream', organAsset: '/assets/organs/bloodstream.png' },
            { name: 'Respiratory Tissues', organAsset: '/assets/organs/respiratory-tissues.png' },
            { name: 'Liver', organAsset: '/assets/organs/liver.png' },
            { name: 'Kidneys', organAsset: '/assets/organs/kidneys.png' },
          ],
        };

      case 'drug-insulin-004':
        return {
          routeName: 'Drug Journey (Injection Route)',
          row1: [
            { name: 'Injection Site', organAsset: '/assets/organs/injection-site.png' },
            { name: 'Bloodstream', organAsset: '/assets/organs/bloodstream.png' },
            { 
              name: 'Body Tissues', 
              organAsset: '/assets/organs/insulin-body-tissues.png',
              sublabel: '(Helps cells use glucose)'
            },
            { name: 'Liver / Kidneys', organAsset: '/assets/organs/liver-kidneys.png' },
          ],
        };

      case 'drug-ibuprofen-001':
      default:
        return {
          routeName: 'Drug Journey (Oral Route)',
          row1: [
            { name: 'Mouth', organAsset: '/assets/organs/mouth.png' },
            { name: 'Esophagus', organAsset: '/assets/organs/esophagus.png' },
            { name: 'Stomach', organAsset: '/assets/organs/stomach.png' },
            { name: 'Small Intestine', organAsset: '/assets/organs/small-intestine.png' },
          ],
          row2: [
            { name: 'Bloodstream', organAsset: '/assets/organs/bloodstream.png' },
            { name: 'Liver', organAsset: '/assets/organs/liver.png' },
            { name: 'Body Tissues', organAsset: '/assets/organs/body-tissues.png' },
            { name: 'Kidneys', organAsset: '/assets/organs/kidneys.png' },
          ],
        };
    }
  };

  const renderFormIcon = (form?: string) => {
    switch (form) {
      case 'Capsules':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        );
      case 'Syrups':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2v2a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2V2" />
            <path d="M6 14h12" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        );
      case 'Injections':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m18 2 4 4" />
            <path d="m17 7 3-3" />
            <path d="M19 9 8.7 19.3c-.4.4-1 .6-1.6.6H3v-4.1c0-.6.2-1.2.6-1.6L14 3.9" />
            <path d="m9 11 4 4" />
            <path d="m5 19-3 3" />
            <path d="m14 4 6 6" />
          </svg>
        );
      case 'Tablets':
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M7 17 17 7" />
          </svg>
        );
    }
  };

  return (
    <div className="medicine-selector-container">
      {/* Background Ambient Glow */}
      <div className="medicine-selector-backdrop" aria-hidden="true" />

      {/* Header Section */}
      <header className="medicine-selector-header">
        <div className="medicine-explore-badge">
          <span className="material-symbols-outlined medicine-explore-badge-icon">
            explore
          </span>
          <span className="medicine-explore-badge-text">Explore</span>
        </div>

        <h1 className="medicine-selector-title">
          Choose a <span className="medicine-title-highlight">Medicine</span>
        </h1>

        <p className="medicine-selector-subtitle">
          Select a medicine to explore its journey through the human body in an interactive 3D experience.
        </p>

        {/* Feature Badges */}
        <div className="medicine-features-row" aria-label="Explore Capabilities">
          <div className="medicine-feature-pill">
            <span className="material-symbols-outlined">view_in_ar</span>
            <span>3D Anatomical Visualisation</span>
          </div>

          <div className="medicine-feature-pill">
            <span className="material-symbols-outlined">menu_book</span>
            <span>Understand Mechanism</span>
          </div>

          <div className="medicine-feature-pill">
            <span className="material-symbols-outlined">bar_chart</span>
            <span>See Real-time Drug Journey</span>
          </div>

          <div className="medicine-feature-pill">
            <span className="material-symbols-outlined">crisis_alert</span>
            <span>Compare Effects</span>
          </div>
        </div>
      </header>

      {/* 4 Cards Grid */}
      <div className="medicine-cards-grid" role="region" aria-label="Available Medicines for Exploration">
        {drugs.map((drug) => {
          const journey = getDrugJourneyLayout(drug.id);

          return (
            <article key={drug.id} className="medicine-card">
              <div>
                {/* Card Top Category Header */}
                <div className="medicine-card-header">
                  <div className="medicine-card-category">
                    <div className="medicine-category-icon-badge">
                      {renderFormIcon(drug.form)}
                    </div>
                    <span className="medicine-category-name">{drug.form || 'Tablets'}</span>
                  </div>

                  <div className="medicine-card-chevron" aria-hidden="true">
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_right
                    </span>
                  </div>
                </div>

                {/* Drug Name & Dosage Badge */}
                <div className="medicine-card-title-group">
                  <h2 className="medicine-card-name">{drug.name}</h2>
                  <span className="medicine-card-dosage-badge">
                    {drug.dosage || (drug.brand_name?.includes('400 mg') ? '400 mg Tablet' : drug.category)}
                  </span>
                  <p className="medicine-card-indication">
                    {drug.indication || drug.description}
                  </p>
                </div>

                {/* 3D Product Render Image */}
                <div className="medicine-card-image-box">
                  <img
                    src={drug.image_url || '/assets/drugs/ibuprofen.jpg'}
                    alt={`Pharmaceutical formulation of ${drug.name}`}
                    className="medicine-card-image"
                    loading="lazy"
                  />
                </div>

                {/* Mini Drug Journey Pipeline */}
                <div className="medicine-journey-box">
                  <div className="medicine-journey-title">
                    {journey.routeName}
                  </div>

                  <div className="medicine-journey-rows">
                    {/* Row 1 */}
                    <div className="medicine-journey-step-row">
                      {journey.row1.map((step, idx) => (
                        <React.Fragment key={step.name}>
                          <div className="medicine-journey-node">
                            <div className="medicine-organ-img-wrapper">
                              <img
                                src={step.organAsset}
                                alt={step.name}
                                className="medicine-organ-img"
                                loading="lazy"
                              />
                            </div>
                            <span className="medicine-node-label">{step.name}</span>
                            {step.sublabel && (
                              <span className="medicine-node-sublabel">{step.sublabel}</span>
                            )}
                          </div>
                          {idx < journey.row1.length - 1 && (
                            <span className="medicine-journey-arrow" aria-hidden="true">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Row 2 (if present) */}
                    {journey.row2 && journey.row2.length > 0 && (
                      <div className="medicine-journey-step-row" style={{ marginTop: '0.4rem' }}>
                        {journey.row2.map((step, idx) => (
                          <React.Fragment key={step.name}>
                            <div className="medicine-journey-node">
                              <div className="medicine-organ-img-wrapper">
                                <img
                                  src={step.organAsset}
                                  alt={step.name}
                                  className="medicine-organ-img"
                                  loading="lazy"
                                />
                              </div>
                              <span className="medicine-node-label">{step.name}</span>
                              {step.sublabel && (
                                <span className="medicine-node-sublabel">{step.sublabel}</span>
                              )}
                            </div>
                            {idx < journey.row2!.length - 1 && (
                              <span className="medicine-journey-arrow" aria-hidden="true">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="medicine-card-actions">
                <button
                  type="button"
                  className="medicine-explore-btn"
                  onClick={() => onSelectDrug(drug.id)}
                  aria-label={`Explore 3D Pathway for ${drug.name}`}
                >
                  <span>Explore 3D Pathway</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>

                <Link
                  to={`/learn?drug=${encodeURIComponent(drug.id)}`}
                  className="medicine-learn-link"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    menu_book
                  </span>
                  <span>Learn more about {drug.name.split(' ')[0]}</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

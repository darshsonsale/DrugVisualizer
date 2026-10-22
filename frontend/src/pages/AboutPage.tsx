import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css';

interface ProjectObjective {
  icon: string;
  title: string;
  description: string;
}

interface ProjectFeature {
  icon: string;
  badge: string;
  title: string;
  description: string;
}

const OBJECTIVES: ProjectObjective[] = [
  {
    icon: 'visibility',
    title: 'See the Medicine Journey in 3D',
    description:
      'Instead of reading heavy medical books, you can watch how a medicine moves through the body step-by-step on a 3D model.',
  },
  {
    icon: 'biotech',
    title: 'Understand How Medicines Work',
    description:
      'Learn how your body takes in a medicine, sends it through the blood, uses it to relieve pain or fight illness, and cleans it out.',
  },
  {
    icon: 'restaurant',
    title: 'See Why Food Matters',
    description:
      'Find out why some medicines must be taken after food while others work best on an empty stomach, and how food changes their speed.',
  },
  {
    icon: 'school',
    title: 'Practice & Check Your Learning',
    description:
      'Test your knowledge with quick, easy quizzes and track your scores so you can see how much you have learned.',
  },
];

const FEATURES: ProjectFeature[] = [
  {
    icon: 'view_in_ar',
    badge: '3D View',
    title: 'Interactive 3D Human Body',
    description:
      'Rotate, zoom in, and click on body organs to follow the path of medicine smoothly in 3D.',
  },
  {
    icon: 'medication',
    badge: 'Medicines',
    title: 'Four Common Medicines',
    description:
      'Explore popular medicines: Ibuprofen (tablet), Amoxicillin (capsule), Ambroxol (cough syrup), and Insulin (injection).',
  },
  {
    icon: 'fastfood',
    badge: 'Food Modes',
    title: 'Before & After Food Modes',
    description:
      'Switch between empty stomach and after-meal modes to see how food slows down or speeds up medicine action.',
  },
  {
    icon: 'menu_book',
    badge: 'Easy Guides',
    title: 'Simple Organ Guides',
    description:
      'Read short, clear explanations of what the stomach, liver, bloodstream, and kidneys do for each medicine.',
  },
  {
    icon: 'quiz',
    badge: 'Quizzes',
    title: 'Quick Practice Quizzes',
    description:
      'Choose a set of 5 questions for any medicine. Answer them and instantly see the correct answers with simple explanations.',
  },
  {
    icon: 'analytics',
    badge: 'Progress',
    title: 'Easy Progress Tracking',
    description:
      'View your quiz history, see your scores as percentages, and review right and wrong answers anytime.',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-ambient-glow-1" aria-hidden="true" />
      <div className="about-ambient-glow-2" aria-hidden="true" />

      {/* ===================================================================
          1. HERO SECTION (Clear & Simple Language)
          =================================================================== */}
      <section className="about-hero" aria-label="About BioLumen Introduction">
        <div className="about-hero__content">
          <div className="about-eyebrow">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              biotech
            </span>
            <span>ABOUT BIOLUMEN</span>
          </div>

          <h1 className="about-hero__title">
            Understand How Medicines Work{' '}
            <span className="about-hero__highlight">Inside Your Body</span>
          </h1>

          <p className="about-hero__subtitle">
            BioLumen makes learning medicine simple and visual. Watch how medicines travel
            through your body step-by-step—from the moment you take them, to how they help
            you feel better, to how your body clears them out.
          </p>

          <div className="about-hero__actions">
            <Link to="/explore" className="about-btn-primary">
              <span>Explore Medicine Journey</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>

            <Link to="/learn" className="about-btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>
                menu_book
              </span>
              <span>Start Learning</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="about-hero__card">
          <div className="about-hero__img-box">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcxvqAuhfBz7s4dsQn8gU807l38WsKo_W8EzXp7PAGvIfJu29glEirq27pb0o215Z4Lf9GaYD2qJPoahFX8Y-IycTy4kKdQnOWW9V_JQgY_wqe7pv4ZenaA9HN4sVCDRDHBg5-xKgRL_IbGlsPtXwrdydGnNJMSmGzHsXh9dV3mOTRNTLnOZq3tdZE6ChkITdV03ZQgCQ6P9YBoKFbap5KOZjNiyc-60tHBraEWWA1"
              alt="BioLumen 3D human body visualization showing medicine pathway milestones"
              className="about-hero__img"
            />
            <div className="about-hero__img-overlay" aria-hidden="true" />
            <div className="about-hero__status-badge">
              <span className="about-hero__status-dot" aria-hidden="true" />
              <span>BioLumen 3D Simulation</span>
            </div>
            <div className="about-hero__card-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-primary-container)' }}>
                  science
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Interactive Medicine Learning
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                7 Simple Body Steps
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. OBJECTIVES OF OUR PROJECT ("What Our Project Actually Does")
          =================================================================== */}
      <section className="about-section" aria-labelledby="project-objectives-title">
        <div className="about-section__header">
          <div className="about-eyebrow">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              flag
            </span>
            <span>PROJECT OBJECTIVES</span>
          </div>
          <h2 id="project-objectives-title" className="about-section__title">
            What Our Project Actually Does
          </h2>
          <p className="about-section__desc">
            We built BioLumen to make learning about medicines simple, visual, and easy to understand for everyone.
          </p>
        </div>

        <div className="about-objectives-grid">
          {OBJECTIVES.map((obj) => (
            <div key={obj.title} className="about-objective-card">
              <div className="about-objective-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                  {obj.icon}
                </span>
              </div>
              <h3 className="about-objective-title">{obj.title}</h3>
              <p className="about-objective-text">{obj.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          3. KEY FEATURES OF OUR PROJECT ("Features of Our Project")
          =================================================================== */}
      <section className="about-section" aria-labelledby="project-features-title">
        <div className="about-section__header">
          <div className="about-eyebrow">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              auto_awesome
            </span>
            <span>KEY FEATURES</span>
          </div>
          <h2 id="project-features-title" className="about-section__title">
            Features of Our Project
          </h2>
          <p className="about-section__desc">
            Here are the main features you can use inside BioLumen to learn easily.
          </p>
        </div>

        <div className="about-features-grid">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="about-feature-card">
              <div className="about-feature-header">
                <div className="about-feature-icon-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    {feat.icon}
                  </span>
                </div>
                <span className="about-feature-badge">{feat.badge}</span>
              </div>
              <h3 className="about-feature-title">{feat.title}</h3>
              <p className="about-feature-desc">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  SegmentedToggle,
  StatCard,
  Panel,
  ProgressBar,
  Accordion,
} from '../components/ui';

export const HomePage: React.FC = () => {
  const [toggleState, setToggleState] = useState<'alpha' | 'beta'>('alpha');
  const [tabState, setTabState] = useState<'overview' | 'telemetry' | 'diagnostics'>('overview');
  const [progressVal, setProgressVal] = useState<number>(65);

  const demoToggleOptions = [
    { value: 'alpha' as const, label: 'Mode Alpha', icon: 'tune' },
    { value: 'beta' as const, label: 'Mode Beta', icon: 'settings' },
  ];

  const demoTabOptions = [
    { value: 'overview' as const, label: 'Overview' },
    { value: 'telemetry' as const, label: 'Telemetry' },
    { value: 'diagnostics' as const, label: 'Diagnostics' },
  ];

  const demoAccordionItems = [
    {
      id: 'acc-1',
      title: 'Design System Architecture',
      icon: 'palette',
      content:
        'The BioLumen Pharmacology design system establishes cohesive colors, dark surfaces, and typography tokens across all application components.',
      defaultExpanded: true,
    },
    {
      id: 'acc-2',
      title: 'Component Reusability & Data Decoupling',
      icon: 'widgets',
      content:
        'All UI primitives accept generic typed properties and remain strictly decoupled from backend pharmacological domain models.',
    },
    {
      id: 'acc-3',
      title: 'Accessibility & Keyboard Navigation',
      icon: 'keyboard',
      content:
        'Interactive components implement WAI-ARIA roles, universal focus rings, and full keyboard navigation across all screen sizes.',
    },
  ];

  return (
    <div className="showcase-container">
      {/* Header Showcase Introduction */}
      <header className="showcase-header">
        <div className="pill-badge">
          <span className="pill-dot" />
          Task 04 — Design System & Primitives
        </div>
        <h1 className="placeholder-title" style={{ fontSize: '32px' }}>
          BioLumen UI Component Library
        </h1>
        <p className="placeholder-desc" style={{ maxWidth: '680px' }}>
          Foundational, data-independent UI primitives built with the BioLumen visual language
          for the Drug Path Visualiser. Tested for desktop and mobile responsiveness.
        </p>
      </header>

      {/* Grid Section 1: Buttons & Badges */}
      <div className="showcase-grid">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Interactive Buttons</CardTitle>
            <CardDescription>Variants, sizes, loading indicators, and states</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="showcase-row">
              <Button variant="primary" size="md">
                Primary Action
              </Button>
              <Button variant="secondary" size="md">
                Secondary
              </Button>
              <Button variant="outline" size="md">
                Outline
              </Button>
              <Button variant="ghost" size="md">
                Ghost
              </Button>
            </div>

            <div className="showcase-row">
              <Button
                variant="primary"
                size="sm"
                icon={<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>}
              >
                Small Pill
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>}
                iconPosition="right"
              >
                Large Action
              </Button>
              <Button variant="primary" size="md" isLoading>
                Processing
              </Button>
              <Button variant="primary" size="md" disabled>
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Pill Badges & Status Tags</CardTitle>
            <CardDescription>Status indicators with optional pulsating glow dots</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="showcase-row">
              <Badge variant="cyan" dot>
                Telemetry Active
              </Badge>
              <Badge variant="emerald" dot>
                System Verified
              </Badge>
              <Badge variant="amber" dot>
                Pending Analysis
              </Badge>
              <Badge variant="error" dot>
                Alert Notice
              </Badge>
              <Badge variant="neutral">
                Neutral Tag
              </Badge>
            </div>

            <div className="showcase-row">
              <Badge variant="cyan" size="sm">
                Small Pill
              </Badge>
              <Badge variant="emerald" size="sm">
                100% Complete
              </Badge>
              <Badge variant="neutral" size="sm">
                v0.1.0
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Section 2: Segmented Toggles & Progress Bar */}
      <div className="showcase-grid">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Segmented Pill Switches</CardTitle>
            <CardDescription>Accessible radiogroup toggles with keyboard arrow control</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>
                Two-State Toggle (e.g., Mode Switcher):
              </p>
              <SegmentedToggle
                options={demoToggleOptions}
                value={toggleState}
                onChange={setToggleState}
                aria-label="Mode Selection"
              />
            </div>

            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>
                Multi-Option Tab Switcher:
              </p>
              <SegmentedToggle
                options={demoTabOptions}
                value={tabState}
                onChange={setTabState}
                aria-label="Tab Selection"
                fullWidth
              />
            </div>
          </CardContent>
          <CardFooter>
            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
              Active Mode: <strong style={{ color: 'var(--color-primary)' }}>{toggleState}</strong> • Active Tab: <strong style={{ color: 'var(--color-primary)' }}>{tabState}</strong>
            </span>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Progress & Telemetry Bar</CardTitle>
            <CardDescription>Luminous glowing progress track with animated fill</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <ProgressBar
              value={progressVal}
              label="Simulation Cycle"
              subLabel="(Checkpoint 3 of 5)"
              variant="cyan"
            />
            <ProgressBar
              value={88}
              label="System Integrity Index"
              variant="emerald"
              size="sm"
            />
            <div className="showcase-row" style={{ marginTop: 'var(--space-xs)' }}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setProgressVal((prev) => Math.max(0, prev - 15))}
              >
                Decrease
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setProgressVal((prev) => Math.min(100, prev + 15))}
              >
                Increase
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Section 3: StatCards & Accordion */}
      <div className="showcase-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Telemetry Stat Cards
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
            <StatCard
              label="Metric Index"
              value="94.2"
              unit="%"
              description="Calibrated benchmark standard"
              icon="monitoring"
              variant="cyan"
              highlight
            />
            <StatCard
              label="Cycle Duration"
              value="45"
              unit="sec"
              description="Observed execution period"
              icon="timer"
              variant="emerald"
            />
            <StatCard
              label="Buffer Delta"
              value="+18"
              unit="ms"
              description="Variance threshold limit"
              icon="trending_up"
              variant="amber"
            />
            <StatCard
              label="Node Count"
              value="7 / 7"
              unit="Active"
              description="Total operational milestones"
              icon="hub"
              variant="neutral"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Accordion Disclosures
          </h2>
          <Accordion items={demoAccordionItems} allowMultiple />
        </div>
      </div>

      {/* Section 4: Reusable Panel / Drawer Preview */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 'var(--space-md)' }}>
          Inspector Panel Container
        </h2>
        <Panel
          title="Component Inspection Dock"
          subtitle="Structural container for explorer drawers, inspection nodes, and toolbars"
          headerAction={<Badge variant="cyan">Docked</Badge>}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <Button variant="secondary" size="sm">
                Reset
              </Button>
              <Button variant="primary" size="sm">
                Apply Parameters
              </Button>
            </div>
          }
        >
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-on-surface-variant)' }}>
            This Panel primitive encapsulates the exact header-body-footer layout used in the 
            right-hand node inspector drawer and the left-hand milestone track in the upcoming 
            Pathway Explorer interface (Task 06).
          </p>
        </Panel>
      </div>
    </div>
  );
};

export default HomePage;

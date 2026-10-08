import React from 'react';
import { usePathway } from '../hooks/usePathway';
import { FoodCondition } from '../api/types';
import {
  Card,
  Badge,
  Button,
  SegmentedToggle,
  StatCard,
  ProgressBar,
} from '../components/ui';

export const ExplorerPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    condition,
    isMockData,
    source,
    setCondition,
    refetch,
  } = usePathway('drug-ibuprofen-001', 'BEFORE_FOOD');

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Task 05 Verification Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <Badge variant="cyan" size="sm" dot>
            Task 05 Data Layer Active
          </Badge>

          {source && (
            <Badge
              variant={source === 'api' ? 'emerald' : 'cyan'}
              size="sm"
            >
              {source === 'api' ? 'Source: Live REST API' : 'Source: Development Fixture'}
            </Badge>
          )}

          {isMockData && (
            <Badge variant="amber" size="sm">
              Offline Fallback
            </Badge>
          )}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {data ? data.drug.name : 'Pathway Explorer'}
          {data?.drug.brand_name && (
            <span style={{ fontSize: '1.125rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
              ({data.drug.brand_name})
            </span>
          )}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.6 }}>
          {data
            ? data.drug.description
            : 'Fetching pharmacokinetic and physiological pathway data via the centralized API client...'}
        </p>
      </div>

      {/* Condition Selector & Controls */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Physiological Condition
            </div>
            <SegmentedToggle<FoodCondition>
              value={condition}
              onChange={(newCond) => setCondition(newCond)}
              options={[
                { value: 'BEFORE_FOOD', label: 'Before Food (Fasting)', icon: 'timer' },
                { value: 'AFTER_FOOD', label: 'After Food (Fed State)', icon: 'restaurant' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={() => refetch()}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refetch Data'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && !data && (
        <Card style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <ProgressBar value={100} animated variant="cyan" size="sm" showPercent={false} style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Retrieving Pathway Contract
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Querying physiological graph for {condition === 'BEFORE_FOOD' ? 'fasting state' : 'fed state'}...
          </p>
        </Card>
      )}

      {/* Error State */}
      {error && !data && (
        <Card style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'var(--color-danger, #ef4444)', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span className="material-symbols-outlined">error</span>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Failed to Load Pathway Data
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {error}
          </p>
          <Button variant="primary" size="sm" icon="refresh" onClick={() => refetch()}>
            Retry Request
          </Button>
        </Card>
      )}

      {/* Data State */}
      {data && (
        <>
          {/* Pharmacokinetic Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard
              label="Bioavailability"
              value={data.drug.bioavailability_pct ?? 0}
              unit="%"
              icon="vital_signs"
              variant="cyan"
              description="Oral systemic fraction"
            />
            <StatCard
              label="Cmax"
              value={data.drug.cmax_ug_ml ?? 0}
              unit="µg/mL"
              icon="trending_up"
              variant="emerald"
              description="Peak plasma concentration"
            />
            <StatCard
              label="Tmax (Peak Time)"
              value={data.drug.tmax_hours ?? 0}
              unit="hours"
              icon="schedule"
              variant="amber"
              description={`Under ${condition === 'BEFORE_FOOD' ? 'fasting' : 'fed'} condition`}
            />
            <StatCard
              label="Elimination Half-life"
              value={data.drug.half_life_hours ?? 0}
              unit="hours"
              icon="timelapse"
              variant="neutral"
              description="Terminal plasma half-life"
            />
          </div>

          {/* Physiological Node Checkpoints */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Physiological Transit Waypoints ({data.nodes.length} Stations)
              </h2>
              <Badge variant="neutral" size="sm">
                Pathway ID: {data.pathway.id}
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.nodes.map((node) => (
                <Card key={node.id} variant="interactive" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(0, 242, 254, 0.12)',
                          color: 'var(--brand-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {node.node_order}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                          {node.name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {node.anatomical_location} • {node.organ_system}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {node.content?.micro_environment_ph !== undefined && (
                        <Badge variant="cyan" size="sm">
                          pH {node.content.micro_environment_ph.toFixed(1)}
                        </Badge>
                      )}
                      <Badge variant="neutral" size="sm">
                        {node.estimated_time_minutes} min transit
                      </Badge>
                    </div>
                  </div>

                  {node.content && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0', lineHeight: 1.5 }}>
                      {node.content.general_description}
                    </p>
                  )}

                  {node.variation && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: '3px solid var(--brand-emerald)',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <strong style={{ color: 'var(--brand-emerald)' }}>Condition Effect: </strong>
                      {node.variation.clinical_observation}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Boundary / Scope Notice */}
      <Card style={{ background: 'rgba(255, 255, 255, 0.01)', borderStyle: 'dashed', textAlign: 'center', padding: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          <strong>Task 05 Verification Harness:</strong> Data layer, HTTP client, and custom hook verified. Full 3-column workspace, milestone navigation, and 3D canvas deferred to <strong>Task 06 – 08</strong>.
        </p>
      </Card>
    </div>
  );
};

export default ExplorerPage;

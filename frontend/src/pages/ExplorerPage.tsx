import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePathway } from '../hooks/usePathway';
import { FoodCondition, DrugSummary } from '../api/types';
import { PathwayService } from '../services/pathwayService';
import {
  ExplorerHeader,
  MilestoneRail,
  Viewport3DCanvas,
  NodeInspector,
  TimelineBar,
  ExplorerSkeleton,
  InspectorTab,
  MedicineSelector,
} from '../components/explorer';
import { Button, Card } from '../components/ui';
import '../components/explorer/explorer.css';

export const ExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramDrug = searchParams.get('drug');
  const paramView = searchParams.get('view');

  const [availableDrugs, setAvailableDrugs] = useState<DrugSummary[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState<string>(paramDrug || 'drug-ibuprofen-001');
  // Default to selector view unless user requested 3d view via param
  const [currentView, setCurrentView] = useState<'selector' | 'workspace'>(
    paramView === '3d' ? 'workspace' : 'selector'
  );

  // Load drug metadata from PathwayService
  useEffect(() => {
    PathwayService.getDrugs()
      .then((res) => {
        setAvailableDrugs(res.data);
      })
      .catch((err) => {
        console.warn('Failed to load drugs list:', err);
      });
  }, []);

  // Synchronize state with URL parameters
  useEffect(() => {
    if (paramDrug) {
      setSelectedDrugId(paramDrug);
    }
    if (paramView === '3d') {
      setCurrentView('workspace');
    } else if (paramView === 'selector') {
      setCurrentView('selector');
    }
  }, [paramDrug, paramView]);

  const {
    data,
    loading,
    error,
    condition,
    setCondition,
    refetch,
  } = usePathway(selectedDrugId, 'BEFORE_FOOD');

  // Selected node state for the workspace
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [isAutoTransitActive, setIsAutoTransitActive] = useState<boolean>(false);
  const [transitSpeed, setTransitSpeed] = useState<number>(1);

  // Synchronize initial node selection when data arrives or drug changes
  useEffect(() => {
    if (data?.nodes?.length) {
      setSelectedNodeId(data.nodes[0].id);
    }
  }, [data]);

  // If selected node is no longer in nodes list, fallback to first node
  const activeNodeId = useMemo(() => {
    if (!data?.nodes?.length) return '';
    if (selectedNodeId && data.nodes.some((n) => n.id === selectedNodeId)) {
      return selectedNodeId;
    }
    return data.nodes[0].id;
  }, [data, selectedNodeId]);

  const selectedNode = useMemo(() => {
    if (!data?.nodes?.length) return null;
    return data.nodes.find((n) => n.id === activeNodeId) || data.nodes[0];
  }, [data, activeNodeId]);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleToggleAutoTransit = useCallback(() => {
    setIsAutoTransitActive((prev) => !prev);
  }, []);

  const handleNextNode = useCallback(() => {
    if (!data?.nodes?.length) return;
    const currentIndex = data.nodes.findIndex((n) => n.id === activeNodeId);
    const nextIndex = (currentIndex + 1) % data.nodes.length;
    setSelectedNodeId(data.nodes[nextIndex].id);
  }, [data, activeNodeId]);

  const handlePrevNode = useCallback(() => {
    if (!data?.nodes?.length) return;
    const currentIndex = data.nodes.findIndex((n) => n.id === activeNodeId);
    const prevIndex = (currentIndex - 1 + data.nodes.length) % data.nodes.length;
    setSelectedNodeId(data.nodes[prevIndex].id);
  }, [data, activeNodeId]);

  const handleResetTransit = useCallback(() => {
    if (data?.nodes?.length) {
      setSelectedNodeId(data.nodes[0].id);
    }
  }, [data]);

  const handleSelectDrug = useCallback(
    (drugId: string) => {
      setSelectedDrugId(drugId);
      setSelectedNodeId(null);
      setCurrentView('workspace');
      setSearchParams({ drug: drugId, view: '3d' });
    },
    [setSearchParams]
  );

  const handleBackToSelector = useCallback(() => {
    setCurrentView('selector');
    setSearchParams({});
  }, [setSearchParams]);

  // Auto-transit animation loop with speed scaling
  useEffect(() => {
    if (!isAutoTransitActive || !data?.nodes?.length) return;

    const intervalTime = Math.max(1200, Math.round(3600 / transitSpeed));
    const interval = setInterval(() => {
      setSelectedNodeId((currentId) => {
        const nodes = data.nodes;
        const currentIndex = nodes.findIndex((n) => n.id === currentId);
        const nextIndex = (currentIndex + 1) % nodes.length;
        return nodes[nextIndex].id;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isAutoTransitActive, data, transitSpeed]);

  // If in selector view, render the Choose a Medicine screen!
  if (currentView === 'selector') {
    return (
      <main className="explorer-page-root" aria-label="Choose a Medicine">
        <MedicineSelector
          drugs={availableDrugs.length > 0 ? availableDrugs : (data?.drug ? [data.drug] : [])}
          onSelectDrug={handleSelectDrug}
        />
      </main>
    );
  }

  // Loading State for Workspace
  if (loading && !data) {
    return <ExplorerSkeleton />;
  }

  // Error State
  if (error && !data) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <Card style={{ padding: '3rem', textAlign: 'center', borderColor: 'var(--color-danger, #ef4444)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Unable to Load Pathway Workspace
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={handleBackToSelector}>
              Back to Medicines
            </Button>
            <Button variant="primary" icon="refresh" onClick={() => refetch()}>
              Retry Connection
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Empty State Fallback
  if (!data || !selectedNode) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Pathway Data Available
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            No anatomical milestones found for the selected drug regimen.
          </p>
          <Button variant="secondary" onClick={handleBackToSelector}>
            Back to Medicines
          </Button>
        </Card>
      </div>
    );
  }

  // Active Pathway Explorer Workspace
  return (
    <main className="explorer-workspace" aria-label="Pathway Explorer Workspace">
      {/* 1. Header Controls Strip */}
      <ExplorerHeader
        drug={data.drug}
        condition={condition}
        onConditionChange={(newCondition: FoodCondition) => setCondition(newCondition)}
        loading={loading}
        onBackToSelector={handleBackToSelector}
      />

      {/* 2. Total Pharmacokinetic Progression Timeline Strip (Above Diagram) */}
      <TimelineBar
        nodes={data.nodes}
        selectedNodeId={activeNodeId}
        onSelectNode={handleSelectNode}
        condition={condition}
      />

      {/* 3. Main Tri-Pane Workstation Grid */}
      <div className="explorer-grid">
        {/* Left Column: Milestones Rail */}
        <MilestoneRail
          nodes={data.nodes}
          selectedNodeId={activeNodeId}
          onSelectNode={handleSelectNode}
        />

        {/* Center Column: 3D Anatomical Viewport Canvas */}
        <Viewport3DCanvas
          nodes={data.nodes}
          edges={data.edges}
          selectedNodeId={activeNodeId}
          onSelectNode={handleSelectNode}
          isAutoTransitActive={isAutoTransitActive}
          onToggleAutoTransit={handleToggleAutoTransit}
          condition={condition}
          transitSpeed={transitSpeed}
          onSpeedChange={setTransitSpeed}
          onNextNode={handleNextNode}
          onPrevNode={handlePrevNode}
          onResetTransit={handleResetTransit}
          drugName={data.drug?.name}
        />

        {/* Right Column: Node Detailed Inspector Drawer */}
        <NodeInspector
          selectedNode={selectedNode}
          nodes={data.nodes}
          onSelectNode={handleSelectNode}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </main>
  );
};

export default ExplorerPage;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathway } from '../hooks/usePathway';
import { FoodCondition } from '../api/types';
import {
  ExplorerHeader,
  MilestoneRail,
  Viewport3DCanvas,
  NodeInspector,
  TimelineBar,
  ExplorerSkeleton,
  InspectorTab,
} from '../components/explorer';
import { Button, Card } from '../components/ui';
import '../components/explorer/explorer.css';

export const ExplorerPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    condition,
    setCondition,
    refetch,
  } = usePathway('drug-ibuprofen-001', 'BEFORE_FOOD');

  // Selected node state for the workspace
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [isAutoTransitActive, setIsAutoTransitActive] = useState<boolean>(false);

  // Synchronize initial node selection when data arrives
  useEffect(() => {
    if (data?.nodes?.length && !selectedNodeId) {
      setSelectedNodeId(data.nodes[0].id);
    }
  }, [data, selectedNodeId]);

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

  // Auto-transit animation loop
  useEffect(() => {
    if (!isAutoTransitActive || !data?.nodes?.length) return;

    const interval = setInterval(() => {
      setSelectedNodeId((currentId) => {
        const nodes = data.nodes;
        const currentIndex = nodes.findIndex((n) => n.id === currentId);
        const nextIndex = (currentIndex + 1) % nodes.length;
        return nodes[nextIndex].id;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoTransitActive, data]);

  // Loading State
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

          <Button variant="primary" icon="refresh" onClick={() => refetch()}>
            Retry Connection
          </Button>
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
          <Button variant="secondary" onClick={() => refetch()}>
            Reload Data
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
      />

      {/* 2. Main Tri-Pane Workstation Grid */}
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
          selectedNodeId={activeNodeId}
          onSelectNode={handleSelectNode}
          isAutoTransitActive={isAutoTransitActive}
          onToggleAutoTransit={handleToggleAutoTransit}
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

      {/* 3. Bottom Horizontal Pharmacokinetic Progression Timeline */}
      <TimelineBar
        nodes={data.nodes}
        selectedNodeId={activeNodeId}
        onSelectNode={handleSelectNode}
        condition={condition}
      />
    </main>
  );
};

export default ExplorerPage;

import React, { useMemo } from 'react';
import { PathwayNodeWithDetails, PathwayEdge as PathwayEdgeType } from '../../api/types';
import { resolveNodeVisualPosition } from './types';
import { PathwayNode } from './PathwayNode';
import { PathwayEdge } from './PathwayEdge';

export interface PathwaySceneProps {
  nodes: PathwayNodeWithDetails[];
  edges: PathwayEdgeType[];
  selectedNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

export const PathwayScene: React.FC<PathwaySceneProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}) => {
  // Active node index calculation
  const activeIndex = useMemo(() => {
    if (!selectedNodeId || !nodes.length) return 0;
    const idx = nodes.findIndex((n) => n.id === selectedNodeId);
    return idx >= 0 ? idx : 0;
  }, [nodes, selectedNodeId]);

  // Spatial coordinate lookup map for all nodes in the dataset
  const nodePositionMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    nodes.forEach((node, index) => {
      map[node.id] = resolveNodeVisualPosition(node.id, index, nodes.length);
    });
    return map;
  }, [nodes]);

  return (
    <group name="PathwayScene">
      {/* 1. Render all 3D Edges connecting appropriate nodes */}
      <group name="PathwayEdges">
        {edges.map((edge) => {
          const fromPos = nodePositionMap[edge.from_node_id];
          const toPos = nodePositionMap[edge.to_node_id];

          if (!fromPos || !toPos) return null;

          const fromIdx = nodes.findIndex((n) => n.id === edge.from_node_id);
          const toIdx = nodes.findIndex((n) => n.id === edge.to_node_id);

          const isTraversed = toIdx <= activeIndex;
          const isCurrentSegment = fromIdx === activeIndex;
          const status = isCurrentSegment
            ? 'active'
            : isTraversed
            ? 'traversed'
            : 'future';

          return (
            <PathwayEdge
              key={edge.id}
              edge={edge}
              fromPosition={fromPos}
              toPosition={toPos}
              status={status}
              isCurrentSegment={isCurrentSegment}
            />
          );
        })}
      </group>

      {/* 2. Render all 3D Nodes with raycasting & billboard labels */}
      <group name="PathwayNodes">
        {nodes.map((node, index) => {
          const position = nodePositionMap[node.id] || [0, 0, 0];
          const isActive = node.id === selectedNodeId;
          const isTraversed = index <= activeIndex;
          const stepNumber = node.node_order || index + 1;

          return (
            <PathwayNode
              key={node.id}
              node={node}
              position={position}
              stepNumber={stepNumber}
              isActive={isActive}
              isTraversed={isTraversed}
              onSelect={onSelectNode}
            />
          );
        })}
      </group>
    </group>
  );
};

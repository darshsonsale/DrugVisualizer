import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneEnvironment } from './SceneEnvironment';
import { CameraController } from './CameraController';
import { HolographicTorso } from '../anatomy/HolographicTorso';
import { OrganVolumes } from '../anatomy/OrganVolumes';
import { LandmarkAnchors } from '../anatomy/LandmarkAnchors';
import { PathwayScene } from '../PathwayScene';
import { PathwayNodeWithDetails, PathwayEdge } from '../../../api/types';

export interface AnatomicalCanvasProps {
  nodes?: PathwayNodeWithDetails[];
  edges?: PathwayEdge[];
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
  className?: string;
  transparentBackground?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
}

export const AnatomicalCanvas: React.FC<AnatomicalCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  className = '',
  transparentBackground = true,
  enableRotate = true,
  enableZoom = true,
}) => {
  return (
    <div
      className={`anatomical-canvas-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: transparentBackground ? 'transparent' : '#080f18',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.45, 4.8], fov: 48, near: 0.1, far: 20 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment />
          <CameraController enableRotate={enableRotate} enableZoom={enableZoom} />

          {/* Master Centered Anatomical & Pathway Group */}
          <group position={[0, -0.1, 0]}>
            <HolographicTorso />
            <OrganVolumes selectedNodeId={selectedNodeId} />

            {nodes && nodes.length > 0 && edges && edges.length > 0 ? (
              <PathwayScene
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode ?? (() => {})}
              />
            ) : (
              <LandmarkAnchors selectedNodeId={selectedNodeId} />
            )}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

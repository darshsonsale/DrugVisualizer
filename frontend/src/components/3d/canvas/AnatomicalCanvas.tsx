import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneEnvironment } from './SceneEnvironment';
import { CameraController } from './CameraController';
import { HolographicTorso } from '../anatomy/HolographicTorso';
import { OrganVolumes } from '../anatomy/OrganVolumes';
import { LandmarkAnchors } from '../anatomy/LandmarkAnchors';

export interface AnatomicalCanvasProps {
  selectedNodeId?: string;
  className?: string;
}

export const AnatomicalCanvas: React.FC<AnatomicalCanvasProps> = ({
  selectedNodeId,
  className = '',
}) => {
  return (
    <div
      className={`anatomical-canvas-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#080f18',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.45, 4.8], fov: 48, near: 0.1, far: 20 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment />
          <CameraController />

          {/* Master Centered Anatomical Group */}
          <group position={[0, -0.1, 0]}>
            <HolographicTorso />
            <OrganVolumes selectedNodeId={selectedNodeId} />
            <LandmarkAnchors selectedNodeId={selectedNodeId} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

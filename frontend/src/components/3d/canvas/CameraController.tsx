import React, { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface CameraControllerProps {
  enableRotate?: boolean;
  enableZoom?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  enableRotate = true,
  enableZoom = true,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.85}
      panSpeed={0.5}
      minDistance={2.6}
      maxDistance={7.2}
      maxPolarAngle={Math.PI / 1.7}
      minPolarAngle={Math.PI / 3.8}
      target={[0, 0.45, 0]}
      enabled={enableRotate}
      enableZoom={enableZoom}
    />
  );
};

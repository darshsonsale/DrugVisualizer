import React from 'react';
import { BIOLUMEN_PALETTE } from '../materials/holographicMaterial';

export const SceneEnvironment: React.FC = () => {
  return (
    <>
      {/* Dark Oceanic Clear Background */}
      <color attach="background" args={[BIOLUMEN_PALETTE.bgOceanic]} />

      {/* Atmospheric Depth Fog */}
      <fog attach="fog" args={[BIOLUMEN_PALETTE.bgOceanic, 5, 12]} />

      {/* Ambient Fill Light */}
      <ambientLight color="#bac9cc" intensity={0.55} />

      {/* Primary Key Light (Upper Right Front) */}
      <directionalLight position={[4, 7, 5]} color="#c3f5ff" intensity={1.2} />

      {/* Bioluminescent Cyan Rim Light (Left Back) */}
      <pointLight position={[-4, 2.5, -3]} color="#00e5ff" intensity={1.1} distance={15} />

      {/* Emerald Secondary Underglow (Bottom Front) */}
      <pointLight position={[1.5, -2.5, 3]} color="#4edea3" intensity={0.5} distance={12} />
    </>
  );
};

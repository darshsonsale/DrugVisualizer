import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BIOLUMEN_PALETTE } from '../materials/holographicMaterial';

export const HolographicTorso: React.FC = () => {
  // Ribcage ring levels
  const ribRings = useMemo(() => {
    return [
      { y: 1.45, rx: 0.95, rz: 0.55 },
      { y: 1.25, rx: 1.15, rz: 0.65 },
      { y: 1.05, rx: 1.25, rz: 0.72 },
      { y: 0.85, rx: 1.22, rz: 0.70 },
      { y: 0.65, rx: 1.10, rz: 0.65 },
      { y: 0.45, rx: 0.95, rz: 0.58 },
    ];
  }, []);

  return (
    <group name="HolographicTorso" position={[0, 0, 0]}>
      {/* 1. Cranium / Head Holographic Sphere */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial
          color={BIOLUMEN_PALETTE.cyanGlow}
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Head Translucent Core */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshPhysicalMaterial
          color={BIOLUMEN_PALETTE.torsoHologram}
          transparent
          opacity={0.08}
          transmission={0.8}
          roughness={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Cervical Neck */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.45, 16, 1, true]} />
        <meshBasicMaterial
          color={BIOLUMEN_PALETTE.cyanGlow}
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* 3. Clavicles / Shoulder Girdle */}
      <mesh position={[0, 1.62, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 12]} />
        <meshBasicMaterial
          color={BIOLUMEN_PALETTE.cyanPrimary}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 4. Thoracic Ribcage (Volumetric Rings) */}
      {ribRings.map((rib, idx) => (
        <group key={idx} position={[0, rib.y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[rib.rx, 0.02, 8, 32]} />
            <meshBasicMaterial
              color={BIOLUMEN_PALETTE.cyanPrimary}
              transparent
              opacity={0.22 - idx * 0.02}
            />
          </mesh>
        </group>
      ))}

      {/* 5. Vertebral Spine Axis */}
      <mesh position={[0, 0.4, -0.45]}>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 12]} />
        <meshBasicMaterial
          color={BIOLUMEN_PALETTE.cyanGlow}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Spine Segment Markers */}
      {[-0.6, -0.3, 0.0, 0.3, 0.6, 0.9, 1.2].map((y, idx) => (
        <mesh key={idx} position={[0, y, -0.45]}>
          <boxGeometry args={[0.18, 0.06, 0.12]} />
          <meshBasicMaterial
            color={BIOLUMEN_PALETTE.cyanGlow}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* 6. Pelvic Girdle & Iliac Crests */}
      <group position={[0, -0.85, 0]}>
        {/* Left Ilium Arch */}
        <mesh position={[0.65, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshBasicMaterial color={BIOLUMEN_PALETTE.cyanPrimary} transparent opacity={0.25} />
        </mesh>
        {/* Right Ilium Arch */}
        <mesh position={[-0.65, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshBasicMaterial color={BIOLUMEN_PALETTE.cyanPrimary} transparent opacity={0.25} />
        </mesh>
      </group>

      {/* 7. Outer Translucent Torso Silhouette Volume */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.1, 0.85, 2.4, 24, 6, true]} />
        <meshPhysicalMaterial
          color="#00daf3"
          transparent
          opacity={0.06}
          transmission={0.9}
          roughness={0.2}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

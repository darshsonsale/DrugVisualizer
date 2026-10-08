import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ANATOMICAL_LANDMARKS, LandmarkCoordinate } from '../types';

export interface LandmarkAnchorsProps {
  selectedNodeId?: string;
}

const LandmarkPulseOrb: React.FC<{
  landmark: LandmarkCoordinate;
  isActive: boolean;
}> = ({ landmark, isActive }) => {
  const pulseRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulseRingRef.current && isActive) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 3) * 0.25;
      pulseRingRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={landmark.position}>
      {/* Central Waypoint Core Sphere */}
      <mesh>
        <sphereGeometry args={[isActive ? 0.085 : 0.055, 16, 16]} />
        <meshBasicMaterial
          color={isActive ? '#00e5ff' : landmark.color}
          transparent
          opacity={isActive ? 1.0 : 0.75}
        />
      </mesh>

      {/* Pulsing Outer Aura Ring */}
      <mesh ref={pulseRingRef}>
        <ringGeometry args={[0.09, 0.13, 24]} />
        <meshBasicMaterial
          color={isActive ? '#00e5ff' : landmark.color}
          transparent
          opacity={isActive ? 0.65 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle Anatomical Waypoint Billboard Label */}
      <Html
        position={[0, 0.16, 0]}
        center
        distanceFactor={6.5}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            background: isActive ? 'rgba(8, 15, 24, 0.95)' : 'rgba(8, 15, 24, 0.75)',
            border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.8)' : 'rgba(255, 255, 255, 0.12)'}`,
            boxShadow: isActive ? '0 0 14px rgba(0, 229, 255, 0.6)' : 'none',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: isActive ? '#00e5ff' : '#bac9cc',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            letterSpacing: '0.02em',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: isActive ? '#00e5ff' : landmark.color,
            }}
          />
          {landmark.name.split(' ')[0]}
        </div>
      </Html>
    </group>
  );
};

export const LandmarkAnchors: React.FC<LandmarkAnchorsProps> = ({ selectedNodeId }) => {
  return (
    <group name="LandmarkAnchors">
      {Object.values(ANATOMICAL_LANDMARKS).map((landmark) => {
        const isActive = landmark.id === selectedNodeId;
        return (
          <LandmarkPulseOrb
            key={landmark.id}
            landmark={landmark}
            isActive={isActive}
          />
        );
      })}
    </group>
  );
};

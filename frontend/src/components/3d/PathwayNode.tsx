import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PathwayNodeWithDetails } from '../../api/types';
import { resolveNodeVisualColor } from './types';

export interface PathwayNodeProps {
  node: PathwayNodeWithDetails;
  position: [number, number, number];
  stepNumber: number;
  isActive: boolean;
  isTraversed: boolean;
  onSelect: (nodeId: string) => void;
}

export const PathwayNode: React.FC<PathwayNodeProps> = ({
  node,
  position,
  stepNumber,
  isActive,
  isTraversed,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);

  // Pulse animation on active node
  useFrame((state) => {
    if (pulseRingRef.current && (isActive || isHovered)) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 3.5) * 0.28;
      pulseRingRef.current.scale.set(scale, scale, scale);
    }
    if (coreMeshRef.current && isHovered) {
      coreMeshRef.current.scale.set(1.15, 1.15, 1.15);
    } else if (coreMeshRef.current) {
      coreMeshRef.current.scale.set(1, 1, 1);
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const organColor = resolveNodeVisualColor(node.id);
  const nodeColor = isActive
    ? '#00e5ff'
    : isTraversed
    ? '#4edea3'
    : organColor;

  return (
    <group position={position} name={`PathwayNode-${node.id}`}>
      {/* 1. Generous Invisible Raycasting Hit Sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Core Luminous Sphere */}
      <mesh ref={coreMeshRef} onClick={handleClick}>
        <sphereGeometry args={[isActive ? 0.08 : isHovered ? 0.075 : 0.055, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isActive ? 1.2 : isHovered ? 0.9 : isTraversed ? 0.6 : 0.25}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* 3. Pulsing Outer Aura Halo (Active or Hovered) */}
      {(isActive || isHovered) && (
        <mesh ref={pulseRingRef} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.09, 0.14, 24]} />
          <meshBasicMaterial
            color={isActive ? '#00e5ff' : '#4edea3'}
            transparent
            opacity={isActive ? 0.65 : 0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 4. Billboard 3D HTML Label */}
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
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            background: isActive
              ? 'rgba(8, 15, 24, 0.95)'
              : isHovered
              ? 'rgba(21, 28, 38, 0.95)'
              : 'rgba(8, 15, 24, 0.75)',
            border: `1px solid ${
              isActive
                ? 'rgba(0, 229, 255, 0.85)'
                : isHovered
                ? 'rgba(78, 222, 163, 0.6)'
                : 'rgba(59, 73, 76, 0.4)'
            }`,
            boxShadow: isActive
              ? '0 0 16px rgba(0, 229, 255, 0.65)'
              : isHovered
              ? '0 0 10px rgba(78, 222, 163, 0.4)'
              : 'none',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: isActive ? '#00e5ff' : isHovered ? '#4edea3' : '#bac9cc',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            letterSpacing: '0.02em',
            transition: 'all 0.25s ease',
          }}
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isActive ? '#00e5ff' : isTraversed ? '#4edea3' : 'rgba(59, 73, 76, 0.6)',
              color: isActive ? '#00363d' : '#080f18',
              fontSize: '0.55rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {stepNumber}
          </span>
          {node.name.split(' ')[0]}
        </div>
      </Html>
    </group>
  );
};

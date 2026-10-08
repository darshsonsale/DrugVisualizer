import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PathwayEdge as PathwayEdgeType } from '../../api/types';

export interface PathwayEdgeProps {
  edge: PathwayEdgeType;
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
  status: 'active' | 'traversed' | 'future';
  isCurrentSegment: boolean;
}

export const PathwayEdge: React.FC<PathwayEdgeProps> = ({
  edge,
  fromPosition,
  toPosition,
  status,
  isCurrentSegment,
}) => {
  const bolusRef = useRef<THREE.Mesh>(null);

  // Smooth 3D curved trajectory between the two anatomical waypoints
  const { curve, geometry } = useMemo(() => {
    const start = new THREE.Vector3(...fromPosition);
    const end = new THREE.Vector3(...toPosition);

    // Anatomically gentle curvature outward
    const midX = (start.x + end.x) / 2 + (start.x < end.x ? 0.04 : -0.04);
    const midY = (start.y + end.y) / 2;
    const midZ = Math.max(start.z, end.z) + 0.06;
    const mid = new THREE.Vector3(midX, midY, midZ);

    const quadCurve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tubeRadius = isCurrentSegment ? 0.022 : status === 'traversed' ? 0.016 : 0.01;
    const tubeGeo = new THREE.TubeGeometry(quadCurve, 24, tubeRadius, 8, false);

    return { curve: quadCurve, geometry: tubeGeo };
  }, [fromPosition, toPosition, status, isCurrentSegment]);

  // Animate the traveling drug bolus along the active segment
  useFrame((state) => {
    if (bolusRef.current && isCurrentSegment) {
      const speed = 0.45;
      const t = (state.clock.getElapsedTime() * speed) % 1;
      const point = curve.getPointAt(t);
      bolusRef.current.position.copy(point);
    }
  });

  const edgeColor = isCurrentSegment || status === 'active'
    ? '#00e5ff'
    : status === 'traversed'
    ? '#4edea3'
    : '#3b494c';

  const emissiveColor = isCurrentSegment || status === 'active'
    ? '#00e5ff'
    : status === 'traversed'
    ? '#059669'
    : '#151c26';

  const emissiveIntensity = isCurrentSegment || status === 'active'
    ? 1.1
    : status === 'traversed'
    ? 0.6
    : 0.1;

  const opacity = isCurrentSegment || status === 'active'
    ? 0.95
    : status === 'traversed'
    ? 0.75
    : 0.28;

  return (
    <group name={`PathwayEdge-${edge.id}`}>
      {/* 1. Curved 3D Pathway Tube */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={edgeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          roughness={0.25}
          metalness={0.3}
          depthWrite={status !== 'future'}
        />
      </mesh>

      {/* 2. Traveling Ibuprofen Drug Bolus Particle */}
      {isCurrentSegment && (
        <mesh ref={bolusRef}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#c3f5ff" />
        </mesh>
      )}
    </group>
  );
};

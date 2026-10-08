/**
 * Drug Path Visualiser - BioLumen Holographic Materials Configuration
 */

import * as THREE from 'three';

export const BIOLUMEN_PALETTE = {
  bgOceanic: '#080f18',
  cyanPrimary: '#00e5ff',
  cyanGlow: '#00daf3',
  emeraldSecondary: '#4edea3',
  amberGastric: '#ffb86b',
  coralHepatic: '#ff9e92',
  vascularCyan: '#6ffbbe',
  torsoHologram: '#00838f',
  wireframeSubtle: '#004d54',
};

/**
 * Creates a translucent holographic material with glassmorphic depth.
 */
export function createHolographicMaterial(
  color: string = BIOLUMEN_PALETTE.cyanGlow,
  opacity: number = 0.28,
  wireframe: boolean = false
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    transmission: 0.85,
    opacity,
    transparent: true,
    roughness: 0.2,
    metalness: 0.1,
    wireframe,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

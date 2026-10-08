/**
 * Drug Path Visualiser - 3D Scene Type Definitions
 */

export interface LandmarkCoordinate {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  organType?: string;
}

/**
 * Visual 3D Coordinate Mapping Layer
 * Maps known node IDs to 3D spatial anchors inside the anatomical torso.
 * Note: Does NOT define scientific logic, ordering, descriptions, pH, transit times, or pharmacology.
 */
export const ANATOMICAL_LANDMARKS: Record<string, LandmarkCoordinate> = {
  'node-oral-cavity': {
    id: 'node-oral-cavity',
    name: 'Mouth',
    position: [0.0, 1.85, 0.25],
    color: '#00e5ff',
    organType: 'mouth',
  },
  'node-stomach': {
    id: 'node-stomach',
    name: 'Stomach',
    position: [0.28, 0.65, 0.22],
    color: '#ffb86b',
    organType: 'stomach',
  },
  'node-small-intestine': {
    id: 'node-small-intestine',
    name: 'Small Intestine',
    position: [0.06, -0.15, 0.28],
    color: '#4edea3',
    organType: 'small-intestine',
  },
  'node-liver': {
    id: 'node-liver',
    name: 'Liver',
    position: [-0.55, 0.72, 0.18],
    color: '#ff9e92',
    organType: 'liver',
  },
  'node-bloodstream': {
    id: 'node-bloodstream',
    name: 'Bloodstream',
    position: [0.22, 0.15, 0.2],
    color: '#00daf3',
    organType: 'systemic',
  },
  'node-target-sites': {
    id: 'node-target-sites',
    name: 'Target Sites',
    position: [-0.35, -0.7, 0.22],
    color: '#ffc589',
    organType: 'target',
  },
  'node-kidneys': {
    id: 'node-kidneys',
    name: 'Kidneys',
    position: [-0.18, -0.45, 0.15],
    color: '#6ffbbe',
    organType: 'renal',
  },
  // Legacy alias for backwards compatibility
  'node-systemic-circulation': {
    id: 'node-systemic-circulation',
    name: 'Bloodstream',
    position: [0.22, 0.15, 0.2],
    color: '#00daf3',
    organType: 'systemic',
  },
};

/**
 * Procedural fallback resolver to position any arbitrary node within the torso axis
 * without breaking when new nodes or drugs are introduced.
 */
export function resolveNodeVisualPosition(
  nodeId: string,
  index = 0,
  total = 1
): [number, number, number] {
  if (ANATOMICAL_LANDMARKS[nodeId]) {
    return ANATOMICAL_LANDMARKS[nodeId].position;
  }
  // Procedural distribution along torso vertical axis
  const t = total > 1 ? index / (total - 1) : 0.5;
  const y = 1.75 - t * 2.5;
  const x = Math.sin(t * Math.PI * 2) * 0.25;
  return [x, y, 0.2];
}

export function resolveNodeVisualColor(nodeId: string): string {
  if (ANATOMICAL_LANDMARKS[nodeId]) {
    return ANATOMICAL_LANDMARKS[nodeId].color;
  }
  return '#00e5ff';
}

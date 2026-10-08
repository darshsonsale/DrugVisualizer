/**
 * Drug Path Visualiser - 3D Scene Type Definitions
 */

export interface LandmarkCoordinate {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  organType: 'mouth' | 'esophagus' | 'stomach' | 'small-intestine' | 'liver' | 'systemic';
}

export const ANATOMICAL_LANDMARKS: Record<string, LandmarkCoordinate> = {
  'node-oral-cavity': {
    id: 'node-oral-cavity',
    name: 'Oral Cavity & Ingestion',
    position: [0.0, 1.85, 0.25],
    color: '#00e5ff',
    organType: 'mouth',
  },
  'node-stomach': {
    id: 'node-stomach',
    name: 'Gastric Disintegration',
    position: [0.32, 0.65, 0.22],
    color: '#ffb86b',
    organType: 'stomach',
  },
  'node-small-intestine': {
    id: 'node-small-intestine',
    name: 'Intestinal Absorption',
    position: [0.08, -0.2, 0.28],
    color: '#4edea3',
    organType: 'small-intestine',
  },
  'node-liver': {
    id: 'node-liver',
    name: 'Hepatic First-Pass & Chiral Inversion',
    position: [-0.55, 0.72, 0.18],
    color: '#ff9e92',
    organType: 'liver',
  },
  'node-systemic-circulation': {
    id: 'node-systemic-circulation',
    name: 'Systemic Distribution & COX Inhibition',
    position: [0.0, -1.05, 0.12],
    color: '#6ffbbe',
    organType: 'systemic',
  },
};

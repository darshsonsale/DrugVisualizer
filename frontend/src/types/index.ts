/**
 * Shared Frontend Types — Core Application Foundations
 * Initialized during Task 02 (Frontend Application Bootstrap)
 */

export interface AppMetadata {
  name: string;
  version: string;
  environment: string;
  theme: 'biolumen-pharmacology';
}

export type StatusState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Drug Path Visualiser - Pathway Service
 * Handles drug information and physiological pathway graph retrieval.
 */

import { apiClient } from '../api/client';
import {
  DrugSummary,
  FoodCondition,
  PathwayGraphResponse,
} from '../api/types';
import {
  MOCK_DRUGS,
  MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD,
  MOCK_IBUPROFEN_PATHWAY_AFTER_FOOD,
} from '../api/mockData';

export interface ServiceFetchResult<T> {
  data: T;
  isMockData: boolean;
  source: 'api' | 'mock-fixture';
}

export interface FetchOptions {
  preferMock?: boolean;
  signal?: AbortSignal;
}

export class PathwayService {
  /**
   * Check whether development mock fallback is explicitly allowed in current environment.
   */
  private static isMockFallbackAllowed(): boolean {
    return import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
  }

  /**
   * Retrieves list of all available drugs.
   */
  public static async getDrugs(options: FetchOptions = {}): Promise<ServiceFetchResult<DrugSummary[]>> {
    if (options.preferMock) {
      return {
        data: MOCK_DRUGS,
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.get<DrugSummary[]>('/drugs', { signal: options.signal });
      return {
        data,
        isMockData: false,
        source: 'api',
      };
    } catch (err: unknown) {
      if (this.isMockFallbackAllowed()) {
        console.warn(
          '[PathwayService] Real API request failed for /drugs. VITE_ENABLE_MOCK_FALLBACK is enabled in development. Serving development mock fixture.',
          err
        );
        return {
          data: MOCK_DRUGS,
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      // Re-throw if fallback is not explicitly permitted
      throw err;
    }
  }

  /**
   * Retrieves pathway graph for a drug under a specific physiological state (BEFORE_FOOD / AFTER_FOOD).
   */
  public static async getPathway(
    drugId: string,
    condition: FoodCondition = 'BEFORE_FOOD',
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<PathwayGraphResponse>> {
    if (options.preferMock) {
      const mockResult =
        condition === 'AFTER_FOOD'
          ? MOCK_IBUPROFEN_PATHWAY_AFTER_FOOD
          : MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD;
      return {
        data: mockResult,
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.get<PathwayGraphResponse>(`/drugs/${encodeURIComponent(drugId)}/pathway`, {
        params: { condition },
        signal: options.signal,
      });

      return {
        data,
        isMockData: false,
        source: 'api',
      };
    } catch (err: unknown) {
      if (this.isMockFallbackAllowed()) {
        console.warn(
          `[PathwayService] Real API request failed for /drugs/${drugId}/pathway?condition=${condition}. VITE_ENABLE_MOCK_FALLBACK is enabled in development. Serving development mock fixture.`,
          err
        );
        const mockResult =
          condition === 'AFTER_FOOD'
            ? MOCK_IBUPROFEN_PATHWAY_AFTER_FOOD
            : MOCK_IBUPROFEN_PATHWAY_BEFORE_FOOD;
        return {
          data: mockResult,
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      // Re-throw genuine API / network error to prevent hiding backend integration issues
      throw err;
    }
  }
}

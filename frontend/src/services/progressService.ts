/**
 * Drug Path Visualiser - Progress Service
 * Handles user learning progression and node completion storage.
 */

import { apiClient } from '../api/client';
import { UserProgress } from '../api/types';
import { MOCK_USER_PROGRESS } from '../api/mockData';
import { ServiceFetchResult, FetchOptions } from './pathwayService';

export class ProgressService {
  private static isMockFallbackAllowed(): boolean {
    return import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
  }

  /**
   * Retrieves user progress for a specific drug.
   */
  public static async getProgress(
    drugId: string,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<UserProgress>> {
    if (options.preferMock) {
      return {
        data: MOCK_USER_PROGRESS,
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.get<UserProgress>(`/progress/${encodeURIComponent(drugId)}`, {
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
          `[ProgressService] Real API request failed for /progress/${drugId}. VITE_ENABLE_MOCK_FALLBACK is enabled in development. Serving development mock fixture.`,
          err
        );
        return {
          data: MOCK_USER_PROGRESS,
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      throw err;
    }
  }

  /**
   * Updates user progress for a specific drug.
   */
  public static async saveProgress(
    drugId: string,
    progress: Partial<UserProgress>,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<UserProgress>> {
    if (options.preferMock) {
      return {
        data: {
          ...MOCK_USER_PROGRESS,
          ...progress,
          last_accessed: new Date().toISOString(),
        },
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.put<UserProgress>(
        `/progress/${encodeURIComponent(drugId)}`,
        progress,
        { signal: options.signal }
      );
      return {
        data,
        isMockData: false,
        source: 'api',
      };
    } catch (err: unknown) {
      if (this.isMockFallbackAllowed()) {
        console.warn(
          `[ProgressService] Real API request failed for /progress/${drugId}. Saving to local in-memory fallback in development.`,
          err
        );
        return {
          data: {
            ...MOCK_USER_PROGRESS,
            ...progress,
            last_accessed: new Date().toISOString(),
          },
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      throw err;
    }
  }
}

/**
 * Drug Path Visualiser - Content Service
 * Handles educational content, ADME summaries, and verified scientific FAQs.
 */

import { apiClient } from '../api/client';
import type { DrugEducationalContent, FoodCondition } from '../api/types';
import type { ServiceFetchResult, FetchOptions } from './pathwayService';

export class ContentService {
  /**
   * Retrieves structured educational content for a drug by ID or slug and optional food condition.
   */
  public static async getDrugContent(
    drugId: string,
    condition?: FoodCondition,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<DrugEducationalContent>> {
    const cleanId = drugId.trim();
    const query = condition ? `?condition=${encodeURIComponent(condition)}` : '';

    try {
      const data = await apiClient.get<DrugEducationalContent>(
        `/content/drugs/${encodeURIComponent(cleanId)}${query}`,
        { signal: options.signal }
      );

      return {
        data,
        isMockData: false,
        source: 'api'
      };
    } catch (err: unknown) {
      console.warn(`[ContentService] Failed to load educational content for ${drugId}:`, err);
      throw err;
    }
  }
}

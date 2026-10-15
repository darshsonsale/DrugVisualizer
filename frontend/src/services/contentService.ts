/**
 * Drug Path Visualiser - Content Service
 * Handles educational content, ADME summaries, and verified scientific FAQs.
 */

import { apiClient } from '../api/client';
import type { DrugEducationalContent } from '../api/types';
import type { ServiceFetchResult, FetchOptions } from './pathwayService';

export class ContentService {
  /**
   * Retrieves structured educational content for a drug by ID or slug.
   */
  public static async getDrugContent(
    drugId: string,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<DrugEducationalContent>> {
    const cleanId = drugId.trim();

    try {
      const data = await apiClient.get<DrugEducationalContent>(
        `/content/drugs/${encodeURIComponent(cleanId)}`,
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

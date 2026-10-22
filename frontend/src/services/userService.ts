/**
 * Drug Path Visualiser - User Telemetry & Progress Service
 * Provides access to authenticated user profile telemetry, persisted quiz attempts,
 * and drug pathway progress records.
 */

import { apiClient } from '../api/client';
import type {
  UserProgress,
  UserQuizAttemptSummary,
  UserOverview,
} from '../api/types';
import type { FetchOptions } from './pathwayService';

export class UserService {
  /**
   * Retrieves the authenticated user's progress records across all drugs.
   */
  public static async getMyProgress(options: FetchOptions = {}): Promise<UserProgress[]> {
    return apiClient.get<UserProgress[]>('/users/me/progress', {
      signal: options.signal,
    });
  }

  /**
   * Retrieves the authenticated user's quiz attempt history.
   */
  public static async getMyAttempts(options: FetchOptions = {}): Promise<UserQuizAttemptSummary[]> {
    return apiClient.get<UserQuizAttemptSummary[]>('/users/me/attempts', {
      signal: options.signal,
    });
  }

  /**
   * Retrieves the authenticated user's aggregated learning overview.
   */
  public static async getMyOverview(options: FetchOptions = {}): Promise<UserOverview> {
    return apiClient.get<UserOverview>('/users/me/overview', {
      signal: options.signal,
    });
  }
}

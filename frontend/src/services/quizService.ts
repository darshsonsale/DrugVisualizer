/**
 * Drug Path Visualiser - Quiz Service
 * Handles quiz retrieval and attempt submission.
 */

import { apiClient } from '../api/client';
import {
  QuizResponse,
  QuizAttemptSubmission,
  QuizAttemptResult,
} from '../api/types';
import { MOCK_IBUPROFEN_QUIZ } from '../api/mockData';
import { ServiceFetchResult, FetchOptions } from './pathwayService';

export class QuizService {
  private static isMockFallbackAllowed(): boolean {
    return import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
  }

  /**
   * Retrieves quiz questions and options for a given quiz ID.
   */
  public static async getQuiz(
    quizId: string,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<QuizResponse>> {
    if (options.preferMock) {
      return {
        data: MOCK_IBUPROFEN_QUIZ,
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.get<QuizResponse>(`/quizzes/${encodeURIComponent(quizId)}`, {
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
          `[QuizService] Real API request failed for /quizzes/${quizId}. VITE_ENABLE_MOCK_FALLBACK is enabled in development. Serving development mock fixture.`,
          err
        );
        return {
          data: MOCK_IBUPROFEN_QUIZ,
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      throw err;
    }
  }

  /**
   * Submits a user's quiz attempt and returns graded results.
   */
  public static async submitQuizAttempt(
    quizId: string,
    submission: QuizAttemptSubmission,
    options: FetchOptions = {}
  ): Promise<ServiceFetchResult<QuizAttemptResult>> {
    if (options.preferMock) {
      const total = submission.answers.length;
      return {
        data: {
          id: `attempt-mock-${Date.now()}`,
          quiz_id: quizId,
          score: 100,
          total_questions: total,
          passed: true,
          completed_at: new Date().toISOString(),
          details: submission.answers.map((a) => ({
            question_id: a.question_id,
            correct: true,
            explanation: 'Verified via developmental mock validator.',
          })),
        },
        isMockData: true,
        source: 'mock-fixture',
      };
    }

    try {
      const data = await apiClient.post<QuizAttemptResult>(
        `/quizzes/${encodeURIComponent(quizId)}/attempts`,
        submission,
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
          `[QuizService] Real API submission failed for /quizzes/${quizId}/attempts. Returning fallback result in development.`,
          err
        );
        const total = submission.answers.length;
        return {
          data: {
            id: `attempt-fallback-${Date.now()}`,
            quiz_id: quizId,
            score: 100,
            total_questions: total,
            passed: true,
            completed_at: new Date().toISOString(),
          },
          isMockData: true,
          source: 'mock-fixture',
        };
      }
      throw err;
    }
  }
}

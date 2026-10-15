import type { Request, Response, NextFunction } from 'express';
import { quizService } from '../services/quiz.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { QuizResponseDto, QuizAttemptResultDto } from '../dto/quiz.dto.js';

export class QuizController {
  /**
   * GET /api/v1/quizzes/:quizId
   */
  public async getQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params;
      const quiz = await quizService.getQuizById(quizId);
      const response: ApiResponse<QuizResponseDto> = {
        success: true,
        data: quiz,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/quizzes/drug/:drugId
   */
  public async getQuizForDrug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const quiz = await quizService.getQuizForDrug(drugId);
      const response: ApiResponse<QuizResponseDto> = {
        success: true,
        data: quiz,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/quizzes/:quizId/attempts
   */
  public async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params;
      const userId = req.auth?.userId ?? null;

      const result = await quizService.submitQuizAttempt(quizId, req.body, userId);
      const response: ApiResponse<QuizAttemptResultDto> = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          authenticated: Boolean(userId)
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const quizController = new QuizController();

import type { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { UserProgressDto } from '../../progress/dto/progress.dto.js';
import type { UserQuizAttemptSummaryDto, UserOverviewDto } from '../dto/users.dto.js';

export class UsersController {
  /**
   * GET /api/v1/users/me/progress
   * Returns authenticated caller's progress across all drugs.
   */
  public async getMyProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth!.userId;
      const progress = await usersService.getUserProgressList(userId);
      const response: ApiResponse<UserProgressDto[]> = {
        success: true,
        data: progress,
        meta: {
          timestamp: new Date().toISOString(),
          total: progress.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/users/me/attempts
   * Returns authenticated caller's quiz attempts.
   */
  public async getMyAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth!.userId;
      const attempts = await usersService.getUserAttempts(userId);
      const response: ApiResponse<UserQuizAttemptSummaryDto[]> = {
        success: true,
        data: attempts,
        meta: {
          timestamp: new Date().toISOString(),
          total: attempts.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/users/me/overview
   * Returns authenticated caller's aggregate learning summary.
   */
  public async getMyOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth!.userId;
      const overview = await usersService.getUserOverview(userId);
      const response: ApiResponse<UserOverviewDto> = {
        success: true,
        data: overview,
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
   * GET /api/v1/users/:userId/progress
   * Protected with requireOwnership('userId')
   */
  public async getUserProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = req.params.userId;
      const progress = await usersService.getUserProgressList(targetUserId);
      const response: ApiResponse<UserProgressDto[]> = {
        success: true,
        data: progress,
        meta: {
          timestamp: new Date().toISOString(),
          target_user_id: targetUserId,
          total: progress.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/users/:userId/attempts
   * Protected with requireOwnership('userId')
   */
  public async getUserAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = req.params.userId;
      const attempts = await usersService.getUserAttempts(targetUserId);
      const response: ApiResponse<UserQuizAttemptSummaryDto[]> = {
        success: true,
        data: attempts,
        meta: {
          timestamp: new Date().toISOString(),
          target_user_id: targetUserId,
          total: attempts.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();

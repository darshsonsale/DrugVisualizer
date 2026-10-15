import type { Request, Response, NextFunction } from 'express';
import { progressService } from '../services/progress.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { UserProgressDto } from '../dto/progress.dto.js';

export class ProgressController {
  /**
   * GET /api/v1/progress/:drugId
   */
  public async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const userId = req.auth?.userId ?? null;

      const progress = await progressService.getProgress(userId, drugId);
      const response: ApiResponse<UserProgressDto> = {
        success: true,
        data: progress,
        meta: {
          timestamp: new Date().toISOString(),
          persistent: Boolean(userId)
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/progress/:drugId
   */
  public async saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { drugId } = req.params;
      const userId = req.auth?.userId ?? null;

      const progress = await progressService.saveProgress(userId, drugId, req.body);
      const response: ApiResponse<UserProgressDto> = {
        success: true,
        data: progress,
        meta: {
          timestamp: new Date().toISOString(),
          persistent: true
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const progressController = new ProgressController();

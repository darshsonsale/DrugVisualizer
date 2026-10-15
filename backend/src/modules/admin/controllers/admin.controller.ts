import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import type { ApiResponse } from '../../../common/types/index.js';
import type { AdminUserListItemDto, PlatformMetricsDto } from '../dto/admin.dto.js';
import type { UserProgressDto } from '../../progress/dto/progress.dto.js';

export class AdminController {
  /**
   * GET /api/v1/admin/users
   */
  public async getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.listUsers();
      const response: ApiResponse<AdminUserListItemDto[]> = {
        success: true,
        data: users,
        meta: {
          timestamp: new Date().toISOString(),
          total: users.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:userId/role
   */
  public async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const updatedUser = await adminService.updateUserRole(userId, role);
      const response: ApiResponse<AdminUserListItemDto> = {
        success: true,
        data: updatedUser,
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
   * GET /api/v1/admin/metrics
   */
  public async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await adminService.getPlatformMetrics();
      const response: ApiResponse<PlatformMetricsDto> = {
        success: true,
        data: metrics,
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
   * GET /api/v1/admin/users/:userId/progress
   */
  public async getUserProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const progress = await adminService.getUserProgress(userId);
      const response: ApiResponse<UserProgressDto[]> = {
        success: true,
        data: progress,
        meta: {
          timestamp: new Date().toISOString(),
          target_user_id: userId,
          total: progress.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();

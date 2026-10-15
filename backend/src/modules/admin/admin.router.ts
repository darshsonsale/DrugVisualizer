import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/authorization.js';
import { adminController } from './controllers/admin.controller.js';
import type { ApiResponse } from '../../common/types/index.js';

export const adminRouter: Router = Router();

// Administrative module status (accessible to authenticated administrators)
adminRouter.get('/', requireAuth, requireAdmin, (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'admin',
      status: 'operational',
      description: 'Administrative access control, user management & operational metrics'
    }
  };
  res.status(200).json(response);
});

// User management endpoints (admin-only)
adminRouter.get('/users', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getUsers(req, res, next)
);

adminRouter.patch('/users/:userId/role', requireAuth, requireAdmin, (req, res, next) =>
  adminController.updateUserRole(req, res, next)
);

// Platform telemetry & metrics
adminRouter.get('/metrics', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getMetrics(req, res, next)
);

// Cross-user administrative inspection
adminRouter.get('/users/:userId/progress', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getUserProgress(req, res, next)
);

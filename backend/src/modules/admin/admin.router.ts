import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/authorization.js';
import { adminController } from './controllers/admin.controller.js';
import type { ApiResponse } from '../../common/types/index.js';
import { adminRateLimiter, validateBody, validateParams } from '../../middleware/index.js';
import { updateRoleBodySchema, userParamSchema } from '../../validation/index.js';

export const adminRouter: Router = Router();

// Administrative module status (accessible to authenticated administrators)
adminRouter.get('/', requireAuth, requireAdmin, (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'admin',
      status: 'operational',
      description: 'Administrative access control, user management & operational metrics'
    },
    meta: {
      timestamp
    }
  };
  res.status(200).json(response);
});

// User management endpoints (admin-only)
adminRouter.get('/users', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getUsers(req, res, next)
);

adminRouter.patch(
  '/users/:userId/role',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(userParamSchema),
  validateBody(updateRoleBodySchema),
  (req, res, next) => adminController.updateUserRole(req, res, next)
);


// Platform telemetry & metrics
adminRouter.get('/metrics', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getMetrics(req, res, next)
);

// Cross-user administrative inspection
adminRouter.get('/users/:userId/progress', requireAuth, requireAdmin, (req, res, next) =>
  adminController.getUserProgress(req, res, next)
);

// ----------------------------------------------------------------------------
// Task 25: Administrative Content, Pathway Edge & Assessment Management
// ----------------------------------------------------------------------------
import { adminContentController } from './controllers/adminContent.controller.js';
import {
  updateNodeContentBodySchema,
  updateReviewStatusBodySchema,
  updateEdgeBodySchema,
  updateQuizSettingsBodySchema,
  updateQuizQuestionBodySchema,
  updateQuizOptionReviewBodySchema,
  nodeIdParamSchema,
  edgeIdParamSchema,
  quizIdParamSchema,
  questionIdParamSchema,
  optionIdParamSchema
} from '../../validation/index.js';

// 1. Content summary overview
adminRouter.get('/content/summary', requireAuth, requireAdmin, (req, res, next) =>
  adminContentController.getContentSummary(req, res, next)
);

// 2. Medicine-specific pathway nodes and content
adminRouter.get('/content/drugs/:drugId/nodes', requireAuth, requireAdmin, (req, res, next) =>
  adminContentController.getDrugNodesContent(req, res, next)
);

// 2b. Medicine-specific pathway transition edges
adminRouter.get('/content/drugs/:drugId/edges', requireAuth, requireAdmin, (req, res, next) =>
  adminContentController.getDrugEdges(req, res, next)
);

// 3. Update node content
adminRouter.put(
  '/content/nodes/:nodeId',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(nodeIdParamSchema),
  validateBody(updateNodeContentBodySchema),
  (req, res, next) => adminContentController.updateNodeContent(req, res, next)
);

// 4. Update scientific review status
adminRouter.patch(
  '/content/nodes/:nodeId/review-status',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(nodeIdParamSchema),
  validateBody(updateReviewStatusBodySchema),
  (req, res, next) => adminContentController.updateReviewStatus(req, res, next)
);

// 5. Update pathway edge transition (with pathway row locking and cycle detection)
adminRouter.put(
  '/content/edges/:edgeId',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(edgeIdParamSchema),
  validateBody(updateEdgeBodySchema),
  (req, res, next) => adminContentController.updatePathwayEdge(req, res, next)
);

// 6. Medicine-specific quiz details
adminRouter.get('/content/drugs/:drugId/quiz', requireAuth, requireAdmin, (req, res, next) =>
  adminContentController.getDrugQuiz(req, res, next)
);

// 7. Update quiz settings
adminRouter.patch(
  '/content/quizzes/:quizId',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(quizIdParamSchema),
  validateBody(updateQuizSettingsBodySchema),
  (req, res, next) => adminContentController.updateQuizSettings(req, res, next)
);

// 8. Update quiz question text
adminRouter.patch(
  '/content/quiz-questions/:questionId',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(questionIdParamSchema),
  validateBody(updateQuizQuestionBodySchema),
  (req, res, next) => adminContentController.updateQuizQuestion(req, res, next)
);

// 9. Update quiz option review flag / explanation
adminRouter.patch(
  '/content/quiz-options/:optionId/review',
  requireAuth,
  requireAdmin,
  adminRateLimiter,
  validateParams(optionIdParamSchema),
  validateBody(updateQuizOptionReviewBodySchema),
  (req, res, next) => adminContentController.updateQuizOptionReview(req, res, next)
);

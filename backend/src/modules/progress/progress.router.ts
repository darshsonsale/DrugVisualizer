import { Router } from 'express';
import { progressController } from './controllers/progress.controller.js';
import { sensitiveRateLimiter, validateBody, validateParams } from '../../middleware/index.js';
import { progressParamSchema, saveProgressBodySchema } from '../../validation/index.js';

export const progressRouter: Router = Router();

// GET /api/v1/progress/:drugId - Retrieve user learning progress for a drug
progressRouter.get(
  '/:drugId',
  validateParams(progressParamSchema),
  (req, res, next) => progressController.getProgress(req, res, next)
);

// PUT /api/v1/progress/:drugId - Update/save user learning progress for a drug (requires authenticated context)
progressRouter.put(
  '/:drugId',
  sensitiveRateLimiter,
  validateParams(progressParamSchema),
  validateBody(saveProgressBodySchema),
  (req, res, next) => progressController.saveProgress(req, res, next)
);


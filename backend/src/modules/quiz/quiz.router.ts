import { Router } from 'express';
import { quizController } from './controllers/quiz.controller.js';
import type { ApiResponse } from '../../common/types/index.js';
import { sensitiveRateLimiter, validateBody, validateParams } from '../../middleware/index.js';
import { quizAttemptBodySchema, quizParamSchema, drugParamSchema } from '../../validation/index.js';

export const quizRouter: Router = Router();

// GET /api/v1/quizzes/drug/:drugId - Retrieve quiz by drug ID
quizRouter.get(
  '/drug/:drugId',
  validateParams(drugParamSchema),
  (req, res, next) => quizController.getQuizForDrug(req, res, next)
);

// POST /api/v1/quizzes/:quizId/attempts - Submit and grade quiz attempt (rate limited & schema validated)
quizRouter.post(
  '/:quizId/attempts',
  sensitiveRateLimiter,
  validateBody(quizAttemptBodySchema),
  (req, res, next) => quizController.submitAttempt(req, res, next)
);

// GET /api/v1/quizzes/:quizId - Retrieve quiz by quiz ID (confidential questions & options)
quizRouter.get(
  '/:quizId',
  validateParams(quizParamSchema),
  (req, res, next) => quizController.getQuiz(req, res, next)
);

// GET /api/v1/quizzes/ - Module status
quizRouter.get('/', (_req, res) => {
  const timestamp = new Date().toISOString();
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'quiz',
      status: 'operational',
      description: 'Diagnostic checkpoint quiz, questions & scoring module'
    },
    meta: {
      timestamp
    }
  };
  res.status(200).json(response);
});

import { Router } from 'express';
import { quizController } from './controllers/quiz.controller.js';
import type { ApiResponse } from '../../common/types/index.js';

export const quizRouter: Router = Router();

// GET /api/v1/quizzes/drug/:drugId - Retrieve quiz by drug ID
quizRouter.get('/drug/:drugId', (req, res, next) => quizController.getQuizForDrug(req, res, next));

// POST /api/v1/quizzes/:quizId/attempts - Submit and grade quiz attempt
quizRouter.post('/:quizId/attempts', (req, res, next) => quizController.submitAttempt(req, res, next));

// GET /api/v1/quizzes/:quizId - Retrieve quiz by quiz ID (confidential questions & options)
quizRouter.get('/:quizId', (req, res, next) => quizController.getQuiz(req, res, next));

// GET /api/v1/quizzes/ - Module status
quizRouter.get('/', (_req, res) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'quiz',
      status: 'operational',
      description: 'Diagnostic checkpoint quiz, questions & scoring module'
    }
  };
  res.status(200).json(response);
});

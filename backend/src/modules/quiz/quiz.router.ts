import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const quizRouter: Router = Router();

quizRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'quiz',
      status: 'initialized',
      description: 'Diagnostic checkpoint quiz, questions & scoring module'
    }
  };
  res.status(200).json(response);
});

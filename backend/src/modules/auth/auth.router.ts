import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const authRouter: Router = Router();

authRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'auth',
      status: 'initialized',
      description: 'Authentication & Google OAuth module'
    }
  };
  res.status(200).json(response);
});

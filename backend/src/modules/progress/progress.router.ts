import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const progressRouter: Router = Router();

progressRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'progress',
      status: 'initialized',
      description: 'User quiz attempts, scores & telemetry persistence module'
    }
  };
  res.status(200).json(response);
});

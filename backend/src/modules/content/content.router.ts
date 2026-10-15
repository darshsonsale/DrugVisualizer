import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const contentRouter: Router = Router();

contentRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'content',
      status: 'initialized',
      description: 'Educational definitions, organ roles & fun facts module'
    }
  };
  res.status(200).json(response);
});

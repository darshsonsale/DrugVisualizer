import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const drugsRouter: Router = Router();

drugsRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'drugs',
      status: 'initialized',
      description: 'Pharmaceutical drug catalog & metadata module'
    }
  };
  res.status(200).json(response);
});

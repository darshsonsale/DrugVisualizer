import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const pathwaysRouter: Router = Router();

pathwaysRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'pathways',
      status: 'initialized',
      description: 'Biological pathways, nodes, edges & condition variations module'
    }
  };
  res.status(200).json(response);
});

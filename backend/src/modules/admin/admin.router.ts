import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';

export const adminRouter: Router = Router();

adminRouter.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'admin',
      status: 'initialized',
      description: 'Administrative and operational management module'
    }
  };
  res.status(200).json(response);
});

import { Router, type Request, type Response } from 'express';
import type { ApiResponse } from '../../common/types/index.js';
import { contentController } from './controllers/content.controller.js';

export const contentRouter: Router = Router();

contentRouter.get('/', (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const response: ApiResponse<{ module: string; status: string; description: string }> = {
    success: true,
    data: {
      module: 'content',
      status: 'active',
      description: 'Educational definitions, organ roles, student key takeaways, and verified scientific references module'
    },
    meta: {
      timestamp
    }
  };
  res.status(200).json(response);
});

contentRouter.get('/drugs/:drugId', contentController.getDrugContent.bind(contentController));
contentRouter.get('/drug/:drugId', contentController.getDrugContent.bind(contentController));

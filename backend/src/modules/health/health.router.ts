import { Router, type Request, type Response } from 'express';
import { config } from '../../config/index.js';
import type { ApiResponse, HealthCheckData } from '../../common/types/index.js';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const data: HealthCheckData = {
    status: 'ok',
    service: 'drug-path-visualiser-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  };

  const response: ApiResponse<HealthCheckData> = {
    success: true,
    data,
    meta: {
      timestamp: data.timestamp,
      version: data.version
    }
  };

  res.status(200).json(response);
});

import { Router, type Request, type Response } from 'express';
import { config } from '../../config/index.js';
import { getPool } from '../../database/pool.js';
import type { ApiResponse, HealthCheckData } from '../../common/types/index.js';

export const healthRouter: Router = Router();

// GET /api/v1/health - Liveness probe (process is running)
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

// GET /api/v1/health/ready - Readiness probe (database connectivity verified)
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const pool = getPool();
    await pool.query('SELECT 1 AS ready;');

    res.status(200).json({
      success: true,
      data: {
        status: 'ready',
        database: 'connected',
        service: 'drug-path-visualiser-backend',
        uptimeSeconds: Math.floor(process.uptime()),
        environment: config.env,
        timestamp,
        version: '0.1.0'
      },
      meta: { timestamp, version: '0.1.0' }
    });
  } catch {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection is not ready to serve traffic.'
      },
      meta: { timestamp, version: '0.1.0' }
    });
  }
});

import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '../types/index.js';
import { config } from '../../config/index.js';

export function errorHandler(
  err: Error & { statusCode?: number; code?: string; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const isServerFault = statusCode >= 500;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: err.code || (isServerFault ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: isServerFault && config.isProduction ? 'An unexpected internal error occurred' : err.message || 'Internal server error',
      details: err.details !== undefined ? err.details : (!config.isProduction ? { stack: err.stack } : undefined)
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
}

import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../types/index.js';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
  res.status(404).json(response);
}

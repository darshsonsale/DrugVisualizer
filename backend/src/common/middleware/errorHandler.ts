/**
 * Drug Path Visualiser - Centralized Safe Error Handling Middleware
 * Guarantees zero sensitive data, stack trace, or database structure leakage.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '../types/index.js';
import { AppError } from '../../errors/index.js';

interface PgDatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

export function errorHandler(
  err: Error & { statusCode?: number; status?: number; code?: string; type?: string; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. JSON Body Parser Syntax Error (malformed JSON sent by client)
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Malformed JSON payload in request body.'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
    res.status(400).json(response);
    return;
  }

  // 2. Payload Too Large (Express body-parser 413)
  if (err.type === 'entity.too.large' || err.statusCode === 413 || err.status === 413) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds the maximum allowed limit of 100KB.'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
    res.status(413).json(response);
    return;
  }

  // 3. Application Domain Errors (AppError and subclasses)
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // 4. PostgreSQL Database Errors (Strictly mask internal schemas and SQL queries)
  const pgErr = err as PgDatabaseError;
  if (pgErr.code && typeof pgErr.code === 'string' && /^[0-9A-Z]{5}$/.test(pgErr.code)) {
    let statusCode = 500;
    let safeCode = 'DATABASE_OPERATION_FAILED';
    let safeMessage = 'Database operation could not be completed.';

    // Unique constraint violation (23505)
    if (pgErr.code === '23505') {
      statusCode = 409;
      safeCode = 'RESOURCE_CONFLICT';
      safeMessage = 'A resource with the provided unique identifier already exists.';
    }
    // Foreign key constraint violation (23503)
    else if (pgErr.code === '23503') {
      statusCode = 400;
      safeCode = 'INVALID_RELATION';
      safeMessage = 'The requested relationship references a non-existent entity.';
    }
    // Check constraint violation (23514)
    else if (pgErr.code === '23514') {
      statusCode = 400;
      safeCode = 'CONSTRAINT_VIOLATION';
      safeMessage = 'The request violates a required data constraint.';
    }

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: safeCode,
        message: safeMessage
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
    res.status(statusCode).json(response);
    return;
  }

  // 5. Generic Unexpected Errors (Strictly no stack trace or internal diagnostics)
  const statusCode = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const isClientFault = statusCode >= 400 && statusCode < 500;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: isClientFault ? (err.code || 'BAD_REQUEST') : 'INTERNAL_SERVER_ERROR',
      message: isClientFault ? (err.message || 'Bad request') : 'An unexpected internal error occurred.'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
}

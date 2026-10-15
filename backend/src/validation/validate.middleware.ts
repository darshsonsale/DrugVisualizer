/**
 * Drug Path Visualiser - Request Validation Middleware
 * Enforces declarative input validation for bodies, queries, and path parameters.
 */

import type { Request, Response, NextFunction } from 'express';
import type { Schema } from './validator.js';
import { ValidationError } from '../errors/index.js';

export function validateBody<T extends Record<string, unknown> | unknown[]>(schema: Schema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.parse(req.body, 'body');
    if (!result.success) {
      return next(new ValidationError('Invalid request payload', result.issues));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends Record<string, unknown>>(schema: Schema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.parse(req.query, 'query');
    if (!result.success) {
      return next(new ValidationError('Invalid query parameters', result.issues));
    }
    req.query = result.data as Record<string, unknown> as Request['query'];
    next();
  };
}

export function validateParams<T extends Record<string, unknown>>(schema: Schema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.parse(req.params, 'params');
    if (!result.success) {
      return next(new ValidationError('Invalid path parameters', result.issues));
    }
    req.params = result.data as Record<string, string>;
    next();
  };
}

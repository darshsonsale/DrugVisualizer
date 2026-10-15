/**
 * Drug Path Visualiser - Centralized Domain Errors
 * Safe error abstractions ensuring no internal server/database leaks.
 */

export interface ValidationIssue {
  field: string;
  message: string;
  code?: string;
  received?: unknown;
}

export class AppError extends Error {
  public readonly isAppError = true;

  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'BAD_REQUEST',
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier ? `${resource} with identifier '${identifier}' was not found.` : `${resource} was not found.`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 401, 'AUTHENTICATION_REQUIRED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, 409, 'RESOURCE_CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = []) {
    const primaryCode = issues.length === 1 && issues[0].code && issues[0].code !== 'INVALID_FORMAT' && issues[0].code !== 'TOO_SHORT' && issues[0].code !== 'TOO_LONG' && issues[0].code !== 'REQUIRED'
      ? issues[0].code
      : 'VALIDATION_ERROR';
    super(message, 400, primaryCode, { issues });
    this.issues = issues;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;

  constructor(message: string = 'Rate limit exceeded. Please wait before retrying.', retryAfterSeconds: number = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string = 'Request payload exceeds maximum allowed size.') {
    super(message, 413, 'PAYLOAD_TOO_LARGE');
  }
}

export class SafeDatabaseError extends AppError {
  constructor(safeMessage: string = 'Database operation could not be completed.') {
    super(safeMessage, 500, 'DATABASE_OPERATION_FAILED');
  }
}

/**
 * Drug Path Visualiser - Centralized Schema Validator Engine
 * Zero-dependency, type-safe schema validator for HTTP requests.
 */

import type { ValidationIssue } from '../errors/index.js';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssue[] };

export interface Schema<T> {
  parse(input: unknown, path?: string): ValidationResult<T>;
}

// ============================================================================
// String Schema
// ============================================================================
export class StringSchema implements Schema<string> {
  private _min?: number;
  private _max?: number;
  private _regex?: RegExp;
  private _regexMessage?: string;
  private _enumVals?: string[];
  private _minMessage?: string;
  private _maxMessage?: string;
  private _isOptional = false;
  private _shouldTrim = false;
  private _customValidate?: (val: string) => string | null;

  min(length: number, message?: string): this {
    this._min = length;
    this._minMessage = message;
    return this;
  }

  max(length: number, message?: string): this {
    this._max = length;
    this._maxMessage = message;
    return this;
  }

  regex(pattern: RegExp, message?: string): this {
    this._regex = pattern;
    this._regexMessage = message;
    return this;
  }

  enum(values: string[]): this {
    this._enumVals = values;
    return this;
  }

  trim(): this {
    this._shouldTrim = true;
    return this;
  }

  optional(): Schema<string | undefined> {
    this._isOptional = true;
    return this as unknown as Schema<string | undefined>;
  }

  refine(fn: (val: string) => string | null): this {
    this._customValidate = fn;
    return this;
  }

  parse(input: unknown, path = 'value'): ValidationResult<string> {
    if (input === undefined || input === null) {
      if (this._isOptional) {
        return { success: true, data: undefined as unknown as string };
      }
      return {
        success: false,
        issues: [{ field: path, message: `${path} is required`, code: 'REQUIRED' }]
      };
    }

    if (typeof input !== 'string') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be a string`, code: 'INVALID_TYPE', received: typeof input }]
      };
    }

    let val = this._shouldTrim ? input.trim() : input;

    if (this._min !== undefined && val.length < this._min) {
      return {
        success: false,
        issues: [{ field: path, message: this._minMessage || `${path} must be at least ${this._min} characters long`, code: 'TOO_SHORT' }]
      };
    }

    if (this._max !== undefined && val.length > this._max) {
      return {
        success: false,
        issues: [{ field: path, message: this._maxMessage || `${path} cannot exceed ${this._max} characters`, code: 'TOO_LONG' }]
      };
    }

    if (this._regex && !this._regex.test(val)) {
      return {
        success: false,
        issues: [{ field: path, message: this._regexMessage || `${path} has an invalid format`, code: 'INVALID_FORMAT' }]
      };
    }

    if (this._enumVals && !this._enumVals.includes(val)) {
      return {
        success: false,
        issues: [
          {
            field: path,
            message: `${path} must be one of: [${this._enumVals.join(', ')}]`,
            code: 'INVALID_ENUM_VALUE',
            received: val
          }
        ]
      };
    }

    if (this._customValidate) {
      const err = this._customValidate(val);
      if (err) {
        return {
          success: false,
          issues: [{ field: path, message: err, code: 'CUSTOM_VALIDATION_FAILED' }]
        };
      }
    }

    return { success: true, data: val };
  }
}

// ============================================================================
// Number Schema
// ============================================================================
export class NumberSchema implements Schema<number> {
  private _min?: number;
  private _max?: number;
  private _isInteger = false;
  private _isOptional = false;

  min(minVal: number): this {
    this._min = minVal;
    return this;
  }

  max(maxVal: number): this {
    this._max = maxVal;
    return this;
  }

  integer(): this {
    this._isInteger = true;
    return this;
  }

  positive(): this {
    this._min = 0;
    return this;
  }

  optional(): Schema<number | undefined> {
    this._isOptional = true;
    return this as unknown as Schema<number | undefined>;
  }

  parse(input: unknown, path = 'value'): ValidationResult<number> {
    if (input === undefined || input === null) {
      if (this._isOptional) {
        return { success: true, data: undefined as unknown as number };
      }
      return {
        success: false,
        issues: [{ field: path, message: `${path} is required`, code: 'REQUIRED' }]
      };
    }

    const num = typeof input === 'string' && input.trim() !== '' ? Number(input) : input;

    if (typeof num !== 'number' || Number.isNaN(num)) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be a valid number`, code: 'INVALID_TYPE', received: input }]
      };
    }

    if (this._isInteger && !Number.isInteger(num)) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an integer`, code: 'INVALID_INTEGER', received: num }]
      };
    }

    if (this._min !== undefined && num < this._min) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be at least ${this._min}`, code: 'TOO_SMALL' }]
      };
    }

    if (this._max !== undefined && num > this._max) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} cannot exceed ${this._max}`, code: 'TOO_LARGE' }]
      };
    }

    return { success: true, data: num };
  }
}

// ============================================================================
// Array Schema
// ============================================================================
export class ArraySchema<T> implements Schema<T[]> {
  private _min?: number;
  private _max?: number;
  private _isOptional = false;

  constructor(private readonly itemSchema: Schema<T>) {}

  min(length: number): this {
    this._min = length;
    return this;
  }

  max(length: number): this {
    this._max = length;
    return this;
  }

  optional(): Schema<T[] | undefined> {
    this._isOptional = true;
    return this as unknown as Schema<T[] | undefined>;
  }

  parse(input: unknown, path = 'value'): ValidationResult<T[]> {
    if (input === undefined || input === null) {
      if (this._isOptional) {
        return { success: true, data: undefined as unknown as T[] };
      }
      return {
        success: false,
        issues: [{ field: path, message: `${path} is required`, code: 'REQUIRED' }]
      };
    }

    if (!Array.isArray(input)) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an array`, code: 'INVALID_TYPE', received: typeof input }]
      };
    }

    if (this._min !== undefined && input.length < this._min) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must contain at least ${this._min} item(s)`, code: 'ARRAY_TOO_SHORT' }]
      };
    }

    if (this._max !== undefined && input.length > this._max) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} cannot contain more than ${this._max} item(s)`, code: 'ARRAY_TOO_LONG' }]
      };
    }

    const parsedItems: T[] = [];
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < input.length; i++) {
      const itemResult = this.itemSchema.parse(input[i], `${path}[${i}]`);
      if (itemResult.success) {
        parsedItems.push(itemResult.data);
      } else {
        issues.push(...itemResult.issues);
      }
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }

    return { success: true, data: parsedItems };
  }
}

// ============================================================================
// Object Schema
// ============================================================================
export class ObjectSchema<T extends Record<string, unknown>> implements Schema<T> {
  private _isOptional = false;

  constructor(private readonly shape: { [K in keyof T]: Schema<T[K]> }) {}

  optional(): Schema<T | undefined> {
    this._isOptional = true;
    return this as unknown as Schema<T | undefined>;
  }

  parse(input: unknown, path = 'body'): ValidationResult<T> {
    if (input === undefined || input === null) {
      if (this._isOptional) {
        return { success: true, data: undefined as unknown as T };
      }
      return {
        success: false,
        issues: [{ field: path, message: `${path} is required`, code: 'REQUIRED' }]
      };
    }

    if (typeof input !== 'object' || Array.isArray(input)) {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an object`, code: 'INVALID_TYPE', received: typeof input }]
      };
    }

    const obj = input as Record<string, unknown>;
    const resultData: Partial<T> = {};
    const issues: ValidationIssue[] = [];

    for (const [key, schema] of Object.entries(this.shape)) {
      const fieldPath = path === 'body' ? key : `${path}.${key}`;
      const fieldResult = (schema as Schema<unknown>).parse(obj[key], fieldPath);

      if (fieldResult.success) {
        if (fieldResult.data !== undefined) {
          resultData[key as keyof T] = fieldResult.data as T[keyof T];
        }
      } else {
        issues.push(...fieldResult.issues);
      }
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }

    return { success: true, data: resultData as T };
  }
}

// ============================================================================
// Boolean Schema
// ============================================================================
export class BooleanSchema implements Schema<boolean> {
  private _isOptional = false;

  optional(): Schema<boolean | undefined> {
    this._isOptional = true;
    return this as unknown as Schema<boolean | undefined>;
  }

  parse(input: unknown, path = 'value'): ValidationResult<boolean> {
    if (input === undefined || input === null) {
      if (this._isOptional) {
        return { success: true, data: undefined as unknown as boolean };
      }
      return {
        success: false,
        issues: [{ field: path, message: `${path} is required`, code: 'REQUIRED' }]
      };
    }

    if (typeof input !== 'boolean') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be a boolean`, code: 'INVALID_TYPE' }]
      };
    }

    return { success: true, data: input };
  }
}

// ============================================================================
// Fluent Builder API
// ============================================================================
export const v = {
  string(): StringSchema {
    return new StringSchema();
  },
  number(): NumberSchema {
    return new NumberSchema();
  },
  boolean(): BooleanSchema {
    return new BooleanSchema();
  },
  array<T>(itemSchema: Schema<T>): ArraySchema<T> {
    return new ArraySchema(itemSchema);
  },
  object<T extends Record<string, unknown>>(shape: { [K in keyof T]: Schema<T[K]> }): ObjectSchema<T> {
    return new ObjectSchema(shape);
  }
};

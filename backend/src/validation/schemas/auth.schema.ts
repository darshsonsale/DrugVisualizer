import type { Schema, ValidationResult } from '../validator.js';

export const googleVerifyBodySchema: Schema<{ idToken?: string; id_token?: string }> = {
  parse(input: unknown, path = 'body'): ValidationResult<{ idToken?: string; id_token?: string }> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an object`, code: 'INVALID_TYPE' }]
      };
    }
    const obj = input as Record<string, unknown>;
    const token = (typeof obj.idToken === 'string' ? obj.idToken : typeof obj.id_token === 'string' ? obj.id_token : '').trim();

    if (!token) {
      return {
        success: false,
        issues: [{ field: 'id_token', message: 'Google ID token (id_token or idToken) is required', code: 'REQUIRED' }]
      };
    }
    if (token.length < 10) {
      return {
        success: false,
        issues: [{ field: 'id_token', message: 'Token is too short', code: 'TOO_SHORT' }]
      };
    }
    if (token.length > 8192) {
      return {
        success: false,
        issues: [{ field: 'id_token', message: 'Token exceeds maximum length', code: 'TOO_LONG' }]
      };
    }
    return {
      success: true,
      data: {
        idToken: token,
        id_token: token
      }
    };
  }
};

export const loginBodySchema: Schema<{ email: string; password: string }> = {
  parse(input: unknown, path = 'body'): ValidationResult<{ email: string; password: string }> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an object`, code: 'INVALID_TYPE' }]
      };
    }
    const obj = input as Record<string, unknown>;
    const rawIdentifier = (
      typeof obj.email === 'string'
        ? obj.email
        : typeof obj.username === 'string'
        ? obj.username
        : typeof (obj as any).identifier === 'string'
        ? (obj as any).identifier
        : ''
    ).trim();
    const password = typeof obj.password === 'string' ? obj.password : '';

    const issues = [];
    if (!rawIdentifier) {
      issues.push({ field: 'email', message: 'Email address or username is required', code: 'REQUIRED' });
    } else if (rawIdentifier.length < 2) {
      issues.push({ field: 'email', message: 'Email address or username must be at least 2 characters', code: 'TOO_SHORT' });
    } else if (rawIdentifier.length > 255) {
      issues.push({ field: 'email', message: 'Email address or username exceeds maximum length', code: 'TOO_LONG' });
    }

    if (!password) {
      issues.push({ field: 'password', message: 'Password is required', code: 'REQUIRED' });
    } else if (password.length < 6) {
      issues.push({ field: 'password', message: 'Password must be at least 6 characters', code: 'TOO_SHORT' });
    } else if (password.length > 128) {
      issues.push({ field: 'password', message: 'Password exceeds maximum length of 128 characters', code: 'TOO_LONG' });
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }

    return {
      success: true,
      data: {
        email: rawIdentifier,
        password
      }
    };
  }
};

export const registerBodySchema: Schema<{ email: string; password: string; name?: string }> = {
  parse(input: unknown, path = 'body'): ValidationResult<{ email: string; password: string; name?: string }> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an object`, code: 'INVALID_TYPE' }]
      };
    }
    const obj = input as Record<string, unknown>;
    const email = typeof obj.email === 'string' ? obj.email.trim().toLowerCase() : '';
    const password = typeof obj.password === 'string' ? obj.password : '';
    const name = typeof obj.name === 'string' ? obj.name.trim() : undefined;

    const issues = [];
    if (!email) {
      issues.push({ field: 'email', message: 'Email is required', code: 'REQUIRED' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      issues.push({ field: 'email', message: 'Invalid email address format', code: 'INVALID_FORMAT' });
    }

    if (!password) {
      issues.push({ field: 'password', message: 'Password is required', code: 'REQUIRED' });
    } else if (password.length < 8) {
      issues.push({ field: 'password', message: 'Password must be at least 8 characters long', code: 'TOO_SHORT' });
    } else if (password.length > 128) {
      issues.push({ field: 'password', message: 'Password exceeds maximum length of 128 characters', code: 'TOO_LONG' });
    }

    if (name !== undefined && name.length > 100) {
      issues.push({ field: 'name', message: 'Name cannot exceed 100 characters', code: 'TOO_LONG' });
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }

    return {
      success: true,
      data: {
        email,
        password,
        name: name || undefined
      }
    };
  }
};


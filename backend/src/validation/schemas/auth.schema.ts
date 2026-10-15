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

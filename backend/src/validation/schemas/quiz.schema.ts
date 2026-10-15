import { v, type Schema, type ValidationResult } from '../validator.js';

export const quizParamSchema: Schema<{ quizId?: string; id?: string }> = {
  parse(input: unknown, path = 'params'): ValidationResult<{ quizId?: string; id?: string }> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        issues: [{ field: path, message: `${path} must be an object`, code: 'INVALID_TYPE' }]
      };
    }
    const obj = input as Record<string, unknown>;
    const rawId = (typeof obj.quizId === 'string' ? obj.quizId : typeof obj.id === 'string' ? obj.id : '').trim();

    if (!rawId) {
      return {
        success: false,
        issues: [{ field: 'quizId', message: 'Quiz identifier is required', code: 'REQUIRED' }]
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(rawId)) {
      return {
        success: false,
        issues: [{ field: 'quizId', message: 'Quiz identifier contains invalid characters', code: 'INVALID_FORMAT' }]
      };
    }

    return {
      success: true,
      data: {
        quizId: rawId,
        id: rawId
      }
    };
  }
};

export const quizAttemptAnswerSchema = v.object({
  question_id: v.string().trim().min(1).max(100),
  selected_option_id: v.string().trim().min(1).max(100)
});

export const quizAttemptBodySchema = v.object({
  answers: v.array(quizAttemptAnswerSchema).min(1).max(50)
});

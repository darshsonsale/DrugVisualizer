import { v, type Schema, type ValidationResult } from '../validator.js';
import { isValidFoodCondition } from '../../modules/pathways/validation/condition.validation.js';

export const pathwayQuerySchema: Schema<{ condition?: string }> = {
  parse(input: unknown, _path = 'query'): ValidationResult<{ condition?: string }> {
    if (!input || typeof input !== 'object') {
      return { success: true, data: {} };
    }
    const obj = input as Record<string, unknown>;
    if (obj.condition !== undefined && obj.condition !== null && obj.condition !== '') {
      if (typeof obj.condition !== 'string' || !isValidFoodCondition(obj.condition)) {
        return {
          success: false,
          issues: [
            {
              field: 'condition',
              message: "Food condition must be 'BEFORE_FOOD' or 'AFTER_FOOD'",
              code: 'INVALID_FOOD_CONDITION',
              received: obj.condition
            }
          ]
        };
      }
      return { success: true, data: { condition: obj.condition.trim().toUpperCase() } };
    }
    return { success: true, data: {} };
  }
};

export const drugParamSchema = v.object({
  drugId: v
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Drug identifier contains invalid characters')
});

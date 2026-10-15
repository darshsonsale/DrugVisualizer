import { AppError } from '../../../common/errors/AppError.js';
import { VALID_FOOD_CONDITIONS, type FoodCondition } from '../models/variation.model.js';

export class InvalidFoodConditionError extends AppError {
  public readonly allowedValues = VALID_FOOD_CONDITIONS;

  constructor(public readonly invalidValue: unknown) {
    super(
      `Invalid food condition: '${String(invalidValue)}'. Allowed conditions are: ${VALID_FOOD_CONDITIONS.join(', ')}.`,
      400,
      'INVALID_FOOD_CONDITION',
      { allowedConditions: VALID_FOOD_CONDITIONS, providedValue: invalidValue }
    );
  }
}

export function isValidFoodCondition(value: unknown): value is FoodCondition {
  return typeof value === 'string' && (VALID_FOOD_CONDITIONS as readonly string[]).includes(value.trim().toUpperCase());
}

export function normalizeFoodCondition(value: unknown): FoodCondition {
  if (typeof value !== 'string') {
    throw new InvalidFoodConditionError(value);
  }

  const normalized = value.trim().toUpperCase();
  if (!isValidFoodCondition(normalized)) {
    throw new InvalidFoodConditionError(value);
  }

  return normalized;
}

export function validateFoodCondition(value: unknown): FoodCondition {
  return normalizeFoodCondition(value);
}

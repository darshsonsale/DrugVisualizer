import { v } from '../validator.js';

export const userParamSchema = v.object({
  userId: v
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'User identifier contains invalid characters')
});

export const updateRoleBodySchema = v.object({
  role: v.string().trim().enum(['learner', 'admin'])
});

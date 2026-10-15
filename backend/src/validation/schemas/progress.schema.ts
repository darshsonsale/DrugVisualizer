import { v } from '../validator.js';

export const progressParamSchema = v.object({
  drugId: v
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Drug identifier contains invalid characters')
});

export const saveProgressBodySchema = v.object({
  completed_nodes: v.array(v.string().trim().min(1).max(100)).max(50).optional(),
  quiz_score: v.number().min(0).max(100).optional(),
  user_id: v.string().trim().min(1).max(100).optional(),
  last_active_node_id: v.string().trim().min(1).max(100).optional(),
  time_spent_seconds: v.number().integer().min(0).max(864000).optional()
});

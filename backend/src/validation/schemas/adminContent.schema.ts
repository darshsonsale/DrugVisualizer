import { v } from '../validator.js';

export const updateNodeContentBodySchema = v.object({
  general_description: v.string().trim().min(10).max(5000),
  physiological_role: v.string().trim().min(10).max(5000),
  key_takeaway: v.string().trim().min(5).max(1000),
  key_cellular_mechanisms: v.array(v.string().trim().min(2).max(500)).optional(),
  defined_terms: v
    .array(
      v.object({
        term: v.string().trim().min(1).max(200),
        definition: v.string().trim().min(1).max(2000)
      })
    )
    .optional(),
  references_list: v.array(v.string().trim().min(5).max(1000)).optional(),
  micro_environment_ph: v.number().min(0).max(14).optional()
});

export const updateReviewStatusBodySchema = v.object({
  review_status: v.string().trim().enum(['FLAGGED_FOR_SCIENTIFIC_REVIEW'])
});

export const updateEdgeBodySchema = v.object({
  from_node_id: v.string().trim().min(1).max(64),
  to_node_id: v.string().trim().min(1).max(64),
  transition_duration_minutes: v.number().min(0).max(10000).optional(),
  transition_description: v.string().trim().min(5).max(1000).optional()
});

export const updateQuizSettingsBodySchema = v.object({
  title: v.string().trim().min(3).max(255).optional(),
  description: v.string().trim().min(5).max(2000).optional(),
  pass_percentage: v.number().min(0).max(100).optional()
});

export const updateQuizQuestionBodySchema = v.object({
  question_text: v.string().trim().min(5).max(2000)
});

export const updateQuizOptionReviewBodySchema = v.object({
  needs_scientific_review: v.boolean(),
  explanation: v.string().trim().min(5).max(2000).optional()
});

export const nodeIdParamSchema = v.object({
  nodeId: v
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Node identifier contains invalid characters')
});

export const edgeIdParamSchema = v.object({
  edgeId: v
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Edge identifier contains invalid characters')
});

export const quizIdParamSchema = v.object({
  quizId: v
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Quiz identifier contains invalid characters')
});

export const questionIdParamSchema = v.object({
  questionId: v
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Question identifier contains invalid characters')
});

export const optionIdParamSchema = v.object({
  optionId: v
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Option identifier contains invalid characters')
});

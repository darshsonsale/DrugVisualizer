/**
 * Drug Path Visualiser - Data Layer Type Definitions
 * Aligned with the PostgreSQL 14-table schema and REST API contract.
 *
 * Source of Truth: Backend database and REST API specification.
 */

// ==========================================
// Condition & Parameter Types
// ==========================================

export type FoodCondition = 'BEFORE_FOOD' | 'AFTER_FOOD';

// ==========================================
// Drug Metadata Types (Table: drugs)
// ==========================================

export interface DrugSummary {
  id: string;
  name: string;
  brand_name?: string;
  category: string;
  description: string;
  molecular_formula?: string;
  half_life_hours?: number;
  bioavailability_pct?: number;
  cmax_ug_ml?: number;
  tmax_hours?: number;
}

// ==========================================
// Pathway Types (Tables: pathways, pathway_nodes, node_content, node_variations, pathway_edges)
// ==========================================

export interface PathwayNode {
  id: string;
  pathway_id: string;
  node_order: number;
  name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: number;
  camera_focus_x?: number;
  camera_focus_y?: number;
  camera_focus_z?: number;
}

export interface NodeContent {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_cellular_mechanisms?: string[];
  micro_environment_ph?: number;
}

export interface NodeVariation {
  id: string;
  node_id: string;
  condition: FoodCondition;
  transit_time_modifier_pct?: number;
  absorption_modifier_pct?: number;
  clinical_observation: string;
  notes?: string;
}

export interface PathwayNodeWithDetails extends PathwayNode {
  content?: NodeContent;
  variation?: NodeVariation;
}

export interface PathwayEdge {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  transition_description?: string;
  transition_duration_minutes?: number;
}

export interface PathwayGraph {
  id: string;
  drug_id: string;
  name: string;
  description?: string;
  condition: FoodCondition;
}

export interface PathwayGraphResponse {
  drug: DrugSummary;
  pathway: PathwayGraph;
  nodes: PathwayNodeWithDetails[];
  edges: PathwayEdge[];
}

// ==========================================
// Quiz Types (Tables: quizzes, quiz_questions, quiz_options, quiz_attempts)
// ==========================================

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  options: QuizOption[];
}

export interface QuizResponse {
  id: string;
  drug_id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptAnswer {
  question_id: string;
  selected_option_id: string;
}

export interface QuizAttemptSubmission {
  answers: QuizAttemptAnswer[];
}

export interface QuizQuestionDetail {
  question_id: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  user_id?: string;
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string;
  details?: QuizQuestionDetail[];
}

// ==========================================
// Progress Types (Table: user_progress)
// ==========================================

export interface UserProgress {
  id: string;
  user_id?: string;
  drug_id: string;
  completed_nodes: string[];
  quiz_score?: number;
  quiz_completed: boolean;
  last_accessed: string;
}

// ==========================================
// Generic API Envelope & Error Payloads
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp?: string;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

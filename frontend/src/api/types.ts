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
  form?: 'Tablets' | 'Capsules' | 'Syrups' | 'Injections';
  dosage?: string;
  indication?: string;
  route?: 'Oral Route' | 'Injection Route';
  image_url?: string;
  journey_stages?: Array<{ name: string; organ?: string; icon?: string }>;
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

export interface DefinedTerm {
  term: string;
  definition: string;
}

export interface NodeContent {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_cellular_mechanisms?: string[];
  micro_environment_ph?: number;
  key_takeaway?: string;
  defined_terms?: DefinedTerm[];
  references_list?: string[];
  review_status?: string;
}

export interface EducationalNode {
  node_id: string;
  name: string;
  node_order: number;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: number;
  general_description: string;
  physiological_role: string;
  key_takeaway: string;
  key_cellular_mechanisms: string[];
  defined_terms: DefinedTerm[];
  micro_environment_ph?: number;
  references_list: string[];
  review_status: string;
}

export interface DrugFaq {
  id: string;
  question: string;
  answer: string;
  source_reference: string;
  review_status: string;
}

export interface AdmeSummary {
  absorption: string;
  distribution: string;
  metabolism: string;
  excretion: string;
  source: string;
  review_status: string;
}

export interface DrugEducationalContent {
  drug: DrugSummary;
  pathway_id: string;
  review_status: string;
  adme_overview: AdmeSummary;
  nodes: EducationalNode[];
  faqs: DrugFaq[];
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
  pass_percentage?: number;
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
  correct_answers?: number;
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
  meta?: {
    timestamp: string;
    version?: string;
    [key: string]: unknown;
  };
  timestamp?: string;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// ==========================================
// Authentication Types (Tables: users)
// ==========================================

export type UserRole = 'learner' | 'educator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthSessionResponse {
  token: string;
  expires_in: string;
  user: UserProfile;
}

export interface GoogleAuthUrlResponse {
  url: string;
  state: string;
}

// ==========================================
// User Overview & Telemetry Types
// ==========================================

export interface UserQuizAttemptSummary {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserOverview {
  user_id: string;
  email?: string;
  role?: string;
  total_drugs_tracked: number;
  total_quizzes_completed: number;
  progress: UserProgress[];
  recent_attempts: UserQuizAttemptSummary[];
}

// ==========================================
// Administrative Portal Types
// ==========================================

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface PlatformMetrics {
  total_users: number;
  total_attempts: number;
  total_progress_records: number;
  total_drugs: number;
  total_pathways: number;
  role_breakdown: Record<string, number>;
}



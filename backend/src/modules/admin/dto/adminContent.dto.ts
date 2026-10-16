import type { DefinedTermDto } from '../../pathways/dto/pathway.dto.js';

export interface AdminContentSummaryDto {
  total_drugs: number;
  total_pathways: number;
  total_nodes: number;
  total_edges: number;
  total_quizzes: number;
  total_questions: number;
  total_options: number;
  review_status_counts: Record<string, number>;
  options_needing_review: number;
}

export interface AdminNodeContentDetailDto {
  node_id: string;
  pathway_id: string;
  drug_id: string;
  node_order: number;
  node_name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: number;
  content_id: string | null;
  general_description: string;
  physiological_role: string;
  key_takeaway: string;
  key_cellular_mechanisms: string[];
  defined_terms: DefinedTermDto[];
  references_list: string[];
  micro_environment_ph: number | null;
  review_status: string;
  updated_at: string;
}

export interface UpdateNodeContentInputDto {
  general_description: string;
  physiological_role: string;
  key_takeaway: string;
  key_cellular_mechanisms?: string[];
  defined_terms?: DefinedTermDto[];
  references_list?: string[];
  micro_environment_ph?: number;
}

export interface AdminEdgeDetailDto {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  from_node_name?: string;
  to_node_name?: string;
  transition_description: string | null;
  transition_duration_minutes: number | null;
  updated_at: string;
}

export interface UpdateEdgeInputDto {
  from_node_id: string;
  to_node_id: string;
  transition_duration_minutes?: number;
  transition_description?: string;
}

export interface AdminQuizDetailDto {
  id: string;
  drug_id: string;
  title: string;
  description: string | null;
  pass_percentage: number;
  questions_count: number;
  options_count: number;
  updated_at: string;
  questions: Array<{
    id: string;
    question_order: number;
    question_text: string;
    options: Array<{
      id: string;
      option_text: string;
      explanation: string | null;
      needs_scientific_review: boolean;
    }>;
  }>;
}

import type { FoodCondition } from '../models/variation.model.js';
import type { DrugSummaryDto } from '../../drugs/dto/drug.dto.js';

export interface PathwayNodeDto {
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

export interface DefinedTermDto {
  term: string;
  definition: string;
}

export interface NodeContentDto {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_cellular_mechanisms?: string[];
  micro_environment_ph?: number;
  key_takeaway?: string;
  defined_terms?: DefinedTermDto[];
  references_list?: string[];
  review_status?: string;
}

export interface NodeVariationDto {
  id: string;
  node_id: string;
  condition: FoodCondition;
  transit_time_modifier_pct?: number;
  absorption_modifier_pct?: number;
  clinical_observation: string;
  notes?: string;
}

export interface PathwayNodeWithDetailsDto extends PathwayNodeDto {
  content?: NodeContentDto;
  variation?: NodeVariationDto;
}

export interface PathwayEdgeDto {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  transition_description?: string;
  transition_duration_minutes?: number;
}

export interface PathwayGraphDto {
  id: string;
  drug_id: string;
  name: string;
  description?: string;
  condition: FoodCondition;
}

export interface PathwayGraphResponseDto {
  drug: DrugSummaryDto;
  pathway: PathwayGraphDto;
  nodes: PathwayNodeWithDetailsDto[];
  edges: PathwayEdgeDto[];
}

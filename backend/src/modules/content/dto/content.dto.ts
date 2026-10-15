import type { DrugSummaryDto } from '../../drugs/dto/drug.dto.js';
import type { DefinedTermDto } from '../../pathways/dto/pathway.dto.js';
import type { FoodCondition } from '../../pathways/models/variation.model.js';

export interface NodeVariationDetailDto {
  condition: FoodCondition;
  transit_time_modifier_pct: number;
  absorption_modifier_pct: number;
  clinical_observation?: string;
  notes?: string;
  review_status?: string;
}

export interface EducationalNodeDto {
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
  defined_terms: DefinedTermDto[];
  micro_environment_ph?: number;
  references_list: string[];
  review_status: string;
  variation?: NodeVariationDetailDto;
}

export interface DrugFaqDto {
  id: string;
  question: string;
  answer: string;
  source_reference: string;
  review_status: string;
}

export interface AdmeSummaryDto {
  absorption: string;
  distribution: string;
  metabolism: string;
  excretion: string;
  source: string;
  review_status: string;
}

export interface PathwayVariationSummaryDto {
  id: string;
  condition: FoodCondition;
  name: string;
  description: string | null;
  clinical_significance?: string | null;
  review_status: string;
}

export interface DrugEducationalContentDto {
  drug: DrugSummaryDto;
  pathway_id: string;
  condition?: FoodCondition;
  is_food_dependent?: boolean;
  limitation_note?: string;
  pathway_variation?: PathwayVariationSummaryDto;
  review_status: string;
  adme_overview: AdmeSummaryDto;
  nodes: EducationalNodeDto[];
  faqs: DrugFaqDto[];
}

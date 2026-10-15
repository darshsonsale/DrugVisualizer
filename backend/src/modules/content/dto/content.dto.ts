import type { DrugSummaryDto } from '../../drugs/dto/drug.dto.js';
import type { DefinedTermDto } from '../../pathways/dto/pathway.dto.js';

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

export interface DrugEducationalContentDto {
  drug: DrugSummaryDto;
  pathway_id: string;
  review_status: string;
  adme_overview: AdmeSummaryDto;
  nodes: EducationalNodeDto[];
  faqs: DrugFaqDto[];
}

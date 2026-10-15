export const VALID_FOOD_CONDITIONS = ['BEFORE_FOOD', 'AFTER_FOOD'] as const;

export type FoodCondition = (typeof VALID_FOOD_CONDITIONS)[number];

export interface PathwayVariation {
  id: string;
  pathway_id: string;
  condition: FoodCondition;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface NodeVariation {
  id: string;
  node_id: string;
  condition: FoodCondition;
  transit_time_modifier_pct: number;
  absorption_modifier_pct: number;
  clinical_observation: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PathwayNodeWithVariation {
  node_id: string;
  base_estimated_time_minutes: number;
  effective_estimated_time_minutes: number;
  condition: FoodCondition;
  transit_time_modifier_pct: number;
  absorption_modifier_pct: number;
  clinical_observation: string;
}

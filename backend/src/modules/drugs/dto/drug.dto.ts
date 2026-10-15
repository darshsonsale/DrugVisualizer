export interface DrugSummaryDto {
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
  form?: string;
  dosage?: string;
  indication?: string;
  route?: string;
  image_url?: string;
  journey_stages?: Array<{ name: string; organ?: string; icon?: string }>;
}

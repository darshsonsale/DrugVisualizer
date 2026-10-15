export interface Drug {
  id: string;
  name: string;
  brand_name: string | null;
  category: string;
  description: string;
  molecular_formula: string | null;
  half_life_hours: number | null;
  bioavailability_pct: number | null;
  cmax_ug_ml: number | null;
  tmax_hours: number | null;
  form: string | null;
  dosage: string | null;
  indication: string | null;
  route: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateDrugDto = Omit<Drug, 'created_at' | 'updated_at'>;

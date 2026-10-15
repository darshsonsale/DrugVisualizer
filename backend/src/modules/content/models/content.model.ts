export interface NodeContent {
  id: string;
  node_id: string;
  general_description: string;
  physiological_role: string;
  key_cellular_mechanisms: string[];
  micro_environment_ph: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Pathway {
  id: string;
  drug_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PathwayNode {
  id: string;
  pathway_id: string;
  node_order: number;
  name: string;
  anatomical_location: string;
  organ_system: string;
  estimated_time_minutes: number;
  camera_focus_x: number | null;
  camera_focus_y: number | null;
  camera_focus_z: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface PathwayEdge {
  id: string;
  pathway_id: string;
  from_node_id: string;
  to_node_id: string;
  transition_description: string | null;
  transition_duration_minutes: number | null;
  created_at: Date;
  updated_at: Date;
}

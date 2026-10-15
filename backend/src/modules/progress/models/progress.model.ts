export interface UserProgress {
  id: string;
  user_id: string;
  drug_id: string;
  completed_nodes: string[];
  quiz_score: number | null;
  quiz_completed: boolean;
  last_accessed: Date;
  created_at: Date;
  updated_at: Date;
}

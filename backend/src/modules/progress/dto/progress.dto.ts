export interface UserProgressDto {
  id: string;
  user_id?: string;
  drug_id: string;
  completed_nodes: string[];
  quiz_score?: number;
  quiz_completed: boolean;
  last_accessed: string;
}

export interface UpdateProgressDto {
  completed_nodes?: string[];
  quiz_score?: number;
  quiz_completed?: boolean;
}

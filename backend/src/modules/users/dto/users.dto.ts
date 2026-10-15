import type { UserProgressDto } from '../../progress/dto/progress.dto.js';

export interface UserQuizAttemptSummaryDto {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserOverviewDto {
  user_id: string;
  email?: string;
  role?: string;
  total_drugs_tracked: number;
  total_quizzes_completed: number;
  progress: UserProgressDto[];
  recent_attempts: UserQuizAttemptSummaryDto[];
}

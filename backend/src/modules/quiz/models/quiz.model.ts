export interface Quiz {
  id: string;
  drug_id: string;
  title: string;
  description: string | null;
  pass_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  explanation: string | null;
  needs_scientific_review: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string | null;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  completed_at: Date;
  created_at: Date;
}

export interface QuizAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  created_at: Date;
}

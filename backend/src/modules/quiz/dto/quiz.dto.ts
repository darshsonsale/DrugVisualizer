/**
 * Quiz Option DTO for quiz question retrieval.
 * Answer confidentiality: is_correct and explanation are strictly omitted.
 */
export interface QuizOptionDto {
  id: string;
  question_id: string;
  option_text: string;
}

export interface QuizQuestionDto {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  options: QuizOptionDto[];
}

export interface QuizResponseDto {
  id: string;
  drug_id: string;
  title: string;
  description?: string;
  pass_percentage: number;
  questions: QuizQuestionDto[];
}

export interface QuizAttemptAnswerSubmissionDto {
  question_id: string;
  selected_option_id: string;
}

export interface QuizAttemptSubmissionDto {
  answers: QuizAttemptAnswerSubmissionDto[];
}

export interface QuizQuestionFeedbackDetailDto {
  question_id: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizAttemptResultDto {
  id: string;
  quiz_id: string;
  user_id?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  completed_at: string;
  details: QuizQuestionFeedbackDetailDto[];
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizResponse, QuizAttemptResult, QuizAttemptSubmission } from '../api/types';
import { QuizService } from '../services/quizService';
import { ApiError } from '../api/client';

export interface UseQuizOptions {
  autoFetch?: boolean;
  preferMock?: boolean;
}

export interface UseQuizResult {
  data: QuizResponse | null;
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  flaggedQuestions: Set<string>;
  submitted: boolean;
  submissionResult: QuizAttemptResult | null;
  submitting: boolean;
  selectAnswer: (questionId: string, optionId: string) => void;
  toggleFlagQuestion: (questionId: string) => void;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  refetch: () => Promise<void>;
}

export function useQuiz(
  quizId: string = 'quiz-ibuprofen-001',
  options: UseQuizOptions = {}
): UseQuizResult {
  const { autoFetch = true, preferMock = false } = options;

  const [data, setData] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await QuizService.getQuiz(quizId, {
        preferMock,
        signal: controller.signal,
      });
      setData(result.data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message =
        err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : err instanceof Error
          ? err.message
          : 'Failed to load quiz';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [quizId, preferMock]);

  useEffect(() => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setSubmitted(false);
    setSubmissionResult(null);
    setCurrentQuestionIndex(0);
  }, [quizId]);

  useEffect(() => {
    if (autoFetch) {
      fetchQuiz();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchQuiz]);

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);

  const toggleFlagQuestion = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const goToNextQuestion = useCallback(() => {
    if (!data?.questions?.length) return;
    setCurrentQuestionIndex((prev) => Math.min(data.questions.length - 1, prev + 1));
  }, [data]);

  const goToPrevQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (!data?.questions?.length) return;
      if (index >= 0 && index < data.questions.length) {
        setCurrentQuestionIndex(index);
      }
    },
    [data]
  );

  const submitQuiz = useCallback(async () => {
    if (!data?.questions?.length) return;
    setSubmitting(true);
    try {
      const submission: QuizAttemptSubmission = {
        answers: Object.entries(selectedAnswers).map(([question_id, selected_option_id]) => ({
          question_id,
          selected_option_id,
        })),
      };

      const targetQuizId = data.id || quizId;
      const result = await QuizService.submitQuizAttempt(targetQuizId, submission, {
        preferMock,
      });

      // Directly trust and assign server-evaluated result (zero client tampering)
      setSubmissionResult(result.data);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('[useQuiz] Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [data, selectedAnswers, quizId, preferMock]);

  const resetQuiz = useCallback(() => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setSubmitted(false);
    setSubmissionResult(null);
    setCurrentQuestionIndex(0);
  }, []);

  return {
    data,
    loading,
    error,
    currentQuestionIndex,
    selectedAnswers,
    flaggedQuestions,
    submitted,
    submissionResult,
    submitting,
    selectAnswer,
    toggleFlagQuestion,
    goToNextQuestion,
    goToPrevQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    refetch: fetchQuiz,
  };
}

export default useQuiz;

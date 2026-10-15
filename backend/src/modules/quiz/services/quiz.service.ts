import { getPool } from '../../../database/pool.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/AppError.js';
import { progressService } from '../../progress/services/progress.service.js';
import type {
  QuizResponseDto,
  QuizQuestionDto,
  QuizOptionDto,
  QuizAttemptSubmissionDto,
  QuizAttemptResultDto,
  QuizQuestionFeedbackDetailDto
} from '../dto/quiz.dto.js';

interface RawQuizRow {
  id: string;
  drug_id: string;
  title: string;
  description: string | null;
  pass_percentage: string | number;
}

interface RawQuestionRow {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
}

interface RawOptionConfidentialRow {
  id: string;
  question_id: string;
  option_text: string;
}

interface RawOptionVerificationRow {
  id: string;
  question_id: string;
  is_correct: boolean;
  explanation: string | null;
}

export class QuizService {
  /**
   * Retrieves quiz questions and options by quiz ID.
   * Answer confidentiality safeguard: is_correct and explanation are strictly omitted.
   */
  public async getQuizById(quizId: string): Promise<QuizResponseDto> {
    const quizQuery = `
      SELECT id, drug_id, title, description, pass_percentage
      FROM quizzes
      WHERE id = $1;
    `;
    const quizResult = await getPool().query<RawQuizRow>(quizQuery, [quizId]);
    if (quizResult.rows.length === 0) {
      throw new NotFoundError('Quiz', quizId);
    }
    const quiz = quizResult.rows[0];

    const questionsQuery = `
      SELECT id, quiz_id, question_order, question_text
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY question_order ASC;
    `;
    const questionsResult = await getPool().query<RawQuestionRow>(questionsQuery, [quizId]);

    const optionsQuery = `
      SELECT o.id, o.question_id, o.option_text
      FROM quiz_options o
      JOIN quiz_questions q ON q.id = o.question_id
      WHERE q.quiz_id = $1
      ORDER BY o.id ASC;
    `;
    const optionsResult = await getPool().query<RawOptionConfidentialRow>(optionsQuery, [quizId]);

    const optionsByQuestionId = new Map<string, QuizOptionDto[]>();
    for (const opt of optionsResult.rows) {
      const list = optionsByQuestionId.get(opt.question_id) || [];
      list.push({
        id: opt.id,
        question_id: opt.question_id,
        option_text: opt.option_text
      });
      optionsByQuestionId.set(opt.question_id, list);
    }

    const questions: QuizQuestionDto[] = questionsResult.rows.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question_order: q.question_order,
      question_text: q.question_text,
      options: optionsByQuestionId.get(q.id) || []
    }));

    return {
      id: quiz.id,
      drug_id: quiz.drug_id,
      title: quiz.title,
      description: quiz.description ?? undefined,
      pass_percentage: parseFloat(String(quiz.pass_percentage)),
      questions
    };
  }

  /**
   * Retrieves quiz for a specific drug.
   */
  public async getQuizForDrug(drugId: string): Promise<QuizResponseDto> {
    const query = `
      SELECT id
      FROM quizzes
      WHERE drug_id = $1
      LIMIT 1;
    `;
    const result = await getPool().query<{ id: string }>(query, [drugId]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Quiz for drug', drugId);
    }

    return this.getQuizById(result.rows[0].id);
  }

  /**
   * Submits and grades a quiz attempt server-side.
   * If authenticated, persists attempt and updates user progress.
   * If anonymous, evaluates score without persisting user records.
   */
  public async submitQuizAttempt(
    quizId: string,
    submission: QuizAttemptSubmissionDto,
    userId?: string | null
  ): Promise<QuizAttemptResultDto> {
    // 1. Verify quiz exists
    const quizQuery = `
      SELECT id, drug_id, title, pass_percentage
      FROM quizzes
      WHERE id = $1;
    `;
    const quizResult = await getPool().query<RawQuizRow>(quizQuery, [quizId]);
    if (quizResult.rows.length === 0) {
      throw new NotFoundError('Quiz', quizId);
    }
    const quiz = quizResult.rows[0];

    // 2. Validate submission structure
    if (!submission || !Array.isArray(submission.answers) || submission.answers.length === 0) {
      throw new BadRequestError('Quiz submission must contain a non-empty answers array.');
    }

    // 3. Validation: No duplicate question answers
    const answeredQuestionIds = new Set<string>();
    for (const ans of submission.answers) {
      if (!ans.question_id || !ans.selected_option_id) {
        throw new BadRequestError('Each answer must specify question_id and selected_option_id.');
      }
      if (answeredQuestionIds.has(ans.question_id)) {
        throw new BadRequestError(`Duplicate answer submitted for question: '${ans.question_id}'.`);
      }
      answeredQuestionIds.add(ans.question_id);
    }

    // 4. Load all genuine questions for this quiz
    const questionsQuery = `
      SELECT id, question_order
      FROM quiz_questions
      WHERE quiz_id = $1;
    `;
    const questionsResult = await getPool().query<{ id: string; question_order: number }>(questionsQuery, [quizId]);
    const validQuestionsMap = new Map(questionsResult.rows.map((q) => [q.id, q]));

    // Check all submitted questions belong to this quiz
    for (const qId of answeredQuestionIds) {
      if (!validQuestionsMap.has(qId)) {
        throw new BadRequestError(`Question '${qId}' does not belong to quiz '${quizId}'.`);
      }
    }

    // 5. Load all options with correctness and explanations for grading
    const optionsQuery = `
      SELECT o.id, o.question_id, o.is_correct, o.explanation
      FROM quiz_options o
      JOIN quiz_questions q ON q.id = o.question_id
      WHERE q.quiz_id = $1;
    `;
    const optionsResult = await getPool().query<RawOptionVerificationRow>(optionsQuery, [quizId]);

    // Map: question_id -> Map of option_id -> option
    const optionsByQuestion = new Map<string, Map<string, RawOptionVerificationRow>>();
    for (const opt of optionsResult.rows) {
      let optMap = optionsByQuestion.get(opt.question_id);
      if (!optMap) {
        optMap = new Map();
        optionsByQuestion.set(opt.question_id, optMap);
      }
      optMap.set(opt.id, opt);
    }

    // 6. Strict validation: Every selected option must belong to the specified question
    for (const ans of submission.answers) {
      const questionOptions = optionsByQuestion.get(ans.question_id);
      if (!questionOptions || !questionOptions.has(ans.selected_option_id)) {
        throw new BadRequestError(
          `Selected option '${ans.selected_option_id}' is not a valid option for question '${ans.question_id}'.`
        );
      }
    }

    // 7. Server-side grading (Never trust client input)
    let correctCount = 0;
    const totalQuestions = questionsResult.rows.length;
    const feedbackDetails: QuizQuestionFeedbackDetailDto[] = [];
    const answerRecords: Array<{ question_id: string; selected_option_id: string; is_correct: boolean }> = [];

    for (const ans of submission.answers) {
      const opt = optionsByQuestion.get(ans.question_id)!.get(ans.selected_option_id)!;
      const isCorrect = Boolean(opt.is_correct);

      if (isCorrect) {
        correctCount++;
      }

      feedbackDetails.push({
        question_id: ans.question_id,
        correct: isCorrect,
        explanation: opt.explanation ?? undefined
      });

      answerRecords.push({
        question_id: ans.question_id,
        selected_option_id: ans.selected_option_id,
        is_correct: isCorrect
      });
    }

    const calculatedScore = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
    const passPercentage = parseFloat(String(quiz.pass_percentage));
    const isPassed = calculatedScore >= passPercentage;
    const completedAt = new Date().toISOString();
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 8. Conditional Persistence: Only authenticated attempts are saved to PostgreSQL
    if (userId) {
      const client = await getPool().connect();
      try {
        await client.query('BEGIN');

        // Persist attempt
        const insertAttemptSql = `
          INSERT INTO quiz_attempts (
            id, quiz_id, user_id, score, total_questions, correct_answers, passed, completed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `;
        await client.query(insertAttemptSql, [
          attemptId,
          quizId,
          userId,
          calculatedScore,
          totalQuestions,
          correctCount,
          isPassed,
          completedAt
        ]);

        // Persist answers
        for (const record of answerRecords) {
          const answerId = `ans-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          const insertAnsSql = `
            INSERT INTO quiz_attempt_answers (
              id, attempt_id, question_id, selected_option_id, is_correct
            ) VALUES ($1, $2, $3, $4, $5);
          `;
          await client.query(insertAnsSql, [
            answerId,
            attemptId,
            record.question_id,
            record.selected_option_id,
            record.is_correct
          ]);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      // Update user learning progress telemetry
      await progressService.recordQuizScore(userId, quiz.drug_id, calculatedScore, isPassed);
    }

    return {
      id: attemptId,
      quiz_id: quizId,
      user_id: userId ?? undefined,
      score: calculatedScore,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      passed: isPassed,
      completed_at: completedAt,
      details: feedbackDetails
    };
  }
}

export const quizService = new QuizService();

import { getPool } from '../../../database/pool.js';
import type { UserProgressDto } from '../../progress/dto/progress.dto.js';
import type { UserQuizAttemptSummaryDto, UserOverviewDto } from '../dto/users.dto.js';

interface RawProgressRow {
  id: string;
  user_id: string;
  drug_id: string;
  completed_nodes: string[];
  quiz_score: string | number | null;
  quiz_completed: boolean;
  last_accessed: Date | string;
}

interface RawAttemptRow {
  id: string;
  quiz_id: string;
  user_id: string;
  score: string | number | null;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  started_at: Date | string;
  completed_at: Date | string | null;
}

function mapProgressRow(row: RawProgressRow): UserProgressDto {
  return {
    id: row.id,
    user_id: row.user_id,
    drug_id: row.drug_id,
    completed_nodes: row.completed_nodes || [],
    quiz_score: row.quiz_score != null ? parseFloat(String(row.quiz_score)) : undefined,
    quiz_completed: Boolean(row.quiz_completed),
    last_accessed: new Date(row.last_accessed).toISOString()
  };
}

function mapAttemptRow(row: RawAttemptRow): UserQuizAttemptSummaryDto {
  return {
    id: row.id,
    quiz_id: row.quiz_id,
    user_id: row.user_id,
    score: row.score != null ? parseFloat(String(row.score)) : 0,
    passed: Boolean(row.passed),
    total_questions: row.total_questions,
    correct_count: row.correct_count,
    started_at: new Date(row.started_at).toISOString(),
    completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null
  };
}

export class UsersService {
  /**
   * Retrieves all progress records belonging exclusively to a single user.
   */
  public async getUserProgressList(userId: string): Promise<UserProgressDto[]> {
    const query = `
      SELECT id, user_id, drug_id, completed_nodes, quiz_score, quiz_completed, last_accessed
      FROM user_progress
      WHERE user_id = $1
      ORDER BY last_accessed DESC;
    `;
    const result = await getPool().query<RawProgressRow>(query, [userId]);
    return result.rows.map(mapProgressRow);
  }

  /**
   * Retrieves quiz attempt history belonging exclusively to a single user.
   */
  public async getUserAttempts(userId: string): Promise<UserQuizAttemptSummaryDto[]> {
    const query = `
      SELECT id, quiz_id, user_id, score, passed, total_questions, correct_count, started_at, completed_at
      FROM quiz_attempts
      WHERE user_id = $1
      ORDER BY started_at DESC;
    `;
    const result = await getPool().query<RawAttemptRow>(query, [userId]);
    return result.rows.map(mapAttemptRow);
  }

  /**
   * Retrieves aggregated learning overview for a user.
   */
  public async getUserOverview(userId: string): Promise<UserOverviewDto> {
    const [progress, recentAttempts] = await Promise.all([
      this.getUserProgressList(userId),
      this.getUserAttempts(userId)
    ]);

    const completedQuizzes = progress.filter((p) => p.quiz_completed).length;

    return {
      user_id: userId,
      total_drugs_tracked: progress.length,
      total_quizzes_completed: completedQuizzes,
      progress,
      recent_attempts: recentAttempts
    };
  }
}

export const usersService = new UsersService();

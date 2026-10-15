import { getPool } from '../../../database/pool.js';
import { UnauthorizedError, BadRequestError, ForbiddenError } from '../../../common/errors/AppError.js';
import { drugsService } from '../../drugs/services/drugs.service.js';
import type { UserProgressDto, UpdateProgressDto } from '../dto/progress.dto.js';

interface RawProgressRow {
  id: string;
  user_id: string;
  drug_id: string;
  completed_nodes: string[];
  quiz_score: string | number | null;
  quiz_completed: boolean;
  last_accessed: Date | string;
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

export class ProgressService {
  /**
   * Retrieves user progress for a drug.
   * If caller is anonymous (userId === null), returns a non-persistent default baseline.
   */
  public async getProgress(userId: string | null, drugId: string): Promise<UserProgressDto> {
    const resolvedDrug = await drugsService.getDrugById(drugId).catch(() => null);
    const canonicalDrugId = resolvedDrug ? resolvedDrug.id : drugId;

    if (!userId) {
      return {
        id: `anon-${canonicalDrugId}`,
        drug_id: canonicalDrugId,
        completed_nodes: [],
        quiz_score: undefined,
        quiz_completed: false,
        last_accessed: new Date().toISOString()
      };
    }

    const query = `
      SELECT id, user_id, drug_id, completed_nodes, quiz_score, quiz_completed, last_accessed
      FROM user_progress
      WHERE user_id = $1 AND drug_id = $2;
    `;

    const result = await getPool().query<RawProgressRow>(query, [userId, canonicalDrugId]);
    if (result.rows.length === 0) {
      return {
        id: `init-${userId}-${canonicalDrugId}`,
        user_id: userId,
        drug_id: canonicalDrugId,
        completed_nodes: [],
        quiz_score: undefined,
        quiz_completed: false,
        last_accessed: new Date().toISOString()
      };
    }

    return mapProgressRow(result.rows[0]);
  }

  /**
   * Saves or updates progress for an authenticated user.
   * Anonymous updates are rejected with UnauthorizedError (401).
   */
  public async saveProgress(
    userId: string | null,
    drugId: string,
    update: UpdateProgressDto
  ): Promise<UserProgressDto> {
    if (!userId) {
      throw new UnauthorizedError('Authentication required to persist progress to the database.');
    }

    // Resolve canonical drug ID (supports both full ID and short slug)
    const resolvedDrug = await drugsService.getDrugById(drugId).catch(() => null);
    const canonicalDrugId = resolvedDrug ? resolvedDrug.id : drugId;

    // Explicitly reject user_id tampering in request payload
    if ((update as any).user_id && (update as any).user_id !== userId) {
      throw new ForbiddenError('Access denied: Cannot modify progress belonging to another user.');
    }

    // Input validation
    if (update.completed_nodes !== undefined) {
      if (!Array.isArray(update.completed_nodes)) {
        throw new BadRequestError('completed_nodes must be an array of node identifiers.');
      }
      if (update.completed_nodes.length > 50) {
        throw new BadRequestError('completed_nodes exceeds maximum allowable items (50).');
      }
      for (const nodeId of update.completed_nodes) {
        if (typeof nodeId !== 'string' || nodeId.length > 64) {
          throw new BadRequestError(`Invalid node identifier in completed_nodes: '${String(nodeId)}'.`);
        }
      }
    }

    if (update.quiz_score !== undefined && update.quiz_score !== null) {
      const score = Number(update.quiz_score);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        throw new BadRequestError('quiz_score must be a number between 0 and 100.');
      }
    }

    const progressId = `prog-${userId}-${canonicalDrugId}`;
    const completedNodes = update.completed_nodes ?? null;
    const quizScore = update.quiz_score ?? null;
    const quizCompleted = update.quiz_completed ?? null;

    const query = `
      INSERT INTO user_progress (id, user_id, drug_id, completed_nodes, quiz_score, quiz_completed, last_accessed)
      VALUES (
        $1, $2, $3,
        COALESCE($4, '{}'::text[]),
        $5,
        COALESCE($6, false),
        NOW()
      )
      ON CONFLICT (user_id, drug_id) DO UPDATE SET
        completed_nodes = CASE
          WHEN EXCLUDED.completed_nodes IS NOT NULL AND array_length(EXCLUDED.completed_nodes, 1) > 0
          THEN EXCLUDED.completed_nodes
          ELSE user_progress.completed_nodes
        END,
        quiz_score = COALESCE(EXCLUDED.quiz_score, user_progress.quiz_score),
        quiz_completed = CASE
          WHEN EXCLUDED.quiz_completed = true THEN true
          ELSE user_progress.quiz_completed
        END,
        last_accessed = NOW()
      RETURNING id, user_id, drug_id, completed_nodes, quiz_score, quiz_completed, last_accessed;
    `;

    const result = await getPool().query<RawProgressRow>(query, [
      progressId,
      userId,
      drugId,
      completedNodes,
      quizScore,
      quizCompleted
    ]);

    return mapProgressRow(result.rows[0]);
  }

  /**
   * Helper to update quiz score directly on authenticated attempt completion.
   */
  public async recordQuizScore(
    userId: string,
    drugId: string,
    score: number,
    passed: boolean
  ): Promise<void> {
    const progressId = `prog-${userId}-${drugId}`;
    const query = `
      INSERT INTO user_progress (id, user_id, drug_id, completed_nodes, quiz_score, quiz_completed, last_accessed)
      VALUES ($1, $2, $3, '{}'::text[], $4, $5, NOW())
      ON CONFLICT (user_id, drug_id) DO UPDATE SET
        quiz_score = EXCLUDED.quiz_score,
        quiz_completed = CASE WHEN EXCLUDED.quiz_completed = true THEN true ELSE user_progress.quiz_completed END,
        last_accessed = NOW();
    `;

    await getPool().query(query, [progressId, userId, drugId, score, passed]);
  }
}

export const progressService = new ProgressService();

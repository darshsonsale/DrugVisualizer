import { getPool } from '../../../database/pool.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/AppError.js';
import { VALID_USER_ROLES } from '../../../middleware/authorization.js';
import type { UserRole } from '../../auth/models/user.model.js';
import type { AdminUserListItemDto, PlatformMetricsDto } from '../dto/admin.dto.js';
import { usersService } from '../../users/services/users.service.js';
import type { UserProgressDto } from '../../progress/dto/progress.dto.js';

interface RawAdminUserRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapAdminUserRow(row: RawAdminUserRow): AdminUserListItemDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url ?? undefined,
    role: row.role as UserRole,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

export class AdminService {
  /**
   * Lists all registered users in the platform.
   */
  public async listUsers(): Promise<AdminUserListItemDto[]> {
    const query = `
      SELECT id, email, name, avatar_url, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC;
    `;
    const result = await getPool().query<RawAdminUserRow>(query);
    return result.rows.map(mapAdminUserRow);
  }

  /**
   * Updates a user's role with validation.
   */
  public async updateUserRole(userId: string, newRoleInput: unknown): Promise<AdminUserListItemDto> {
    if (!newRoleInput || typeof newRoleInput !== 'string') {
      throw new BadRequestError('role must be a non-empty string.');
    }

    const normalizedRole = newRoleInput.trim().toLowerCase() as UserRole;
    if (!VALID_USER_ROLES.includes(normalizedRole)) {
      throw new BadRequestError(
        `Invalid role '${newRoleInput}'. Allowed roles are: ${VALID_USER_ROLES.join(', ')}.`
      );
    }

    const query = `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, avatar_url, role, created_at, updated_at;
    `;

    const result = await getPool().query<RawAdminUserRow>(query, [normalizedRole, userId]);
    if (result.rows.length === 0) {
      throw new NotFoundError('User', userId);
    }

    return mapAdminUserRow(result.rows[0]);
  }

  /**
   * Retrieves high-level operational platform metrics.
   */
  public async getPlatformMetrics(): Promise<PlatformMetricsDto> {
    const pool = getPool();

    const [usersRes, attemptsRes, progressRes, drugsRes, pathwaysRes] = await Promise.all([
      pool.query<{ role: string; count: string }>('SELECT role, COUNT(*)::text as count FROM users GROUP BY role;'),
      pool.query<{ count: string }>('SELECT COUNT(*)::text as count FROM quiz_attempts;'),
      pool.query<{ count: string }>('SELECT COUNT(*)::text as count FROM user_progress;'),
      pool.query<{ count: string }>('SELECT COUNT(*)::text as count FROM drugs;'),
      pool.query<{ count: string }>('SELECT COUNT(*)::text as count FROM pathways;')
    ]);

    let totalUsers = 0;
    const roleBreakdown: Record<string, number> = {};

    for (const row of usersRes.rows) {
      const cnt = parseInt(row.count, 10) || 0;
      totalUsers += cnt;
      roleBreakdown[row.role] = cnt;
    }

    return {
      total_users: totalUsers,
      total_attempts: parseInt(attemptsRes.rows[0]?.count || '0', 10),
      total_progress_records: parseInt(progressRes.rows[0]?.count || '0', 10),
      total_drugs: parseInt(drugsRes.rows[0]?.count || '0', 10),
      total_pathways: parseInt(pathwaysRes.rows[0]?.count || '0', 10),
      role_breakdown: roleBreakdown
    };
  }

  /**
   * Allows administrator to inspect any user's progress.
   */
  public async getUserProgress(userId: string): Promise<UserProgressDto[]> {
    return usersService.getUserProgressList(userId);
  }
}

export const adminService = new AdminService();

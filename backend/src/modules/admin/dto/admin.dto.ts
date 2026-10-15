import type { UserRole } from '../../auth/models/user.model.js';

export interface AdminUserListItemDto {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface PlatformMetricsDto {
  total_users: number;
  total_attempts: number;
  total_progress_records: number;
  total_drugs: number;
  total_pathways: number;
  role_breakdown: Record<string, number>;
}

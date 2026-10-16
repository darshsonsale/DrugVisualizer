export type UserRole = 'learner' | 'educator' | 'admin';

export interface User {
  id: string;
  google_id: string | null;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  password_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawUserRow {
  id: string;
  google_id: string | null;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  password_hash?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}


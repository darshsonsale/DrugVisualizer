export type UserRole = 'learner' | 'educator' | 'admin';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface RawUserRow {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: Date | string;
  updated_at: Date | string;
}

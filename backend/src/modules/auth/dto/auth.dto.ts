import type { UserRole } from '../models/user.model.js';

export interface UserProfileDto {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthSessionResponseDto {
  token: string;
  expires_in: string;
  user: UserProfileDto;
}

export interface GoogleVerifyTokenDto {
  id_token: string;
}

export interface GoogleAuthUrlResponseDto {
  url: string;
  state: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  name?: string;
}


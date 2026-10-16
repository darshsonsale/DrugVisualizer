/**
 * Drug Path Visualiser - Authentication Service
 * Manages Google OAuth 2.0 / OIDC flows, JWT session tokens, and user profiles.
 */

import { apiClient } from '../api/client';
import type {
  UserProfile,
  AuthSessionResponse,
  GoogleAuthUrlResponse
} from '../api/types';

export class AuthService {
  /**
   * Fetches the Google OAuth 2.0 authorization URL with CSRF state parameter.
   */
  public static async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    return apiClient.get<GoogleAuthUrlResponse>('/auth/google/url');
  }

  /**
   * Exchanges authorization code for a session JWT.
   */
  public static async handleGoogleCallback(code: string, state: string): Promise<AuthSessionResponse> {
    return apiClient.get<AuthSessionResponse>(
      `/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    );
  }

  /**
   * Authenticates user via Google Identity Services (GIS) ID Token.
   */
  public static async verifyGoogleIdToken(idToken: string): Promise<AuthSessionResponse> {
    return apiClient.post<AuthSessionResponse>('/auth/google/verify', { id_token: idToken });
  }

  /**
   * Retrieves profile of current authenticated user.
   */
  public static async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  }

  /**
   * Logs in a regular user with email and password.
   */
  public static async loginWithPassword(email: string, password: string): Promise<AuthSessionResponse> {
    return apiClient.post<AuthSessionResponse>('/auth/login', { email, password });
  }

  /**
   * Registers a new regular user with username, email, and password.
   */
  public static async registerWithPassword(email: string, password: string, name?: string): Promise<AuthSessionResponse> {
    return apiClient.post<AuthSessionResponse>('/auth/register', { email, password, name });
  }

  /**
   * Logs in an administrator via dedicated endpoint enforcing database 'admin' role.
   */
  public static async loginAdministrator(email: string, password: string): Promise<AuthSessionResponse> {
    return apiClient.post<AuthSessionResponse>('/auth/admin/login', { email, password });
  }

  /**
   * Signals session termination to backend.
   */
  public static async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout');
  }
}

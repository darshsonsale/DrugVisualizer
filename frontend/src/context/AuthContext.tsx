import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../api/client';
import { AuthService } from '../services/authService';
import type { UserProfile, AuthSessionResponse } from '../api/types';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<UserProfile>;
  registerWithPassword: (email: string, password: string, name?: string) => Promise<UserProfile>;
  loginAdministrator: (email: string, password: string) => Promise<UserProfile>;
  loginWithDemoAccount: (role?: 'learner' | 'admin') => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('biolumen_auth_token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize session token with apiClient and localStorage
  const setSession = useCallback((session: AuthSessionResponse | null) => {
    if (session && session.token) {
      setToken(session.token);
      setUser(session.user);
      apiClient.setAuthToken(session.token);
      localStorage.setItem('biolumen_auth_token', session.token);
    } else {
      setToken(null);
      setUser(null);
      apiClient.setAuthToken(null);
      localStorage.removeItem('biolumen_auth_token');
    }
  }, []);

  // Restore authenticated session from persistent storage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('biolumen_auth_token');
    if (savedToken && !user) {
      setLoading(true);
      apiClient.setAuthToken(savedToken);
      AuthService.getMe()
        .then((profile) => {
          setUser(profile);
          setError(null);
        })
        .catch((err) => {
          console.warn('[AuthContext] Stored session verification failed:', err);
          localStorage.removeItem('biolumen_auth_token');
          apiClient.setAuthToken(null);
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Listen for popup OAuth messages from callback page
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Validate event origin
      if (event.origin !== window.location.origin && !event.origin.includes('localhost') && !event.origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'DRUG_VISUALIZER_AUTH_SUCCESS' && event.data?.session) {
        setSession(event.data.session);
        setLoading(false);
        setError(null);
      } else if (event.data?.type === 'DRUG_VISUALIZER_AUTH_ERROR') {
        setError(event.data.error || 'Google authentication failed');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [setSession]);

  // Check for auth_token query parameter in case of full-page redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    if (authToken) {
      // Clean query parameter from URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
      apiClient.setAuthToken(authToken);
      setToken(authToken);

      // Fetch user profile
      AuthService.getMe()
        .then((profile) => {
          setUser(profile);
          setError(null);
        })
        .catch((err) => {
          console.warn('[AuthContext] Failed to retrieve user profile from token:', err);
          setSession(null);
        });
    }
  }, [setSession]);

  // Initiate Google OAuth 2.0 Sign In
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { url } = await AuthService.getGoogleAuthUrl();

      // Check if client_id is configured in Google URL
      let hasValidClientId = false;
      try {
        const parsed = new URL(url);
        const cid = parsed.searchParams.get('client_id');
        hasValidClientId = Boolean(cid && cid.trim() !== '');
      } catch {
        hasValidClientId = false;
      }

      if (!hasValidClientId) {
        setError(
          'Google OAuth Client ID is not configured in backend/.env. Add GOOGLE_CLIENT_ID to enable live Google login, or use Demo Sign In.'
        );
        setLoading(false);
        return;
      }

      // Open a centered popup for the Google consent flow
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        url,
        'GoogleSignIn',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
      );

      if (!popup) {
        setError('Popup was blocked by your browser. Please allow popups for localhost to sign in with Google.');
        setLoading(false);
        return;
      }

      // Track if user manually closed popup without completing
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setLoading(false);
        }
      }, 500);
    } catch (err: unknown) {
      let message = 'Unable to connect to Google authentication service';
      if (err instanceof ApiError) {
        if (err.code === 'NETWORK_ERROR') {
          message = 'Cannot connect to backend server at http://localhost:3000. Ensure the backend server is running.';
        } else {
          message = `${err.message} (${err.code || `HTTP ${err.status}`})`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setLoading(false);
    }
  }, []);

  // Authenticate directly via GIS ID Token
  const loginWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError(null);

      try {
        const session = await AuthService.verifyGoogleIdToken(idToken);
        setSession(session);
      } catch (err: unknown) {
        let message = 'Google verification failed';
        if (err instanceof ApiError) {
          if (err.code === 'NETWORK_ERROR') {
            message = 'Cannot connect to backend server at http://localhost:3000. Ensure the backend server is running.';
          } else {
            message = `${err.message} (${err.code || `HTTP ${err.status}`})`;
          }
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  // Authenticate as verified administrator for testing & content management
  const loginAsAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = 'mock-google-token:google-demo-admin-biolumen:admin@biolumen.org:BioLumen+Admin';
      const session = await AuthService.verifyGoogleIdToken(adminToken);
      setSession(session);
      setError(null);
    } catch (err: unknown) {
      let message = 'Admin sign-in failed';
      if (err instanceof ApiError) {
        if (err.code === 'NETWORK_ERROR') {
          message = 'Cannot connect to backend server at http://localhost:3000. Ensure the backend server is running.';
        } else {
          message = `${err.message} (${err.code || `HTTP ${err.status}`})`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  // Authenticate with development demo account (learner or admin)
  const loginWithDemoAccount = useCallback(async (role: 'learner' | 'admin' = 'learner') => {
    if (role === 'admin') {
      return loginAsAdmin();
    }
    setLoading(true);
    setError(null);
    try {
      const demoToken = 'mock-google-token:google-demo-user:demo.learner@biolumen.org:Demo+Learner';
      const session = await AuthService.verifyGoogleIdToken(demoToken);
      setSession(session);
      setError(null);
    } catch (err: unknown) {
      let message = 'Demo sign-in failed';
      if (err instanceof ApiError) {
        if (err.code === 'NETWORK_ERROR') {
          message = 'Cannot connect to backend server at http://localhost:3000. Ensure the backend server is running.';
        } else {
          message = `${err.message} (${err.code || `HTTP ${err.status}`})`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setSession, loginAsAdmin]);

  // Log in regular user with email and password
  const loginWithPassword = useCallback(async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const session = await AuthService.loginWithPassword(email, password);
      setSession(session);
      return session.user;
    } catch (err: unknown) {
      let message = 'Login failed';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  // Register regular user with username, email, and password (role = 'learner')
  const registerWithPassword = useCallback(async (email: string, password: string, name?: string): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const session = await AuthService.registerWithPassword(email, password, name);
      setSession(session);
      return session.user;
    } catch (err: unknown) {
      let message = 'Registration failed';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  // Dedicated administrator login (strictly enforces database role = 'admin')
  const loginAdministrator = useCallback(async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      const session = await AuthService.loginAdministrator(email, password);
      setSession(session);
      return session.user;
    } catch (err: unknown) {
      let message = 'Administrator login failed';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  // Terminate session
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } catch {
      // Safe client-side cleanup even if network fails
    } finally {
      setSession(null);
      setLoading(false);
      setError(null);
    }
  }, [setSession]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        error,
        loginWithGoogle,
        loginWithGoogleIdToken,
        loginWithPassword,
        registerWithPassword,
        loginAdministrator,
        loginWithDemoAccount,
        loginAsAdmin,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

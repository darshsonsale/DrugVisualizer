import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const {
    loginWithPassword,
    registerWithPassword,
    loginWithGoogle,
    user,
    isAuthenticated
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/content', { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithPassword(email, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerWithPassword(email, password, name);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <span className="auth-badge learner">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            school
          </span>
          BioLumen Learning Portal
        </span>

        <h1 className="auth-title">
          {activeTab === 'signin' ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="auth-subtitle">
          {activeTab === 'signin'
            ? 'Sign in to sync your molecular pharmacology progress, quiz mastery, and personalized insights.'
            : 'Join students and educators mastering pharmacokinetics and dynamic biological pathways.'}
        </p>

        {/* 3 Clearly Distinguishable Options */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'signin'}
            className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              login
            </span>
            <span>1. Sign In</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              person_add
            </span>
            <span>2. Register</span>
          </button>
        </div>

        {error && (
          <div className="auth-error-box" role="alert" style={{ marginBottom: '18px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="auth-field">
              <label htmlFor="signin-email">Email Address / Username</label>
              <input
                id="signin-email"
                type="text"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. Yash Wadhwani or name@university.edu"
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signin-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input-with-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label htmlFor="reg-name">Your Full Name (Optional)</label>
              <input
                id="reg-name"
                type="text"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password">Create Password (Minimum 8 characters)</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input-with-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                person_add
              </span>
              <span>{loading ? 'Creating Account...' : 'Register as Learner'}</span>
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={() => loginWithGoogle()}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{activeTab === 'signin' ? 'Sign In with Google' : 'Register with Google'}</span>
        </button>

        {/* Option 3: Clearly Distinguishable Administrator Sign-In Banner */}
        <div className="admin-switch-banner">
          <div className="admin-banner-text">
            <span className="admin-banner-title">3. Administrator Access</span>
            <span className="admin-banner-desc">Are you a clinical reviewer or content curator?</span>
          </div>
          <Link to="/admin/login" className="admin-banner-link">
            Administrator Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

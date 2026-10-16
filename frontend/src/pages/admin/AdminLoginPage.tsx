import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdministrator, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as admin, offer direct jump or redirect
  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/content', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await loginAdministrator(email, password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin/content', { replace: true });
      } else {
        setError('Access denied. Administrator privileges are required to access this portal.');
      }
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card admin-card">
        <span className="auth-badge admin">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            admin_panel_settings
          </span>
          Restricted Portal
        </span>

        <h1 className="auth-title">Administrator Sign In</h1>
        <p className="auth-subtitle">
          Secure identity verification for BioLumen clinical reviewers, medical content editors, and system administrators.
        </p>

        {error && (
          <div className="auth-error-box" role="alert" style={{ marginBottom: '18px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>
              gpp_bad
            </span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="admin-email">Administrator Email / Username</label>
            <input
              id="admin-email"
              type="text"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin or admin@biolumen.org"
              required
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="admin-password">Administrator Password</label>
            <div className="auth-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input-with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
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
              security
            </span>
            <span>{loading ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Not an administrator?</span>
          <Link to="/login">Go to Learner Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

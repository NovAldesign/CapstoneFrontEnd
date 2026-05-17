import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginService from '../Services/loginService';
import "../Styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginService.login(formData.email, formData.password);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'partner') {
        navigate('/partner/vault');
      } else {
        navigate('/member/profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left-inner">
          <span className="login-left-eyebrow">Atlanta & Beyond</span>
          <h1 className="playfair login-left-title">
            Grown Folks<br />Collective.
          </h1>
          <div className="login-left-rule"></div>
          <p className="login-left-lead">
            Where Atlanta's finest come to connect.
            Excellence, intention, and genuine community — every Saturday night.
          </p>

          <div className="login-left-stats">
            <div className="login-stat">
              <div className="login-stat-number">1,500+</div>
              <div className="login-stat-label">Community members</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-number">250%+</div>
              <div className="login-stat-label">Venue sales lift</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-number">40</div>
              <div className="login-stat-label">Guests per event</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-card">

          <div className="login-header">
            <span className="login-card-eyebrow">Member Portal</span>
            <h2 className="playfair login-card-title">GFC Portal</h2>
            <p className="login-card-sub">Reconnect with your community.</p>
          </div>

          {/* Rate limiter / error display — logic unchanged */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form" noValidate>

            <div className="login-input-group">
              <label className="login-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="login-input"
              />
            </div>

            <div className="login-input-group">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="login-forgot">
                  Forgot Password?
                </Link>
              </div>
              <div className="login-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-show-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Enter the Collective'}
            </button>

          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-footer">
            <p>
              Not yet a member?{' '}
              <Link to="/membership" className="login-footer-link">
                Start your journey here.
              </Link>
            </p>
            <p>
              Interested in partnering?{' '}
              <Link to="/partnerships" className="login-footer-link">
                View partnership options.
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
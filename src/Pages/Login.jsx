import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import loginService from '../Services/loginService';
import "../Styles/Login.css";

const Login = () => {
  const [formData, setFormData]       = useState({ email: '', password: '', accessKey: '' });
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const navigate                      = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginService.login(
        formData.email,
        formData.password,
        formData.accessKey || ''
      );

      // Route based on role
      const role = user.role?.toLowerCase();
      if (role === 'admin' || role === 'moderator') {
        navigate('/admin/dashboard');
      } else if (role === 'partner') {
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
      <Helmet>
        <title>Log In | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left-inner">
          <span className="login-left-eyebrow">Atlanta · 30+ · Alcohol-Free</span>
          <h1 className="playfair login-left-title">
            Grown Folks<span style={{ fontSize: '0.35em', verticalAlign: 'super', marginLeft: '2px' }}>™</span><br />Collective
          </h1>
          <div className="login-left-rule"></div>
          <p className="login-left-lead">
            Where grown folks come out to play.™ Game nights, live music,
            karaoke and good company for Atlanta adults 30+.
          </p>

          <div className="login-left-stats">
            <div className="login-stat">
              <div className="login-stat-number">2,270+</div>
              <div className="login-stat-label">Community in Atlanta</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-number">30+</div>
              <div className="login-stat-label">Grown folks only</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-number">100%</div>
              <div className="login-stat-label">Alcohol-free</div>
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
            <p className="login-card-sub">Welcome back.</p>
          </div>

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
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Access Key — staff/admin only, hidden by default */}
            <div className="login-access-toggle">
              <button
                type="button"
                className="login-access-toggle-btn"
                onClick={() => {
                  setShowAccessKey(p => !p);
                  setFormData(prev => ({ ...prev, accessKey: '' }));
                }}
              >
                {showAccessKey ? '− Staff login' : '+ Staff / Admin access'}
              </button>
            </div>

            {showAccessKey && (
              <div className="login-input-group login-access-key-group">
                <label className="login-label" htmlFor="accessKey">
                  Access Key
                </label>
                <input
                  id="accessKey"
                  type="password"
                  name="accessKey"
                  value={formData.accessKey}
                  onChange={handleChange}
                  placeholder="Enter your staff access key"
                  autoComplete="off"
                  className="login-input"
                />
                <span className="login-input-hint">
                  Staff and admin use only.
                </span>
              </div>
            )}

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
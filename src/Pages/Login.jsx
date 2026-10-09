import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import loginService from '../Services/loginService';
import memberApi from '../Services/memberApi';
import "../Styles/Login.css";

const Login = () => {
  const [formData, setFormData]       = useState({ email: '', password: '', accessKey: '' });
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const navigate                      = useNavigate();

  // Members log in with an emailed link; staff and partners use a password
  const [staffMode, setStaffMode]     = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [linkSent, setLinkSent]       = useState('');

  // Already logged in as a member? Go straight to the dashboard
  useEffect(() => {
    const user = loginService.getCurrentUser();
    if (user?.role === 'member' && loginService.getToken()) navigate('/member/dashboard', { replace: true });
  }, [navigate]);

  const sendLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail.trim())) {
      setError('Please enter the email you used to join.');
      return;
    }
    setLoading(true);
    try {
      const { message } = await memberApi.requestLink(memberEmail.trim());
      setLinkSent(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        navigate('/member/dashboard');
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
            <span className="login-card-eyebrow">{staffMode ? 'Staff & Partners' : 'Member Login'}</span>
            <h2 className="playfair login-card-title">Welcome back</h2>
            <p className="login-card-sub">
              {staffMode
                ? 'Log in with your password.'
                : "Enter the email you joined with and we'll send you a one-tap login link. No password needed."}
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {!staffMode && (linkSent ? (
            <div className="login-sent" role="status">
              <span className="login-sent-icon" aria-hidden="true">✉</span>
              <h3 className="playfair login-sent-title">Check your email</h3>
              <p>{linkSent}</p>
              <p className="login-sent-hint">
                Don't see it? Check your spam or promotions folder, or{' '}
                <button type="button" className="login-text-btn" onClick={() => { setLinkSent(''); setError(''); }}>
                  try a different email
                </button>.
              </p>
            </div>
          ) : (
            <form onSubmit={sendLink} className="login-form" noValidate>
              <div className="login-input-group">
                <label className="login-label" htmlFor="member-email">Email Address</label>
                <input
                  id="member-email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => { setMemberEmail(e.target.value); if (error) setError(''); }}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="login-input"
                />
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Email Me a Login Link'}
              </button>
            </form>
          ))}

          {staffMode && (
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
          )}

          <div className="login-access-toggle login-mode-toggle">
            <button
              type="button"
              className="login-access-toggle-btn"
              onClick={() => { setStaffMode((m) => !m); setError(''); setLinkSent(''); }}
            >
              {staffMode ? '← Member login' : 'Staff or partner? Log in with a password'}
            </button>
          </div>

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
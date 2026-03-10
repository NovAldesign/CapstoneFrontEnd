import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginService from '../Services/loginService'; 
import "../Styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Using loginService
      const user = await loginService.login(formData.email, formData.password);
      
      // Redirect based on the role the service/backend identified
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'partner') {
        navigate('/partner/vault');
      } else {
        navigate('/member/profile');
      }
    } catch (err) {
      // This will catch the "Too many attempts" error from your limiter
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="playfair">GFC Portal</h2>
          <p>Reconnect with your community.</p>
        </div>

        {/* This error box will display Rate Limiter message if they try > 3 times */}
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              required 
            />
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Enter the Collective"}
          </button>
        </form>

        <div className="login-footer">
          <p>Not yet a member? <Link to="/membership">Start your journey here.</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
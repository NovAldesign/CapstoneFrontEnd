import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../Services/eventUtils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
      <h2 className="playfair">Forgot Your Password?</h2>
      <p style={{ color: '#555', fontSize: '14px' }}>
        Enter the email on your admin account and we'll send you a link to set a new password.
      </p>

      {error && <p role="alert" style={{ color: '#B3261E', fontSize: '14px' }}>{error}</p>}
      {message ? (
        <p role="status" style={{ color: '#2E7D32', fontSize: '15px', marginTop: '24px' }}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="forgot-email" style={{ display: 'block', fontWeight: 'bold', fontSize: '12px' }}>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#002147', color: 'white', border: 'none', padding: '12px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : 'Email Me a Reset Link'}
          </button>
        </form>
      )}

      <p style={{ marginTop: '24px', fontSize: '14px' }}>
        <Link to="/login" style={{ color: '#9A7630', fontWeight: 600 }}>Back to login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
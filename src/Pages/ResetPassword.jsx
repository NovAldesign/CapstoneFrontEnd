import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams(); // Catches the token from /reset-password/:token
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirects to login page after 3 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
      <h2 className="playfair">Set New Password</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Please choose a secure password for your administrative profile.</p>

      {error && <p style={{ color: '#E05C5C', fontSize: '14px' }}>{error}</p>}
      {message && <p style={{ color: '#4CAF7D', fontSize: '14px' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px' }}>New Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px' }}>Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#002147', color: 'white', border: 'none', padding: '12px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Updating Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
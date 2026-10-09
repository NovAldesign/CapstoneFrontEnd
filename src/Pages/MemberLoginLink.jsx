import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import memberApi from '../Services/memberApi';
import '../Styles/MemberDashboard.css';

// Opened from the login email: /member/login/:token
const MemberLoginLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false); // React dev mode runs effects twice; the link only works once

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    memberApi
      .verify(token)
      .then(() => navigate('/member/dashboard', { replace: true }))
      .catch((err) => setError(err.message));
  }, [token, navigate]);

  return (
    <div className="md-gate">
      <Helmet>
        <title>Logging In | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {error ? (
        <div className="md-gate-card" role="alert">
          <h1 className="playfair">That link didn't work</h1>
          <p>{error}</p>
          <Link to="/login" className="md-btn md-btn-gold">Send me a new link</Link>
        </div>
      ) : (
        <div className="md-gate-card" role="status">
          <div className="md-spinner" aria-hidden="true" />
          <h1 className="playfair">Logging you in…</h1>
        </div>
      )}
    </div>
  );
};

export default MemberLoginLink;

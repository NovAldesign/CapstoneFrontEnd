import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../Styles/Membership.css';

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="membership-page">
      <div className="ms-screen">
        <div className="ms-inner">

          <div className="ms-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="27" stroke="#C5A059" strokeWidth="1.5" />
              <path
                d="M17 28l8 8 14-14"
                stroke="#C5A059"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="ms-eyebrow">Welcome to the Collective</span>
          <h1 className="ms-heading">You're In.</h1>
          <div className="ms-divider" />

          <p className="ms-body">
            Your membership is confirmed. Check your email for a confirmation
            and next steps. We'll see you at the next event.
          </p>

          {sessionId && (
            <div className="ms-ref">
              <span className="ms-ref-label">Reference</span>
              <span className="ms-ref-value">{sessionId.slice(-12).toUpperCase()}</span>
            </div>
          )}

          <button className="gold-submit-btn gold-submit-btn-font ms-btn" onClick={() => navigate('/')}>
            Back to Home
          </button>

          <p className="ms-countdown">
            Redirecting in {countdown}s
          </p>

        </div>
      </div>
    </div>
  );
};

export default MembershipSuccess;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Membership.css';

const MembershipCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="membership-page">
      <div className="ms-screen">
        <div className="ms-inner">

          <div className="ms-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="27" stroke="rgba(197,160,89,0.4)" strokeWidth="1.5" />
              <path
                d="M20 28h16"
                stroke="#C5A059"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="ms-eyebrow">No Worries</span>
          <h1 className="ms-heading">Checkout Cancelled.</h1>
          <div className="ms-divider" />

          <p className="ms-body">
            Your spot hasn't been taken yet. Founding Member slots are
            limited — head back whenever you're ready to complete your membership.
          </p>

          <div className="ms-actions">
            <button
              className="gold-submit-btn gold-submit-btn-font ms-btn"
              onClick={() => navigate('/membership')}
            >
              Return to Membership
            </button>
            <button
              className="ms-ghost-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MembershipCancelled;
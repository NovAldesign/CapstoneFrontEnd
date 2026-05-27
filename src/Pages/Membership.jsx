import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../Styles/Membership.css';
import membershipService from '../Services/membershipService';

const TIERS = [
  {
    id: 'Social',
    name: 'Social Pass',
    price: '$39',
    note: '/month',
    badge: null,
    featured: false,
    features: [
      '1 Game Night ticket per month ($20 value)',
      'Priority booking 24 hrs before public sale',
      'Discounted tickets on Wind Down & Cookout events ($40 instead of $50)',
      'Access to private member community',
      'Choose 1 card deck at month 3 — GFC Playing Cards or Intentional Conversation Cards',
    ],
  },
  {
    id: 'Founding',
    name: 'Founding Member',
    price: '$69',
    note: '/month · First 40 only',
    badge: 'Founding Member',
    featured: true,
    features: [
      'Everything in Social Pass',
      '1 free Guest Pass per month — bring anyone to any event',
      '48-hr priority booking (longer window than Social Pass)',
      '1 free Wind Down Wednesday or Cookout ticket per quarter',
      '50% off the GFC Wooden Box upgrade at month 3',
      'Choose 1 card deck at month 3 — GFC Playing Cards or Intentional Conversation Cards',
      'Founding Member status locked for life',
    ],
  },
];

const TIER_PRICES = {
  Social: '$39/mo',
  Founding: '$69/mo',
};

const Membership = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    tier: 'Founding',
    connectionGoals: {
      primaryInterest: 'Meet New People',
      isolationBarrier: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const [outer, inner] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [outer]: { ...prev[outer], [inner]: val },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }

    if (feedback) setFeedback(null);
  };

  const handleTierSelect = (tierId) => {
    setFormData(prev => ({ ...prev, tier: tierId }));
    setTimeout(() => {
      const formEl = document.querySelector('.applicant-container');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const submissionData = { ...formData };

      await membershipService.createMembership(submissionData);

      setFeedback({
        type: 'success',
        message: 'Application received. Your journey with the Collective begins now.',
      });

      setTimeout(() => navigate('/login'), 2800);

    } catch (err) {
      console.error('Submission Error:', err.response?.data);
      const errorMsg =
        err.response?.data?.error ||
        'Submission error. Please check your details and try again.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTier = TIERS.find(t => t.id === formData.tier);

  return (
    <div className="membership-page">
      <Helmet>
        <title>Join the Collective | Grown Folks Collective Membership</title>
        <meta
          name="description"
          content="Become a member of the Grown Folks Collective. Choose your membership tier to access exclusive events, intentional dinners, and a community dedicated to ending social isolation."
        />
      </Helmet>

      {/* ── HERO ── */}
      <header className="membership-hero">
        <div className="hero-content-right">
          <span className="location-tag">A Life of Joy &amp; Adventure</span>
          <h1 className="luxe-title">The Collective</h1>
          <div className="gold-spacer-bar"></div>
          <div className="mission-narrative">
            <p className="narrative-lead">Success shouldn't be a solo journey.</p>
            <p className="narrative-body">
              The <strong>Grown Folks Collective</strong> is centered around
              authentic connection and ending social isolation.
            </p>
            <p className="narrative-impact">
              Join a collective where excellence meets genuine connection.
            </p>
          </div>
        </div>
      </header>

      {/* ── TIER SELECTOR ── */}
      <section className="tier-selector-section">
        <span className="tier-eyebrow">Choose Your Level</span>
        <h2 className="playfair tier-heading">Select Your Membership</h2>
        <p className="tier-subhead">
          No contracts. Cancel anytime. Founding rate locked for life.
        </p>

        <div className="tier-cards">
          {TIERS.map(tier => (
            <div
              key={tier.id}
              className={[
                'tier-card',
                tier.featured ? 'featured' : '',
                formData.tier === tier.id ? 'active' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleTierSelect(tier.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTierSelect(tier.id);
                }
              }}
              aria-pressed={formData.tier === tier.id}
              aria-label={`Select ${tier.name} membership at ${tier.price} per month`}
            >
              {tier.badge && (
                <span className="tier-badge">{tier.badge}</span>
              )}
              <div className="tier-name">{tier.name}</div>
              <div className="tier-price">{tier.price}</div>
              <div className="tier-price-note">{tier.note}</div>
              <div className="tier-divider"></div>
              <ul className="tier-features">
                {tier.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="founding-note">
          <p>
            <strong>Founding Member offer:</strong> Only 40 Founding Member spots available.
            Once filled, this tier closes permanently. Members lock in their rate for life.
          </p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="form-section">
        <div className="applicant-container">
          <h2 className="section-header-font">Request Membership</h2>
          <p className="form-intro-font">Let's start the conversation.</p>

          {/* Selected tier display */}
          <div className="selected-tier-display">
            <div>
              <div className="tier-display-label">Selected Tier</div>
              <div className="tier-display-value">{selectedTier?.name}</div>
            </div>
            <div className="tier-display-price">
              {TIER_PRICES[formData.tier]}
            </div>
            <button
              type="button"
              className="tier-change-link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Change &uarr;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="luxe-form" noValidate>

            {/* Identity */}
            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="firstName">First Name</label>
                <input
                  id="firstName" type="text" name="firstName"
                  value={formData.firstName} onChange={handleChange}
                  required autoComplete="given-name"
                />
              </div>
              <div className="input-group">
                <label className="label-font" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName" type="text" name="lastName"
                  value={formData.lastName} onChange={handleChange}
                  required autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="email">Email Address</label>
                <input
                  id="email" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required autoComplete="email"
                />
              </div>
              <div className="input-group">
                <label className="label-font" htmlFor="phone">Phone Number</label>
                <input
                  id="phone" type="tel" name="phone"
                  value={formData.phone} onChange={handleChange}
                  required autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="dob">Date of Birth</label>
                <input
                  id="dob" type="date" name="dob"
                  value={formData.dob} onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Experience & Preferences */}
            <div className="form-divider-font">Experience &amp; Preferences</div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="primaryInterest">Primary Interest</label>
                <select
                  id="primaryInterest"
                  name="connectionGoals.primaryInterest"
                  value={formData.connectionGoals.primaryInterest}
                  onChange={handleChange}
                >
                  <option value="Meet New People">Meet New People</option>
                  <option value="Play / Games">Play / Games</option>
                  <option value="Local Events">Local Events</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="label-font" htmlFor="isolationBarrier">
                What is your biggest barrier to social connection lately?
              </label>
              <textarea
                id="isolationBarrier"
                name="connectionGoals.isolationBarrier"
                className="luxe-textarea"
                value={formData.connectionGoals.isolationBarrier}
                onChange={handleChange}
                placeholder="Share your story..."
              />
            </div>

            {feedback && (
              <div className={`form-feedback ${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="gold-submit-btn-font gold-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing Application...'
                : 'Apply to the Collective'}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
};

export default Membership;
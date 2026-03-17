import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Membership.css';
import membershipService from '../Services/membershipService';

const TIERS = [
  {
    id: 'Silver',
    name: 'Silver',
    price: '$20',
    note: '/month · Founding rate',
    badge: 'Founding Member',
    featured: true,
    features: [
      'Priority access to all events before public sale',
      'Member pricing on every event',
      '$10 off Intentional Conversations dinners',
      'Access to private member community',
      'Founding Member recognition',
      'First access to group travel announcements',
    ],
  },
  {
    id: 'Gold',
    name: 'Gold',
    price: '$35',
    note: '/month',
    badge: null,
    featured: false,
    features: [
      'All Silver tier benefits',
      '$15 off Intentional Conversations dinners',
      'Early access to tournaments',
      'GFC apparel credit ($25/quarter)',
      'VIP seating at signature events',
      'Priority group travel selection',
    ],
  },
  {
    id: 'Platinum',
    name: 'Platinum',
    price: '$60',
    note: '/month',
    badge: null,
    featured: false,
    features: [
      'All Gold tier benefits',
      'One complimentary event per month',
      'Dedicated travel concierge',
      'Private Platinum member dinners',
      'GFC apparel credit ($60/quarter)',
      'Co-host opportunities at select events',
    ],
  },
];

const TIER_PRICES = {
  Silver: '$20/mo',
  Gold: '$35/mo',
  Platinum: '$60/mo',
};

const Membership = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    industry: '',
    tier: 'Silver',
    securityQuestion: "What was the name of your first pet?",
    securityAnswer: '',
    connectionGoals: {
      socialSatisfaction: 5,
      primaryInterest: 'Meet New People',
      isolationBarrier: '',
    },
    preferences: {
      dietaryRestrictions: '',
      apparelSize: 'M',
      favoriteMocktail: '',
      golfSkillLevel: 'Never Played',
    },
    hasPassport: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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

  // FIXED: clicking a tier card now directly updates formData.tier
  // AND scrolls down to the form so the user sees the change reflected
  const handleTierSelect = (tierId) => {
    setFormData(prev => ({ ...prev, tier: tierId }));
    // Small delay lets the active class paint before scroll
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
      const submissionData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          dietaryRestrictions: formData.preferences.dietaryRestrictions
            ? formData.preferences.dietaryRestrictions.split(',').map(s => s.trim())
            : [],
        },
      };

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
  const sliderVal = formData.connectionGoals.socialSatisfaction;

  return (
    <div className="membership-page">

      {/* ── HERO ── */}

  <header className="membership-hero">
    <div className="hero-dark-overlay-right">
      <div className="hero-content-right">
        <span className="location-tag">A Life of Joy & Adventure</span>
        <h1 className="luxe-title">The Collective</h1>
        <div className="gold-spacer-bar"></div>
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
            <strong>Founding Member offer:</strong> The first 50 members lock
            in Silver at $20/month for life. After 50 spots fill, Silver moves
            to $25/month.
          </p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="form-section">
        <div className="applicant-container">
          <h2 className="section-header-font">Request Membership</h2>
          <p className="form-intro-font">Let's start the conversation.</p>

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
              <div className="input-group">
                <label className="label-font" htmlFor="industry">Industry</label>
                <input
                  id="industry" type="text" name="industry"
                  value={formData.industry} onChange={handleChange}
                  required placeholder="e.g. Technology, Real Estate"
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="form-divider-font">Account Security</div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="password">Secure Password</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-text"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* FIXED: selected tier display updates live when card is clicked */}
              <div className="input-group">
                <label className="label-font">Selected Membership</label>
                <div className="selected-tier-display">
                  <div>
                    <div className="tier-display-label">Tier</div>
                    <div className="tier-display-value">{selectedTier?.name}</div>
                  </div>
                  <div className="tier-display-price">
                    {TIER_PRICES[formData.tier]}
                  </div>
                  <button
                    type="button"
                    className="tier-change-link"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  >
                    Change ↑
                  </button>
                </div>
                {/* Hidden select keeps the value in formData for the backend */}
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="tier-hidden-select"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {TIERS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="securityQuestion">
                  Security Question
                </label>
                <select
                  id="securityQuestion"
                  name="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  required
                >
                  <option value="What was the name of your first pet?">
                    What was the name of your first pet?
                  </option>
                  <option value="What city did you meet your best friend in?">
                    What city did you meet your best friend in?
                  </option>
                  <option value="What was your favorite childhood board game?">
                    What was your favorite childhood board game?
                  </option>
                  <option value="What was the make of your first car?">
                    What was the make of your first car?
                  </option>
                </select>
              </div>
              <div className="input-group">
                <label className="label-font" htmlFor="securityAnswer">
                  Security Answer
                </label>
                <input
                  id="securityAnswer" type="text" name="securityAnswer"
                  value={formData.securityAnswer} onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Experience Profile */}
            <div className="form-divider-font">Experience Profile</div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="primaryInterest">
                  Primary Interest
                </label>
                <select
                  id="primaryInterest"
                  name="connectionGoals.primaryInterest"
                  value={formData.connectionGoals.primaryInterest}
                  onChange={handleChange}
                >
                  <option value="Meet New People">Meet New People</option>
                  <option value="Play/Games">Play / Games</option>
                  <option value="Travel">Travel</option>
                  <option value="Local Events">Local Events</option>
                </select>
              </div>
              <div className="input-group">
                <label className="label-font" htmlFor="golfSkillLevel">
                  Golf Skill Level
                </label>
                <select
                  id="golfSkillLevel"
                  name="preferences.golfSkillLevel"
                  value={formData.preferences.golfSkillLevel}
                  onChange={handleChange}
                >
                  <option value="Never Played">Never Played</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="input-group slider-group">
              <label className="label-font">
                Current Social Satisfaction (1–10)
              </label>
              <div className="slider-value">{sliderVal}</div>
              <input
                type="range"
                name="connectionGoals.socialSatisfaction"
                min="1" max="10" step="1"
                value={sliderVal}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    connectionGoals: {
                      ...prev.connectionGoals,
                      socialSatisfaction: parseInt(e.target.value, 10),
                    },
                  }))
                }
              />
              <div className="slider-labels">
                <span>Deeply isolated</span>
                <span>Fully connected</span>
              </div>
            </div>

            {/* Preferences & Travel */}
            <div className="form-divider-font">Preferences & Travel</div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font" htmlFor="favoriteMocktail">
                  Favorite Mocktail
                </label>
                <input
                  id="favoriteMocktail" type="text"
                  name="preferences.favoriteMocktail"
                  value={formData.preferences.favoriteMocktail}
                  onChange={handleChange}
                  placeholder="e.g. Virgin Mojito"
                />
              </div>
              <div className="input-group">
                <label className="label-font" htmlFor="apparelSize">
                  Apparel Size
                </label>
                <select
                  id="apparelSize" name="preferences.apparelSize"
                  value={formData.preferences.apparelSize}
                  onChange={handleChange}
                >
                  <option value="XS">X-Small</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="label-font" htmlFor="dietaryRestrictions">
                Dietary Restrictions{' '}
                <span style={{ color: '#999', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  (comma separated)
                </span>
              </label>
              <input
                id="dietaryRestrictions" type="text"
                name="preferences.dietaryRestrictions"
                value={formData.preferences.dietaryRestrictions}
                onChange={handleChange}
                placeholder="e.g. Vegan, No Shellfish"
              />
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

            <div className="checkbox-row">
              <input
                type="checkbox"
                name="hasPassport"
                id="passport"
                checked={formData.hasPassport}
                onChange={handleChange}
              />
              <label
                htmlFor="passport"
                className="label-font"
                style={{ marginBottom: 0 }}
              >
                I have a valid passport
              </label>
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
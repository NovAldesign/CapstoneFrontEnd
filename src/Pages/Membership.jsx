import React, { useState, useEffect } from 'react';
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
      'Your Game Night ticket covered every month — that\'s $20 back immediately',
      'Priority access 24 hrs before the public — you never miss out',
      '$10 off every Wind Down Wednesday and Cookout ticket',
      'Private member community — connections that extend beyond the events',
      'Month 3 Reward: Receive one GFC card deck (Playing Cards or Conversation Cards), Add-on Opportunity: Upgrade to an engraved wooden box for 25% OFF',
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
      'Bring 2 guest to our game nights free — every single month',
      '48-hr priority booking — first access before anyone else',
      'One free Intentional Conversations Over Mocktails or Cookout ticket per quarter',
      'Month 3 Reward: Receive both GFC card decks (Playing Cards & Conversation Cards), Add-on Opportunity: Upgrade to an engraved wooden box for 50% OFF',
      'Quarterly gift from Grown Folks Collective valued at $30',
      'Founding Member rate and status locked in for life',
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

  // ── STRIPE CANCELLATION RESTORE SYSTEM ──
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCancelled = urlParams.get('cancelled');

    if (isCancelled) {
      const cachedData = localStorage.getItem('gfc_form_cache');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setFormData({
            firstName: parsed.firstName || '',
            lastName: parsed.lastName || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            dob: parsed.dob || '',
            tier: parsed.tier || 'Founding',
            connectionGoals: {
              primaryInterest: parsed.connectionGoals?.primaryInterest || 'Meet New People',
              isolationBarrier: parsed.connectionGoals?.isolationBarrier || '',
            },
          });
          localStorage.removeItem('gfc_form_cache');
        } catch (err) {
          console.error('Error parsing cached form data:', err);
        }
      }
    }
  }, []);

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

  // Helper to scroll smoothly directly to the card selector section instead of top of page
  const scrollToTierSelector = () => {
    const selectorSection = document.querySelector('.tier-selector-section');
    if (selectorSection) {
      selectorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // ── CLIENT-SIDE VALIDATION SAFETY OVERRIDE ──
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dob) {
      setFeedback({
        type: 'error',
        message: 'All application fields (Name, Email, Phone, and Date of Birth) are required to join the Collective.',
      });
      setIsSubmitting(false);
      return;
    }
   
    try {
      // Explicitly layout the submission model structure
      const submissionData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        tier: formData.tier,
        connectionGoals: {
          primaryInterest: formData.connectionGoals.primaryInterest,
          isolationBarrier: formData.connectionGoals.isolationBarrier,
        }
      };

      localStorage.setItem('gfc_form_cache', JSON.stringify(submissionData));

      console.log("🚀 Sending data to backend via membershipService...");
      const response = await membershipService.createMembership(submissionData);
      
      // 🔍 DEBUG LOG: Inspect this in the browser dev tools to see what the service returns!
      console.log("📥 Full Backend Response Object Received:", response);
   
      // ⚡️ UNIVERSAL PROPERTY EXTRACTOR: Resolves 'url' across direct returns or nested data wrappers
      const targetUrl = 
        response?.url || 
        response?.data?.url || 
        response?.data?.data?.url;

      if (targetUrl) {
        console.log("✈️ Redirecting user to Stripe Checkout Portal:", targetUrl);
        window.location.href = targetUrl;
        return;
      } else {
        console.warn("⚠️ Form saved successfully, but no redirect URL was found in the object wrapper.");
      }
   
      localStorage.removeItem('gfc_form_cache');
      setFeedback({
        type: 'success',
        message: 'Application received. Your journey with the Collective begins now.',
      });
      setTimeout(() => navigate('/'), 2800);
   
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
            <strong>Founding Member offer:</strong> Only 40 spots available.
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
              onClick={scrollToTierSelector}
            >
              Compare Tiers &uarr;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="luxe-form" noValidate>

            {/* Inline Tier Selector Switch Button Row */}
            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Membership Level</label>
                <div className="tier-toggle-container" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.tier === 'Social' ? 'active-toggle' : 'inactive-toggle'}`}
                    onClick={() => setFormData(prev => ({ ...prev, tier: 'Social' }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: formData.tier === 'Social' ? '2px solid #C5A059' : '1px solid #ddd',
                      backgroundColor: formData.tier === 'Social' ? '#002147' : '#fff',
                      color: formData.tier === 'Social' ? '#fff' : '#002147',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Social Pass ($39/mo)
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.tier === 'Founding' ? 'active-toggle' : 'inactive-toggle'}`}
                    onClick={() => setFormData(prev => ({ ...prev, tier: 'Founding' }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: formData.tier === 'Founding' ? '2px solid #C5A059' : '1px solid #ddd',
                      backgroundColor: formData.tier === 'Founding' ? '#002147' : '#fff',
                      color: formData.tier === 'Founding' ? '#fff' : '#002147',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Founding Member ($69/mo)
                  </button>
                </div>
              </div>
            </div>

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
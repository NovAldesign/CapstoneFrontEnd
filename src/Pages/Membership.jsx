import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../Styles/Membership.css';
import membershipService from '../Services/membershipService';

const TIERS = [
  {
    id: 'Social',
    name: 'Social Pass',
    price: '$39.99',
    note: '/month',
    badge: null,
    featured: false,
    tagline: 'Pays for itself every month.',
    features: [
      '$40 in event credit every month — use it at any GFC event (unused credit rolls over 1 month)',
      '$5 off every GFC ticket',
      '10% off food events like our Cookout, Friendsgiving, and holiday dinners',
      '48-hour early access to tickets + priority waitlist for sold-out events',
      'Early doors member mixer at every event',
      'Private member group chat',
      'Birthday bonus: $25 extra event credit in your birthday month',
      '10% off AMC Performance Company shows',
      'Your own referral code — friends save $10, and 4 referrals earn you a free month',
    ],
  },
  {
    id: 'Founding',
    name: 'Founding Member',
    price: '$69.99',
    note: '/month · First 40 only · Locked for life',
    badge: 'Founding Member',
    featured: true,
    tagline: 'For the ones who were here first.',
        features: [
      '$70 in event credit every month — use it at any GFC event (unused credit rolls over 1 month)',
      '$7 off every GFC ticket',
      '15% off food events like our Cookout, Friendsgiving, and holiday dinners',
      '72-hour early access to tickets + first dibs on group travel',
      'Guest pass: bring a friend free once every quarter',
      'Early doors member mixer at every event',
      'Private member group chat',
      'Birthday bonus: $25 extra event credit + your guest gets in free',
      '10% off AMC Performance Company shows',
      'Your own referral code — friends save $10, and just 3 referrals earn you a free month',
      'Founding Member badge at every event',
      'Your name on the Founders Wall',
      'Founders Circle: a say in new events and travel destinations',
      'Your Founding rate is locked in for life',
    ],
  },
];

const TIER_PRICES = {
  Social: '$39.99/mo',
  Founding: '$69.99/mo',
};

const HOW_IT_WORKS = [
  {
    title: 'Your membership pays for itself',
    body: 'Every month, your membership fee comes back to you as event credit. Use it on any GFC event, and if you miss a month, your credit rolls over to the next one.',
  },
  {
    title: 'Member pricing on everything',
    body: 'Every ticket you buy is discounted, including tickets for friends you bring along. Food events like our Cookout, Friendsgiving, and holiday dinners get a percentage off instead.',
  },
  {
    title: 'First in line, every time',
    body: 'Members get tickets before the public and priority on the waitlist when events sell out. Founding Members get first dibs on group travel too.',
  },
  {
    title: 'Bring your people',
    body: 'Share your personal referral code. Your friends save $10 on their first GFC event, and once enough of them come out, your next month is on us.',
  },
];

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

  // Scroll smoothly to the tier cards
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

    // ── CLIENT-SIDE VALIDATION ──
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dob) {
      setFeedback({
        type: 'error',
        message: 'All application fields (Name, Email, Phone, and Date of Birth) are required to join the Collective.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
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

      const response = await membershipService.createMembership(submissionData);

      // Resolves 'url' across direct returns or nested data wrappers
      const targetUrl =
        response?.url ||
        response?.data?.url ||
        response?.data?.data?.url;

      if (targetUrl) {
        window.location.href = targetUrl;
        return;
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

  const toggleStyle = (tierId) => ({
    flex: 1,
    padding: '12px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: formData.tier === tierId ? '2px solid #C5A059' : '1px solid #ddd',
    backgroundColor: formData.tier === tierId ? '#002147' : '#fff',
    color: formData.tier === tierId ? '#fff' : '#002147',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="membership-page">
      <Helmet>
        <title>Join the Collective | Grown Folks Collective Membership</title>
        <meta
          name="description"
          content="Become a Grown Folks Collective member. Your monthly fee comes back as event credit, plus member pricing, early access, and perks for Atlanta adults 30+."
        />
      </Helmet>

      {/* ── HERO ── */}
      <header className="membership-hero">
        <div className="hero-content-right">
          <span className="location-tag">Atlanta · 30+</span>
          <h1 className="luxe-title">The Collective</h1>
          <div className="gold-spacer-bar"></div>
          <div className="mission-narrative">
            <p className="narrative-lead">Grown life is better with your people.</p>
            <p className="narrative-body">
              Membership in the <strong>Grown Folks Collective</strong> turns
              every month into something to look forward to: game nights, good
              food, real conversation, and a circle that keeps showing up.
            </p>
            <p className="narrative-impact">
              Your membership pays for itself. Every dollar comes back as event credit.
            </p>
          </div>
        </div>
      </header>

      {/* ── HOW IT WORKS ── */}
      <section className="member-how-section" aria-labelledby="how-heading">
        <span className="tier-eyebrow">Why Members Love It</span>
        <h2 id="how-heading" className="playfair tier-heading">How Membership Works</h2>
        <div className="member-how-grid">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.title} className="member-how-card">
              <span className="member-how-num" aria-hidden="true">0{i + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

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
              <p className="tier-tagline">{tier.tagline}</p>
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
            Once filled, this tier closes permanently. Founding Members keep
            their rate for life.
          </p>
        </div>
      </section>

      {/* ── PARTNER PERK ── */}
      <section className="member-partner-section" aria-labelledby="partner-heading">
        <span className="tier-eyebrow">Member Partner Perk</span>
        <h2 id="partner-heading" className="playfair member-partner-title">
          🎭 10% Off AMC Performance Company Shows
        </h2>
        <p className="member-partner-body">
          All members save 10% on every AMC Performance Company production in
          Atlanta: plays, musicals, and tribute shows. Your discount code is
          shared in the private member group chat.
        </p>
      </section>

      {/* ── FINE PRINT ── */}
      <section className="member-fineprint" aria-labelledby="fineprint-heading">
        <h2 id="fineprint-heading" className="member-fineprint-title">Good to Know</h2>
        <ul>
          <li>
            Event credit, guest passes, and birthday credit can be used at any GFC
            event except food-inclusive events (such as our Cookout, Friendsgiving,
            and holiday dinners). Members still receive their member discount on
            food-inclusive events.
          </li>
          <li>Unused monthly event credit rolls over for one month, then expires.</li>
          <li>
            Referral credit counts when a friend who is new to GFC buys a ticket to
            their first event using your code.
          </li>
          <li>Memberships renew monthly. Cancel anytime before your next billing date.</li>
        </ul>
      </section>

      {/* ── FORM ── */}
      <section className="form-section">
        <div className="applicant-container">
          <h2 className="section-header-font">Become a Member</h2>
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

            {/* Tier toggle */}
            <div className="form-row">
              <div className="input-group">
                <span className="label-font">Membership Level</span>
                <div className="tier-toggle-container" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button
                    type="button"
                    aria-pressed={formData.tier === 'Social'}
                    onClick={() => setFormData(prev => ({ ...prev, tier: 'Social' }))}
                    style={toggleStyle('Social')}
                  >
                    Social Pass ($39.99/mo)
                  </button>
                  <button
                    type="button"
                    aria-pressed={formData.tier === 'Founding'}
                    onClick={() => setFormData(prev => ({ ...prev, tier: 'Founding' }))}
                    style={toggleStyle('Founding')}
                  >
                    Founding Member ($69.99/mo)
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
                <label className="label-font" htmlFor="dob">
                  Date of Birth <span style={{ textTransform: 'none', fontWeight: 400 }}>(for your birthday bonus)</span>
                </label>
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
                <label className="label-font" htmlFor="primaryInterest">What are you most excited about?</label>
                <select
                  id="primaryInterest"
                  name="connectionGoals.primaryInterest"
                  value={formData.connectionGoals.primaryInterest}
                  onChange={handleChange}
                >
                  <option value="Meet New People">Meeting new people</option>
                  <option value="Play / Games">Game nights &amp; friendly competition</option>
                  <option value="Conversations">Real conversations</option>
                  <option value="Food Events">Dinners, cookouts &amp; food events</option>
                  <option value="Travel">Group travel</option>
                  <option value="Local Events">Trying new things around Atlanta</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="label-font" htmlFor="isolationBarrier">
                What's kept you from getting out and connecting lately?
              </label>
              <textarea
                id="isolationBarrier"
                name="connectionGoals.isolationBarrier"
                className="luxe-textarea"
                value={formData.connectionGoals.isolationBarrier}
                onChange={handleChange}
                placeholder="Share as much or as little as you like..."
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
                ? 'Processing...'
                : `Join as ${selectedTier?.name || 'a Member'}`}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
};

export default Membership;
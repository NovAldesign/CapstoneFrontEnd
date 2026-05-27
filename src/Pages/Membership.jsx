import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS = [
  {
    id: 'Social',
    name: 'Social Pass',
    price: '$39',
    note: '/month',
    badge: null,
    featured: false,
    tagline: 'Your way in.',
    features: [
      '1 Game Night ticket per month ($20 value)',
      'Priority booking 24 hrs before public',
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
    tagline: 'The full experience.',
    features: [
      'Everything in Social Pass',
      '1 free Guest Pass per month — bring anyone to any event',
      '48-hr priority booking (longer window than Social Pass)',
      '1 free Wind Down Wednesday or Cookout ticket per quarter',
      '50% off the GFC Wooden Box upgrade at month 3',
      'Choose 1 card deck at month 3 — GFC Playing Cards or Intentional Conversation Cards',
      '"Founding Member" status locked for life',
    ],
  },
];

const TIER_PRICES = { Social: '$39/mo', Founding: '$69/mo' };

// ── Component ─────────────────────────────────────────────────────────────────
const Membership = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    industry: '',
    tier: 'Founding',
    connectionGoals: {
      primaryInterest: 'Meet New People',
      isolationBarrier: '',
    },
    preferences: {
      dietaryRestrictions: '',
      apparelSize: 'M',
      golfSkillLevel: 'Never Played',
    },
    hasPassport: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name.includes('.')) {
      const [outer, inner] = name.split('.');
      setFormData(prev => ({ ...prev, [outer]: { ...prev[outer], [inner]: val } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
    if (feedback) setFeedback(null);
  };

  const handleTierSelect = (tierId) => {
    setFormData(prev => ({ ...prev, tier: tierId }));
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      // Replace with your actual service call
      await new Promise(res => setTimeout(res, 1200)); // placeholder
      setFeedback({ type: 'success', message: 'Application received. Your journey with the Collective begins now.' });
      setTimeout(() => navigate('/'), 2800);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTier = TIERS.find(t => t.id === formData.tier);

  return (
    <>
      <Helmet>
        <title>Join the Collective | Grown Folks Collective</title>
        <meta name="description" content="Become a member of the Grown Folks Collective. Priority access to exclusive events, game nights, cookouts, and a community built for genuine connection." />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: rgba(201,168,76,0.18);
          --ink: #0E0C09;
          --ink-soft: #1C1A15;
          --parchment: #F5F0E8;
          --parchment-mid: #EDE5D4;
          --warm-white: #FAF8F4;
          --text-muted: #8A7F6E;
          --text-body: #3D3828;
          --border: rgba(201,168,76,0.25);
          --radius: 4px;
        }

        .gfc-page {
          background: var(--ink);
          color: var(--parchment);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .gfc-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 24px 60px;
          text-align: center;
        }
        .gfc-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 30%, rgba(201,168,76,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .gfc-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
        .hero-inner { position: relative; max-width: 680px; }
        .hero-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 24px;
          display: block;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.2rem, 8vw, 6.5rem);
          font-weight: 600;
          line-height: 0.95;
          color: var(--parchment);
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .hero-title em {
          font-style: italic;
          color: var(--gold-light);
        }
        .hero-rule {
          width: 48px;
          height: 1px;
          background: var(--gold);
          margin: 28px auto;
        }
        .hero-body {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--parchment-mid);
          max-width: 480px;
          margin: 0 auto 36px;
          font-weight: 300;
        }
        .hero-cta {
          display: inline-block;
          background: var(--gold);
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 14px 36px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .hero-cta:hover { background: var(--gold-light); transform: translateY(-1px); }

        /* ── TIERS ── */
        .tier-section {
          background: var(--ink-soft);
          padding: 96px 24px;
          border-top: 1px solid var(--border);
        }
        .section-label {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          text-align: center;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          text-align: center;
          color: var(--parchment);
          margin-bottom: 8px;
        }
        .section-sub {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 300;
          margin-bottom: 60px;
        }

        .tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          max-width: 860px;
          margin: 0 auto;
        }

        .tier-card {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          padding: 40px 32px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          position: relative;
          outline: none;
        }
        .tier-card:hover { border-color: var(--gold); transform: translateY(-3px); }
        .tier-card.active {
          border-color: var(--gold);
          background: var(--gold-dim);
        }
        .tier-card.featured {
          border-color: var(--gold);
        }
        .tier-badge-tag {
          position: absolute;
          top: -1px; right: 24px;
          background: var(--gold);
          color: var(--ink);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 5px 14px;
        }
        .tier-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--parchment);
          margin-bottom: 4px;
        }
        .tier-card-tagline {
          font-size: 0.8rem;
          color: var(--gold);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-weight: 300;
        }
        .tier-card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 600;
          color: var(--gold-light);
          line-height: 1;
          margin-bottom: 4px;
        }
        .tier-card-note {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 28px;
          font-weight: 300;
        }
        .tier-divider { height: 1px; background: var(--border); margin-bottom: 24px; }
        .tier-features-list { list-style: none; }
        .tier-features-list li {
          font-size: 0.875rem;
          color: var(--parchment-mid);
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-weight: 300;
          line-height: 1.5;
          padding-left: 20px;
          position: relative;
        }
        .tier-features-list li::before {
          content: '—';
          color: var(--gold);
          position: absolute;
          left: 0;
          font-size: 0.75rem;
        }
        .tier-features-list li:last-child { border-bottom: none; }

        .founding-note {
          max-width: 860px;
          margin: 32px auto 0;
          padding: 16px 24px;
          border-left: 2px solid var(--gold);
          background: var(--gold-dim);
        }
        .founding-note p {
          font-size: 0.85rem;
          color: var(--parchment-mid);
          font-weight: 300;
          line-height: 1.6;
        }
        .founding-note strong { color: var(--gold-light); font-weight: 500; }

        /* ── CARD REWARD ── */
        .reward-section {
          background: var(--ink);
          padding: 80px 24px;
          border-top: 1px solid var(--border);
        }
        .reward-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          max-width: 860px;
          margin: 48px auto 0;
        }
        .reward-card {
          border: 1px solid var(--border);
          padding: 28px 24px;
          text-align: center;
          background: rgba(255,255,255,0.02);
        }
        .reward-icon { font-size: 2rem; margin-bottom: 12px; }
        .reward-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: var(--parchment);
          margin-bottom: 8px;
          font-weight: 600;
        }
        .reward-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 300;
          line-height: 1.6;
        }
        .reward-tag {
          display: inline-block;
          margin-top: 12px;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          border: 1px solid var(--gold);
          padding: 3px 10px;
        }

        /* ── FORM SECTION ── */
        .form-section {
          background: var(--warm-white);
          padding: 96px 24px;
          border-top: 1px solid var(--border);
        }
        .form-wrapper {
          max-width: 640px;
          margin: 0 auto;
        }
        .form-section .section-label { color: var(--gold); }
        .form-section .section-title { color: var(--ink); }
        .form-section .section-sub { color: var(--text-muted); }

        .selected-tier-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--ink);
          color: var(--parchment);
          padding: 16px 24px;
          margin-bottom: 36px;
        }
        .stb-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2px;
          font-weight: 500;
        }
        .stb-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--parchment);
        }
        .stb-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          color: var(--gold-light);
          font-weight: 600;
        }
        .stb-change {
          font-size: 11px;
          color: var(--gold);
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          text-decoration: underline;
        }

        .gfc-form { width: 100%; }
        .field-group { margin-bottom: 0; }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 560px) {
          .form-row { grid-template-columns: 1fr; }
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .field-full { grid-column: 1 / -1; }
        .field label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .field input,
        .field select,
        .field textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          color: var(--text-body);
          background: #fff;
          border: 1px solid #D8D0C4;
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          appearance: none;
          border-radius: 0;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus { border-color: var(--gold); }
        .field textarea { resize: vertical; min-height: 90px; }

        .form-divider {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
          padding: 28px 0 16px;
          border-top: 1px solid var(--parchment-mid);
          margin-top: 12px;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .checkbox-row input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--gold); }
        .checkbox-row label {
          font-size: 0.875rem;
          color: var(--text-body);
          font-weight: 300;
          cursor: pointer;
        }

        .form-feedback {
          padding: 14px 18px;
          font-size: 0.875rem;
          margin-bottom: 20px;
          font-weight: 300;
        }
        .form-feedback.success { background: #EEF7EE; color: #2D6A2D; border-left: 3px solid #4CAF50; }
        .form-feedback.error { background: #FFF0EE; color: #8B2525; border-left: 3px solid #E53935; }

        .submit-btn {
          width: 100%;
          background: var(--ink);
          color: var(--gold-light);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 18px;
          border: 1px solid var(--ink);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background: #1C1A15; border-color: var(--gold); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="gfc-page">

        {/* ── HERO ── */}
        <header className="gfc-hero">
          <div className="hero-inner">
            <span className="hero-eyebrow">Atlanta · Est. 2024</span>
            <h1 className="hero-title">
              Grown Folks<br /><em>Collective</em>
            </h1>
            <div className="hero-rule" />
            <p className="hero-body">
              Success shouldn't be a solo journey. GFC is a community of local professionals
              built around authentic connection — alcohol-free, smoke-free, and real.
            </p>
            <button
              className="hero-cta"
              onClick={() => document.querySelector('.tier-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Membership
            </button>
          </div>
        </header>

        {/* ── TIERS ── */}
        <section className="tier-section">
          <p className="section-label">Choose Your Level</p>
          <h2 className="section-title">Select Your Membership</h2>
          <p className="section-sub">No contracts. Cancel anytime. Founding spots are limited.</p>

          <div className="tier-grid">
            {TIERS.map(tier => (
              <div
                key={tier.id}
                className={['tier-card', tier.featured ? 'featured' : '', formData.tier === tier.id ? 'active' : ''].filter(Boolean).join(' ')}
                onClick={() => handleTierSelect(tier.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTierSelect(tier.id); }}}
                aria-pressed={formData.tier === tier.id}
                aria-label={`Select ${tier.name} at ${tier.price} per month`}
              >
                {tier.badge && <span className="tier-badge-tag">{tier.badge}</span>}
                <div className="tier-card-name">{tier.name}</div>
                <div className="tier-card-tagline">{tier.tagline}</div>
                <div className="tier-card-price">{tier.price}</div>
                <div className="tier-card-note">{tier.note}</div>
                <div className="tier-divider" />
                <ul className="tier-features-list">
                  {tier.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="founding-note">
            <p>
              <strong>Founding Member offer:</strong> Only 40 Founding Member spots available.
              Once filled, this tier closes permanently. Current members lock in their rate for life.
            </p>
          </div>
        </section>

        {/* ── CARD REWARD ── */}
        <section className="reward-section">
          <p className="section-label">Member Rewards</p>
          <h2 className="section-title">The 3-Month Loyalty Reward</h2>
          <p className="section-sub">At month 3, choose your reward — then upgrade anytime.</p>

          <div className="reward-grid">
            <div className="reward-card">
              <div className="reward-icon">🃏</div>
              <div className="reward-title">GFC Playing Cards</div>
              <div className="reward-desc">Custom branded playing cards for game nights, cookouts, and gifting.</div>
              <span className="reward-tag">Choose at Month 3</span>
            </div>
            <div className="reward-card">
              <div className="reward-icon">💬</div>
              <div className="reward-title">Conversation Cards</div>
              <div className="reward-desc">Intentional conversation prompts designed to spark real connection.</div>
              <span className="reward-tag">Choose at Month 3</span>
            </div>
            <div className="reward-card">
              <div className="reward-icon">🎁</div>
              <div className="reward-title">The Full Set</div>
              <div className="reward-desc">Both decks + the GFC wooden keepsake box. The collector's upgrade.</div>
              <span className="reward-tag">Add-on Upgrade</span>
            </div>
          </div>
        </section>

        {/* ── FORM ── */}
        <section className="form-section">
          <div className="form-wrapper">
            <p className="section-label">Apply</p>
            <h2 className="section-title">Request Membership</h2>
            <p className="section-sub" style={{ marginBottom: 40 }}>Let's start the conversation.</p>

            {/* Selected tier banner */}
            <div className="selected-tier-banner">
              <div>
                <div className="stb-label">Selected Tier</div>
                <div className="stb-name">{selectedTier?.name}</div>
              </div>
              <div className="stb-price">{TIER_PRICES[formData.tier]}</div>
              <button className="stb-change" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Change ↑
              </button>
            </div>

            <form className="gfc-form" onSubmit={handleSubmit} noValidate>

              {/* Identity */}
              <div className="form-row">
                <div className="field">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="given-name" />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="family-name" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required autoComplete="tel" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="dob">Date of Birth</label>
                  <input id="dob" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="industry">Industry</label>
                  <input id="industry" type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Technology, Real Estate" />
                </div>
              </div>

              {/* Experience */}
              <div className="form-divider">Experience & Preferences</div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="primaryInterest">Primary Interest</label>
                  <select id="primaryInterest" name="connectionGoals.primaryInterest" value={formData.connectionGoals.primaryInterest} onChange={handleChange}>
                    <option value="Meet New People">Meet New People</option>
                    <option value="Play / Games">Play / Games</option>
                    <option value="Travel">Travel</option>
                    <option value="Local Events">Local Events</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="apparelSize">Apparel Size</label>
                  <select id="apparelSize" name="preferences.apparelSize" value={formData.preferences.apparelSize} onChange={handleChange}>
                    <option value="S">Small</option>
                    <option value="M">Medium</option>
                    <option value="L">Large</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="dietaryRestrictions">Dietary Restrictions <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 300, fontSize: '0.78rem' }}>(comma separated)</span></label>
                <input id="dietaryRestrictions" type="text" name="preferences.dietaryRestrictions" value={formData.preferences.dietaryRestrictions} onChange={handleChange} placeholder="e.g. Vegan, No Shellfish" />
              </div>

              <div className="field">
                <label htmlFor="isolationBarrier">What's your biggest barrier to social connection lately?</label>
                <textarea id="isolationBarrier" name="connectionGoals.isolationBarrier" value={formData.connectionGoals.isolationBarrier} onChange={handleChange} placeholder="Share your story..." />
              </div>

              <div className="checkbox-row">
                <input type="checkbox" id="passport" name="hasPassport" checked={formData.hasPassport} onChange={handleChange} />
                <label htmlFor="passport">I have a valid passport</label>
              </div>

              {feedback && (
                <div className={`form-feedback ${feedback.type}`} role="alert">
                  {feedback.message}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Processing Application...' : 'Apply to the Collective'}
              </button>

            </form>
          </div>
        </section>

      </div>
    </>
  );
};

export default Membership;
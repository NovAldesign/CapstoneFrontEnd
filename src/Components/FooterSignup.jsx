import React, { useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from '../content/legalContent.js';

// ── Newsletter signup (saves to /api/subscribers) ──
const FooterSignup = ({ corporate = false }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | already
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (smsOptIn && !phoneNumber.trim()) {
      setError('Please add your phone number to get text updates.');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(`${BACKEND_URL}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          smsOptIn: corporate ? false : smsOptIn,
          phoneNumber: !corporate && smsOptIn ? phoneNumber.trim() : '',
          smsConsentText: smsOptIn ? SMS_CONSENT_TEXT : '',
          smsConsentVersion: smsOptIn ? SMS_CONSENT_VERSION : '',
          source: corporate ? 'corporate' : 'footer',
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Already on the list counts as a win
        if (/already subscribed/i.test(result.error || '')) {
          setStatus('already');
          return;
        }
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'done' || status === 'already') {
    return (
      <div className="footer-signup-success" role="status">
        <div className="footer-signup-success-title">
          {status === 'done' ? "You're on the list! ✨" : "You're already on the list! ✨"}
        </div>
        <p>{corporate
          ? "We'll send hosting ideas and open dates about once a month. Talk soon."
          : "We'll let you know first when new events drop. See you soon."}</p>
      </div>
    );
  }

  return (
    <form className="footer-signup-form" onSubmit={handleSubmit} noValidate>
      <div className="footer-signup-fields">
        <label className="sr-only" htmlFor="footer-name">Name</label>
        <input
          id="footer-name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setError(''); }}
        />
        <label className="sr-only" htmlFor="footer-email">Email</label>
        <input
          id="footer-email"
          type="email"
          placeholder={corporate ? 'you@company.com' : 'you@email.com'}
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Joining…' : corporate ? 'Get Hosting Updates' : 'Join the List'}
        </button>
      </div>

      {!corporate && (
      <label className="footer-signup-sms">
        <input
          type="checkbox"
          checked={smsOptIn}
          onChange={(e) => { setSmsOptIn(e.target.checked); setError(''); }}
        />
        <span>{SMS_CONSENT_TEXT}</span>
      </label>
      )}

      {!corporate && smsOptIn && (
        <div className="footer-signup-phone">
          <label className="sr-only" htmlFor="footer-phone">Phone number</label>
          <input
            id="footer-phone"
            type="tel"
            placeholder="Phone number"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
          />
        </div>
      )}

      {error && <p className="footer-signup-error" role="alert">{error}</p>}
      <p className="footer-signup-note">
        No spam. Unsubscribe anytime. By joining, you agree to our{' '}
        <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.
      </p>
    </form>
  );
};

// ── Full sign-up section shown at the top of the footer ──
// The corporate version speaks to property managers, HR and team leads (tagged "corporate")
const FooterSignupSection = ({ corporate = false }) => (
  <section className="footer-signup" aria-labelledby="footer-signup-title">
    <div className="footer-signup-text">
      {corporate ? (
        <>
          <div className="footer-block-label">For Planners</div>
          <h2 id="footer-signup-title" className="footer-signup-title">Fresh ideas for your residents and team</h2>
          <p className="footer-signup-sub">
            For property managers, HR and team leads. Seasonal event ideas, holiday booking dates and
            first pick of open weekday dates, about once a month.
          </p>
        </>
      ) : (
        <>
          <div className="footer-block-label">Stay in the Loop</div>
          <h2 id="footer-signup-title" className="footer-signup-title">Get first dibs on new events</h2>
          <p className="footer-signup-sub">
            Game nights, dinners, and trips for Atlanta's 30+ crowd. Hear about them before tickets sell out.
          </p>
        </>
      )}
    </div>
    <FooterSignup corporate={corporate} />
  </section>
);

export default FooterSignupSection;
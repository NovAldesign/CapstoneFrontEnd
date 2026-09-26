import React, { useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';

const SMS_CONSENT_TEXT =
  'Yes, text me about upcoming GFC events and early access. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to opt out.';

// ── Newsletter signup (saves to /api/subscribers) ──
const FooterSignup = () => {
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
          smsOptIn,
          phoneNumber: smsOptIn ? phoneNumber.trim() : '',
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
        <p>We'll let you know first when new events drop. See you soon.</p>
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
          placeholder="you@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Joining…' : 'Join the List'}
        </button>
      </div>

      <label className="footer-signup-sms">
        <input
          type="checkbox"
          checked={smsOptIn}
          onChange={(e) => { setSmsOptIn(e.target.checked); setError(''); }}
        />
        <span>{SMS_CONSENT_TEXT}</span>
      </label>

      {smsOptIn && (
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
      <p className="footer-signup-note">No spam. Unsubscribe anytime.</p>
    </form>
  );
};

// ── Full "Stay in the Loop" section shown at the top of the footer ──
const FooterSignupSection = () => (
  <section className="footer-signup" aria-labelledby="footer-signup-title">
    <div className="footer-signup-text">
      <div className="footer-block-label">Stay in the Loop</div>
      <h2 id="footer-signup-title" className="footer-signup-title">Get first dibs on new events</h2>
      <p className="footer-signup-sub">
        Game nights, dinners, and trips for Atlanta's 30+ crowd. Hear about them before tickets sell out.
      </p>
    </div>
    <FooterSignup />
  </section>
);

export default FooterSignupSection;
import React, { useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
import { useCart } from '../Context/CartContext';
import SelectInterest from './SelectInterest';
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from '../content/legalContent.js';

// "$5 off your first ticket" newsletter signup. Saves to /api/subscribers;
// the welcome email (backend utilities/welcomeEmail.js) sends the code.
//   compact: name + email only, for event pages
//   source:  where they signed up, e.g. "join" or "event:<id>" (for reports)
const NewsletterOffer = ({ compact = false, source = 'join', idPrefix = 'nl' }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [select, setSelect] = useState({ checked: false, gender: '' }); // GFC Select™ interest
  const [status, setStatus] = useState('idle'); // idle | sending | done | already
  const [error, setError] = useState('');
  const [codeAdded, setCodeAdded] = useState('');
  const { applyPromoCode, setCodeEmail } = useCart();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim()) return setError('Please enter your name and email.');
    if (smsOptIn && !phoneNumber.trim()) return setError('Please add your phone number to get text updates.');
    setStatus('sending');
    try {
      const res = await fetch(`${BACKEND_URL}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          smsOptIn,
          phoneNumber: smsOptIn ? phoneNumber.trim() : '',
          smsConsentText: smsOptIn ? SMS_CONSENT_TEXT : '',
          smsConsentVersion: smsOptIn ? SMS_CONSENT_VERSION : '',
          source,
          selectInterest: !compact && select.checked,
          selectGender: !compact && select.checked ? select.gender : '',
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (/already subscribed/i.test(result.error || '')) return setStatus('already');
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
      // Put their welcome code in the bag now, so it's there at checkout
      if (result.code) {
        applyPromoCode(result.code);
        setCodeEmail(email.trim());
        setCodeAdded(result.code);
      }
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="nl-offer-done" role="status">
        <strong>You're in!</strong> {codeAdded
          ? `Your code ${codeAdded} is already in your bag, so it comes off at checkout. We also emailed it to you.`
          : 'Check your inbox for your welcome code. It should arrive in a minute or two.'}{select.checked ? " You're on the GFC Select™ list too." : ''}
      </div>
    );
  }
  if (status === 'already') {
    return (
      <div className="nl-offer-done" role="status">
        <strong>You're already on our list.</strong>{select.checked ? " We added you to the GFC Select™ list." : ''} Look for our welcome email in your inbox, or reply to any of our emails and we'll help.
      </div>
    );
  }

  return (
    <form className={`nl-offer-form${compact ? ' is-compact' : ''}`} onSubmit={submit} noValidate>
      <label htmlFor={`${idPrefix}-name`}>
        First and last name
        <input id={`${idPrefix}-name`} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
      </label>
      <label htmlFor={`${idPrefix}-email`}>
        Email
        <input id={`${idPrefix}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      {!compact && (
        <>
          <label className="nl-offer-check" htmlFor={`${idPrefix}-sms`}>
            <input id={`${idPrefix}-sms`} type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} />
            <span>Text me event updates too. <small>{SMS_CONSENT_TEXT}</small></span>
          </label>
          {smsOptIn && (
            <label htmlFor={`${idPrefix}-phone`}>
              Mobile number
              <input id={`${idPrefix}-phone`} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} autoComplete="tel" />
            </label>
          )}
          <SelectInterest idPrefix={idPrefix} checked={select.checked} gender={select.gender} onChange={setSelect} />
        </>
      )}
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'One moment…' : 'Send me $5 off'}
      </button>
      {error && <p className="nl-offer-error" role="alert">{error}</p>}
      <p className="nl-offer-fine">
        For your first GFC ticket, any event without food. Good for 14 days. Unsubscribe anytime.
      </p>
    </form>
  );
};

export default NewsletterOffer;

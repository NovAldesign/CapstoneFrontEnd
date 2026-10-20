import React, { useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';

// In-kind donation offer (Partnerships page). Keep KINDS, EVENTS and DELIVERY in
// sync with models/donationSchema.js in the backend.
const KINDS = [
  'Products for gift bags',
  'Giveaways and prizes',
  'Sound equipment (speakers, mics, mixer, karaoke machine)',
  'Lighting and stage decor',
  'Games (cards, tables, board games)',
  'Art and coloring supplies (easels, canvases, coloring books)',
  'Non-alcoholic drinks',
  'Something else',
];
const EVENTS = [
  'Game Night',
  'Karaoke Bingo',
  'Acoustic & Infused™ (Live Music Showcase)',
  'Recess Talks™',
  'GFC Select™',
  'Any event',
];
const DELIVERY = ["I'll drop it off", 'Please pick it up', "I'll ship it", "Let's talk"];

const EMPTY = {
  donorType: 'business',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  items: '',
  quantity: '',
  delivery: '',
  availableBy: '',
  recognition: true,
  instagram: '',
  website: '',
  notes: '',
  fax: '', // bot trap (hidden)
};

const Checks = ({ legend, options, value, onToggle, idPrefix }) => (
  <fieldset className="input-group donate-fieldset">
    <legend className="donate-legend">{legend}</legend>
    <div className="partner-checkbox-grid">
      {options.map((o) => {
        const id = `${idPrefix}-${o.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
        return (
          <label key={o} className="partner-checkbox-label" htmlFor={id}>
            <input id={id} type="checkbox" checked={value.includes(o)} onChange={() => onToggle(o)} />
            <span>{o}</span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

const DonationForm = ({ source = 'partnerships' }) => {
  const [form, setForm] = useState(EMPTY);
  const [kinds, setKinds] = useState([]);
  const [events, setEvents] = useState([]);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (feedback) setFeedback(null);
  };
  const toggle = (setter) => (v) => setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const submit = async (e) => {
    e.preventDefault();
    const f = form;
    if (!f.contactName.trim() || !/^\S+@\S+\.\S+$/.test(f.email.trim())) {
      setFeedback({ type: 'error', message: 'Please add your name and a valid email.' });
      return;
    }
    if (f.donorType === 'business' && !f.companyName.trim()) {
      setFeedback({ type: 'error', message: 'Please add your business or brand name.' });
      return;
    }
    if (f.items.trim().length < 5) {
      setFeedback({ type: 'error', message: "Please tell us what you'd like to donate." });
      return;
    }
    if (f.website.trim() && !/^https?:\/\//i.test(f.website.trim())) {
      setFeedback({ type: 'error', message: 'Your website link needs to start with https://.' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, kinds, events, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setFeedback({ type: 'success', message: "Thank you! We received your donation offer and will reach out within a few days." });
      setForm(EMPTY);
      setKinds([]);
      setEvents([]);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="luxe-form" noValidate>
      <fieldset className="input-group donate-fieldset">
        <legend className="donate-legend">I'm donating as</legend>
        <div className="donate-toggle">
          {[['business', 'A business or brand'], ['individual', 'An individual']].map(([v, l]) => (
            <label key={v} className={`donate-toggle-opt ${form.donorType === v ? 'on' : ''}`}>
              <input type="radio" name="donorType" value={v} checked={form.donorType === v} onChange={change} />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-row">
        {form.donorType === 'business' && (
          <div className="input-group">
            <label htmlFor="dn-company">Business / Brand Name</label>
            <input id="dn-company" name="companyName" value={form.companyName} onChange={change} autoComplete="organization" />
          </div>
        )}
        <div className="input-group">
          <label htmlFor="dn-name">Your Name</label>
          <input id="dn-name" name="contactName" value={form.contactName} onChange={change} autoComplete="name" placeholder="First & Last" />
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label htmlFor="dn-email">Email</label>
          <input id="dn-email" name="email" type="email" value={form.email} onChange={change} autoComplete="email" placeholder="you@email.com" />
        </div>
        <div className="input-group">
          <label htmlFor="dn-phone">Phone (optional)</label>
          <input id="dn-phone" name="phone" type="tel" value={form.phone} onChange={change} autoComplete="tel" placeholder="(404) 000-0000" />
        </div>
      </div>

      <Checks legend="What would you like to donate?" options={KINDS} value={kinds} onToggle={toggle(setKinds)} idPrefix="dn-kind" />

      <div className="input-group">
        <label htmlFor="dn-items">Tell us about it</label>
        <textarea id="dn-items" name="items" rows={4} maxLength={1500} value={form.items} onChange={change}
          placeholder="e.g. 40 travel-size candles for gift bags, or a karaoke machine with 2 wireless mics" />
      </div>

      <div className="form-row">
        <div className="input-group">
          <label htmlFor="dn-qty">How many / about how much? (optional)</label>
          <input id="dn-qty" name="quantity" value={form.quantity} onChange={change} placeholder="e.g. 40 pieces, about $200 value" />
        </div>
        <div className="input-group">
          <label htmlFor="dn-when">When is it available? (optional)</label>
          <input id="dn-when" name="availableBy" value={form.availableBy} onChange={change} placeholder="e.g. Anytime in November" />
        </div>
      </div>

      <Checks legend="Which events is it for? (optional)" options={EVENTS} value={events} onToggle={toggle(setEvents)} idPrefix="dn-event" />

      <div className="input-group">
        <label htmlFor="dn-delivery">Getting it to us</label>
        <select id="dn-delivery" name="delivery" value={form.delivery} onChange={change}>
          <option value="">Choose one…</option>
          {DELIVERY.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <label className="partner-checkbox-label donate-recognize" htmlFor="dn-recognize">
        <input id="dn-recognize" type="checkbox" name="recognition" checked={form.recognition} onChange={change} />
        <span>Yes, give us a shout-out at the event, a tag on social media and a mention in the newsletter</span>
      </label>

      {form.recognition && (
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="dn-ig">Instagram to tag (optional)</label>
            <input id="dn-ig" name="instagram" value={form.instagram} onChange={change} placeholder="@yourhandle" />
          </div>
          <div className="input-group">
            <label htmlFor="dn-web">Website (optional)</label>
            <input id="dn-web" name="website" type="url" value={form.website} onChange={change} placeholder="https://" />
          </div>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="dn-notes">Anything else? (optional)</label>
        <textarea id="dn-notes" name="notes" rows={3} maxLength={1000} value={form.notes} onChange={change} />
      </div>

      <input className="donate-trap" name="fax" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.fax} onChange={change} />

      {feedback && (
        <div role="alert" className={`donate-feedback ${feedback.type}`}>{feedback.message}</div>
      )}

      <button type="submit" className="gold-submit-btn" disabled={sending}>
        {sending ? 'Sending…' : 'Send Donation Offer'}
      </button>
      <p className="form-privacy-note">
        Grown Folks™ Collective is a business, not a nonprofit, so donations aren't tax-deductible.
        By submitting, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.
      </p>
    </form>
  );
};

export default DonationForm;

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';
import PerformLinks from '../Components/PerformLinks.jsx';

// DJs for Scratched & Stirred™, the Grown Folks DJ night (launching 2027).
// Builds the DJ list now; booking details come later.
// Keep ERAS, EQUIPMENT and NIGHTS in sync with models/djApplicationSchema.js in the backend.
const ERAS = [
  '70s & 80s Soul and Funk',
  '90s R&B',
  '90s Hip Hop',
  '2000s R&B',
  '2000s Hip Hop',
  'Old School House',
  'House & Dance',
  'Afrobeats & Amapiano',
  'Reggae & Dancehall',
  'Line Dance & Southern Soul',
  'Neo-Soul',
  'Gospel House',
];
const EQUIPMENT = [
  'I bring my full setup (controller and speakers)',
  'I bring my controller, I need speakers',
  'I need everything provided',
];
const NIGHTS = ['Friday nights', 'Saturday nights', 'Weeknights', 'Daytime events'];

const PERKS = [
  'A 30+ room that came to dance',
  'Your era, your set: three DJs, three eras, one night',
  'Promotion on our socials, email list and venue partners',
  'First call when Scratched & Stirred™ dates drop',
  'Chances to spin our private and corporate events',
];

const FAQS = [
  {
    q: 'What is Scratched & Stirred™?',
    a: "Our DJ night for grown folks 30+, launching in 2027. Three DJs each take an era, from 90s R&B to 2000s hip hop to house and Afrobeats, in an alcohol-free room with mocktails and a dance floor. Your favorites, remixed & refreshed.",
  },
  {
    q: 'Who can join the list?',
    a: 'Atlanta-area DJs who can read a grown room and keep a dance floor moving. Open-format, R&B, hip hop, house, Afrobeats, line dance and soul DJs are all welcome.',
  },
  {
    q: 'Is this booking me for a date?',
    a: "Not yet. This builds our DJ list ahead of launch. We'll listen to your mixes and reach out as we start booking, and everyone on the list hears about dates first.",
  },
  {
    q: 'How do DJs get paid?',
    a: "We'll share pay and booking details with everyone on the list before dates open.",
  },
  {
    q: 'Can I get booked for other events?',
    a: 'Yes. We host corporate team nights, holiday parties and apartment resident events across metro Atlanta. Check the box on the form if you want to be considered.',
  },
];

const formatPhone = (value) => {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  djName: '',
  instagram: '',
  tiktok: '',
  link1: '',
  link2: '',
  link3: '',
  otherStyles: '',
  yearsSpinning: '',
  equipment: '',
  about: '',
  alsoBooks: true,
  notify: true,
  agreed: false,
  fax: '',
};

const DJs = () => {
  const { search } = useLocation();
  const [form, setForm] = useState(EMPTY);
  const [eras, setEras] = useState([]);
  const [nights, setNights] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'phone') next = formatPhone(value);
    setForm((prev) => ({ ...prev, [name]: next }));
    if (error) setError('');
  };
  const toggle = (setter, value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = form;
    const mixLinks = [f.link1, f.link2, f.link3].map((l) => l.trim()).filter(Boolean);
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.djName.trim()) {
      setError('Please fill in your name, DJ name and email.');
      return;
    }
    if (!mixLinks.length || !mixLinks.every((l) => /^https?:\/\//i.test(l))) {
      setError('Please add at least one mix or video link (starting with https://).');
      return;
    }
    if (!eras.length) {
      setError('Pick at least one era or style you spin.');
      return;
    }
    if (!f.agreed) {
      setError('Please agree to the Code of Conduct and Participation Waiver.');
      return;
    }
    setSubmitting(true);
    try {
      const src = new URLSearchParams(search).get('src') || '';
      const res = await fetch(`${BACKEND_URL}/api/djs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, mixLinks, eras, nights, source: src ? `djs?src=${src}` : 'djs' }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page perform-page">
      <Helmet>
        <title>Atlanta DJs: Spin at Scratched &amp; Stirred™ | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Atlanta DJs: join the list for Scratched & Stirred™, the Grown Folks DJ night launching in 2027. Three DJs, three eras, one dance floor for Atlanta's 30+ crowd. Your favorites, remixed & refreshed."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/perform/dj" />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <h1 className="contact-eyebrow seo-eyebrow-h1">Atlanta DJs · Scratched &amp; Stirred™ · Coming 2027</h1>
            <p className="contact-hero-title">Spin the Room</p>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              Scratched &amp; Stirred™ is our DJ night for Atlanta's 30+ crowd: three DJs, three eras, one dance floor.
              Your favorites, remixed &amp; refreshed. We're building our DJ list now, so get on it before dates drop.
            </p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <a href="#join" className="contact-hero-link">Join the DJ List</a>
            </nav>
            <PerformLinks current="/perform/dj" />
          </div>
          <div className="group-perks">
            <p className="contact-info-label">What DJs Get</p>
            <ul className="group-perks-list">
              {PERKS.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </header>

      <div>
        {done ? (
          <section className="contact-form-section">
            <div className="contact-form-container group-success" role="status">
              <span className="contact-form-eyebrow">You're on the List</span>
              <h2 className="contact-form-title">Welcome, {form.firstName}! 🎧</h2>
              <p className="contact-form-subhead">
                We emailed you a confirmation. We'll listen to your mixes and reach out as we start booking
                Scratched &amp; Stirred™. Everyone on the list hears about dates first.
              </p>
              <Link to="/events" className="contact-submit-btn group-success-btn">See Upcoming Events</Link>
            </div>
          </section>
        ) : (
          <>
            {/* ── HOW IT WORKS ── */}
            <section className="perform-info" aria-labelledby="how-heading">
              <div className="perform-info-inner">
                <h2 id="how-heading" className="perform-heading">How It Works</h2>
                <ol className="perform-steps">
                  <li>
                    <strong>Join the list</strong>
                    <span>Tell us who you are, the eras you spin, and send a mix or two. Takes about 3 minutes.</span>
                  </li>
                  <li>
                    <strong>We listen</strong>
                    <span>We review every mix and reach out to DJs who fit the room as we start booking.</span>
                  </li>
                  <li>
                    <strong>Spin the night</strong>
                    <span>Three DJs, three eras, one dance floor full of grown folks who came to move.</span>
                  </li>
                </ol>

                <h2 className="perform-heading">Common Questions</h2>
                <div className="perform-faqs">
                  {FAQS.map((f) => (
                    <details key={f.q} className="perform-faq">
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SIGN-UP ── */}
            <section className="contact-form-section" id="join" aria-labelledby="join-heading">
              <div className="contact-form-container">
                <header className="contact-form-header">
                  <span className="contact-form-eyebrow">DJ List</span>
                  <h2 className="contact-form-title" id="join-heading">Join the DJ List</h2>
                  <p className="contact-form-subhead">* Required fields</p>
                </header>

                <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
                  <input type="text" name="fax" value={form.fax} onChange={handleChange} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />

                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Information</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-first">First Name <span className="contact-required">*</span></label>
                        <input id="dj-first" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-last">Last Name <span className="contact-required">*</span></label>
                        <input id="dj-last" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-email">Email <span className="contact-required">*</span></label>
                        <input id="dj-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-phone">Phone <span className="contact-label-optional">(Optional)</span></label>
                        <input id="dj-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={handleChange} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Sound</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-name">DJ Name <span className="contact-required">*</span></label>
                        <input id="dj-name" name="djName" placeholder="e.g. DJ Smooth" value={form.djName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-years">Years Spinning</label>
                        <select id="dj-years" name="yearsSpinning" value={form.yearsSpinning} onChange={handleChange}>
                          <option value="">Choose one</option>
                          {['Under 1', '1–3', '3–5', '5–10', '10+'].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <p className="contact-label" id="dj-eras">Eras and styles you spin <span className="contact-required">*</span></p>
                    <div className="group-checks" role="group" aria-labelledby="dj-eras">
                      {ERAS.map((x) => (
                        <label key={x} className="group-check">
                          <input type="checkbox" checked={eras.includes(x)} onChange={() => toggle(setEras, x)} />
                          <span>{x}</span>
                        </label>
                      ))}
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="dj-other">Anything else you spin <span className="contact-label-optional">(Optional)</span></label>
                      <input id="dj-other" name="otherStyles" placeholder="e.g. Go-go, Latin, Jersey club" value={form.otherStyles} onChange={handleChange} />
                    </div>
                    <p className="perform-note">Share mixes or videos of you spinning a room: SoundCloud, Mixcloud, YouTube, Instagram or TikTok.</p>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="dj-link1">Mix or Video Link <span className="contact-required">*</span></label>
                      <input id="dj-link1" name="link1" type="url" placeholder="https://" value={form.link1} onChange={handleChange} required />
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-link2">Another Link <span className="contact-label-optional">(Optional)</span></label>
                        <input id="dj-link2" name="link2" type="url" placeholder="https://" value={form.link2} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-link3">Another Link <span className="contact-label-optional">(Optional)</span></label>
                        <input id="dj-link3" name="link3" type="url" placeholder="https://" value={form.link3} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-ig">Instagram <span className="contact-label-optional">(Optional)</span></label>
                        <input id="dj-ig" name="instagram" placeholder="@yourhandle" value={form.instagram} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="dj-tt">TikTok <span className="contact-label-optional">(Optional)</span></label>
                        <input id="dj-tt" name="tiktok" placeholder="@yourhandle" value={form.tiktok} onChange={handleChange} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Logistics</legend>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="dj-equip">Your Equipment</label>
                      <select id="dj-equip" name="equipment" value={form.equipment} onChange={handleChange}>
                        <option value="">Choose one</option>
                        {EQUIPMENT.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </div>
                    <p className="contact-label" id="dj-nights">Best nights for you</p>
                    <div className="group-checks" role="group" aria-labelledby="dj-nights">
                      {NIGHTS.map((x) => (
                        <label key={x} className="group-check">
                          <input type="checkbox" checked={nights.includes(x)} onChange={() => toggle(setNights, x)} />
                          <span>{x}</span>
                        </label>
                      ))}
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="dj-about">Tell us about your sound and the rooms you've rocked <span className="contact-label-optional">(Optional)</span></label>
                      <textarea id="dj-about" name="about" rows={4} value={form.about} onChange={handleChange} />
                    </div>
                    <div className="group-checks">
                      <label className="group-check">
                        <input type="checkbox" name="alsoBooks" checked={form.alsoBooks} onChange={handleChange} />
                        <span>Consider me for private and corporate events too</span>
                      </label>
                      <label className="group-check">
                        <input type="checkbox" name="notify" checked={form.notify} onChange={handleChange} />
                        <span>Email me when Scratched &amp; Stirred™ dates open</span>
                      </label>
                      <label className="group-check">
                        <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} />
                        <span>
                          I agree to the <a href="/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of Conduct</a> and{' '}
                          <a href="/waiver" target="_blank" rel="noopener noreferrer">Participation Waiver</a>. <span className="contact-required">*</span>
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  <div aria-live="polite">
                    {error && (
                      <div ref={errorRef} className="contact-feedback error" role="alert" tabIndex={-1}>{error}</div>
                    )}
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Join the DJ List'}
                  </button>
                  <p className="form-privacy-note">By submitting, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</p>
                </form>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DJs;

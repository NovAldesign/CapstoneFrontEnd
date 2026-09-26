import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGfcEvents } from '../Services/eventService';
import { BACKEND_URL, isUpcoming } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';

// Keep in sync with ARTIST_TERMS in the backend (routes/artistRoutes.js)
const TERMS = [
  'Sell at least 5 tickets using my personal ticket link.',
  "I'm paid $15 for every ticket sold with my link, up to $75, within 3–5 business days after the show via Zelle or Cash App.",
  'Have at least 3 tickets sold one week before the show to hold my spot.',
  'Bring all my own equipment (mic, amp, instrument, cables).',
  'Arrive 1 hour before doors for setup and sound check.',
  'Tag @grownfolkscollective when I promote the show.',
];

const PERKS = [
  '$15 for every ticket you sell, up to $75',
  'A 20-minute set for a room that came to listen',
  'Keep 100% of your merch sales and tips',
  'Promotion on our socials, email list, and venue partners',
  'Your photo and bio featured on the event page',
];

const FAQS = [
  {
    q: 'Who can apply?',
    a: 'Atlanta-area solo artists and duos who perform R&B, soul, neo-soul, jazz, acoustic, and similar styles. Our audience is grown folks 30+ who love live music and good vibes.',
  },
  {
    q: 'How do I get paid?',
    a: "You earn $15 for every ticket sold with your personal link, up to $75 for 5 tickets. We pay within 3–5 business days after the show by Zelle or Cash App. You also keep 100% of your merch and tips.",
  },
  {
    q: 'What if I sell fewer than 5 tickets?',
    a: "You're still paid $15 for each ticket you sell. To hold your spot, have at least 3 sold one week before the show. If not, we may offer your spot to another artist so the room stays full.",
  },
  {
    q: 'What equipment do I need?',
    a: 'Bring everything you need to perform: mic, amp, instrument, and cables. Let us know if you need a power outlet near your spot.',
  },
  {
    q: 'Where are the showcases?',
    a: 'Intimate, alcohol-free venues around Atlanta, like Aromas Tea Bar – The Koncept House. Each showcase features 3 artists with 20-minute sets.',
  },
];

const MUSIC_EVENT = /showcase|live music|acoustic|open mic|concert|jam session/i;
const eventName = (e) => e?.title || e?.name || '';
const eventLabel = (e) =>
  `${new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${eventName(e)}`;

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
  artistName: '',
  genres: '',
  hometown: '',
  bio: '',
  instagram: '',
  tiktok: '',
  otherSocial: '',
  link1: '',
  link2: '',
  link3: '',
  eventId: '',
  equipmentNotes: '',
  needsPower: false,
  payoutMethod: 'Zelle',
  payoutHandle: '',
  featureConsent: true,
  signatureName: '',
};

const Perform = () => {
  const [form, setForm] = useState(EMPTY);
  const [agreed, setAgreed] = useState(TERMS.map(() => false));
  const [events, setEvents] = useState([]);
  const [headshotUrl, setHeadshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const errorRef = useRef(null);

  // Upcoming music events for the dropdown
  useEffect(() => {
    fetchGfcEvents()
      .then((data) => {
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((e) => e && e.status?.toLowerCase() === 'published' && isUpcoming(e))
          .filter((e) => MUSIC_EVENT.test(eventName(e)))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming);
      })
      .catch(() => {});
  }, []);

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

  const toggleTerm = (i) => setAgreed((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  // Upload the headshot straight to Cloudinary
  const handleHeadshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Please choose a photo under 10 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const sig = await fetch(`${BACKEND_URL}/api/artists/upload-signature`).then((r) => r.json());
      if (!sig.signature) throw new Error(sig.error || 'Photo uploads are unavailable right now.');
      const data = new FormData();
      data.append('file', file);
      data.append('api_key', sig.apiKey);
      data.append('timestamp', sig.timestamp);
      data.append('folder', sig.folder);
      data.append('signature', sig.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (!result.secure_url) throw new Error('Upload failed. Please try another photo.');
      setHeadshotUrl(result.secure_url);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = form;
    const links = [f.link1, f.link2, f.link3].map((l) => l.trim()).filter(Boolean);
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.phone.trim() || !f.artistName.trim()) {
      setError('Please fill in your name, artist name, email, and phone.');
      return;
    }
    if (!links.length || !links.every((l) => /^https?:\/\//i.test(l))) {
      setError('Please add at least one performance link (starting with https://).');
      return;
    }
    if (!agreed.every(Boolean)) {
      setError('Please check every box in the artist agreement.');
      return;
    }
    if (!f.signatureName.trim()) {
      setError('Please type your full name to sign.');
      return;
    }
    if (uploading) {
      setError('Please wait for your photo to finish uploading.');
      return;
    }

    const chosen = events.find((ev) => String(ev._id) === f.eventId);
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/artists/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          headshotUrl,
          performanceLinks: links,
          eventName: chosen ? eventLabel(chosen) : 'Any upcoming showcase',
          termsAccepted: true,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setSubmitted(true);
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
        <title>Perform in Atlanta | Paid Live Music Showcase | Grown Folks Collective</title>
        <meta
          name="description"
          content="Atlanta R&B, soul, and acoustic artists: apply to perform at a Grown Folks Collective live music showcase. Paid per ticket, keep 100% of merch and tips, and play for a room that came to listen."
        />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Perform With Us</span>
            <h1 className="contact-hero-title">Take the Stage</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              Paid live music showcases for Atlanta R&amp;B, soul, and acoustic artists.
              Perform for a room of grown folks who came to listen, and grow your fan base with us.
            </p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <a href="#apply" className="contact-hero-link">Apply to Perform</a>
            </nav>
          </div>
          <div className="group-perks">
            <p className="contact-info-label">What Artists Get</p>
            <ul className="group-perks-list">
              {PERKS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <main id="main-content">
        {submitted ? (
          <section className="contact-form-section">
            <div className="contact-form-container group-success" role="status">
              <span className="contact-form-eyebrow">Application Received</span>
              <h2 className="contact-form-title">Thanks, {form.firstName}! 🎶</h2>
              <p className="contact-form-subhead">
                We emailed you a copy of the terms you agreed to. We'll review your music and
                get back to you within 3–5 business days.
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
                    <strong>Apply</strong>
                    <span>Share your music, a headshot, and a short bio. Takes about 5 minutes.</span>
                  </li>
                  <li>
                    <strong>Get reviewed</strong>
                    <span>We listen to your links and reply within 3–5 business days.</span>
                  </li>
                  <li>
                    <strong>Get booked</strong>
                    <span>You get your personal ticket link. Invite your people, then take the stage.</span>
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

            {/* ── APPLICATION ── */}
            <section className="contact-form-section" id="apply" aria-labelledby="apply-heading">
              <div className="contact-form-container">
                <header className="contact-form-header">
                  <span className="contact-form-eyebrow">Artist Application</span>
                  <h2 className="contact-form-title" id="apply-heading">Apply to Perform</h2>
                  <p className="contact-form-subhead">* Required fields</p>
                </header>

                <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
                  {/* Contact info */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Information (private)</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-first">First Name <span className="contact-required">*</span></label>
                        <input id="pf-first" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-last">Last Name <span className="contact-required">*</span></label>
                        <input id="pf-last" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-email">Email <span className="contact-required">*</span></label>
                        <input id="pf-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-phone">Phone <span className="contact-required">*</span></label>
                        <input id="pf-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={handleChange} required />
                      </div>
                    </div>
                  </fieldset>

                  {/* Public profile */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">About You (for "Meet the Artists")</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-artist">Artist / Stage Name <span className="contact-required">*</span></label>
                        <input id="pf-artist" name="artistName" value={form.artistName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-genres">Genre(s)</label>
                        <input id="pf-genres" name="genres" placeholder="e.g. R&B, Neo-Soul" value={form.genres} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-hometown">Hometown <span className="contact-label-optional">(Optional)</span></label>
                      <input id="pf-hometown" name="hometown" placeholder="e.g. Atlanta, GA" value={form.hometown} onChange={handleChange} />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-bio">Short Bio <span className="contact-label-optional">(2–4 sentences)</span></label>
                      <textarea id="pf-bio" name="bio" className="contact-textarea" rows="4" maxLength={600} value={form.bio} onChange={handleChange}
                        placeholder="Who you are, your sound, and what people can expect from your set." />
                      <span className="contact-input-hint" style={{ textAlign: 'right', display: 'block' }}>{form.bio.length}/600</span>
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-headshot">Headshot <span className="contact-label-optional">(JPG or PNG, under 10 MB)</span></label>
                      <div className="perform-headshot">
                        {headshotUrl ? (
                          <img src={headshotUrl} alt="Your headshot preview" />
                        ) : (
                          <div className="perform-headshot-empty" aria-hidden="true">📷</div>
                        )}
                        <div>
                          <input id="pf-headshot" type="file" accept="image/*" onChange={handleHeadshot} />
                          <p className="contact-input-hint">
                            {uploading ? 'Uploading…' : headshotUrl ? '✓ Uploaded. Choose another to replace it.' : 'A clear, well-lit photo works best.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-ig">Instagram</label>
                        <input id="pf-ig" name="instagram" placeholder="@yourhandle" value={form.instagram} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-tt">TikTok</label>
                        <input id="pf-tt" name="tiktok" placeholder="@yourhandle" value={form.tiktok} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-other">Website or other link <span className="contact-label-optional">(Optional)</span></label>
                      <input id="pf-other" name="otherSocial" placeholder="https://" value={form.otherSocial} onChange={handleChange} />
                    </div>
                  </fieldset>

                  {/* Music */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Music</legend>
                    <p className="perform-note">Links to live performance videos help us most (YouTube, Instagram, TikTok, Spotify, SoundCloud).</p>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-l1">Performance link 1 <span className="contact-required">*</span></label>
                      <input id="pf-l1" name="link1" type="url" placeholder="https://" value={form.link1} onChange={handleChange} required />
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-l2">Link 2 <span className="contact-label-optional">(Optional)</span></label>
                        <input id="pf-l2" name="link2" type="url" placeholder="https://" value={form.link2} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-l3">Link 3 <span className="contact-label-optional">(Optional)</span></label>
                        <input id="pf-l3" name="link3" type="url" placeholder="https://" value={form.link3} onChange={handleChange} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Showcase details */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">The Showcase</legend>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-event">Which showcase are you applying for?</label>
                      <select id="pf-event" name="eventId" value={form.eventId} onChange={handleChange}>
                        <option value="">Any upcoming showcase</option>
                        {events.map((ev) => (
                          <option key={ev._id} value={String(ev._id)}>{eventLabel(ev)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-equip">What equipment will you bring?</label>
                      <textarea id="pf-equip" name="equipmentNotes" className="contact-textarea" rows="2" maxLength={600}
                        placeholder="e.g. vocal mic, small PA speaker, acoustic guitar" value={form.equipmentNotes} onChange={handleChange} />
                    </div>
                    <div className="group-checks">
                      <label className="group-check">
                        <input type="checkbox" name="needsPower" checked={form.needsPower} onChange={handleChange} />
                        <span>I'll need a power outlet near my spot 🔌</span>
                      </label>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-payout">Payout method</label>
                        <select id="pf-payout" name="payoutMethod" value={form.payoutMethod} onChange={handleChange}>
                          <option value="Zelle">Zelle</option>
                          <option value="Cash App">Cash App</option>
                        </select>
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-handle">
                          {form.payoutMethod === 'Zelle' ? 'Zelle email or phone' : 'Cash App $cashtag'}
                        </label>
                        <input id="pf-handle" name="payoutHandle" value={form.payoutHandle} onChange={handleChange} />
                      </div>
                    </div>
                  </fieldset>

                  {/* Agreement */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Artist Agreement</legend>
                    <p className="perform-note">If booked, I agree to: <span className="contact-required">*</span></p>
                    <div className="group-checks">
                      {TERMS.map((t, i) => (
                        <label key={t} className="group-check">
                          <input type="checkbox" checked={agreed[i]} onChange={() => toggleTerm(i)} />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                    <div className="group-checks perform-consent">
                      <label className="group-check">
                        <input type="checkbox" name="featureConsent" checked={form.featureConsent} onChange={handleChange} />
                        <span>Grown Folks Collective may feature my name, photo, bio, and music links on its website and social media.</span>
                      </label>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-sign">Type your full name to sign <span className="contact-required">*</span></label>
                        <input id="pf-sign" name="signatureName" autoComplete="name" value={form.signatureName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <span className="contact-label">Date</span>
                        <p className="perform-date">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </fieldset>

                  <div aria-live="polite">
                    {error && (
                      <div ref={errorRef} className="contact-feedback error" role="alert" tabIndex={-1}>{error}</div>
                    )}
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={submitting || uploading}>
                    {submitting ? 'Sending…' : 'Submit My Application'}
                  </button>
                </form>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Perform;
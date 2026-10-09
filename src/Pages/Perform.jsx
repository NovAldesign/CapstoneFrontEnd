import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGfcEvents } from '../Services/eventService';
import { BACKEND_URL, isUpcoming } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';
import { PERFORMER_AGREEMENT_VERSION } from '../content/legalContent.js';

// Keep in sync with ARTIST_TERMS in the backend (routes/artistRoutes.js)
const ARTIST_TERMS = [
  'Sell at least 5 tickets using my personal ticket link.',
  "I'm paid $15 for every ticket sold with my link, up to $75, within 3–5 business days after the show via Zelle or Cash App.",
  'Have at least 3 tickets sold one week before the show to hold my spot.',
  'Bring all my own equipment (mic, amp, instrument, cables).',
  'Arrive 1 hour before doors for setup and sound check.',
  'Tag @grownfolkscollective when I promote the show.',
  'Follow the Performer Agreement, Code of Conduct, and Participation Waiver, including the showcase rules and release.',
];

// Keep in sync with HOST_TERMS in the backend (routes/artistRoutes.js)
const HOST_TERMS = [
  'Sell at least 5 tickets using my personal ticket link.',
  "I'm paid $15 for every ticket sold with my link, up to $75, within 3–5 business days after the show via Zelle or Cash App.",
  'Have at least 3 tickets sold one week before the show to hold my spot.',
  'Arrive 1 hour before doors to walk through the run of show.',
  'Welcome the room, introduce each artist, and keep the night moving.',
  'Tag @grownfolkscollective when I promote the show.',
  'Follow the Performer Agreement, Code of Conduct, and Participation Waiver, including the showcase rules and release.',
];

const ARTIST_PERKS = [
  '$15 for every ticket you sell, up to $75',
  'A 20-minute set for a room that came to listen',
  'Keep 100% of your merch sales and tips',
  'Promotion on our socials, email list, and venue partners',
  'Your photo and bio featured on the event page',
];

const HOST_PERKS = [
  '$15 for every ticket you sell, up to $75',
  'The mic all night, in a room that came to listen',
  'Your photo and bio featured on the event page',
  'Promotion on our socials, email list, and venue partners',
  'A great night to build your name as a host',
];

const ARTIST_FAQS = [
  {
    q: 'Who can apply?',
    a: "Atlanta-area singers, musicians, and duos who play R&B, soul, neo-soul, jazz, acoustic, and similar styles. You don't have to sing: keys, sax, guitar, bass, trumpet, violin, and other instrumentalists are welcome. Our audience is grown folks 30+ who love live music and good vibes.",
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

const HOST_FAQS = [
  {
    q: 'What does the host do?',
    a: 'You welcome the room, introduce each artist, keep the energy up between sets, and handle a few announcements. We send you the run of show and the artist intros before the night.',
  },
  {
    q: 'Who can apply?',
    a: "MCs, comedians, radio and podcast voices, poets, and anyone who's great with a mic and a room full of grown folks 30+. Experience helps, but personality matters most.",
  },
  {
    q: 'How do I get paid?',
    a: 'Just like our artists: $15 for every ticket sold with your personal link, up to $75 for 5 tickets, paid within 3–5 business days after the show by Zelle or Cash App.',
  },
  {
    q: 'Do I need to bring equipment?',
    a: 'No. Just bring yourself, your voice, and your best energy.',
  },
];

// Everything that changes between the artist page (/perform) and the host page (/perform/host)
const ROLES = {
  artist: {
    terms: ARTIST_TERMS,
    perks: ARTIST_PERKS,
    faqs: ARTIST_FAQS,
    title: 'Perform in Atlanta | Paid Live Music Showcase | Grown Folks™ Collective',
    description: 'Atlanta singers and musicians: apply to perform at a Grown Folks™ Collective live music showcase. Paid per ticket, keep 100% of merch and tips, and play for a room that came to listen.',
    canonical: 'https://www.grownfolkscollective.com/perform',
    eyebrow: 'Perform With Us',
    heading: 'Take the Stage',
    lead: 'Paid live music showcases for Atlanta singers and musicians: R&B, soul, jazz, and acoustic. Vocalists and instrumentalists welcome. Perform for a room of grown folks who came to listen, and grow your fan base with us.',
    perksLabel: 'What Artists Get',
    jump: 'Apply to Perform',
    other: { to: '/perform/host', text: 'Want to host the night instead? Apply to host →' },
    formEyebrow: 'Artist Application',
    formTitle: 'Apply to Perform',
    agreementLegend: 'Artist Agreement',
  },
  host: {
    terms: HOST_TERMS,
    perks: HOST_PERKS,
    faqs: HOST_FAQS,
    title: 'Host a Live Music Night in Atlanta | Paid MC Spot | Grown Folks™ Collective',
    description: 'Atlanta MCs, comedians, and personalities: apply to host Acoustic & Infused, a live music showcase for grown folks 30+. Paid per ticket, just like our artists.',
    canonical: 'https://www.grownfolkscollective.com/perform/host',
    eyebrow: 'Host With Us',
    heading: 'Run the Room',
    lead: "Every great show needs a voice that holds it together. Host Acoustic & Infused, welcome the room, introduce the artists, and keep the night moving. You're paid per ticket, just like our artists.",
    perksLabel: 'What Hosts Get',
    jump: 'Apply to Host',
    other: { to: '/perform', text: 'Are you a singer or musician? Apply to perform →' },
    formEyebrow: 'Host Application',
    formTitle: 'Apply to Host',
    agreementLegend: 'Host Agreement',
  },
};

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

const Perform = ({ role = 'artist' }) => {
  const isHost = role === 'host';
  const R = ROLES[isHost ? 'host' : 'artist'];
  const TERMS = R.terms;
  const [form, setForm] = useState(EMPTY);
  const [agreed, setAgreed] = useState(TERMS.map(() => false));
  const [events, setEvents] = useState([]);
  const [headshotUrl, setHeadshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const errorRef = useRef(null);

  // Upcoming showcases for the dropdown, with how many spots are left
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/artists/showcases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list) => { if (Array.isArray(list)) setEvents(list); else throw new Error(); })
      .catch(() => fetchGfcEvents()
      .then((data) => {
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((e) => e && e.status?.toLowerCase() === 'published' && isUpcoming(e))
          .filter((e) => MUSIC_EVENT.test(eventName(e)))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming);
      })
      .catch(() => {}));
  }, []);

  // A date stays open until it's full
  const spotsLeft = (ev) => (isHost ? ev.hostSpotsLeft : ev.artistSpotsLeft);
  const isFull = (ev) => spotsLeft(ev) !== undefined && spotsLeft(ev) <= 0;

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

  // Big phone photos (or HEIC) get resized to a JPEG in the browser first
  const shrinkPhoto = (file) =>
    new Promise((resolve) => {
      const small = file.size <= 4 * 1024 * 1024 && /^image\/(jpeg|png)$/.test(file.type);
      if (small) return resolve(file);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], 'headshot.jpg', { type: 'image/jpeg' }) : file),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // the browser can't read it; try the original
      };
      img.src = url;
    });

  // Upload the headshot straight to Cloudinary
  const handleHeadshot = async (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith('image/') && !/\.(heic|heif)$/i.test(picked.name)) {
      setError('Please choose an image file (JPG or PNG).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const file = await shrinkPhoto(picked);
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('That photo is too large. Please choose one under 10 MB, or take a screenshot of it and upload that.');
      }
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
      if (!result.secure_url) throw new Error('Your photo didn\'t upload. Please try another photo (JPG or PNG).');
      setHeadshotUrl(result.secure_url);
    } catch (err) {
      setHeadshotUrl('');
      setError(err.message || 'Your photo didn\'t upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = form;
    const links = [f.link1, f.link2, f.link3].map((l) => l.trim()).filter(Boolean);
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.phone.trim() || (!isHost && !f.artistName.trim())) {
      setError(isHost ? 'Please fill in your name, email, and phone.' : 'Please fill in your name, artist name, email, and phone.');
      return;
    }
    if ((!isHost && !links.length) || !links.every((l) => /^https?:\/\//i.test(l))) {
      setError(isHost ? 'Links need to start with https://.' : 'Please add at least one performance link (starting with https://).');
      return;
    }
    if (!agreed.every(Boolean)) {
      setError(`Please check every box in the ${isHost ? 'host' : 'artist'} agreement.`);
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
          role: isHost ? 'host' : 'artist',
          headshotUrl,
          performanceLinks: links,
          eventName: chosen ? eventLabel(chosen) : 'Any upcoming showcase',
          termsAccepted: true,
          agreementVersion: PERFORMER_AGREEMENT_VERSION,
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
        <title>{R.title}</title>
        <meta name="description" content={R.description} />
        <link rel="canonical" href={R.canonical} />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">{R.eyebrow}</span>
            <h1 className="contact-hero-title">{R.heading}</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">{R.lead}</p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <a href="#apply" className="contact-hero-link">{R.jump}</a>
            </nav>
            <p className="perform-switch"><Link to={R.other.to}>{R.other.text}</Link></p>
          </div>
          <div className="group-perks">
            <p className="contact-info-label">{R.perksLabel}</p>
            <ul className="group-perks-list">
              {R.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div>
        {submitted ? (
          <section className="contact-form-section">
            <div className="contact-form-container group-success" role="status">
              <span className="contact-form-eyebrow">Application Received</span>
              <h2 className="contact-form-title">Thanks, {form.firstName}! 🎶</h2>
              <p className="contact-form-subhead">
                We emailed you a copy of the terms you agreed to. We'll review your application and
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
                    <span>{isHost ? 'Tell us about you, add a headshot and a short bio. Takes about 5 minutes.' : 'Share your music, a headshot, and a short bio. Takes about 5 minutes.'}</span>
                  </li>
                  <li>
                    <strong>Get reviewed</strong>
                    <span>{isHost ? 'We look at your links and reply within 3–5 business days.' : 'We listen to your links and reply within 3–5 business days.'}</span>
                  </li>
                  <li>
                    <strong>Get booked</strong>
                    <span>{isHost ? 'You get your personal ticket link. Invite your people, then grab the mic.' : 'You get your personal ticket link. Invite your people, then take the stage.'}</span>
                  </li>
                </ol>

                <h2 className="perform-heading">Common Questions</h2>
                <div className="perform-faqs">
                  {R.faqs.map((f) => (
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
                  <span className="contact-form-eyebrow">{R.formEyebrow}</span>
                  <h2 className="contact-form-title" id="apply-heading">{R.formTitle}</h2>
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
                    <legend className="contact-form-divider">About You (for the event page)</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        {isHost ? (
                          <label className="contact-label" htmlFor="pf-artist">Host / Stage Name <span className="contact-label-optional">(Optional)</span></label>
                        ) : (
                          <label className="contact-label" htmlFor="pf-artist">Artist / Stage Name <span className="contact-required">*</span></label>
                        )}
                        <input id="pf-artist" name="artistName" value={form.artistName} onChange={handleChange} required={!isHost}
                          placeholder={isHost ? 'Leave blank to use your name' : ''} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="pf-genres">{isHost ? 'Your style' : 'Instrument / Genre(s)'}</label>
                        <input id="pf-genres" name="genres" placeholder={isHost ? 'e.g. MC, Comedian, Radio Host' : 'e.g. Vocals, R&B · Sax, Jazz'} value={form.genres} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-hometown">Hometown <span className="contact-label-optional">(Optional)</span></label>
                      <input id="pf-hometown" name="hometown" placeholder="e.g. Atlanta, GA" value={form.hometown} onChange={handleChange} />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-bio">Short Bio <span className="contact-label-optional">(2–4 sentences)</span></label>
                      <textarea id="pf-bio" name="bio" className="contact-textarea" rows="4" maxLength={600} value={form.bio} onChange={handleChange}
                        placeholder={isHost ? 'Who you are, where you have hosted, and the energy you bring to a room.' : 'Who you are, your sound, and what people can expect from your set.'} />
                      <span className="contact-input-hint" style={{ textAlign: 'right', display: 'block' }}>{form.bio.length}/600</span>
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-headshot">Headshot <span className="contact-label-optional">(JPG or PNG)</span></label>
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
                    <legend className="contact-form-divider">{isHost ? 'See You in Action' : 'Your Music'}</legend>
                    <p className="perform-note">
                      {isHost
                        ? 'A video of you hosting, speaking, or performing helps us most (YouTube, Instagram, TikTok). No video yet? You can still apply.'
                        : 'Links to live performance videos help us most (YouTube, Instagram, TikTok, Spotify, SoundCloud).'}
                    </p>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="pf-l1">
                        {isHost ? <>Video link 1 <span className="contact-label-optional">(Optional)</span></> : <>Performance link 1 <span className="contact-required">*</span></>}
                      </label>
                      <input id="pf-l1" name="link1" type="url" placeholder="https://" value={form.link1} onChange={handleChange} required={!isHost} />
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
                      <label className="contact-label" htmlFor="pf-event">{isHost ? 'Which showcase do you want to host?' : 'Which showcase are you applying for?'}</label>
                      <select id="pf-event" name="eventId" value={form.eventId} onChange={handleChange}>
                        <option value="">Any upcoming showcase</option>
                        {events.map((ev) => (
                          <option key={ev._id} value={String(ev._id)} disabled={isFull(ev)}>
                            {eventLabel(ev)}{isFull(ev) ? ' (Full)' : !isHost && spotsLeft(ev) === 1 ? ' (1 spot left)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!isHost && (
                      <>
                        <div className="contact-input-group">
                          <label className="contact-label" htmlFor="pf-equip">What equipment will you bring?</label>
                          <textarea id="pf-equip" name="equipmentNotes" className="contact-textarea" rows="2" maxLength={600}
                            placeholder="e.g. vocal mic, small PA speaker, keyboard, sax" value={form.equipmentNotes} onChange={handleChange} />
                        </div>
                        <div className="group-checks">
                          <label className="group-check">
                            <input type="checkbox" name="needsPower" checked={form.needsPower} onChange={handleChange} />
                            <span>I'll need a power outlet near my spot 🔌</span>
                          </label>
                        </div>
                      </>
                    )}
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
                    <legend className="contact-form-divider">{R.agreementLegend}</legend>
                    <p className="perform-note">
                      Grown Folks™ Collective is a social club offering you a stage to showcase your talent.
                      Please read the <a href="/performer-agreement" target="_blank" rel="noopener noreferrer">Performer Agreement</a>.
                      If booked, I agree to: <span className="contact-required">*</span>
                    </p>
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
                        <span>Grown Folks™ Collective may feature my name, photo, bio, and {isHost ? 'links' : 'music links'} on its website and social media.</span>
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

export default Perform;
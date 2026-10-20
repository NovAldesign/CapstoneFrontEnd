import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGfcEvents } from '../Services/eventService';
import { BACKEND_URL, isUpcoming } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';
import PerformLinks from '../Components/PerformLinks.jsx';
import OnOurStage from '../Components/OnOurStage.jsx';

// Industry scouts: label reps, managers, A&R, booking agents, producers.
// They join the scout list, pick showcases, and get a free ticket (their name on the guest list).
// Keep TITLES and INTERESTS in sync with models/scoutSchema.js in the backend.
const TITLES = [
  'A&R',
  'Artist Manager',
  'Label Owner or Executive',
  'Booking Agent',
  'Producer',
  'Publisher',
  'Talent Scout',
  'Gallery or Curator',
  'Other',
];

const INTERESTS = ['Artists to sign', 'Artists to manage', 'Talent to book', 'Collaborators', 'Visual artists'];

const PERKS = [
  'A free ticket to every showcase you pick',
  'An email when new showcases are added',
  'Live music and live art from Atlanta\'s rising artists',
  'Artist photos, bios, and music links on every event page',
  'A relaxed, alcohol-free room built for real connection',
];

const FAQS = [
  {
    q: 'Who is this for?',
    a: 'People who work with talent: A&R, label owners and executives, artist managers, booking agents, producers, publishers, and gallery owners or curators looking for visual artists.',
  },
  {
    q: 'Is it really free?',
    a: "Yes. Your ticket is on us for every showcase you pick. It's for you only. Bringing someone? They can grab a ticket on the event page.",
  },
  {
    q: 'What is Acoustic & Infused™?',
    a: "Our live music showcase for grown folks 30+. Each night features 3 Atlanta singers and musicians (R&B, soul, jazz, and acoustic), a host, and live art capturing the sound of the room, all in an intimate, alcohol-free venue.",
  },
  {
    q: 'Can I connect with the artists?',
    a: "Yes, that's why you're there. Let them finish their set, then say hello. Every artist's photo, bio, and links are on the event page before the show.",
  },
  {
    q: 'What if my plans change?',
    a: 'Just reply to your confirmation email so we can open your seat for someone else.',
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
  company: '',
  title: '',
  website: '',
  instagram: '',
  genres: '',
  notify: true,
  agreed: false,
};

const Scouts = () => {
  const { search } = useLocation();
  const [form, setForm] = useState(EMPTY);
  const [lookingFor, setLookingFor] = useState([]);
  const [picked, setPicked] = useState([]);
  const [events, setEvents] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const errorRef = useRef(null);

  // Upcoming showcases to pick from
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/artists/showcases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list) => { if (Array.isArray(list)) setEvents(list); else throw new Error(); })
      .catch(() => fetchGfcEvents()
        .then((data) => {
          setEvents((Array.isArray(data) ? data : [])
            .filter((e) => e && e.status?.toLowerCase() === 'published' && isUpcoming(e))
            .filter((e) => MUSIC_EVENT.test(eventName(e)))
            .sort((a, b) => new Date(a.date) - new Date(b.date)));
        })
        .catch(() => setEvents([])));
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

  const toggle = (setter, value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = form;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    if (f.website.trim() && !/^https?:\/\//i.test(f.website.trim())) {
      setError('Your website link needs to start with https://.');
      return;
    }
    if (!f.agreed) {
      setError('Please agree to the Code of Conduct and Participation Waiver.');
      return;
    }
    setSubmitting(true);
    try {
      const src = new URLSearchParams(search).get('src') || '';
      const res = await fetch(`${BACKEND_URL}/api/scouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, lookingFor, eventIds: picked, source: src ? `scouts?src=${src}` : 'scouts' }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setDone(result.showcases || []);
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
        <title>Industry Scouts | Discover Atlanta Talent Live | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="A&R, artist managers, label reps, and booking agents: join the Grown Folks™ Collective scout list and get a free ticket to Acoustic & Infused™, our live music showcase featuring Atlanta's rising artists."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/scouts" />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Industry Scouts</span>
            <h1 className="contact-hero-title">Scout the Room</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              Label reps, managers, A&amp;R, booking agents, and producers: Acoustic &amp; Infused™ puts Atlanta's rising
              singers, musicians, and live artists on one stage, in a room that came to listen. Join our scout list and
              your seat is on us.
            </p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <a href="#join" className="contact-hero-link">Join the Scout List</a>
            </nav>
            <PerformLinks current="/scouts" />
          </div>
          <div className="group-perks">
            <p className="contact-info-label">What Scouts Get</p>
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
              <h2 className="contact-form-title">Welcome, {form.firstName}! 🎶</h2>
              {done.length ? (
                <>
                  <p className="contact-form-subhead">Your free ticket is set. Just check in at the door under your name for:</p>
                  <ul className="scout-tickets">
                    {done.map((e) => (
                      <li key={e.id}>
                        <span className="scout-ticket-date">
                          {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="scout-ticket-name">{eventName(e)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="contact-form-subhead">
                  You're on our scout list. We'll email you when the next showcase is on the calendar.
                </p>
              )}
              <p className="contact-form-subhead">We emailed you a confirmation. Meet the artists ahead of time on each event page.</p>
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
                    <span>Tell us who you are and what kind of talent you're looking for. Takes about 2 minutes.</span>
                  </li>
                  <li>
                    <strong>Pick your showcases</strong>
                    <span>We put your name on the guest list. No ticket to buy. You'll also hear about new showcases first.</span>
                  </li>
                  <li>
                    <strong>Come scout</strong>
                    <span>Check in at the door under your name, enjoy the sets, and meet the artists after they perform.</span>
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

            {/* ── WHO YOU'LL SEE ── */}
            <OnOurStage role="all" intro="A look at the artists, hosts, and live artists booked for our showcases." />

            {/* ── SIGN-UP ── */}
            <section className="contact-form-section" id="join" aria-labelledby="join-heading">
              <div className="contact-form-container">
                <header className="contact-form-header">
                  <span className="contact-form-eyebrow">Scout List</span>
                  <h2 className="contact-form-title" id="join-heading">Join the Scout List</h2>
                  <p className="contact-form-subhead">* Required fields</p>
                </header>

                <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Information</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-first">First Name <span className="contact-required">*</span></label>
                        <input id="sc-first" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-last">Last Name <span className="contact-required">*</span></label>
                        <input id="sc-last" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-email">Email <span className="contact-required">*</span></label>
                        <input id="sc-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-phone">Phone <span className="contact-label-optional">(Optional)</span></label>
                        <input id="sc-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={handleChange} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">What You Do</legend>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-company">Company, Label, or Agency</label>
                        <input id="sc-company" name="company" autoComplete="organization" value={form.company} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-title">Your Role</label>
                        <select id="sc-title" name="title" value={form.title} onChange={handleChange}>
                          <option value="">Choose one</option>
                          {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-web">Website <span className="contact-label-optional">(Optional)</span></label>
                        <input id="sc-web" name="website" type="url" placeholder="https://" value={form.website} onChange={handleChange} />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="sc-ig">Instagram <span className="contact-label-optional">(Optional)</span></label>
                        <input id="sc-ig" name="instagram" placeholder="@yourhandle" value={form.instagram} onChange={handleChange} />
                      </div>
                    </div>
                    <p className="contact-label" id="sc-looking">What are you looking for?</p>
                    <div className="group-checks" role="group" aria-labelledby="sc-looking">
                        {INTERESTS.map((x) => (
                          <label key={x} className="group-check">
                            <input type="checkbox" checked={lookingFor.includes(x)} onChange={() => toggle(setLookingFor, x)} />
                            <span>{x}</span>
                          </label>
                        ))}
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="sc-genres">Genres or styles you're into <span className="contact-label-optional">(Optional)</span></label>
                      <input id="sc-genres" name="genres" placeholder="e.g. R&B, Soul, Neo-soul, Jazz" value={form.genres} onChange={handleChange} />
                    </div>
                  </fieldset>

                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Free Ticket</legend>
                    {events === null ? (
                      <p className="perform-note">Loading showcases…</p>
                    ) : events.length ? (
                      <>
                        <p className="perform-note">Pick the showcases you'd like to attend. We'll put your name on the guest list.</p>
                        <div className="group-checks">
                          {events.map((ev) => (
                            <label key={ev._id} className="group-check">
                              <input type="checkbox" checked={picked.includes(String(ev._id))} onChange={() => toggle(setPicked, String(ev._id))} />
                              <span>{eventLabel(ev)}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="perform-note">There are no showcases on the calendar right now. Join the list and we'll email you when the next one is added.</p>
                    )}
                    <div className="group-checks">
                      <label className="group-check">
                        <input type="checkbox" name="notify" checked={form.notify} onChange={handleChange} />
                        <span>Email me when new showcases are added</span>
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
                    {submitting ? 'Sending…' : 'Join the Scout List'}
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

export default Scouts;

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';
import '../Styles/Recess.css';

// Recess Talks: monthly speaker series on play, joy and inner-child healing.
// Guests join the interest list; authors, professors, therapists and more apply to speak.
// Keep SPEAKER_TYPES, BOOKS and AVAILABILITY in sync with models/recessSchema.js in the backend.
const SPEAKER_TYPES = [
  'Author',
  'Professor or Educator',
  'Therapist or Counselor',
  'Coach',
  'Wellness Practitioner',
  'Artist or Creative',
  'Other',
];
const BOOKS = ['Sell and sign books', 'Sign books only', 'No books', 'Not sure yet'];
const AVAILABILITY = ['Saturday mornings', 'Saturday afternoons'];

const EXPECT = [
  'A talk from an author or expert on play, joy and healing your inner child',
  'Coloring and play while you listen',
  'Coffee, tea and a light breakfast',
  'A small, intimate room where you can actually connect',
  'One Saturday a month, mornings or afternoons depending on the venue',
];

const TOPICS = [
  ['Healing the kid in you', 'Reconnect with the parts of you that learned to play small, and give them room to play again.'],
  ['Bringing play back into your week', 'Simple ways grown folks can make room for fun without waiting for vacation.'],
  ['Rest without guilt', "Why slowing down isn't falling behind, and how to actually enjoy it."],
  ['Finding what lights you up', 'The people, places and passions that make you feel like yourself.'],
  ['Creativity for non-creatives', 'You don\'t have to be "artsy" to make something and love it.'],
  ['Joy as a practice', 'Small, daily habits that bring more lightness into a full grown life.'],
];

const SPEAKERS = ['Authors', 'Professors & educators', 'Therapists & counselors', 'Coaches', 'Wellness practitioners', 'Artists & creatives'];

const FAQS = [
  {
    q: 'When does it start?',
    a: "We're planning our first Recess Talk for January 2027, then one Saturday a month after that. Join the list and you'll hear first when the date, speaker and tickets are set.",
  },
  {
    q: 'Where will it be?',
    a: "We're partnering with spaces around Atlanta that fit the vibe, like bookstores, coffee shops and college campuses. Each talk's venue will be on its event page.",
  },
  {
    q: 'Do I need to be "into" self-help?',
    a: 'Not at all. Come curious. Recess Talks™ are warm, interactive and a little playful, never a lecture. You can color, listen, share or just soak it in.',
  },
  {
    q: 'Who is it for?',
    a: 'Grown folks 30+ in Atlanta who want more joy, rest and real connection. Like every Grown Folks™ Collective event, it\'s alcohol-free.',
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
  speakerType: '',
  organization: '',
  about: '',
  talkTitle: '',
  talkSummary: '',
  interactive: '',
  books: '',
  bookTitles: '',
  website: '',
  instagram: '',
  videoLink: '',
  notes: '',
  agreed: false,
  company: '', // bot trap (hidden)
};

const post = async (path, body) => {
  const res = await fetch(`${BACKEND_URL}/api/recess${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

// "Be first to know" list for guests
const InterestForm = ({ source }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please add your name and a valid email.');
      return;
    }
    setSending(true);
    try {
      await post('/interest', { name, email, company: trap, source });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="recess-interest-done" role="status">
        <strong>You're on the list, {name.split(' ')[0]}!</strong>
        <span>We'll email you as soon as the first talk, speaker and tickets are set.</span>
      </div>
    );
  }

  return (
    <form className="recess-interest-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="ri-name">Your name</label>
      <input id="ri-name" placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="sr-only" htmlFor="ri-email">Your email</label>
      <input id="ri-email" type="email" placeholder="you@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="recess-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} />
      <button type="submit" className="contact-submit-btn" disabled={sending}>{sending ? 'Adding…' : 'Be First to Know'}</button>
      {error && <p className="contact-feedback error recess-interest-error" role="alert">{error}</p>}
    </form>
  );
};

const Recess = () => {
  const { search } = useLocation();
  const src = new URLSearchParams(search).get('src') || '';
  const source = src ? `recess?src=${src}` : 'recess';
  const [form, setForm] = useState(EMPTY);
  const [availability, setAvailability] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const errorRef = useRef(null);
  const doneRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  useEffect(() => {
    if (done && doneRef.current) doneRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [done]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'phone') next = formatPhone(value);
    setForm((prev) => ({ ...prev, [name]: next }));
    if (error) setError('');
  };

  const toggleAvailability = (value) =>
    setAvailability((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = form;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    if (!f.talkTitle.trim() || f.talkSummary.trim().length < 30) {
      setError('Please share your talk title and a few sentences about it.');
      return;
    }
    for (const [key, label] of [['website', 'website'], ['videoLink', 'video']]) {
      if (f[key].trim() && !/^https?:\/\//i.test(f[key].trim())) {
        setError(`Your ${label} link needs to start with https://.`);
        return;
      }
    }
    if (!f.agreed) {
      setError("Please confirm you're the speaker and agree to the Code of Conduct.");
      return;
    }
    setSubmitting(true);
    try {
      await post('/speakers', { ...f, availability, source });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page perform-page recess-page">
      <Helmet>
        <title>Recess Talks™ | Play, Joy & Inner-Child Healing in Atlanta | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Recess Talks™ is a monthly Saturday speaker series in Atlanta on play, joy and inner-child healing. Authors and experts, coloring while you listen, coffee and a light breakfast. Starting January 2027. Join the list or apply to speak."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/recess" />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero recess-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Coming January 2027 · Atlanta · 30+</span>
            <h1 className="contact-hero-title">Recess Talks<sup className="recess-tm">™</sup></h1>
            <p className="recess-tagline">Remember recess? It's time for another one.</p>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              A monthly Saturday speaker series on play, joy and healing your inner child. Grab a coffee, pick up a
              crayon, and spend a little time with an author or expert who wants you to enjoy your life again.
            </p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <a href="#list" className="contact-hero-link">Get on the List</a>
              <a href="#speak" className="contact-hero-link">Apply to Speak</a>
            </nav>
          </div>
          <div className="group-perks">
            <p className="contact-info-label">What to Expect</p>
            <ul className="group-perks-list">
              {EXPECT.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </header>

      {/* ── INTEREST LIST ── */}
      <section className="recess-band" id="list" aria-labelledby="list-heading">
        <div className="recess-band-inner">
          <div>
            <h2 id="list-heading" className="recess-band-title">Be first to know</h2>
            <p className="recess-band-text">Seats will be limited. Join the list and you'll hear about the first talk before anyone else.</p>
          </div>
          <InterestForm source={source} />
        </div>
      </section>

      {/* ── TOPICS + FAQ ── */}
      <section className="perform-info" aria-labelledby="topics-heading">
        <div className="perform-info-inner">
          <h2 id="topics-heading" className="perform-heading">Talks We're Dreaming Up</h2>
          <ul className="recess-topics">
            {TOPICS.map(([t, d]) => (
              <li key={t}>
                <strong>{t}</strong>
                <span>{d}</span>
              </li>
            ))}
          </ul>

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

      {/* ── SPEAKER APPLICATION ── */}
      <section className="contact-form-section" id="speak" aria-labelledby="speak-heading" ref={doneRef}>
        {done ? (
          <div className="contact-form-container group-success" role="status">
            <span className="contact-form-eyebrow">Application Received</span>
            <h2 className="contact-form-title">Thank you, {form.firstName}!</h2>
            <p className="contact-form-subhead">
              We received your talk idea, <strong>“{form.talkTitle}”</strong>. We emailed you a confirmation and we'll reach
              out if it's a fit for an upcoming month.
            </p>
            <Link to="/events" className="contact-submit-btn group-success-btn">See Upcoming Events</Link>
          </div>
        ) : (
          <div className="contact-form-container">
            <header className="contact-form-header">
              <span className="contact-form-eyebrow">Call for Speakers</span>
              <h2 className="contact-form-title" id="speak-heading">Apply to Speak</h2>
              <p className="recess-who">
                We're looking for {SPEAKERS.slice(0, -1).join(', ').toLowerCase()} and {SPEAKERS[SPEAKERS.length - 1].toLowerCase()} who
                can help grown folks play more, rest more and reconnect with the kid inside. Talks are warm and interactive,
                never a lecture.
              </p>
              <p className="contact-form-subhead">* Required fields</p>
            </header>

            <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
              <fieldset className="contact-fieldset">
                <legend className="contact-form-divider">About You</legend>
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-first">First Name <span className="contact-required">*</span></label>
                    <input id="rs-first" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-last">Last Name <span className="contact-required">*</span></label>
                    <input id="rs-last" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-email">Email <span className="contact-required">*</span></label>
                    <input id="rs-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-phone">Phone <span className="contact-label-optional">(Optional)</span></label>
                    <input id="rs-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-type">I'm a…</label>
                    <select id="rs-type" name="speakerType" value={form.speakerType} onChange={handleChange}>
                      <option value="">Choose one</option>
                      {SPEAKER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-org">School, Practice or Organization <span className="contact-label-optional">(Optional)</span></label>
                    <input id="rs-org" name="organization" autoComplete="organization" value={form.organization} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-about">Your background <span className="contact-label-optional">(Optional)</span></label>
                  <textarea className="contact-textarea" id="rs-about" name="about" rows={4} maxLength={1200} value={form.about} onChange={handleChange}
                    placeholder="Your work, credentials and what you're known for" />
                </div>
              </fieldset>

              <fieldset className="contact-fieldset">
                <legend className="contact-form-divider">Your Talk</legend>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-title">Talk title <span className="contact-required">*</span></label>
                  <input id="rs-title" name="talkTitle" maxLength={150} value={form.talkTitle} onChange={handleChange} required
                    placeholder="e.g. Permission to Play: Finding Joy as a Grown-Up" />
                </div>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-summary">What's it about? <span className="contact-required">*</span></label>
                  <textarea className="contact-textarea" id="rs-summary" name="talkSummary" rows={5} maxLength={2000} value={form.talkSummary} onChange={handleChange} required
                    placeholder="A few sentences: what you'll share and what guests will walk away with" />
                </div>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-play">How would you bring play into it? <span className="contact-label-optional">(Optional)</span></label>
                  <textarea className="contact-textarea" id="rs-play" name="interactive" rows={3} maxLength={1200} value={form.interactive} onChange={handleChange}
                    placeholder="A coloring prompt, a game, a group activity, a reflection exercise…" />
                </div>
                <p className="contact-label" id="rs-when">When are you usually available?</p>
                <div className="group-checks" role="group" aria-labelledby="rs-when">
                  {AVAILABILITY.map((x) => (
                    <label key={x} className="group-check">
                      <input type="checkbox" checked={availability.includes(x)} onChange={() => toggleAvailability(x)} />
                      <span>{x}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="contact-fieldset">
                <legend className="contact-form-divider">Books &amp; Links</legend>
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-books">Books at the talk?</label>
                    <select id="rs-books" name="books" value={form.books} onChange={handleChange}>
                      <option value="">Choose one</option>
                      {BOOKS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-titles">Book title(s) <span className="contact-label-optional">(Optional)</span></label>
                    <input id="rs-titles" name="bookTitles" maxLength={400} value={form.bookTitles} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-web">Website <span className="contact-label-optional">(Optional)</span></label>
                    <input id="rs-web" name="website" type="url" placeholder="https://" value={form.website} onChange={handleChange} />
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="rs-ig">Instagram <span className="contact-label-optional">(Optional)</span></label>
                    <input id="rs-ig" name="instagram" placeholder="@yourhandle" value={form.instagram} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-video">A past talk, interview or podcast <span className="contact-label-optional">(Optional)</span></label>
                  <input id="rs-video" name="videoLink" type="url" placeholder="https://" value={form.videoLink} onChange={handleChange} />
                </div>
                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="rs-notes">Anything else we should know? <span className="contact-label-optional">(Optional)</span></label>
                  <textarea className="contact-textarea" id="rs-notes" name="notes" rows={3} maxLength={1000} value={form.notes} onChange={handleChange} />
                </div>
                <input className="recess-trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.company} onChange={handleChange} />
                <div className="group-checks">
                  <label className="group-check perform-self">
                    <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} />
                    <span>
                      I'm the speaker named in this application, and I agree to the{' '}
                      <a href="/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of Conduct</a>. <span className="contact-required">*</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <div aria-live="polite">
                {error && <div ref={errorRef} className="contact-feedback error" role="alert" tabIndex={-1}>{error}</div>}
              </div>

              <button type="submit" className="contact-submit-btn" disabled={submitting}>
                {submitting ? 'Sending…' : 'Apply to Speak'}
              </button>
              <p className="form-privacy-note">By submitting, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</p>
            </form>
          </div>
        )}
      </section>

      {/* ── SPONSORS ── */}
      <section className="recess-sponsor" aria-labelledby="sponsor-heading">
        <div className="recess-sponsor-inner">
          <h2 id="sponsor-heading" className="recess-band-title">Want your name on recess?</h2>
          <p className="recess-band-text">
            Bookstores, coffee and tea brands, wellness businesses and anyone who believes grown folks deserve more joy:
            partner with us to present a season, sponsor a Saturday or stock the breakfast table.
          </p>
          <Link to="/partnerships?src=recess" className="contact-submit-btn recess-sponsor-btn">Partner With Us</Link>
        </div>
      </section>
    </div>
  );
};

export default Recess;

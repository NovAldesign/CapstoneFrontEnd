import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Host.css';
import { PACKAGES, WEEKEND_EXTRA } from '../content/hostingPackages';

// ── Play. Sip. Toast. — GFC hosts at apartment communities, offices and teams ──
// Prices live in content/hostingPackages.js (shared with the landing pages).

const INCLUDED = [
  '2 hours (2.5 for the Mystery), hosted start to finish',
  'Signature mocktail bar, with one drink named after your property or company',
  'The Toast: we celebrate your residents’ or team’s wins, live',
  'Branded flyer to promote it to your residents or staff',
  'Setup and breakdown',
  'Event photos within 48 hours',
  'Attendance count for your report',
];

const ADD_ONS = [
  ['Töst sparkling toast upgrade', '+$8 per guest'],
  ['Extra 20 guests', '+$200'],
  ['Extra hour', '+$200'],
  ['GFC merch gifts', 'from $10 per guest'],
];

const STEPS = [
  {
    word: 'Play.',
    text: 'Your residents or team gather for a hosted Game Night, Spades Tournament, Karaoke Bingo or Live-Action Mystery. Strangers become teammates in about ten minutes.',
  },
  {
    word: 'Sip.',
    text: 'A signature mocktail bar, alcohol-free, with a drink named after your community or company. Upgrade to Töst for a sparkling, champagne-style toast.',
  },
  {
    word: 'Toast.',
    text: 'Before the event, guests share their wins: a new job, a birthday, a move-in anniversary, a big quarter. At the peak of the night, we raise a glass to every one of them.',
  },
];

// Recurring programs: % off every event (3-month minimum, Mon–Thu)
const SERIES = [
  { name: 'Monthly', freq: '1 event a month', off: 10 },
  { name: 'Biweekly', freq: '2 events a month', off: 15 },
  { name: 'Weekly', freq: '4 events a month', off: 20 },
];

const FREQUENCIES = ['One-time event', 'Monthly series', 'Biweekly series', 'Weekly series'];

const WHY = [
  ['Alcohol-free by design', 'No bartender, no liability, and everyone is included.'],
  ['Neighbors become friends', 'People who know their neighbors renew. Coworkers who laugh together stay.'],
  ['Made to be shared', 'Named mocktails and toast photos are made for your social media.'],
];

const money = (n) => `$${n.toLocaleString('en-US')}`;

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  clientType: 'residents',
  package: '',
  guestCount: '',
  preferredDate: '',
  city: '',
  toastUpgrade: false,
  frequency: 'One-time event',
  notes: '',
};

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const Host = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef(null);
  const formRef = useRef(null);

  // Holiday special: book a December event by Oct 31
  const showHoliday = new Date() <= new Date('2026-10-31T23:59:59-04:00');

  // Links like /host?type=corporate show corporate prices first
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'corporate' || type === 'residents') {
      setFormData((prev) => ({ ...prev, clientType: type }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (feedback && feedbackRef.current) feedbackRef.current.focus();
  }, [feedback]);

  const isCorporate = formData.clientType === 'corporate';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'phone') next = formatPhone(value);
    setFormData((prev) => ({ ...prev, [name]: next }));
    if (feedback) setFeedback(null);
  };

  const pickPackage = (name) => {
    setFormData((prev) => ({ ...prev, package: name }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, guestCount } = formData;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in your name, email, and phone.' });
      return;
    }
    if (!Number(guestCount) || Number(guestCount) < 1) {
      setFeedback({ type: 'error', message: 'Please tell us about how many guests to expect.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/hosting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          package: formData.package || 'Not sure yet',
          guestCount: Number(guestCount),
          source: searchParams.get('src') || '',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setSubmitted(true);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page group-page host-page">
      <Helmet>
        <title>Resident &amp; Corporate Event Hosting in Atlanta | Play. Sip. Toast. | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Play. Sip. Toast. Alcohol-free resident and corporate events in Atlanta, hosted by Grown Folks™ Collective: game nights, Spades tournaments and Karaoke Bingo with a signature mocktail bar and a toast to your community's wins."
        />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Resident &amp; Corporate Event Hosting · Atlanta</span>
            <h1 className="contact-hero-title host-title">
              Play. Sip. <em>Toast.</em><span className="host-tm">™</span>
            </h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              An alcohol-free celebration social for your apartment community, office
              or team. We bring the games, the mocktail bar and the host. Your people
              bring the wins worth toasting.
            </p>
            <div className="host-hero-actions">
              <button type="button" className="contact-submit-btn host-btn" onClick={() => pickPackage('')}>
                Book a Call
              </button>
              <a href="#packages" className="host-link">See packages &amp; pricing →</a>
              <a href="tel:+14702567729" className="host-link">Call or text 470-256-7729</a>
            </div>
          </div>

          <div className="group-perks">
            <p className="contact-info-label">Every Event Includes</p>
            <ul className="group-perks-list">
              {INCLUDED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {showHoliday && (
        <div className="host-holiday" role="note">
          <strong>Holiday Booking Special:</strong> book a December event by Oct 31 and save $150.
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="host-section" aria-labelledby="host-how">
        <span className="contact-form-eyebrow">How It Works</span>
        <h2 className="host-h2" id="host-how">Three parts. One night they'll talk about.</h2>
        <div className="host-steps">
          {STEPS.map((step, i) => (
            <div className="host-step" key={step.word}>
              <span className="host-step-num">0{i + 1}</span>
              <h3 className="host-step-word">{step.word}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="host-section host-section-alt" id="packages" aria-labelledby="host-packages">
        <span className="contact-form-eyebrow">Packages</span>
        <h2 className="host-h2" id="host-packages">Pick your play.</h2>

        <div className="host-toggle" role="group" aria-label="Show prices for">
          <button
            type="button"
            className={!isCorporate ? 'active' : ''}
            aria-pressed={!isCorporate}
            onClick={() => setFormData((p) => ({ ...p, clientType: 'residents' }))}
          >
            Apartment Communities
          </button>
          <button
            type="button"
            className={isCorporate ? 'active' : ''}
            aria-pressed={isCorporate}
            onClick={() => setFormData((p) => ({ ...p, clientType: 'corporate' }))}
          >
            Offices &amp; Teams
          </button>
        </div>

        <div className="host-packages">
          {PACKAGES.map((pkg) => (
            <article className={`host-card${pkg.badge ? ' featured' : ''}`} key={pkg.name}>
              {pkg.badge && <span className="host-card-badge">{pkg.badge}</span>}
              <p className="host-card-eyebrow">Play. Sip. Toast.</p>
              <h3 className="host-card-title">{pkg.short}</h3>
              <p className="host-card-price">
                {money(isCorporate ? pkg.corporate : pkg.residents)}
                <span> Mon–Thu</span>
              </p>
              <p className="host-card-weekend">
                {money((isCorporate ? pkg.corporate : pkg.residents) + WEEKEND_EXTRA)} Fri–Sun
              </p>
              <p className="host-card-guests">{pkg.guests}</p>
              <p className="host-card-blurb">{pkg.blurb}</p>
              <button type="button" className="host-card-btn" onClick={() => pickPackage(pkg.name)}>
                Request this package
              </button>
            </article>
          ))}
        </div>

        <div className="host-addons">
          <p className="contact-info-label host-addons-label">Add-Ons</p>
          <ul>
            {ADD_ONS.map(([name, price]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{price}</strong>
              </li>
            ))}
          </ul>
          <p className="host-fine">
            Weekend dates are limited, since GFC hosts its own public events most Friday and
            Saturday nights. Serving metro Atlanta. Travel is included within 25 miles of East
            Atlanta, with a small travel fee beyond that. Have a bigger group or a custom idea? Ask us.
          </p>
        </div>
      </section>

      {/* ── SERIES ── */}
      <section className="host-section" aria-labelledby="host-series">
        <span className="contact-form-eyebrow">The GFC Community Series</span>
        <h2 className="host-h2" id="host-series">Make it a series.</h2>
        <p className="host-series-lead">
          Give your residents or team something to look forward to every month. We rotate the
          games, theme them to the season, and toast that month's birthdays, anniversaries and wins.
        </p>
        <div className="host-series">
          {SERIES.map((plan) => {
            const base = isCorporate ? PACKAGES[0].corporate : PACKAGES[0].residents;
            const each = Math.round(base * (1 - plan.off / 100));
            return (
              <div className="host-series-card" key={plan.name}>
                <h3>{plan.name}</h3>
                <p className="host-series-freq">{plan.freq}</p>
                <p className="host-series-off">Save {plan.off}%</p>
                <p className="host-series-price">Game Night from {money(each)} per event</p>
              </div>
            );
          })}
        </div>
        <ul className="host-series-perks">
          <li>Rotating formats: Game Night, Spades, Karaoke Bingo and the Mystery</li>
          <li>A monthly report with attendance and photos</li>
          <li>Weekday dates, 3-month minimum</li>
        </ul>
        <button
          type="button"
          className="contact-submit-btn host-btn"
          onClick={() => {
            setFormData((p) => ({ ...p, frequency: 'Monthly series' }));
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Ask About a Series
        </button>
      </section>

      {/* ── WHY GFC ── */}
      <section className="host-section" aria-labelledby="host-why">
        <span className="contact-form-eyebrow">Why Grown Folks™ Collective</span>
        <h2 className="host-h2" id="host-why">Atlanta's alcohol-free social club, now at your place.</h2>
        <div className="host-why">
          {WHY.map(([title, text]) => (
            <div className="host-why-item" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="host-proof">
          260+ tickets sold to our game nights, Karaoke Bingo, live music and dinners.{' '}
          <Link to="/events">See our public events →</Link>
        </p>
      </section>

      {/* ── FORM ── */}
      <section className="contact-form-section" aria-labelledby="host-form-heading" ref={formRef}>
        <div className="contact-form-container">
          {submitted ? (
            <div className="group-success" role="status">
              <span className="contact-form-eyebrow">Request Received</span>
              <h2 className="contact-form-title">Cheers, {formData.firstName}! 🥂</h2>
              <p className="contact-form-subhead">
                We just emailed you a copy of your request. We'll reach out within 1 business
                day to plan your date, your guests and your signature mocktail.
              </p>
              <Link to="/events" className="contact-submit-btn group-success-btn">
                See Our Public Events
              </Link>
            </div>
          ) : (
            <>
              <header className="contact-form-header">
                <span className="contact-form-eyebrow">Book a Call</span>
                <h2 className="contact-form-title" id="host-form-heading">
                  Let's Plan Something Worth Toasting
                </h2>
                <p className="contact-form-subhead">
                  Takes about two minutes. We'll reach out within 1 business day.
                  Prefer to talk? Call or text <a href="tel:+14702567729">470-256-7729</a>.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
                <fieldset className="contact-fieldset">
                  <legend className="contact-form-divider">Your Information</legend>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-firstName">
                        First Name <span className="contact-required">*</span>
                      </label>
                      <input id="h-firstName" name="firstName" type="text" autoComplete="given-name"
                        value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-lastName">
                        Last Name <span className="contact-required">*</span>
                      </label>
                      <input id="h-lastName" name="lastName" type="text" autoComplete="family-name"
                        value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-email">
                        Work Email <span className="contact-required">*</span>
                      </label>
                      <input id="h-email" name="email" type="email" autoComplete="email"
                        value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-phone">
                        Phone <span className="contact-required">*</span>
                      </label>
                      <input id="h-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel"
                        value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-org">
                        Property or company name
                      </label>
                      <input id="h-org" name="organization" type="text" autoComplete="organization"
                        maxLength={120} value={formData.organization} onChange={handleChange} />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-type">This event is for</label>
                      <select id="h-type" name="clientType" value={formData.clientType} onChange={handleChange}>
                        <option value="residents">Residents (apartment community)</option>
                        <option value="corporate">Coworkers or a team</option>
                        <option value="other">Something else</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="contact-fieldset">
                  <legend className="contact-form-divider">Your Event</legend>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-package">Package</label>
                      <select id="h-package" name="package" value={formData.package} onChange={handleChange}>
                        <option value="">Not sure yet</option>
                        {PACKAGES.map((p) => (
                          <option key={p.name} value={p.name}>{p.short}</option>
                        ))}
                      </select>
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-guests">
                        Expected guests <span className="contact-required">*</span>
                      </label>
                      <input id="h-guests" name="guestCount" type="number" min="1" max="1000" inputMode="numeric"
                        value={formData.guestCount} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-date">
                        Preferred date <span className="contact-label-optional">(Optional)</span>
                      </label>
                      <input id="h-date" name="preferredDate" type="text" maxLength={60}
                        placeholder="e.g. Thu, Dec 11 (weekday rate)"
                        value={formData.preferredDate} onChange={handleChange} />
                    </div>
                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="h-city">City</label>
                      <input id="h-city" name="city" type="text" maxLength={80}
                        placeholder="e.g. Midtown, Decatur, Peachtree Corners"
                        value={formData.city} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="h-frequency">How often?</label>
                    <select id="h-frequency" name="frequency" value={formData.frequency} onChange={handleChange}>
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="group-checks">
                    <label className="group-check">
                      <input type="checkbox" name="toastUpgrade" checked={formData.toastUpgrade} onChange={handleChange} />
                      <span>Add the Töst sparkling toast upgrade 🥂</span>
                    </label>
                  </div>

                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="h-notes">
                      Anything we should know? <span className="contact-label-optional">(Optional)</span>
                    </label>
                    <textarea id="h-notes" name="notes" className="contact-textarea" rows="3" maxLength={1500}
                      placeholder="e.g. holiday resident party, indoor clubhouse, budget, theme ideas"
                      value={formData.notes} onChange={handleChange} />
                  </div>
                </fieldset>

                <p className="contact-required-note">
                  <span aria-hidden="true">*</span> Required fields
                </p>

                <div aria-live="polite">
                  {feedback && (
                    <div ref={feedbackRef} className={`contact-feedback ${feedback.type}`} role="alert" tabIndex={-1}>
                      {feedback.message}
                    </div>
                  )}
                </div>

                <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Book My Call'}
                </button>
                <p className="form-privacy-note">
                  By submitting, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Host;
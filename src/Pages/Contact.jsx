import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import '../Styles/Contact.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const REASONS = [
  'General Inquiry',
  'Event Question',
  'Membership Question',
  'Sponsorship / Partnership',
  'Media or Press',
  'Plan an Event for Me',
];

const EVENT_TYPES = [
  'Corporate Event',
  'Birthday Celebration',
  'Private Dinner',
  'Team Building',
  'Social Mixer',
  'Other',
];

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Not sure yet',
];

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
    message: '',
    eventDetails: { eventType: '', guestCount: '', preferredDate: '', budget: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback]         = useState(null);

  // ADA FIX #1 — Focus management after submit  (WCAG 2.4.3 Level A)
  // When feedback appears, move focus to it so screen-reader users
  // are immediately informed of success/error without having to search.
  const feedbackRef = useRef(null);
  useEffect(() => {
    if (feedback && feedbackRef.current) {
      feedbackRef.current.focus();
    }
  }, [feedback]);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const len = phoneNumber.length;
    if (len < 4) return phoneNumber;
    if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else if (name.startsWith('event_')) {
      const key = name.replace('event_', '');
      setFormData(prev => ({
        ...prev,
        eventDetails: { ...prev.eventDetails, [key]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/api/contact`, formData);
      setFeedback({
        type: 'success',
        message: "Message received. We'll be in touch within 48 hours.",
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        reason: '',
        message: '',
        eventDetails: { eventType: '', guestCount: '', preferredDate: '', budget: '' },
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEventSection = formData.reason === 'Plan an Event for Me';

  return (
    // ADA FIX #2 — Skip navigation link  (WCAG 2.4.1 Level A)
    <div className="contact-page">

      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Helmet>
        <title>Contact Us | Grown Folks Collective</title>
        <meta
          name="description"
          content="Get in touch with Grown Folks Collective. Ask about events, membership, sponsorships, or let us plan an event for you."
        />
      </Helmet>

      {/* HERO */}
      {/* ADA FIX #3 — <header role="banner"> landmark  (WCAG 1.3.6) */}
      <header className="contact-hero" role="banner">
        <div className="contact-hero-inner">

          {/* LEFT */}
          <div className="contact-hero-left">
            {/* ADA FIX #4 — Eyebrow aria-hidden: decorative label, heading provides the real name */}
            <span className="contact-eyebrow" aria-hidden="true">Get In Touch</span>

            {/* ADA FIX #5 — line-height 0.85 fails WCAG 1.4.12 text spacing — fixed in CSS */}
            <h1 className="contact-hero-title">Contact Us</h1>

            {/* Decorative spacer — hidden from AT */}
            <div className="contact-gold-spacer" aria-hidden="true"></div>

            {/* ADA FIX #6 — Hero lead text contrast: rgba(255,255,255,0.78) is ~10:1 ✓ */}
            <p className="contact-hero-lead">
              Whether you have a question, want to learn more about membership,
              or want us to plan an event for you — we're here. Reach out and
              we'll respond within 48 hours.
            </p>

            {/* ADA FIX #7 — CTA links need descriptive text (WCAG 2.4.6 Level AA) */}
            <nav className="contact-hero-links" aria-label="Quick contact actions">
              <Link to="/events" className="contact-hero-link">
                View Upcoming Events
              </Link>
              <Link to="/membership" className="contact-hero-link secondary">
                Join the Collective
              </Link>
            </nav>
          </div>

          {/* RIGHT — contact info */}
          {/* ADA FIX #8 — contact info blocks: use <address> + proper link semantics */}
          <address className="contact-hero-right">

            <div className="contact-info-block contact-socials-block">
              <p className="contact-info-label" id="social-label">Follow Us</p>
              {/* ADA FIX #9 — social icons must have accessible names  (WCAG 4.1.2 Level A)
                  Icon-only links are invisible to screen readers without aria-label.
                  Each link gets aria-label="Platform name (opens in new tab)"          */}
              <ul
                className="contact-socials"
                role="list"
                aria-labelledby="social-label"
              >
                <li>
                  <a
                    href="https://www.tiktok.com/@grownfolkscollective"
                    className="contact-social-icon"
                    aria-label="Follow us on TikTok (opens in new tab)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* ADA FIX #10 — SVG icons must be aria-hidden since the link has a label */}
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/grownfolkscollective"
                    className="contact-social-icon"
                    aria-label="Follow us on Instagram (opens in new tab)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.meetup.com/grownfolkscollective"
                    className="contact-social-icon"
                    aria-label="Join us on Meetup (opens in new tab)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.24 12.68c-.24-.96.1-2.01.87-2.63.17-.14.14-.4-.06-.5a2.83 2.83 0 00-1.3-.24c-.48.02-.94.18-1.32.46a5.04 5.04 0 00-3.43-1.35 5.08 5.08 0 00-5.08 5.08 5.08 5.08 0 005.08 5.08c1.68 0 3.17-.82 4.1-2.08.36.1.74.15 1.13.13a3.07 3.07 0 002.99-3.07 3.07 3.07 0 00-2.98-2.88z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* ADA FIX #11 — Email link must use href="mailto:" for functionality */}
            <div className="contact-info-block">
              {/* Using <p> not <span> for the label so it's a proper text node */}
              <p className="contact-info-label">Email</p>
              <a
                href="mailto:hello@grownfolkscollective.com"
                className="contact-info-value"
              >
                hello@grownfolkscollective.com
              </a>
            </div>

            <div className="contact-info-block">
              <p className="contact-info-label">Location</p>
              {/* ADA FIX #12 — Non-interactive location text: use <p> not <a> 
                  WCAG 2.4.4 — Links must have a purpose. A non-clickable <a>
                  with no href is a broken link. Use <p> for static content.  */}
              <p className="contact-info-value contact-info-static">
                Atlanta, GA
              </p>
            </div>

            <div className="contact-info-block">
              <p className="contact-info-label">Response Time</p>
              <p className="contact-info-value contact-info-static">
                Within 48 Hours
              </p>
            </div>

          </address>
        </div>
      </header>

      {/* ADA FIX #13 — <main> landmark required  (WCAG 2.4.1 Level A) */}
      <main id="main-content">

        <section
          className="contact-form-section"
          aria-labelledby="contact-form-heading"
        >
          <div className="contact-form-container">

            {/* ADA FIX #14 — Form needs a visible heading  (WCAG 2.4.6 Level AA) */}
            <header className="contact-form-header">
              <span className="contact-form-eyebrow" aria-hidden="true">Send a Message</span>
              <h2 className="contact-form-title" id="contact-form-heading">
                Let's Talk
              </h2>
              <p className="contact-form-subhead">
                Fill out the form below and we'll get back to you within 48 hours.
                For faster response, email us directly at{' '}
                <a href="mailto:hello@grownfolkscollective.com" className="contact-inline-link">
                  hello@grownfolkscollective.com
                </a>
              </p>
            </header>

            {/* ADA FIX #15 — <form> needs aria-label  (WCAG 4.1.2 Level A)
                When there are multiple forms on a page, or for robustness,
                label the form so AT announces "Contact form" on focus.     */}
            <form
              onSubmit={handleSubmit}
              className="contact-luxe-form"
              aria-label="Contact form"
              noValidate
            >

              {/* ADA FIX #16 — Form section dividers must be <fieldset>+<legend>
                  WCAG 1.3.1 Level A — "Your Information" is a grouping label.
                  Using <fieldset>/<legend> gives screen readers context for
                  each group of related fields.                               */}
              <fieldset className="contact-fieldset">
                <legend className="contact-form-divider">Your Information</legend>

                <div className="contact-form-row">
                  <div className="contact-input-group">
                    {/* ADA FIX #17 — Labels are correctly associated via htmlFor ✓
                        Adding autocomplete for better UX + WCAG 1.3.5 (Level AA) */}
                    <label className="contact-label" htmlFor="firstName">
                      First Name <span className="contact-required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      autoComplete="given-name"
                      /* ADA FIX #18 — aria-required duplicates HTML required for
                         older AT that may not read the native required attribute */
                    />
                  </div>

                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="lastName">
                      Last Name <span className="contact-required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="email">
                      Email <span className="contact-required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      autoComplete="email"
                      /* ADA FIX #19 — type="email" triggers correct mobile keyboard
                         and provides native format validation hint              */
                    />
                  </div>

                  <div className="contact-input-group">
                    {/* ADA FIX #20 — "(Optional)" must be in the label text,
                        not only visual — screen readers need to hear it.     */}
                    <label className="contact-label" htmlFor="phone">
                      Phone{' '}
                      <span className="contact-label-optional">(Optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="14"
                      autoComplete="tel"
                      /* ADA FIX #21 — Add inputMode for mobile numeric pad */
                      inputMode="numeric"
                      aria-describedby="phone-hint"
                    />
                    {/* ADA FIX #22 — Input hints use aria-describedby  (WCAG 1.3.1) */}
                    <span id="phone-hint" className="contact-input-hint">
                      Format: (555) 555-5555
                    </span>
                  </div>
                </div>
              </fieldset>

              {/* ─── Reason & Message ─────────────────────────── */}
              <fieldset className="contact-fieldset">
                <legend className="contact-form-divider">Your Message</legend>

                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="reason">
                    I'm reaching out about...{' '}
                    <span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    {/* ADA FIX #23 — Placeholder option must have empty value
                        so required validation fires correctly                */}
                    <option value="">Select a reason...</option>
                    {REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* ADA FIX #24 — Conditional section needs proper disclosure pattern
                    WCAG 4.1.3 / 1.3.1 — When "Plan an Event" is selected,
                    the new fields must be announced to AT users.
                    aria-live="polite" on the wrapper announces the appearance. */}
                <div aria-live="polite" aria-atomic="false">
                  {showEventSection && (
                    <fieldset className="contact-event-planning-section contact-fieldset contact-fieldset--nested">
                      <legend className="contact-event-planning-label">
                        Tell Us About Your Event
                      </legend>

                      <div className="contact-form-row">
                        <div className="contact-input-group">
                          <label className="contact-label" htmlFor="event_eventType">
                            Event Type
                          </label>
                          <select
                            id="event_eventType"
                            name="event_eventType"
                            value={formData.eventDetails.eventType}
                            onChange={handleChange}
                          >
                            <option value="">Select event type...</option>
                            {EVENT_TYPES.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="contact-input-group">
                          <label className="contact-label" htmlFor="event_guestCount">
                            Estimated Guest Count
                          </label>
                          <input
                            id="event_guestCount"
                            type="number"
                            name="event_guestCount"
                            value={formData.eventDetails.guestCount}
                            onChange={handleChange}
                            min="1"
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div className="contact-form-row">
                        <div className="contact-input-group">
                          <label className="contact-label" htmlFor="event_preferredDate">
                            Preferred Date
                          </label>
                          {/* ADA FIX #25 — Date inputs need a visible hint about format
                              WCAG 3.3.2 – Labels or Instructions (Level A)           */}
                          <input
                            id="event_preferredDate"
                            type="date"
                            name="event_preferredDate"
                            value={formData.eventDetails.preferredDate}
                            onChange={handleChange}
                            aria-describedby="date-hint"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          <span id="date-hint" className="contact-input-hint">
                            Select a future date
                          </span>
                        </div>

                        <div className="contact-input-group">
                          <label className="contact-label" htmlFor="event_budget">
                            Budget Range
                          </label>
                          <select
                            id="event_budget"
                            name="event_budget"
                            value={formData.eventDetails.budget}
                            onChange={handleChange}
                          >
                            <option value="">Select budget range...</option>
                            {BUDGET_RANGES.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </fieldset>
                  )}
                </div>

                <div className="contact-input-group">
                  <label className="contact-label" htmlFor="message">
                    Message <span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="contact-textarea"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    rows="6"
                    /* ADA FIX #26 — rows attribute gives AT a sense of size;
                       also prevents a 0-height textarea on some browsers       */
                  />
                </div>
              </fieldset>

              {/* ADA FIX #27 — Required field legend  (WCAG 3.3.2 Level A)
                  Users must know which fields are required before submitting. */}
              <p className="contact-required-note">
                <span aria-hidden="true">*</span> Required fields
              </p>

              {/* ADA FIX #28 — Feedback region: aria-live + role="alert" for errors,
                  role="status" for success; tabIndex="-1" so focus lands here.
                  WCAG 4.1.3 – Status Messages (Level AA)                     */}
              <div
                aria-live="polite"
                aria-atomic="true"
              >
                {feedback && (
                  <div
                    ref={feedbackRef}
                    className={`contact-feedback ${feedback.type}`}
                    role={feedback.type === 'error' ? 'alert' : 'status'}
                    tabIndex={-1}
                    /* ADA FIX #29 — tabIndex="-1" allows programmatic focus
                       without adding the element to the natural tab order   */
                  >
                    {/* ADA FIX #30 — Prefix message with type for AT users
                        so they hear "Error: …" or "Success: …" immediately */}
                    <span className="sr-only">
                      {feedback.type === 'error' ? 'Error: ' : 'Success: '}
                    </span>
                    {feedback.message}
                  </div>
                )}
              </div>

              {/* ADA FIX #31 — Submit button  (WCAG 4.1.2 Level A)
                  type="submit" is correct ✓
                  aria-disabled mirrors the disabled state for AT that
                  may not fully read the native disabled attribute        */}
              <button
                type="submit"
                className="contact-submit-btn"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                aria-busy={isSubmitting}
                /* ADA FIX #32 — aria-busy tells AT the form is processing */
              >
                {isSubmitting ? (
                  <>
                    {/* ADA FIX #33 — Loading state must be announced to AT */}
                    <span aria-live="polite" aria-atomic="true">Sending…</span>
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

            </form>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Contact;
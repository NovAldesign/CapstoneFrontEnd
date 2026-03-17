import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Contact.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    eventDetails: {
      eventType: '',
      guestCount: '',
      preferredDate: '',
      budget: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isEventPlanning = formData.reason === 'Plan an Event for Me';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('event_')) {
      const key = name.replace('event_', '');
      setFormData((prev) => ({
        ...prev,
        eventDetails: { ...prev.eventDetails, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await axios.post(`${API}/api/contact`, {
        ...formData,
        eventDetails: isEventPlanning ? formData.eventDetails : {},
      });

      setFeedback({ type: 'success', message: "Message received. We'll be in touch within 48 hours." });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        reason: '',
        message: '',
        eventDetails: {
          eventType: '',
          guestCount: '',
          preferredDate: '',
          budget: '',
        },
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.error ||
          'Something went wrong. Please try again or email us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      {/* =============================================
          DARK HERO SECTION
         ============================================= */}
      <header className="contact-hero">
        <div className="contact-hero-inner">

          <div className="contact-hero-left">
            <span className="contact-eyebrow">Atlanta & Beyond</span>
            <h1 className="playfair contact-hero-title">Let's<br />Talk.</h1>
            <div className="contact-gold-spacer"></div>
            <p className="contact-hero-lead">
              Whether you're ready to join, looking to partner, or just
              want to know more — we respond to every message within 48 hours.
            </p>
          </div>

          <div className="contact-hero-right">

            <div className="contact-info-block">
              <div className="contact-info-label">Email</div>
              <a
                href="mailto:hello@grownfolkscollective.com"
                className="contact-info-value"
              >
                hello@grownfolkscollective.com
              </a>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-label">Phone</div>
              <a href="tel:+14045550000" className="contact-info-value">
                (404) 555-0000
              </a>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-label">Instagram</div>
              <a
                href="https://instagram.com/grownfolkscollective"
                target="_blank"
                rel="noreferrer"
                className="contact-info-value"
              >
                @grownfolkscollective
              </a>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-label">TikTok</div>
              <a
                href="https://tiktok.com/@grownfolkscollective"
                target="_blank"
                rel="noreferrer"
                className="contact-info-value"
              >
                @grownfolkscollective
              </a>
            </div>

            <div className="contact-info-block">
              <div className="contact-info-label">Based In</div>
              <div className="contact-info-value contact-info-static">
                Decatur, GA &nbsp;·&nbsp; Serving Metro Atlanta
              </div>
            </div>

            <div className="contact-hero-links">
              <Link to="/membership" className="contact-hero-link">
                Join the Collective
              </Link>
              <Link to="/partnerships" className="contact-hero-link secondary">
                Become a Partner
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* =============================================
          FORM SECTION
         ============================================= */}
      <section className="contact-form-section">
        <div className="contact-form-container">

          <div className="contact-form-header">
            <span className="contact-form-eyebrow">Send a Message</span>
            <h2 className="playfair contact-form-title">Start the Conversation</h2>
            <p className="contact-form-subhead">
              Use the form below for any inquiry. For partnerships and sponsorships,
              you can also visit our{' '}
              <Link to="/partnerships" className="contact-inline-link">
                Partner page
              </Link>{' '}
              for a dedicated proposal form.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="contact-luxe-form"
            noValidate
          >

            {/* Name */}
            <div className="contact-form-divider">Your Information</div>
            <div className="contact-form-row">
              <div className="contact-input-group">
                <label className="contact-label" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="contact-input-group">
                <label className="contact-label" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="contact-form-row">
              <div className="contact-input-group">
                <label className="contact-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="contact-input-group">
                <label className="contact-label" htmlFor="phone">
                  Phone{' '}
                  <span className="contact-label-optional">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="contact-form-divider">How Can We Help?</div>
            <div className="contact-input-group">
              <label className="contact-label" htmlFor="reason">
                I'm reaching out about...
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">Select a reason...</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Planning — conditional fields */}
            {isEventPlanning && (
              <div className="contact-event-planning-section">
                <div className="contact-event-planning-label">
                  Tell us about your event
                </div>

                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="event_eventType">
                      Type of Event
                    </label>
                    <select
                      id="event_eventType"
                      name="event_eventType"
                      value={formData.eventDetails.eventType}
                      onChange={handleChange}
                    >
                      <option value="">Select type...</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="event_guestCount">
                      Estimated Guest Count
                    </label>
                    <input
                      id="event_guestCount"
                      type="text"
                      name="event_guestCount"
                      value={formData.eventDetails.guestCount}
                      onChange={handleChange}
                      placeholder="e.g. 25–36"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="event_preferredDate">
                      Preferred Date
                    </label>
                    <input
                      id="event_preferredDate"
                      type="date"
                      name="event_preferredDate"
                      value={formData.eventDetails.preferredDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-input-group">
                    <label className="contact-label" htmlFor="event_budget">
                      Approximate Budget
                    </label>
                    <select
                      id="event_budget"
                      name="event_budget"
                      value={formData.eventDetails.budget}
                      onChange={handleChange}
                    >
                      <option value="">Select range...</option>
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="contact-input-group">
              <label className="contact-label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                className="contact-textarea"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder={
                  isEventPlanning
                    ? 'Share any other details about your vision...'
                    : 'How can we help you?'
                }
              />
            </div>

            {feedback && (
              <div className={`contact-feedback ${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
};

export default Contact;
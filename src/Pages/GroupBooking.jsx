import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGfcEvents } from '../Services/eventService';
import { BACKEND_URL, isUpcoming } from '../Services/eventUtils';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  "Girls' / Guys' Night Out",
  'Reunion',
  'Work Outing',
  'Just Because',
  'Other',
];

const PERKS = [
  'Group pricing for 10 or more',
  'Tables reserved so your crew sits together',
  'Bring your own cake',
  'Custom touches, like your favorite songs on the Karaoke Bingo cards',
  'Mocktail specials for your group',
];

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  occasion: '',
  eventId: '',
  groupSize: '',
  songRequests: '',
  bringingCake: false,
  wantsMocktails: false,
  notes: '',
};

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const eventLabel = (event) => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${date} · ${event.title}`;
};

const GroupBooking = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const feedbackRef = useRef(null);

  // Load upcoming events for the dropdown, and pre-pick one from the link
  // Example links: /celebrate?event=karaoke  or  /celebrate?occasion=Birthday
  useEffect(() => {
    let active = true;
    fetchGfcEvents()
      .then((data) => {
        if (!active) return;
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((e) => e && e.title && e.status?.toLowerCase() === 'published')
          .filter((e) => isUpcoming(e))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming);

        const wanted = (searchParams.get('event') || '').toLowerCase();
        const match = wanted
          ? upcoming.find(
              (e) =>
                String(e._id) === wanted ||
                e.title.toLowerCase().includes(wanted)
            )
          : null;
        const occasion = searchParams.get('occasion') || '';
        setFormData((prev) => ({
          ...prev,
          eventId: match ? String(match._id) : prev.eventId,
          occasion: OCCASIONS.includes(occasion) ? occasion : prev.occasion,
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (feedback && feedbackRef.current) feedbackRef.current.focus();
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let next = type === 'checkbox' ? checked : value;
    if (name === 'phone') next = formatPhone(value);
    setFormData((prev) => ({ ...prev, [name]: next }));
    if (feedback) setFeedback(null);
  };

  const selectedEvent = events.find((e) => String(e._id) === formData.eventId);
  const isKaraoke = /karaoke/i.test(selectedEvent?.title || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, groupSize } = formData;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in your name, email, and phone.' });
      return;
    }
    if (!Number(groupSize) || Number(groupSize) < 1) {
      setFeedback({ type: 'error', message: 'Please tell us how many people are in your group.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/group-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          groupSize: Number(groupSize),
          eventTitle: selectedEvent ? eventLabel(selectedEvent) : 'Not sure yet',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page group-page">
      <Helmet>
        <title>Celebrate With Us | Grown Folks Collective</title>
        <meta
          name="description"
          content="Bring your crew to a Grown Folks Collective event. Birthdays, reunions, and nights out for Atlanta's 30+ crowd, with group pricing and reserved tables."
        />
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Celebrate With Us</span>
            <h1 className="contact-hero-title">Bring Your Crew</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              Birthdays, reunions, or just a night out with your people. Pick a
              GFC event, tell us about your group, and we'll handle the rest.
            </p>
          </div>

          <div className="group-perks">
            <p className="contact-info-label">What Groups Get</p>
            <ul className="group-perks-list">
              {PERKS.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="contact-form-section" aria-labelledby="group-form-heading">
          <div className="contact-form-container">
            {submitted ? (
              <div className="group-success" role="status">
                <span className="contact-form-eyebrow">Request Received</span>
                <h2 className="contact-form-title">Let's celebrate, {formData.firstName}! 🎉</h2>
                <p className="contact-form-subhead">
                  We just emailed you a copy of your request. We'll follow up within
                  48 hours with your group ticket link and next steps.
                </p>
                <Link to="/events" className="contact-submit-btn group-success-btn">
                  Browse Upcoming Events
                </Link>
              </div>
            ) : (
              <>
                <header className="contact-form-header">
                  <span className="contact-form-eyebrow">Group Request</span>
                  <h2 className="contact-form-title" id="group-form-heading">
                    Tell Us About Your Group
                  </h2>
                  <p className="contact-form-subhead">
                    Takes about two minutes. We'll reply by email within 48 hours.
                  </p>
                </header>

                <form onSubmit={handleSubmit} className="contact-luxe-form" noValidate>
                  {/* ── Your info ── */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Information</legend>

                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-firstName">
                          First Name <span className="contact-required">*</span>
                        </label>
                        <input
                          id="gb-firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-lastName">
                          Last Name <span className="contact-required">*</span>
                        </label>
                        <input
                          id="gb-lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-email">
                          Email <span className="contact-required">*</span>
                        </label>
                        <input
                          id="gb-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-phone">
                          Phone <span className="contact-required">*</span>
                        </label>
                        <input
                          id="gb-phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* ── The outing ── */}
                  <fieldset className="contact-fieldset">
                    <legend className="contact-form-divider">Your Outing</legend>

                    <div className="contact-form-row">
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-occasion">
                          What's the occasion?
                        </label>
                        <select
                          id="gb-occasion"
                          name="occasion"
                          value={formData.occasion}
                          onChange={handleChange}
                        >
                          <option value="">Select one...</option>
                          {OCCASIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div className="contact-input-group">
                        <label className="contact-label" htmlFor="gb-groupSize">
                          Group size (incl. you) <span className="contact-required">*</span>
                        </label>
                        <input
                          id="gb-groupSize"
                          name="groupSize"
                          type="number"
                          min="1"
                          max="200"
                          inputMode="numeric"
                          value={formData.groupSize}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="gb-event">
                        Which event?
                      </label>
                      <select
                        id="gb-event"
                        name="eventId"
                        value={formData.eventId}
                        onChange={handleChange}
                      >
                        <option value="">Not sure yet</option>
                        {events.map((event) => (
                          <option key={event._id} value={String(event._id)}>
                            {eventLabel(event)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="gb-songs">
                        {isKaraoke
                          ? 'Favorite songs for your bingo cards'
                          : 'Favorite songs or special touches'}{' '}
                        <span className="contact-label-optional">(Optional)</span>
                      </label>
                      <textarea
                        id="gb-songs"
                        name="songRequests"
                        className="contact-textarea"
                        rows="3"
                        maxLength={1500}
                        placeholder="e.g. Before I Let Go, Maze · Weak, SWV · anything Jodeci"
                        value={formData.songRequests}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="group-checks">
                      <label className="group-check">
                        <input
                          type="checkbox"
                          name="bringingCake"
                          checked={formData.bringingCake}
                          onChange={handleChange}
                        />
                        <span>We're bringing a cake 🎂</span>
                      </label>
                      <label className="group-check">
                        <input
                          type="checkbox"
                          name="wantsMocktails"
                          checked={formData.wantsMocktails}
                          onChange={handleChange}
                        />
                        <span>We're interested in a mocktail special for the group 🍹</span>
                      </label>
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label" htmlFor="gb-notes">
                        Anything else we should know?{' '}
                        <span className="contact-label-optional">(Optional)</span>
                      </label>
                      <textarea
                        id="gb-notes"
                        name="notes"
                        className="contact-textarea"
                        rows="3"
                        maxLength={1500}
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </fieldset>

                  <p className="contact-required-note">
                    <span aria-hidden="true">*</span> Required fields
                  </p>

                  <div aria-live="polite">
                    {feedback && (
                      <div
                        ref={feedbackRef}
                        className={`contact-feedback ${feedback.type}`}
                        role="alert"
                        tabIndex={-1}
                      >
                        {feedback.message}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending…' : 'Send My Group Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GroupBooking;
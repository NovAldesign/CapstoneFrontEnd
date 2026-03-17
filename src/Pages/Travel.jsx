import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Travel.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UPCOMING_TRIPS = [
  'Virgin Voyages Group Cruise',
  'Atlanta Weekend Retreat',
  'International Trip (TBD)',
  'Resort Buyout Weekend',
];

const FUTURE_TRIPS = [
  {
    destination: 'Caribbean',
    description:
      'Our first group cruise aboard Virgin Voyages — adults only, alcohol-free by choice, 30–40 of your favorite people on the water.',
    status: 'Booking Now',
    statusType: 'active',
    icon: '&#9632;',
  },
  {
    destination: 'Weekend Retreat',
    description:
      'A curated 2-night Georgia retreat. Private venue, group activities, intentional conversations, and no agenda other than rest and connection.',
    status: 'Coming Soon',
    statusType: 'soon',
    icon: '&#9632;',
  },
  {
    destination: 'International',
    description:
      'Destination TBD by the community. Members vote, we plan, we go. The first international GFC trip is already in discussion.',
    status: 'In Planning',
    statusType: 'planning',
    icon: '&#9632;',
  },
  {
    destination: 'Resort Buyout',
    description:
      'A full resort weekend, GFC-style. Private pool, group dinners, game tournaments, and the kind of energy that only happens when the whole property is yours.',
    status: 'Interest Phase',
    statusType: 'interest',
    icon: '&#9632;',
  },
];

const WHY_ITEMS = [
  {
    heading: 'No Strangers',
    body:
      "When you travel with GFC, you already know these people. You've played spades with them, shared a dinner table, laughed together on a Saturday night. The trip is just the backdrop.",
  },
  {
    heading: 'Intentionally Curated',
    body:
      'We handle every detail — hotel blocks, transfers, group activities, mocktail menus, and onboard game nights. You show up. We handle the rest.',
  },
  {
    heading: 'Alcohol-Free by Default',
    body:
      'GFC group events on every trip are alcohol-free. What the venues serve is outside our control — but our group gatherings are always clear-headed and fully present.',
  },
  {
    heading: 'Small Groups Only',
    body:
      "We cap group travel the same way we cap our events. Never a tour bus full of strangers. Always an intimate group of people who've chosen to be there.",
  },
];

const Travel = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interestedTrips: [],
    groupSize: '',
    budgetRange: '',
    isMember: false,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (feedback) setFeedback(null);
  };

  const handleTripCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      interestedTrips: checked
        ? [...prev.interestedTrips, value]
        : prev.interestedTrips.filter((t) => t !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await axios.post(`${API}/api/travel/interest`, formData);
      setFeedback({
        type: 'success',
        message: "You're on the list. We'll reach out with details as soon as they're confirmed.",
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        interestedTrips: [],
        groupSize: '',
        budgetRange: '',
        isMember: false,
        notes: '',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.error ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="travel-page">

      {/* =============================================
          HERO
         ============================================= */}
      <header className="travel-hero">
        <div className="travel-hero-inner">
          <span className="travel-eyebrow">The Collective Goes Places</span>
          <h1 className="playfair travel-hero-title">
            Travel With<br />People You<br />Already Trust.
          </h1>
          <div className="travel-gold-rule"></div>
          <p className="travel-hero-lead">
            GFC isn't just a Saturday night. It's a lifestyle. Curated group
            travel experiences designed for the same accomplished, intentional
            adults who fill our rooms every weekend.
          </p>
          <a href="#travel-interest" className="travel-hero-cta">
            Join the Interest List
          </a>
        </div>
      </header>

      {/* =============================================
          WHY TRAVEL WITH GFC
         ============================================= */}
      <section className="travel-why-section">
        <div className="travel-why-inner">
          <span className="travel-section-eyebrow">Why Travel With Us</span>
          <h2 className="playfair travel-section-title">
            Not a Tour Group.<br />A Community in Motion.
          </h2>

          <div className="travel-why-grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.heading} className="travel-why-card">
                <div className="travel-why-diamond"></div>
                <h3 className="travel-why-heading">{item.heading}</h3>
                <p className="travel-why-body">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURED TRIP — VIRGIN VOYAGES
         ============================================= */}
      <section className="travel-featured-section">
        <div className="travel-featured-inner">

          <div className="travel-featured-content">
            <span className="travel-section-eyebrow light">Featured Trip</span>
            <div className="travel-featured-status">Booking Now</div>
            <h2 className="playfair travel-section-title light">
              Our First Voyage.
            </h2>
            <p className="travel-featured-lead">
              GFC is planning its first group cruise aboard Virgin Voyages —
              the adults-only, award-winning cruise line built for exactly the
              kind of people who come to our events.
            </p>
            <p className="travel-featured-body">
              No kids. No formal dining dress codes. A ship designed for
              adults who want to actually enjoy themselves. 30–40 of the
              GFC community, together on the water.
            </p>

            <div className="travel-featured-includes">
              <div className="travel-includes-label">What's Included</div>
              <ul className="travel-includes-list">
                <li>Pre-cruise hotel block the night before departure</li>
                <li>Welcome mocktail mixer — meet your fellow travelers</li>
                <li>Charter bus from hotel to terminal and back</li>
                <li>Curated group activities and game night onboard</li>
                <li>Group dinner reservation coordinated by GFC</li>
                <li>Dedicated GFC coordinator throughout the trip</li>
              </ul>
            </div>

            <div className="travel-featured-details">
              <div className="travel-detail-item">
                <span className="travel-detail-label">Destination</span>
                <span className="travel-detail-value">Caribbean — TBD</span>
              </div>
              <div className="travel-detail-item">
                <span className="travel-detail-label">Dates</span>
                <span className="travel-detail-value">2026 — Announcing Soon</span>
              </div>
              <div className="travel-detail-item">
                <span className="travel-detail-label">Group Size</span>
                <span className="travel-detail-value">30–40 guests</span>
              </div>
              <div className="travel-detail-item">
                <span className="travel-detail-label">Cruise Line</span>
                <span className="travel-detail-value">Virgin Voyages</span>
              </div>
            </div>

            <a href="#travel-interest" className="travel-featured-cta">
              Add Me to the Interest List
            </a>
          </div>

          <div className="travel-featured-image">
            <img
              src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=900"
              alt="Virgin Voyages cruise ship"
            />
            <div className="travel-featured-image-caption">
              Virgin Voyages · Adults Only · Award Winning
            </div>
          </div>

        </div>
      </section>

      {/* =============================================
          FUTURE TRIPS
         ============================================= */}
      <section className="travel-future-section">
        <div className="travel-future-inner">
          <span className="travel-section-eyebrow">Where We're Going</span>
          <h2 className="playfair travel-section-title">
            The GFC Travel Calendar.
          </h2>
          <p className="travel-future-subhead">
            Members vote on destinations. We plan the experience.
            Everyone goes together.
          </p>

          <div className="travel-future-grid">
            {FUTURE_TRIPS.map((trip) => (
              <div key={trip.destination} className="travel-future-card">
                <div className={`travel-future-status travel-status-${trip.statusType}`}>
                  {trip.status}
                </div>
                <h3 className="playfair travel-future-destination">
                  {trip.destination}
                </h3>
                <p className="travel-future-desc">{trip.description}</p>
              </div>
            ))}
          </div>

          <div className="travel-future-note">
            <p>
              <strong>Members get first access and exclusive pricing</strong> on
              every GFC trip — before the interest list opens to the public.{' '}
              <Link to="/membership" className="travel-inline-link">
                Become a member
              </Link>{' '}
              to secure your spot at the front of the line.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          INTEREST LIST FORM
         ============================================= */}
      <section className="travel-interest-section" id="travel-interest">
        <div className="travel-interest-inner">

          <div className="travel-interest-header">
            <span className="travel-section-eyebrow light">Join the List</span>
            <h2 className="playfair travel-section-title light">
              Reserve Your Spot<br />Before It's Announced.
            </h2>
            <p className="travel-interest-subhead">
              Trips fill up fast. Get on the interest list now and you'll
              hear about dates, pricing, and availability before anyone else.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="travel-interest-form"
            noValidate
          >
            <div className="travel-form-divider">Your Information</div>
            <div className="travel-form-row">
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="firstName">
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
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="lastName">
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

            <div className="travel-form-row">
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="email">
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
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="phone">
                  Phone{' '}
                  <span className="travel-label-optional">(optional)</span>
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

            <div className="travel-form-divider">Trip Preferences</div>

            <div className="travel-input-group">
              <label className="travel-label">
                Which trips are you interested in?
              </label>
              <div className="travel-checkbox-grid">
                {UPCOMING_TRIPS.map((trip) => (
                  <label key={trip} className="travel-checkbox-label">
                    <input
                      type="checkbox"
                      value={trip}
                      checked={formData.interestedTrips.includes(trip)}
                      onChange={handleTripCheckbox}
                      className="travel-checkbox"
                    />
                    <span>{trip}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="travel-form-row">
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="groupSize">
                  How many are traveling?
                </label>
                <select
                  id="groupSize"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Just me">Just me</option>
                  <option value="Me + 1">Me + 1</option>
                  <option value="Me + 2 or more">Me + 2 or more</option>
                </select>
              </div>
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="budgetRange">
                  Approximate budget per person
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                >
                  <option value="">Select range...</option>
                  <option value="Under $1,500">Under $1,500</option>
                  <option value="$1,500 - $2,500">$1,500 – $2,500</option>
                  <option value="$2,500 - $4,000">$2,500 – $4,000</option>
                  <option value="$4,000 - $6,000">$4,000 – $6,000</option>
                  <option value="$6,000+">$6,000+</option>
                  <option value="Flexible">Flexible — just tell me the details</option>
                </select>
              </div>
            </div>

            <div className="travel-input-group">
              <label className="travel-label" htmlFor="notes">
                Anything else we should know?{' '}
                <span className="travel-label-optional">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                className="travel-textarea"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Special requests, travel concerns, questions..."
              />
            </div>

            <div className="travel-member-row">
              <input
                type="checkbox"
                id="isMember"
                name="isMember"
                checked={formData.isMember}
                onChange={handleChange}
                className="travel-checkbox-single"
              />
              <label htmlFor="isMember" className="travel-member-label">
                I am a current GFC member
              </label>
            </div>

            {feedback && (
              <div className={`travel-feedback ${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="travel-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding You to the List...' : "I'm Interested — Add Me to the List"}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
};

export default Travel;
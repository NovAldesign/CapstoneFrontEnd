import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import '../Styles/Travel.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UPCOMING_TRIPS = [
  'Virgin Voyages Group Cruise',
  'Atlanta Weekend Retreat',
  'International Escape (TBD)',
  'Resort Buyout Weekend',
];

const FUTURE_TRIPS = [
  {
    destination: 'The Caribbean',
    description:
      'Our first group cruise aboard Virgin Voyages — adults-only, alcohol-free by choice, and 30–40 of your favorite people on the water.',
    status: 'Booking Now',
    statusType: 'active',
  },
  {
    destination: 'Weekend Retreat',
    description:
      'A curated 2-night Georgia getaway. Private venue, group activities, intentional conversations, and no agenda other than rest.',
    status: 'Coming Soon',
    statusType: 'soon',
  },
  {
    destination: 'International',
    description:
      'Destination TBD by the community. Members vote, we plan, we go. The first international GFC trip is currently in discussion.',
    status: 'In Planning',
    statusType: 'planning',
  },
  {
    destination: 'Resort Buyout',
    description:
      'A full resort weekend, GFC-style. Private pool, group dinners, game tournaments, and the energy of a house party on a massive scale.',
    status: 'Interest Phase',
    statusType: 'interest',
  },
];

const WHY_ITEMS = [
  {
    heading: 'No Strangers',
    body:
      "When you travel with GFC, you already know the group. You've shared a dinner table or a game night in Atlanta—the trip is just a bigger stage for those connections.",
  },
  {
    heading: 'Intentionally Curated',
    body:
      'We handle the hotel blocks, transfers, and group activities. You show up, unpack, and enjoy. We handle the logistics so you can handle the fun.',
  },
  {
    heading: 'Clear-Headed Connection',
    body:
      'GFC group events are always alcohol-free. We stay fully present for the memories, the laughs, and the views, ensuring everyone feels included.',
  },
  {
    heading: 'Small Groups Only',
    body:
      "We cap our travel groups to keep things intimate. No tour buses full of strangers—just a curated circle of accomplished, intentional adults.",
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
        message: "You're on the list! We'll reach out as soon as the itinerary is ready.",
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
        message: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="travel-page">
      <Helmet>
        <title>Group Travel | Grown Folks Collective</title>
        <meta 
          name="description" 
          content="Experience curated, alcohol-free group travel with the Grown Folks Collective. Join us for Caribbean cruises, retreats, and international escapes." 
        />
      </Helmet>

      {/* HERO */}
      <header className="travel-hero">
        <div className="travel-hero-inner">
          <span className="travel-eyebrow">The Collective Goes Places</span>
          <h1 className="playfair travel-hero-title">
            Travel With<br />People You<br />Actually Trust.
          </h1>
          <div className="travel-gold-rule"></div>
          <p className="travel-hero-lead">
            GFC isn’t just a Saturday night. It’s a lifestyle. Curated group 
            travel experiences designed for the same intentional adults who fill our rooms every month.
          </p>
          <a href="#travel-interest" className="travel-hero-cta">
            Join the Interest List
          </a>
        </div>
      </header>

      {/* WHY TRAVEL */}
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

      {/* FEATURED TRIP */}
      <section className="travel-featured-section">
        <div className="travel-featured-inner">
          <div className="travel-featured-content">
            <span className="travel-section-eyebrow light">Featured Trip</span>
            <div className="travel-featured-status">Booking Now</div>
            <h2 className="playfair travel-section-title light">
              The First Voyage.
            </h2>
            <p className="travel-featured-lead">
              We’re taking over a block of cabins on Virgin Voyages. Adults-only, 
              award-winning, and designed for people who want to actually enjoy their vacation.
            </p>
            <div className="travel-featured-includes">
              <div className="travel-includes-label">What’s Included</div>
              <ul className="travel-includes-list">
                <li>Pre-cruise hotel block for a "night before" mixer</li>
                <li>GFC Welcome Mocktail reception</li>
                <li>Curated group activities and game nights onboard</li>
                <li>Group dinner reservations coordinated by us</li>
                <li>Chartered transport to and from the terminal</li>
              </ul>
            </div>
            <div className="travel-featured-details">
              <div className="travel-detail-item">
                <span className="travel-detail-label">Destination</span>
                <span className="travel-detail-value">Caribbean — TBD</span>
              </div>
              <div className="travel-detail-item">
                <span className="travel-detail-label">Vibe</span>
                <span className="travel-detail-value">Luxury & Connection</span>
              </div>
            </div>
            <a href="#travel-interest" className="travel-featured-cta">
              Get Details & Pricing
            </a>
          </div>
          <div className="travel-featured-image">
            <img
              src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=900"
              alt="Luxury cruise ship view"
            />
          </div>
        </div>
      </section>

      {/* INTEREST FORM */}
      <section className="travel-interest-section" id="travel-interest">
        <div className="travel-interest-inner">
          <div className="travel-interest-header">
            <h2 className="playfair travel-section-title light">Join the Interest List</h2>
            <p className="travel-interest-subhead">
              Trips fill up fast within our community. Join the list to get first access to dates and pricing.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="travel-interest-form" noValidate>
            <div className="travel-form-row">
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="travel-input-group">
                <label className="travel-label" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="travel-input-group">
              <label className="travel-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="travel-input-group">
              <label className="travel-label">Which trips interest you?</label>
              <div className="travel-checkbox-grid">
                {UPCOMING_TRIPS.map((trip) => (
                  <label key={trip} className="travel-checkbox-label">
                    <input
                      type="checkbox"
                      value={trip}
                      checked={formData.interestedTrips.includes(trip)}
                      onChange={handleTripCheckbox}
                    />
                    <span>{trip}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="travel-member-row">
              <input
                type="checkbox"
                id="isMember"
                name="isMember"
                checked={formData.isMember}
                onChange={handleChange}
              />
              <label htmlFor="isMember" className="travel-member-label">I am a current GFC member</label>
            </div>
            {feedback && <div className={`travel-feedback ${feedback.type}`}>{feedback.message}</div>}
            <button type="submit" className="travel-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding You...' : "Add Me to the List"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Travel;
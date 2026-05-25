import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../Styles/Partnership.css";
import partnershipService from "../Services/partnershipService.js";

const tiers = [
  {
    id: "bronze",
    label: "Bronze",
    price: "$150 / event",
    description: "Get your name in the room. Perfect for testing the waters.",
    features: [
      "Logo & brand mention during the selected event",
      "Mentioned in event-specific social preview posts",
      "Tagged in the event recap video",
      "Newsletter mention in the post-event wrap-up",
    ],
  },
  {
    id: "silver",
    label: "Silver",
    price: "$500 / event",
    featured: true,
    description: "Show up, stand out, and engage directly with attendees.",
    features: [
      "Everything in Bronze",
      "Dedicated table presence at the event venue",
      "Physical signage placed at the venue",
      "Product sampling (you provide, we handle logistics)",
      "Dedicated social feature highlighting your brand before the event",
      "Newsletter spotlight feature in that event cycle",
    ],
  },
  {
    id: "gold",
    label: "Gold",
    price: "$1,200 / event",
    elite: true,
    description: "Full-on brand integration and exclusive category presence.",
    features: [
      "Everything in Silver",
      "Branded standalone activation space at the event",
      "Custom high-quality b-roll content from the venue",
      "Short video interview feature integrated into event recap content",
      "100% industry category exclusivity for that specific event",
      "Priority consideration for a permanent/multi-event partnership",
    ],
  },
];

const eventOptions = [
  "Intentional Dinners",
  "Golf Simulations",
  "Luxury Bingo",
  "Game Nights / Spades",
  "Group Travel / Retreats",
  "Social Mixers",
];

const defaultForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  tierRequested: "",
  eventsInterested: [],
  hostingInterest: "",
  details: "",
  status: "pending",
};

const Partnership = () => {
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (feedback) setFeedback(null);
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      eventsInterested: checked
        ? [...prev.eventsInterested, value]
        : prev.eventsInterested.filter((v) => v !== value),
    }));
  };

  const handleTierSelect = (tierId) => {
    setFormData((prev) => ({ ...prev, tierRequested: tierId }));
    document.getElementById("partner-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    try {
      await partnershipService.createInquiry(formData);
      setFeedback({ type: "success", message: "We received your inquiry. Expect to hear from us within 48 hours." });
      setFormData(defaultForm);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong. Please try again.";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="partnership-page">
      <Helmet>
        <title>Partner With Us | Grown Folks Collective</title>
      </Helmet>

      {/* HERO */}
      <header className="partner-hero">
        <div className="partner-hero-inner">
          <span className="partner-eyebrow">Atlanta &amp; Surrounding Cities</span>
          <h1 className="partner-hero-title">Partner With<br />the Collective</h1>
          <div className="partner-gold-rule"></div>
          <p className="partner-hero-sub">
            We bring together adults 35+ who are intentional about how they spend their time, energy, and money.
            <br />Partner with us for a single event to see the alignment firsthand, and let's build from there.
          </p>
        </div>
      </header>

      {/* WHO WE ARE */}
      <section className="partner-audience">
        <div className="partner-audience-inner">
          <div className="partner-stat-card">
            <div className="partner-stat-num">35+</div>
            <div className="partner-stat-label">Core demographic age</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-num">$80K+</div>
            <div className="partner-stat-label">Avg. household income</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-num">100%</div>
            <div className="partner-stat-label">Alcohol-free programming</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-num">ATL</div>
            <div className="partner-stat-label">Based &amp; rooted locally</div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="partner-what-section">
        <div className="partner-section-inner">
          <span className="partner-eyebrow">The Approach</span>
          <h2 className="partner-section-heading">Test the Fit. Build the Bridge.</h2>
          <div className="partner-offer-grid">
            <div className="partner-offer-card">
              <div className="partner-offer-icon">◈</div>
              <h3>Per-Event Sponsorship</h3>
              <p>No long contracts right away. Sponsor an individual event—whether a dinner, mixer, or retreat—and see how our crowd connects with your product.</p>
            </div>
            <div className="partner-offer-card">
              <div className="partner-offer-icon">◈</div>
              <h3>Collaborative Review</h3>
              <p>After the event, we look at the traction, engagement, and data together. If it feels seamless, we can map out a permanent arrangement.</p>
            </div>
            <div className="partner-offer-card">
              <div className="partner-offer-icon">◈</div>
              <h3>Authentic Alignment</h3>
              <p>We only work with brands that match our community's values. That high bar is exactly why our collective trusts what our partners put in front of them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="partner-tiers-section">
        <div className="partner-section-inner">
          <span className="partner-eyebrow">Partnership Levels</span>
          <h2 className="partner-section-heading">Find Your Level</h2>
          <div className="partner-tier-row">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`partner-tier-card${tier.featured ? " partner-tier-featured" : ""}${tier.elite ? " partner-tier-elite" : ""}`}
              >
                {tier.featured && <div className="partner-tier-badge">Most Popular</div>}
                {tier.elite && <div className="partner-tier-badge partner-tier-badge-elite">Premium</div>}
                <div className="partner-tier-label">{tier.label}</div>
                <div className="partner-tier-price">{tier.price}</div>
                <div className="partner-tier-desc">{tier.description}</div>
                <ul className="partner-tier-features">
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  className="partner-tier-btn"
                  onClick={() => handleTierSelect(tier.label)}
                  type="button"
                >
                  {tier.elite ? "Inquire" : tier.featured ? "Select" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="partner-form-section" id="partner-form">
        <div className="partner-form-inner">
          <span className="partner-eyebrow">Get Started</span>
          <h2 className="partner-section-heading">Let's Connect</h2>
          <p className="partner-form-sub">Tell us a bit about your brand. We'll find the right event format to pilot our partnership and follow up within 48 hours.</p>

          <form onSubmit={handleSubmit} className="partner-form">

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="companyName">Company / Brand Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Acme Co."
                />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="contactPerson">Your Name</label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  placeholder="First &amp; Last"
                />
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(404) 000-0000"
                />
              </div>
            </div>

            <div className="partner-input-group">
              <label className="partner-label" htmlFor="tierRequested">Partnership Level Requested</label>
              <select
                id="tierRequested"
                name="tierRequested"
                value={formData.tierRequested}
                onChange={handleChange}
                className="partner-select"
              >
                <option value="">Select a level...</option>
                {tiers.map((t) => (
                  <option key={t.id} value={t.label}>{t.label} — {t.price}</option>
                ))}
                <option value="Not sure">Not sure yet / Want to customize</option>
              </select>
            </div>

            <div className="partner-input-group">
              <label className="partner-label">Events You're Interested In Auditioning</label>
              <div className="partner-checkbox-grid">
                {eventOptions.map((event) => (
                  <label key={event} className="partner-checkbox-label">
                    <input
                      type="checkbox"
                      value={event}
                      checked={formData.eventsInterested.includes(event)}
                      onChange={handleCheckbox}
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="partner-input-group">
              <label className="partner-label" htmlFor="hostingInterest">Interested in hosting or co-creating an experience?</label>
              <select
                id="hostingInterest"
                name="hostingInterest"
                value={formData.hostingInterest}
                onChange={handleChange}
                className="partner-select"
              >
                <option value="">Select...</option>
                <option value="Yes - Pilot first event">Yes — Let's pitch a custom concept for our initial pilot event</option>
                <option value="Maybe">Maybe — Tell me more about co-branded experiences</option>
                <option value="No">No — Standard brand placement / space sponsorship only</option>
              </select>
            </div>

            <div className="partner-input-group">
              <label className="partner-label" htmlFor="details">Anything else we should know about your brand timeline?</label>
              <textarea
                id="details"
                name="details"
                className="partner-textarea"
                value={formData.details}
                placeholder="Tell us about your brand positioning, what target products you want to feature during this event, or details about your permanent timeline goals..."
                onChange={handleChange}
                rows={5}
              />
            </div>

            {feedback && (
              <div className={`partner-feedback partner-feedback--${feedback.type}`}>
                {feedback.message}
              </div>
            )}

            <button type="submit" className="partner-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Partnership Inquiry"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Partnership;
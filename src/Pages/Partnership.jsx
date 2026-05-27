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
  "Intentional Conversations Over Dinner / Mocktails",
  "Golf Simulations / Bowling",
  "R&B Bingo",
  "Game Nights / Spades Tournament",
  "Group Travel / Retreats",
  "Cookout / Field Day",
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

      {/* HERO & NARRATIVE */}
      <header className="partner-hero">
        <div className="mission-narrative">
          <span className="location-tag">Atlanta &amp; Surrounding Cities</span>
          <h1 className="playfair luxe-title">Partner With<br />the Collective</h1>
          <div className="gold-spacer-bar"></div>
          <p className="narrative-lead">
            We bring together adults 35+ who are intentional about how they spend their time, energy, and money.
          </p>
          <p className="narrative-body">
            Partner with us for a single event to see the alignment firsthand, and let's build from there. Our curated environment removes traditional corporate noise, letting your brand make lasting, high-level connections.
          </p>
        </div>
      </header>

      {/* STATS SECTION */}
      <section className="impact-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h4 className="playfair">35+</h4>
            <p>Core demographic age</p>
          </div>
          <div className="stat-card">
            <h4 className="playfair">$80K+</h4>
            <p>Avg. household income</p>
          </div>
          <div className="stat-card">
            <h4 className="playfair">100%</h4>
            <p>Alcohol-free programming</p>
          </div>
          <div className="stat-card">
            <h4 className="playfair">ATL</h4>
            <p>Based &amp; rooted locally</p>
          </div>
        </div>
      </section>

      {/* TIERS SHOWCASE */}
      <section className="tier-showcase">
        <span className="location-tag">Partnership Levels</span>
        <h2 className="playfair section-title">Find Your Level</h2>
        
        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className="tier-item">
              <span className="tier-label">{tier.label}</span>
              <h3 className="playfair">{tier.price}</h3>
              <p className="narrative-body" style={{ minHeight: "60px", fontSize: "0.95rem" }}>
                {tier.description}
              </p>
              <div className="gold-spacer-bar" style={{ margin: "20px 0", width: "40px" }}></div>
              <ul className="partner-tier-features" style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", flex: 1 }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{ fontSize: "0.85rem", padding: "8px 0", borderBottom: "1px solid #eee", color: "#666" }}>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="gold-submit-btn"
                style={{ width: "100%", marginTop: "auto", padding: "15px", fontSize: "0.75rem" }}
                onClick={() => handleTierSelect(tier.label)}
                type="button"
              >
                {tier.elite ? "Inquire" : tier.featured ? "Select" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="proposal-container" id="partner-form">
        <span className="form-intro">Get Started</span>
        <h2 className="playfair narrative-lead" style={{ marginTop: "10px" }}>Let's Connect</h2>
        <p className="narrative-body" style={{ textAlign: "center", marginBottom: "40px" }}>
          Tell us a bit about your brand. We'll find the right event format to pilot our partnership and follow up within 48 hours.
        </p>

        <form onSubmit={handleSubmit} className="luxe-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="companyName">Company / Brand Name</label>
              <input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Herndon Spritz & Co."
              />
            </div>
            <div className="input-group">
              <label htmlFor="contactPerson">Your Name</label>
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

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="email">Email</label>
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
            <div className="input-group">
              <label htmlFor="phone">Phone (optional)</label>
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

          <div className="input-group">
            <label htmlFor="tierRequested">Partnership Level Requested</label>
            <select
              id="tierRequested"
              name="tierRequested"
              value={formData.tierRequested}
              onChange={handleChange}
              style={{ background: "transparent", color: "var(--navy)" }}
            >
              <option value="">Select a level...</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.label}>{t.label} — {t.price}</option>
              ))}
              <option value="Not sure">Not sure yet / Want to customize</option>
            </select>
          </div>

          <div className="input-group">
            <label style={{ marginBottom: "15px" }}>Sponsorship Opportunities</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              padding: "20px",
              background: "#fcfbfa",
              border: "1px solid #eee"
            }}>
              {eventOptions.map((event) => (
                <label key={event} style={{ display: "flex", alignItems: "right", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    value={event}
                    checked={formData.eventsInterested.includes(event)}
                    onChange={handleCheckbox}
                    style={{ accentColor: "var(--gold)" }}
                  />
                  <span>{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="hostingInterest">Interested in hosting or co-creating an experience?</label>
            <select
              id="hostingInterest"
              name="hostingInterest"
              value={formData.hostingInterest}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Yes - Pilot first event">Yes — Let's pitch a custom concept for our initial pilot event</option>
              <option value="Maybe">Maybe — Tell me more about co-branded experiences</option>
              <option value="No">No — Standard brand placement / space sponsorship only</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="details">Anything else we should know about your brand timeline?</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              placeholder="Tell us about your brand positioning, what target products you want to feature during this event..."
              onChange={handleChange}
              rows={5}
            />
          </div>

          {feedback && (
            <div style={{
              padding: "15px",
              textAlign: "center",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: feedback.type === "success" ? "var(--gold)" : "#d9534f",
              background: feedback.type === "success" ? "#fbf9f5" : "#fdf2f2",
              border: `1px solid ${feedback.type === "success" ? "var(--gold)" : "#d9534f"}`
            }}>
              {feedback.message}
            </div>
          )}

          <button type="submit" className="gold-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Partnership Inquiry"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Partnership;
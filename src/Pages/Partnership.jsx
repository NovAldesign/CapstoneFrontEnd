import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../Styles/Partnership.css";
import partnershipService from "../Services/partnershipService.js";

const Partnership = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    tierRequested: "Collective",
    contributionType: "Financial",
    contractStart: "",
    contractEnd: "",
    details: "",
    hearAboutUs: "",
    monthlyBudget: "",
    eventsInterested: [],
    hasSocialFollowing: "",
    preferredContact: "Email",
    hostingInterest: "",
    status: "pending",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    setIsSubmitting(true);

    try {
      await partnershipService.createInquiry(formData);
      setFeedback({
        type: "success",
        message: "Strategic proposal submitted. Thank you for joining the mission.",
      });

      setFormData({
        companyName: "",
        industry: "",
        contactPerson: "",
        email: "",
        phone: "",
        password: "",
        tierRequested: "Collective",
        contributionType: "Financial",
        contractStart: "",
        contractEnd: "",
        details: "",
        hearAboutUs: "",
        monthlyBudget: "",
        eventsInterested: [],
        hasSocialFollowing: "",
        preferredContact: "Email",
        hostingInterest: "",
        status: "pending",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Submission failed. Please check your connection and password strength.";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventOptions = [
    "Intentional Dinners",
    "Golf Simulations",
    "Luxury Bingo",
    "Game Nights / Spades",
    "Group Travel / Retreats",
    "Social Mixers",
  ];

  const TIER_OPTIONS = [
    "Elite Title Sponsor",
    "Collective Partner",
    "Community Supporter",
    "Experience Partner (In-Kind)",
    "Digital Ally",
    "Venue Partner"
  ];

  return (
    <div className="partnership-page">
      <Helmet>
        <title>Strategic Partnerships | Grown Folks Collective</title>
        <meta 
          name="description" 
          content="Partner with Atlanta's premier community for intentional 35+ professionals. Exclusive title sponsorships and experience activations available." 
        />
      </Helmet>

      {/* HERO */}
      <header className="partner-hero">
        <div className="partner-hero-inner">
          <span className="partner-location-tag">Atlanta & Surrounding Cities</span>
          <h1 className="playfair partner-luxe-title">
            Strategic<br />Alignment
          </h1>
          <div className="partner-gold-spacer"></div>
          <div className="partner-mission-narrative">
            <p className="partner-narrative-lead">
              For the 35+ professional, success often comes at a silent cost: <strong>Social Isolation.</strong>
            </p>
            <p className="partner-narrative-body">
              Atlanta's seasoned entrepreneurs are seeking true community. Partnership with the Collective is an active investment in <strong>Social Wellness.</strong>
            </p>
          </div>
        </div>
      </header>

      {/* IMPACT STATS */}
      <section className="partner-impact-stats">
        <div className="partner-stats-grid">
          <div className="partner-stat-card">
            <div className="partner-stat-number">35+</div>
            <div className="partner-stat-label">Core Demographic Age</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">$80K+</div>
            <div className="partner-stat-label">Avg. Household Income</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">250%+</div>
            <div className="partner-stat-label">Documented Venue Sales Lift</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">0%</div>
            <div className="partner-stat-label">Alcohol-Free Programming</div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="partner-tiers-section">
        <div className="partner-tiers-inner">
          <span className="partner-tiers-eyebrow">Opportunities</span>
          <h2 className="playfair partner-tiers-heading">Choose Your Level of Impact</h2>
          
          <div className="partner-tier-grid">
            {/* Digital Ally */}
            <div className="partner-tier-card">
              <div className="partner-tier-label">Digital Ally</div>
              <div className="partner-tier-price">$75</div>
              <div className="partner-tier-price-note">per month</div>
              <div className="partner-tier-best">Ideal for digital creators & service providers</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>Directory listing on website</li>
                <li>Monthly Spotlight in email</li>
                <li>Digital event program credit</li>
                <li>Partner network access</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Select Tier</a>
            </div>

            {/* Community */}
            <div className="partner-tier-card">
              <div className="partner-tier-label">Community</div>
              <div className="partner-tier-price">$300–$500</div>
              <div className="partner-tier-price-note">per event</div>
              <div className="partner-tier-best">Ideal for local boutiques & small biz</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>Logo on event signage</li>
                <li>1 Social media mention</li>
                <li>Marketing materials at table</li>
                <li>Verbal recognition by host</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Select Tier</a>
            </div>

            {/* Collective */}
            <div className="partner-tier-card partner-tier-featured">
              <div className="partner-tier-badge">Recommended</div>
              <div className="partner-tier-label">Collective</div>
              <div className="partner-tier-price">$750–$1,000</div>
              <div className="partner-tier-price-note">per event</div>
              <div className="partner-tier-best">Best for health & financial brands</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>Branded activation space</li>
                <li>3 social content pieces</li>
                <li>Product sampling opportunity</li>
                <li>Attendee email recap feature</li>
                <li>2 Guest passes included</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Select Tier</a>
            </div>

            {/* Experience Partner */}
            <div className="partner-tier-card">
              <div className="partner-tier-label">Experience</div>
              <div className="partner-tier-price">Product + Fee</div>
              <div className="partner-tier-price-note">In-Kind Activation</div>
              <div className="partner-tier-best">For beverage & wellness brands (e.g. Poppi)</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>Dedicated product station</li>
                <li>High-end aesthetic b-roll creation</li>
                <li>"Hand-to-hand" marketing</li>
                <li>Brand mention in Newsletter</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Inquire Now</a>
            </div>

            {/* Elite Title Sponsor */}
            <div className="partner-tier-card partner-tier-elite">
              <div className="partner-tier-badge">Exclusive</div>
              <div className="partner-tier-label">Elite Title</div>
              <div className="partner-tier-price">$2,000+</div>
              <div className="partner-tier-price-note">per event</div>
              <div className="partner-tier-best">For firms seeking maximum authority</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li><strong>Full Video Interview Feature</strong></li>
                <li>3-Minute Event Opening Remarks</li>
                <li>Industry Category Lockout</li>
                <li>"Presented By" title branding</li>
                <li>4 VIP guest passes</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Secure Exclusivity</a>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="partner-form-section" id="partner-form">
        <div className="partner-proposal-container">
          <h2 className="playfair partner-form-heading">Initiate Proposal</h2>
          <p className="partner-form-intro">Define your alignment and create your partner portal account.</p>

          <form onSubmit={handleSubmit} className="partner-luxe-form">
            <div className="partner-form-divider">Company Details</div>
            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label">Company Name</label>
                <input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="partner-input-group">
                <label className="partner-label">Industry</label>
                <input name="industry" value={formData.industry} onChange={handleChange} required />
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label">Tier Requested</label>
                <select name="tierRequested" value={formData.tierRequested} onChange={handleChange} required>
                  {TIER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="partner-input-group">
                <label className="partner-label">Contact Person</label>
                <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label">Portal Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="partner-input-group">
                <label className="partner-label">Portal Password</label>
                <div className="partner-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="partner-input-group">
              <label className="partner-label">Experience Hosting Interest?</label>
              <select name="hostingInterest" value={formData.hostingInterest} onChange={handleChange}>
                <option value="">Select interest...</option>
                <option value="Yes - 3 months">Yes — 3 month commitment</option>
                <option value="Yes - 6 months">Yes — 6 month commitment</option>
                <option value="Maybe">Maybe — tell me more</option>
                <option value="No">No — sponsorship only</option>
              </select>
            </div>

            <div className="partner-input-group">
              <label className="partner-label">Primary Event Interests</label>
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
              <label className="partner-label">Alignment Details (Interview Goals / Activation Vision)</label>
              <textarea
                name="details"
                className="partner-textarea"
                value={formData.details}
                placeholder="Briefly describe your goals or what product you'd like to feature..."
                onChange={handleChange}
                required
              />
            </div>

            <div aria-live="polite">
                {feedback && <div className={`partner-feedback ${feedback.type}`}>{feedback.message}</div>}
            </div>

            <button type="submit" className="partner-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Strategic Proposal"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Partnership;
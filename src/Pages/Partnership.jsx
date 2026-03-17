import React, { useState } from "react";
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

    if (new Date(formData.contractEnd) <= new Date(formData.contractStart)) {
      setFeedback({
        type: "error",
        message: "Contract end date must be after the start date.",
      });
      return;
    }

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
        "Submission failed. Please check your password strength (8+ chars, uppercase, number, symbol).";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventOptions = [
    "Game Night",
    "Spades Tournament",
    "Luxury Bingo",
    "Intentional Conversations Over Dinner",
    "Group Travel",
    "Social Mixer",
  ];

  return (
    <div className="partnership-page">

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
              For the 35+ professional, success often comes at a silent cost:{" "}
              <strong>Social Isolation.</strong>
            </p>
            <p className="partner-narrative-body">
              Atlanta's seasoned entrepreneurs and professionals are experiencing
              a profound lack of true community. Partnership with the Collective
              is an active investment in <strong>Social Wellness.</strong>
            </p>
            <p className="partner-narrative-impact">
              By providing resources to host our alcohol-free sanctuaries, our
              partners help us turn "networking" back into{" "}
              <strong>belonging.</strong>
            </p>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="partner-impact-stats">
        <div className="partner-stats-grid">
          <div className="partner-stat-card">
            <div className="partner-stat-number">35+</div>
            <div className="partner-stat-label">High-earning demographic</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">$80K+</div>
            <div className="partner-stat-label">Annual household income</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">200%+</div>
            <div className="partner-stat-label">Venue sales lift, every event</div>
          </div>
          <div className="partner-stat-card">
            <div className="partner-stat-number">0%</div>
            <div className="partner-stat-label">Alcohol at any GFC event</div>
          </div>
        </div>
      </section>

      {/* SPONSORSHIP TIERS */}
      <section className="partner-tiers-section">
        <div className="partner-tiers-inner">
          <span className="partner-tiers-eyebrow">Partnership Opportunities</span>
          <h2 className="playfair partner-tiers-heading">Choose Your Level of Impact</h2>
          <p className="partner-tiers-subhead">
            Every tier puts your brand in front of 36 high-income Atlanta
            professionals per event — present, engaged, and spending. This is
            not advertising. This is community.
          </p>

          {/* FIXED: tier grid closes before the note */}
          <div className="partner-tier-grid">

            <div className="partner-tier-card">
              <div className="partner-tier-label">Community</div>
              <div className="partner-tier-price">$150–$300</div>
              <div className="partner-tier-price-note">per event</div>
              <div className="partner-tier-best">Best for local restaurants & boutiques</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>Logo on event signage and welcome table</li>
                <li>1 social media mention per event</li>
                <li>Business cards or flyers at the venue</li>
                <li>Verbal recognition by host</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Get Started</a>
            </div>

            <div className="partner-tier-card partner-tier-featured">
              <div className="partner-tier-badge">Most Popular</div>
              <div className="partner-tier-label">Collective</div>
              <div className="partner-tier-price">$500–$750</div>
              <div className="partner-tier-price-note">per event</div>
              <div className="partner-tier-best">Best for health, wellness & financial brands</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>All Community tier benefits</li>
                <li>Branded table or activation space at the event</li>
                <li>3 social content pieces per event (reel, story, post)</li>
                <li>Product sampling or swag distribution to guests</li>
                <li>Feature in post-event email recap</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Get Started</a>
            </div>

            <div className="partner-tier-card">
              <div className="partner-tier-label">Impact</div>
              <div className="partner-tier-price">$1,000–$2,500</div>
              <div className="partner-tier-price-note">per month</div>
              <div className="partner-tier-best">Best for corporate, credit unions & luxury brands</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>All Collective tier benefits</li>
                <li>"Presented by" naming rights for all events that month</li>
                <li>Speaking moment or branded game at each event</li>
                <li>Monthly impact report with attendance data</li>
                <li>First right of refusal each month</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Get Started</a>
            </div>

            <div className="partner-tier-card partner-tier-venue">
              <div className="partner-tier-label">Venue Partner</div>
              <div className="partner-tier-price">Free</div>
              <div className="partner-tier-price-note">in exchange for exposure</div>
              <div className="partner-tier-best">Best for restaurants, dealerships & hotels</div>
              <div className="partner-tier-divider"></div>
              <ul className="partner-tier-features">
                <li>GFC events hosted at your location monthly</li>
                <li>"Home of Grown Folks Collective" co-branding</li>
                <li>Monthly social content featuring your space</li>
                <li>200%+ documented sales lift every event night</li>
                <li>First-look access to attendee demographics</li>
                <li>Co-branded event series option</li>
              </ul>
              <a href="#partner-form" className="partner-tier-btn">Get Started</a>
            </div>

          </div>
          {/* END tier grid */}

          <div className="partner-tiers-note">
            <p>
              <strong>Our audience drives 30–60 miles on a Saturday night to be in the right room.</strong>{" "}
              That level of commitment means your brand is seen by people who are
              intentional, engaged, and loyal. The 200%+ venue sales lift is
              documented — not projected.
            </p>
          </div>

        </div>
      </section>

      {/* FORM */}
      <section className="partner-form-section" id="partner-form">
        <div className="partner-proposal-container">
          <h2 className="playfair partner-form-heading">Initiate Proposal</h2>
          <p className="partner-form-intro">
            Define the parameters of your alignment and create your partner portal account.
          </p>

          <form onSubmit={handleSubmit} className="partner-luxe-form" noValidate>

            {/* Company Information */}
            <div className="partner-form-divider">Company Information</div>
            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="companyName">Company Name</label>
                <input id="companyName" type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="industry">Industry</label>
                <input id="industry" type="text" name="industry" value={formData.industry} onChange={handleChange} required />
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="hearAboutUs">How did you hear about GFC?</label>
                <select id="hearAboutUs" name="hearAboutUs" value={formData.hearAboutUs} onChange={handleChange} required>
                  <option value="">Select one...</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Word of mouth">Word of mouth</option>
                  <option value="Google search">Google search</option>
                  <option value="Email">Email outreach</option>
                  <option value="Attended an event">Attended a GFC event</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="monthlyBudget">Estimated Monthly Budget</label>
                <select id="monthlyBudget" name="monthlyBudget" value={formData.monthlyBudget} onChange={handleChange} required>
                  <option value="">Select range...</option>
                  <option value="Under $300">Under $300</option>
                  <option value="$300-$750">$300 – $750</option>
                  <option value="$750-$1500">$750 – $1,500</option>
                  <option value="$1500-$2500">$1,500 – $2,500</option>
                  <option value="$2500+">$2,500+</option>
                  <option value="Venue only">Venue partnership only</option>
                </select>
              </div>
            </div>

            {/* Primary Contact & Security */}
            <div className="partner-form-divider">Primary Contact & Portal Security</div>
            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="contactPerson">Contact Person Name</label>
                <input id="contactPerson" type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="phone">Contact Phone</label>
                <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="email">Portal Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="password">Portal Password</label>
                <div className="partner-password-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    placeholder="8+ chars, uppercase, number, symbol"
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="partner-password-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="preferredContact">Preferred Contact Method</label>
                <select id="preferredContact" name="preferredContact" value={formData.preferredContact} onChange={handleChange}>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone call</option>
                  <option value="Video call">Video call</option>
                  <option value="Text">Text message</option>
                </select>
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="hasSocialFollowing">Do you have an existing audience or social following?</label>
                <select id="hasSocialFollowing" name="hasSocialFollowing" value={formData.hasSocialFollowing} onChange={handleChange} required>
                  <option value="">Select one...</option>
                  <option value="Yes - large (10k+)">Yes — large (10K+ followers)</option>
                  <option value="Yes - mid (1k-10k)">Yes — mid-size (1K–10K)</option>
                  <option value="Yes - small (under 1k)">Yes — growing (under 1K)</option>
                  <option value="No">No social presence yet</option>
                </select>
              </div>
            </div>

            {/* Partnership Logistics */}
            <div className="partner-form-divider">Partnership Logistics</div>
            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="tierRequested">Partnership Tier</label>
                <select id="tierRequested" name="tierRequested" value={formData.tierRequested} onChange={handleChange}>
                  <option value="Community">Community — $150–$300/event</option>
                  <option value="Collective">Collective — $500–$750/event</option>
                  <option value="Impact">Impact — $1,000–$2,500/month</option>
                  <option value="Venue Partner">Venue Partner — No fee</option>
                </select>
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="contributionType">Contribution Type</label>
                <select id="contributionType" name="contributionType" value={formData.contributionType} onChange={handleChange}>
                  <option value="Financial">Financial</option>
                  <option value="Venue">Venue</option>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>

            {/* Hosting Interest — full width */}
            <div className="partner-input-group">
              <label className="partner-label" htmlFor="hostingInterest">
                Would you like to be the Official Home of Grown Folks Collective?
              </label>
              <select id="hostingInterest" name="hostingInterest" value={formData.hostingInterest} onChange={handleChange}>
                <option value="">Select one...</option>
                <option value="Yes - 1 month">Yes — let's start with 1 month</option>
                <option value="Yes - 3 months">Yes — 3 month commitment</option>
                <option value="Yes - 6 months">Yes — 6 month commitment</option>
                <option value="Yes - 12 months">Yes — 12 month commitment</option>
                <option value="Maybe - tell me more">Maybe — I'd like to learn more first</option>
                <option value="No">Not at this time</option>
              </select>
            </div>

            {/* Events interested in */}
            <div className="partner-input-group">
              <label className="partner-label">Which GFC events are you most interested in sponsoring?</label>
              <div className="partner-checkbox-grid">
                {eventOptions.map((event) => (
                  <label key={event} className="partner-checkbox-label">
                    <input
                      type="checkbox"
                      value={event}
                      checked={formData.eventsInterested.includes(event)}
                      onChange={handleCheckbox}
                      className="partner-checkbox"
                    />
                    <span>{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="partner-form-row">
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="contractStart">Contract Start Date</label>
                <input id="contractStart" type="date" name="contractStart" value={formData.contractStart} onChange={handleChange} required />
              </div>
              <div className="partner-input-group">
                <label className="partner-label" htmlFor="contractEnd">Contract End Date</label>
                <input id="contractEnd" type="date" name="contractEnd" value={formData.contractEnd} onChange={handleChange} required />
              </div>
            </div>

            <div className="partner-input-group">
              <label className="partner-label" htmlFor="details">Alignment Details</label>
              <textarea
                id="details"
                name="details"
                className="partner-textarea"
                value={formData.details}
                placeholder="Briefly describe your goals for this alignment..."
                onChange={handleChange}
                required
              />
            </div>

            {feedback && (
              <div className={`partner-feedback ${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <button type="submit" className="partner-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Proposal..." : "Submit Strategic Proposal"}
            </button>

          </form>
        </div>
      </section>

    </div>
  );
};

export default Partnership;

import React, { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../Styles/Partnership.css";
import partnershipService from "../Services/partnershipService.js";
import { useSiteStats, plus } from "../Services/siteStats";
import VenuePartners from "../Components/VenuePartners.jsx";

const tiers = [
  {
    id: "friend",
    label: "Friend of GFC",
    price: "$150 / event",
    description: "Get your name in front of our community.",
    features: [
      "Shout-out on all our social media platforms",
      "Mention in our newsletter",
      "Your logo on our website as a sponsor",
    ],
  },
  {
    id: "featured",
    label: "Featured Partner",
    price: "$350 / event",
    featured: true,
    description: "Show up in the room and on every listing.",
    features: [
      "Everything in Friend of GFC",
      "Your logo on the event flyer",
      "Your logo on every platform we post the event on (Eventbrite, Meetup and more)",
      "A table or display at the event",
      "Product sampling or an item in our gift bags",
    ],
  },
  {
    id: "presenting",
    label: "Presenting Partner",
    price: "$750 / event",
    description: "Put your name on the night.",
    features: [
      "Everything in Featured Partner",
      "\u201c[Event] presented by [Your Brand]\u201d on the flyer, event page and every listing",
      "A 2-minute welcome from the mic",
      "The only brand in your category that night",
      "2 tickets to the event",
    ],
  },
  {
    id: "series",
    label: "Series Partner",
    price: "$1,800 / 3 events",
    priceNote: "or $3,000 for 6 events",
    elite: true,
    description: "Our best value: present a whole run of events.",
    features: [
      "Presenting Partner for every event in the series",
      "Your logo on every flyer for the run",
      "A Live on our social media featuring your brand (optional, great for smaller brands)",
      "Pick your series: Game Night, Karaoke Bingo, Acoustic & Infused™ or a Recess Talks™ season",
    ],
  },
];

// Sponsor one part of the night (one sponsor per moment, per event)
const ACOUSTIC = "Acoustic & Infused™ (Live Music Showcase)";
const moments = [
  {
    id: "stage",
    series: "Acoustic & Infused™",
    event: ACOUSTIC,
    label: "Stage Sponsor",
    price: "$375",
    covers: "Pays our 3 artists, our host and our live visual artist.",
    features: [
      "\u201cTonight's artists are paid thanks to [Your Brand]\u201d as the host introduces the performers",
      "Your logo on the event flyer and every platform we post the event on",
      "Shout-out on all our social media platforms",
      "Mention in our newsletter",
      "Your logo on our website as a sponsor",
    ],
  },
  {
    id: "toast",
    series: "Acoustic & Infused™",
    event: ACOUSTIC,
    label: "First Toast Sponsor",
    price: "$400",
    covers: "Treats the whole room to the first toast of the night.",
    features: [
      "The host leads the first toast, \u201cbrought to you by [Your Brand]\u201d",
      "A non-alcoholic drink brand can pour its own product for the toast",
      "Your logo on the event flyer and every platform we post the event on",
      "Shout-out on all our social media platforms and in our newsletter",
      "Your logo on our website as a sponsor",
    ],
  },
];
// Tells Google what sponsors can buy
const SPONSOR_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Event sponsorship with Grown Folks™ Collective",
  serviceType: "Event sponsorship",
  description:
    "Sponsor alcohol-free game nights, Karaoke Bingo and live music showcases for Atlanta adults 30+. Logo placement, social media shout-outs, newsletter mentions, on-site tables and presenting rights.",
  areaServed: { "@type": "City", name: "Atlanta, GA" },
  audience: { "@type": "PeopleAudience", suggestedMinAge: 30, geographicArea: { "@type": "City", name: "Atlanta" } },
  provider: { "@type": "Organization", name: "Grown Folks™ Collective", url: "https://www.grownfolkscollective.com/" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Partnership levels",
    itemListElement: [
      { "@type": "Offer", name: "Friend of GFC (per event)", price: 150, priceCurrency: "USD" },
      { "@type": "Offer", name: "Featured Partner (per event)", price: 350, priceCurrency: "USD" },
      { "@type": "Offer", name: "Presenting Partner (per event)", price: 750, priceCurrency: "USD" },
      { "@type": "Offer", name: "Series Partner (3 events)", price: 1800, priceCurrency: "USD" },
    ],
  },
};
const momentLabel = (m) => `${m.series}: ${m.label}`;
const SERIES = [{ name: "Acoustic & Infused™", tag: "Live music showcase" }];

// Our staple events (keep in sync with EVENTS in models/donationSchema.js)
const eventOptions = [
  "Game Night",
  "Karaoke Bingo",
  "Acoustic & Infused™ (Live Music Showcase)",
  "Recess Talks™",
  "GFC Select™",
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
  const siteStats = useSiteStats();
  const [params] = useSearchParams();
  const [showForm, setShowForm] = useState(params.get("inquire") === "1");
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

  // The inquiry form stays hidden until someone picks a level (or asks to talk)
  const openForm = (tierLabel = "", event = "") => {
    if (tierLabel) setFormData((prev) => ({ ...prev, tierRequested: tierLabel }));
    if (event) {
      setFormData((prev) => ({
        ...prev,
        eventsInterested: prev.eventsInterested.includes(event) ? prev.eventsInterested : [...prev.eventsInterested, event],
      }));
    }
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  const handleTierSelect = (tierLabel) => openForm(tierLabel);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    try {
      // Create copy and apply safe formatting trims
      const cleanedData = {
        ...formData,
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        details: formData.details.trim(),
      };

      await partnershipService.createInquiry(cleanedData);
      setFeedback({
        type: "success",
        message:
          "We received your inquiry. Expect to hear from us within 48 hours.",
      });
      setFormData(defaultForm);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Old donation links (/partnerships?donate=1) now go to the donate page
  if (params.get("donate") === "1") {
    const src = params.get("src");
    return <Navigate to={src ? `/donate?src=${encodeURIComponent(src)}` : "/donate"} replace />;
  }

  return (
    <div className="partnership-page">
      <Helmet>
        <title>Sponsor an Atlanta Event | Reach Adults 30+ | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Put your brand in the room with Atlanta adults 30+. Sponsor a Game Night, Karaoke Bingo or live music showcase from $150 per event, present a whole series, donate products, or offer our community a perk for free."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/partnerships" />
        <script type="application/ld+json">{JSON.stringify(SPONSOR_SCHEMA)}</script>
      </Helmet>

      {/* HERO & NARRATIVE */}
      <header className="partner-hero">
        <div className="mission-narrative">
          <h1 className="location-tag seo-tag-h1">Atlanta Event Sponsorships for Brands</h1>
          <p className="playfair luxe-title">
            Partner With
            <br />
            the Collective
          </p>
          <div className="gold-spacer-bar"></div>
          <p className="narrative-lead">
            We bring together Atlanta adults 30+ who are intentional about how
            they spend their time, energy, and money.
          </p>
          <p className="narrative-body">
            Partner with us for a single event to see the alignment firsthand,
            and let's build from there. Our alcohol-free, low-key rooms are
            built for real conversation, so your brand connects with engaged
            guests who are present, relaxed, and actually paying attention.
          </p>

          {/* Two paths: sponsors vs. local businesses */}
          <div className="partner-paths">
            <a href="#levels" className="partner-path">
              <span className="partner-path-tag">For brands</span>
              <span className="playfair partner-path-title">Sponsor an Event</span>
              <span className="partner-path-text">Get your brand in the room with Atlanta's 30+ crowd. From $150 per event.</span>
              <span className="partner-path-cta">See partnership levels ↓</span>
            </a>
            <Link to="/partnerships/perks" className="partner-path">
              <span className="partner-path-tag">For local businesses</span>
              <span className="playfair partner-path-title">Offer a Member Perk</span>
              <span className="partner-path-text">Give our members a discount and bring new regulars through your door. Free to join.</span>
              <span className="partner-path-cta">Offer a perk →</span>
            </Link>
            <Link to="/donate" className="partner-path">
              <span className="partner-path-tag">For anyone</span>
              <span className="playfair partner-path-title">Donate Products or Equipment</span>
              <span className="partner-path-text">Stock our gift bags, giveaways and game nights, or help us gear up with sound, lights and supplies.</span>
              <span className="partner-path-cta">Offer a donation →</span>
            </Link>
          </div>
        </div>
      </header>

      {/* STATS SECTION */}
      <section className="impact-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <p className="playfair stat-number">30+</p>
            <p>Core demographic age</p>
          </div>
          <div className="stat-card">
            <p className="playfair stat-number">250%+</p>
            <p>Venue sales lift on event nights</p>
          </div>
          <div className="stat-card">
            <p className="playfair stat-number">100%</p>
            <p>Alcohol & Smoke-free environment</p>
          </div>
          <div className="stat-card">
            <p className="playfair stat-number">{plus(siteStats.communityTotal)}</p>
            <p>Community in Atlanta</p>
          </div>
        </div>
      </section>

      {/* VENUE PARTNERS */}
      <section className="venue-partners-section" aria-label="Venue partners">
        <VenuePartners />
      </section>

      {/* TIERS SHOWCASE */}
      <section className="tier-showcase" id="levels">
        <span className="location-tag">Partnership Levels</span>
        <h2 className="playfair section-title">Find Your Level</h2>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className="tier-item">
              <span className="tier-label">{tier.label}</span>
              <h3 className="playfair">{tier.price}</h3>
              {tier.priceNote && <p className="tier-price-note">{tier.priceNote}</p>}
              <p
                className="narrative-body"
                style={{ minHeight: "60px", fontSize: "0.95rem" }}
              >
                {tier.description}
              </p>
              <div
                className="gold-spacer-bar"
                style={{ margin: "20px 0", width: "40px" }}
              ></div>
              <ul
                className="partner-tier-features"
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 30px 0",
                  flex: 1,
                }}
              >
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "0.85rem",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                      color: "#666",
                    }}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className="gold-submit-btn"
                style={{
                  width: "100%",
                  marginTop: "auto",
                  padding: "15px",
                  fontSize: "0.75rem",
                }}
                onClick={() => handleTierSelect(tier.label)}
                type="button"
              >
                {tier.elite
                  ? "Inquire"
                  : tier.featured
                    ? "Select"
                    : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ACOUSTIC & INFUSED: sponsor one part of the night */}
      <section className="moments-section" aria-labelledby="moments-heading">
        <span className="location-tag">Acoustic &amp; Infused™ · Live Music Showcase</span>
        <h2 className="playfair section-title" id="moments-heading">Sponsor a Moment</h2>
        <p className="narrative-body moments-lead">
          Want to support Atlanta artists in a way people will remember? Cover one part of the night and we'll make sure
          the room knows it was you. One sponsor per moment, per show.
        </p>
        {SERIES.map((series) => (
        <div key={series.name} className="moments-group">
        {SERIES.length > 1 && <h3 className="moments-group-title">{series.name} <span>{series.tag}</span></h3>}
        <div className={`moments-grid ${moments.filter((m) => m.series === series.name).length === 1 ? "moments-grid-one" : ""}`}>
          {moments.filter((m) => m.series === series.name).map((m) => (
            <div key={m.id} className="moment-card">
              <span className="tier-label">{m.label}</span>
              <h3 className="playfair moment-price">{m.price} <span>/ {m.per || "show"}</span></h3>
              <p className="moment-covers">{m.covers}</p>
              <ul className="moment-features">
                {m.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button type="button" className="gold-submit-btn moment-btn" onClick={() => openForm(momentLabel(m), m.event)}>
                Sponsor This Moment
              </button>
            </div>
          ))}
        </div>
        </div>
        ))}
      </section>

      {!showForm && (
        <p className="partner-talk">
          Not sure which level fits?{" "}
          <button type="button" className="partner-talk-btn" onClick={() => openForm("Not sure")}>
            Let's talk →
          </button>
        </p>
      )}

      {/* FORM SECTION: opens when someone picks a level */}
      {showForm && (
      <section
        className="proposal-container"
        id="partner-form"
        style={{
          border: "1px solid #e2e2e2",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#ffffff",
          maxWidth: "950px",
          margin: "80px auto",
          padding: 0,
        }}
      >
        {/* Dark Luxe Header Cap */}
        <div style={{
          backgroundColor: "var(--navy)",
          padding: "50px 30px",
          textAlign: "center"
        }}>
          <span className="form-intro" style={{ color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Get Started
          </span>
          <h2 className="playfair luxe-title" style={{ color: "#ffffff", marginTop: "12px", marginBottom: 0, fontSize: "2.2rem" }}>
            Let's Connect
          </h2>
        </div>

        {/* Content Body Inner Wrapper */}
        <div style={{ padding: "40px 50px" }}>
          <p
            className="narrative-body"
            style={{ textAlign: "center", marginBottom: "50px", color: "#555555" }}
          >
            Tell us a bit about your brand. We'll find the right event format to
            pilot our partnership and follow up within 48 hours.
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
                  placeholder="First & Last"
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
                  <option key={t.id} value={t.label}>
                    {t.label} — {t.price}
                  </option>
                ))}
                {moments.map((m) => (
                  <option key={m.id} value={momentLabel(m)}>
                    {momentLabel(m)} — {m.price}
                  </option>
                ))}
                <option value="Not sure">Not sure yet / Want to customize</option>
              </select>
            </div>

            {/* Sponsorship Opportunities */}
            <div className="input-group">
              <label
                style={{
                  marginBottom: "15px",
                  display: "block",
                  letterSpacing: "0.05em",
                  fontWeight: "600",
                }}
              >
                SPONSORSHIP OPPORTUNITIES
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px 30px",
                  padding: "24px",
                  background: "#fcfbfa",
                  border: "1px solid #e2e2e2",
                  borderRadius: "4px",
                }}
              >
                {eventOptions.map((event) => {
                  const inputId = `event-${event.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                  return (
                    <div
                      key={event}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: "18px",
                          height: "20px",
                        }}
                      >
                        <input
                          type="checkbox"
                          id={inputId}
                          value={event}
                          checked={formData.eventsInterested.includes(event)}
                          onChange={handleCheckbox}
                          style={{
                            accentColor: "var(--gold)",
                            width: "18px",
                            height: "18px",
                            margin: 0,
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <label
                        htmlFor={inputId}
                        style={{
                          fontSize: "0.85rem",
                          lineHeight: "1.4",
                          color: "var(--navy)",
                          fontWeight: "600",
                          letterSpacing: "0.03em",
                          cursor: "pointer",
                          userSelect: "none",
                          textTransform: "uppercase",
                        }}
                      >
                        {event}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="hostingInterest">
                Interested in hosting or co-creating an experience?
              </label>
              <select
                id="hostingInterest"
                name="hostingInterest"
                value={formData.hostingInterest}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Yes - Pilot first event">
                  Yes — Let's pitch a custom concept for our initial pilot event
                </option>
                <option value="Maybe">
                  Maybe — Tell me more about co-branded experiences
                </option>
                <option value="No">
                  No — Standard brand placement / space sponsorship only
                </option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="details">
                Anything else we should know about your brand timeline?
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                placeholder="Tell us about your brand, your timeline, and what products you'd like to feature..."
                onChange={handleChange}
                rows={5}
              />
            </div>

            {feedback && (
              <div
                role="alert"
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: feedback.type === "success" ? "var(--gold)" : "#d9534f",
                  background: feedback.type === "success" ? "#fbf9f5" : "#fdf2f2",
                  border: `1px solid ${feedback.type === "success" ? "var(--gold)" : "#d9534f"}`,
                  marginBottom: "20px"
                }}
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="gold-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Partnership Inquiry"}
            </button>
            <p className="form-privacy-note">By submitting, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms</a>.</p>
          </form>
        </div>
      </section>
      )}

      {/* DONATIONS live on /donate */}
      <section className="donate-section donate-teaser" aria-labelledby="donate-heading">
        <div className="donate-inner">
          <span className="location-tag">Give to the Collective</span>
          <h2 className="playfair section-title" id="donate-heading">Donate Products or Equipment</h2>
          <p className="narrative-body donate-lead">
            Gift bag products, prizes, sound gear or non-alcoholic drinks. Every donation gets your name in the room
            with a shout-out at the event, a social media tag and a newsletter mention.
          </p>
          <Link to="/donate" className="gold-submit-btn donate-open-btn">Offer a Donation</Link>
        </div>
      </section>
    </div>
  );
};

export default Partnership;
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { formatEventDate, formatEventTime } from "../Services/eventService";
import {
  loadUpcomingEvents,
  getCategory,
  getPriceDisplay,
  getSpotsLeft,
  parseCleanPrice,
  getTierStatus,
  matchesWhen,
  eventPath,
  truncate,
  CATEGORIES,
  OTHER_CATEGORY,
  WHEN_OPTIONS,
} from "../Services/eventUtils";
import PriceTag from "../Components/PriceTag";
import "../Styles/Events.css";
import "../Styles/EventListing.css";

// ── FAQS: one tab per event series + general (also given to Google as FAQ data) ──
const FAQ_TABS = [
  { id: "general", label: "General", faqs: [
    { q: "Who are GFC events for?", a: "Grown folks 30 and up. We may ask for ID at the door." },
    { q: "Can I come by myself?", a: "Yes. Come solo, as a couple, or with friends and coworkers. Solo folks never stay solo for long." },
    { q: "Is alcohol served?", a: "No. Every GFC event is alcohol-free. Venues offer mocktails, tea and coffee to buy." },
    { q: "Any ticket deals?", a: "Early Bird tickets are our best price (6 per event, ending 14 days before). Book 2 different events in one order and save 5%, or 3 or more and save 10%." },
    { q: "Is there parking?", a: "Yes, and it's free at our venues, including Aromas Tea Bar at The Koncept House and Mint Coffeehouse." },
    { q: "Refunds and transfers?", a: "Tickets are final, but you can transfer yours up to 24 hours before by emailing community@grownfolkscollective.com. If we cancel, you get a full refund." },
  ]},
  { id: "games", label: "Game Nights", faqs: [
    { q: "I've never played spades. Can I come?", a: "Absolutely. Beginners are welcome and we'll teach you." },
    { q: "What games do you play?", a: "Spades, dominoes, Uno, Taboo, Mad Gab, chess and more." },
    { q: "Do I need a partner?", a: "No. Tables rotate, so you'll play with new people all night." },
  ]},
  { id: "karaoke", label: "Karaoke Bingo", faqs: [
    { q: "Do I have to sing?", a: "Never. Sing from your seat, take the mic, or just mark your card." },
    { q: "How does it work?", a: "Your bingo card is full of songs from the night's theme. When one plays, mark it. Get a bingo, win a prize." },
  ]},
  { id: "acoustic", label: "Acoustic & Infused", faqs: [
    { q: "Who's performing?", a: "Atlanta R&B, neo-soul and acoustic artists, each with a 20-minute set. The lineup is on each event page." },
    { q: "How do I support the artists?", a: "Buy your ticket through an artist's link and visit their merch table." },
    { q: "Can I perform?", a: "Yes. Apply at grownfolkscollective.com/perform." },
  ]},
  { id: "dinners", label: "Holiday Tables", faqs: [
    { q: "Is dinner included?", a: "Yes, dinner is included in your ticket." },
    { q: "Can you handle dietary needs?", a: "Email community@grownfolkscollective.com at least 5 days before and we'll do our best." },
    { q: "Why do sales close early?", a: "We plan the food around the headcount, so sales close 5 days before each dinner." },
  ]},
  { id: "reunion", label: "Family Reunion", faqs: [
    { q: "Where is it?", a: "The location is emailed to ticket holders before the event." },
    { q: "How do I enter the grill-off?", a: "Buy a Grill Master ticket. Setup, supplies and judging details come by email." },
    { q: "What games will there be?", a: "Tabletop games, spades, dominoes, Jenga, kickball and more." },
  ]},
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_TABS.flatMap((t) => t.faqs).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

// ── FAQ TABS + STAY CONNECTED ───────────────────────────────
const EventFaqs = () => {
  const [tab, setTab] = useState("general");
  const active = FAQ_TABS.find((t) => t.id === tab) || FAQ_TABS[0];
  const onKey = (e) => {
    const i = FAQ_TABS.findIndex((t) => t.id === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    const t = FAQ_TABS.at((next + FAQ_TABS.length) % FAQ_TABS.length);
    setTab(t.id);
    document.getElementById(`faq-tab-${t.id}`)?.focus();
  };
  return (
    <section className="gfc-events-faq" aria-labelledby="events-faq-title">
      <div className="gfc-events-faq-inner">
        <h2 id="events-faq-title" className="playfair">Questions? We've Got You.</h2>
        <div className="gfc-faq-tabs" role="tablist" aria-label="FAQ topics" onKeyDown={onKey}>
          {FAQ_TABS.map((t) => (
            <button
              key={t.id}
              id={`faq-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={t.id === tab}
              aria-controls="faq-panel"
              tabIndex={t.id === tab ? 0 : -1}
              className={`gfc-faq-tab ${t.id === tab ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          id="faq-panel"
          role="tabpanel"
          aria-labelledby={`faq-tab-${active.id}`}
          className="gfc-faq-panel"
        >
          {active.faqs.map((f) => (
            <details key={f.q} className="gfc-faq">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="gfc-connect">
          <div>
            <h3 className="playfair">Stay connected between events</h3>
            <p>Join the conversation, find a spades partner, and hear about new events first.</p>
          </div>
          <div className="gfc-connect-links">
            <a href="https://discord.gg/yZG48Q4tgJ" target="_blank" rel="noopener noreferrer" className="gfc-connect-btn discord">Join our Discord</a>
            <a href="https://www.facebook.com/groups/grownfolksatl" target="_blank" rel="noopener noreferrer" className="gfc-connect-btn facebook">Join the Facebook group</a>
          </div>
        </div>
        <p className="gfc-events-faq-more">
          Still have a question? Email <a href="mailto:community@grownfolkscollective.com">community@grownfolkscollective.com</a>
        </p>
      </div>
    </section>
  );
};



// Lowest price someone can actually buy right now (for "sort by price")
const lowestAvailablePrice = (event) => {
  const prices = event.tiers
    .filter((t) => getTierStatus(t) === "available")
    .map(parseCleanPrice);
  return prices.length ? Math.min(...prices) : Infinity;
};

// ── ONE EVENT CARD ───────────────────────────────────────────
const EventCard = ({ event }) => {
  const category = getCategory(event);
  const price = getPriceDisplay(event.tiers);
  const spotsLeft = getSpotsLeft(event.tiers);
  const date = new Date(event.date);
  const loc = event.location || {};
  const path = eventPath(event);
  const soldOut = price.type === "sold-out";

  return (
    <article className={`gfc-card ${soldOut ? "is-sold-out" : ""}`}>
      <Link to={path} className="gfc-card-media" aria-label={`View details for ${event.title}`}>
        <img src={event.image} alt="" loading="lazy" />
        <span className="gfc-card-category">{category.label}</span>
        <div className="gfc-date-block" aria-hidden="true">
          <span className="gfc-date-month">{date.toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="gfc-date-day">{date.getDate()}</span>
        </div>
        {soldOut && <span className="gfc-card-ribbon">Sold Out</span>}
      </Link>

      <div className="gfc-card-body">
        <p className="gfc-card-when">
          {formatEventDate(event.date)} · {formatEventTime(event.date)}
        </p>
        <h3 className="playfair gfc-card-title">
          <Link to={path}>{event.title}</Link>
        </h3>

        {(loc.name || loc.city) && (
          <p className="gfc-card-where">
            <span aria-hidden="true">📍</span> {[loc.name, loc.city].filter(Boolean).join(" · ")}
          </p>
        )}

        {event.plainDescription && (
          <p className="gfc-card-desc">{truncate(event.plainDescription, 140)}</p>
        )}

        {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
          <p className="gfc-spots-alert">Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left</p>
        )}

        <div className="gfc-card-foot">
          <PriceTag display={price} />
          <Link to={path} className={soldOut ? "gfc-btn-outline" : "gfc-btn-primary"}>
            {soldOut ? "View Details" : "Get Tickets"}
          </Link>
        </div>
      </div>
    </article>
  );
};

// ── PAGE ─────────────────────────────────────────────────────
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters live in the URL, so /events?type=game-night can be shared
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "";
  const type = params.get("type") || "all";
  const when = params.get("when") || "all";
  const sort = params.get("sort") || "date";

  const setParam = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const clearFilters = () => setParams({}, { replace: true });

  useEffect(() => {
    loadUpcomingEvents()
      .then(setEvents)
      .catch((err) => {
        console.error("Error fetching GFC events:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only show category chips for types that currently have events
  const categoryChips = useMemo(() => {
    const present = new Set(events.map((e) => getCategory(e).id));
    return [...CATEGORIES, OTHER_CATEGORY]
      .filter((c) => present.has(c.id))
      .map((c) => ({ ...c, count: events.filter((e) => getCategory(e).id === c.id).length }));
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = events.filter((e) => {
      if (type !== "all" && getCategory(e).id !== type) return false;
      if (!matchesWhen(e, when)) return false;
      if (!q) return true;
      const loc = e.location || {};
      return [e.title, e.plainDescription, loc.name, loc.address, loc.city, getCategory(e).label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (sort === "price") {
      return [...list].sort((a, b) => lowestAvailablePrice(a) - lowestAvailablePrice(b));
    }
    return list;
  }, [events, search, type, when, sort]);

  const hasFilters = search || type !== "all" || when !== "all";

  return (
    <div className="events-page-wrapper">
      <Helmet>
        <title>Events | Grown Folks Collective</title>
        <meta
          name="description"
          content="Upcoming game nights, dinners, conversations, and travel for Atlanta adults 30+. Alcohol-free, low-key, and built for real connection and a little more joy."
        />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      {/* HERO */}
      <header className="page-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">Atlanta · 30+</span>
            <h1 className="playfair luxe-title-white">
              Curated<br />Gatherings.
            </h1>
            <div className="gold-spacer-v2" aria-hidden="true"></div>
            <p className="narrative-lead-white">
              Game nights, dinners, and adventures for grown folks who want a few more sparks of joy.
            </p>
          </div>
        </div>
      </header>

      {/* EVENTS */}
      <div className="gfc-events-main">
        <div className="gfc-section-head">
          <span className="gold-label">Upcoming</span>
          <h2 className="playfair section-title-navy">Find Your Next Night Out</h2>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="gfc-toolbar" role="search">
          <div className="gfc-search">
            <span className="gfc-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setParam("q", e.target.value, "")}
              placeholder="Search events, venues, or neighborhoods"
              aria-label="Search events"
            />
          </div>
          <div className="gfc-selects">
            <label>
              <span className="sr-only">When</span>
              <select value={when} onChange={(e) => setParam("when", e.target.value, "all")}>
                {WHEN_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setParam("sort", e.target.value, "date")}>
                <option value="date">Soonest first</option>
                <option value="price">Lowest price</option>
              </select>
            </label>
          </div>
        </div>

        {categoryChips.length > 1 && (
          <div className="gfc-chips" role="group" aria-label="Filter by event type">
            <button
              className={`gfc-chip ${type === "all" ? "active" : ""}`}
              aria-pressed={type === "all"}
              onClick={() => setParam("type", "all", "all")}
            >
              All <span>{events.length}</span>
            </button>
            {categoryChips.map((c) => (
              <button
                key={c.id}
                className={`gfc-chip ${type === c.id ? "active" : ""}`}
                aria-pressed={type === c.id}
                onClick={() => setParam("type", c.id, "all")}
              >
                {c.label} <span>{c.count}</span>
              </button>
            ))}
          </div>
        )}

             {/* DISCOUNT BANNER */}
        <div className="gfc-bundle-banner">
          <strong>Book more than one event and save.</strong> Your discount is applied automatically at checkout:
          <span className="gfc-bundle-tiers">
            <span>2 different events · 5% off</span>
            <span>3+ different events · 10% off</span>
          </span>
          <span className="gfc-bundle-fine">Multiple tickets to the same event count as one event.</span>
        </div>

        {/* GROUP BOOKINGS BANNER */}
        <Link to="/celebrate" className="gfc-group-banner">
          <span>
            <strong>Celebrating something? Bring your crew.</strong>{" "}
            Group pricing for 10+, reserved tables, and custom touches.
          </span>
          <span className="gfc-group-banner-cta">Plan a group outing →</span>
        </Link>

        {/* RESULTS */}
        {loading ? (
          <div className="gfc-grid" aria-busy="true" aria-label="Loading events">
            {[0, 1, 2].map((i) => (
              <div key={i} className="gfc-card gfc-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="gfc-empty">
            <p>We couldn't load events right now. Please refresh and try again.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="gfc-empty">
            <p>Our next gathering is being planned. Join the collective to be the first to know.</p>
            <Link to="/membership" className="gfc-btn-primary">Join the Collective</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gfc-empty">
            <p>No events match your search.</p>
            <button className="gfc-btn-outline" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <>
            <p className="gfc-results-count" aria-live="polite">
              Showing {filtered.length} of {events.length} upcoming event{events.length === 1 ? "" : "s"}
              {hasFilters && (
                <button className="gfc-link-btn" onClick={clearFilters}>Clear filters</button>
              )}
            </p>
            <div className="gfc-grid">
              {filtered.map((event) => (
                <EventCard key={event._id || event.eventbriteId} event={event} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAQS */}
      <EventFaqs />

      {/* GET INVOLVED */}
      <section className="gfc-involved">
        <div className="gfc-involved-inner">
          <span className="gfc-involved-eyebrow">Get Involved</span>
          <h2 className="playfair">Join the Movement Against Social Isolation</h2>
          <div className="gfc-involved-grid">
            <div className="gfc-involved-card featured">
              <h3 className="playfair">Join The Collective</h3>
              <p>
                Loneliness among adults is at an all-time high, and busy lives make it harder to fix.
                Grown Folks Collective exists to change that. Members get priority access, member
                pricing, and a circle of Atlanta grown folks who keep showing up for each other.
              </p>
              <Link to="/membership" className="gfc-btn-gold-outline">Join The Collective</Link>
            </div>
            <div className="gfc-involved-card">
              <h3 className="playfair">Partner With Us</h3>
              <p>
                We partner with brands, venues, and local businesses that care about real human
                connection. Co-host an experience, sponsor an event, or put your brand in a room full of
                engaged Atlanta grown folks.
              </p>
              <Link to="/partnerships" className="gfc-btn-light-outline">Explore Partnerships</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
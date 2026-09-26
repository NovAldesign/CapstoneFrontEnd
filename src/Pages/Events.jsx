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
      <main id="main-content" className="gfc-events-main">
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
          <strong>Coming to more than one?</strong> Savings add up automatically at checkout:
          <span className="gfc-bundle-tiers">
            <span>2 events · 5% off</span>
            <span>3+ events · 10% off</span>
          </span>
        </div>

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
      </main>

      {/* ABOUT THE EXPERIENCE */}
      <section className="gfc-story">
        <div className="gfc-story-grid">
          <img
            src="https://media.cnn.com/api/v1/images/stellar/prod/230725152449-01-group-friend-vacation-tips-top.jpg?c=16x9&q=h_653,w_1160,c_fill/f_avif"
            alt="A group of friends laughing together outdoors"
            loading="lazy"
          />
          <div>
            <h2 className="playfair">More Fun. Real Connection.</h2>
            <p className="gfc-story-lead">
              Grown life gets busy, and fun is usually the first thing to slip off the calendar.
            </p>
            <p>
              The <strong>Grown Folks Collective</strong> brings Atlanta adults 30+ together for game
              nights, good food, real conversation, and shared adventure. No networking, no pressure,
              no "So, what do you do?" Just good people and a few more sparks of joy.
            </p>
            <div className="gfc-story-values">
              <div><strong>Alcohol-Free</strong><span>Clear heads, real conversation.</span></div>
              <div><strong>Human First</strong><span>People, not job titles.</span></div>
              <div><strong>Pure Joy</strong><span>Laugh, play, and leave lighter.</span></div>
            </div>
          </div>
        </div>
      </section>

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
                The Grown Folks Collective exists to change that. Members get priority access, member
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
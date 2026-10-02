import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import logo from "../assets/gfcLogo.png";
import { loadUpcomingEvents, eventPath, getPriceDisplay } from "../Services/eventUtils";
import { formatEventDate } from "../Services/eventService";
import "../Styles/Links.css";

// ── Link-in-bio page: grownfolkscollective.com/links?src=ig ──
// Use a different ?src= on each platform (ig, tiktok, threads, fb, yt, li, x, lemon8)
// so site analytics show which platform sent each visitor.

// Community spaces: shown as full-size buttons right under the events.
const COMMUNITY = [
  { label: "Join the Facebook group (Atlanta Grown Folks 30+)", url: "https://www.facebook.com/groups/grownfolksatl" },
  { label: "Join our Discord", url: "https://discord.gg/yZG48Q4tgJ" },
];

const SOCIALS = [
  { label: "Instagram", url: "https://instagram.com/grownfolkscollective" },
  { label: "TikTok", url: "https://tiktok.com/@grownfolkscollective" },
  { label: "Threads", url: "https://threads.net/@grownfolkscollective" },
  { label: "Facebook", url: "https://facebook.com/grownfolkscollectiveatl" },
  { label: "YouTube", url: "https://www.youtube.com/@grownfolkscollective" },
  { label: "LinkedIn", url: "https://linkedin.com/company/grownfolkscollective" },
];

// The fixed buttons under the events, in order. Add the Select waitlist once it's live:
// { label: "Join the GFC Select waitlist", to: "/select" },
const BUTTONS = [
  { label: "See all events", to: "/events" },
  { label: "Become a member", to: "/membership" },
  { label: "Bring your crew (group & birthday bookings)", to: "/celebrate" },
  { label: "Perform with us", to: "/perform" },
  { label: "Partner with us", to: "/partnerships" },
];

const priceText = (event) => {
  const p = getPriceDisplay(event.tiers || []);
  if (p.type === "sale") return `$${p.price} early bird`;
  if (p.type === "from") return `From $${p.price}`;
  if (p.type === "single") return `$${p.price}`;
  if (p.type === "free") return "Free";
  return p.label || "";
};

const Links = () => {
  const [params] = useSearchParams();
  const src = (params.get("src") || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 20);
  const withSrc = (path) => (src ? `${path}${path.includes("?") ? "&" : "?"}src=${src}` : path);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadUpcomingEvents()
      .then((list) => { if (alive) setEvents(list.slice(0, 4)); })
      .catch(() => { if (alive) setEvents([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const [next, ...more] = events;

  return (
    <div className="links-page">
      <Helmet>
        <title>Grown Folks™ Collective | Links</title>
        <meta name="description" content="Tickets, membership, and everything Grown Folks™ Collective: Atlanta's alcohol-free social club for grown folks 30+." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="links-head">
        <img src={logo} alt="Grown Folks Collective logo" className="links-logo" width="84" height="84" />
        <h1 className="playfair">Grown Folks™ Collective</h1>
        <p>Atlanta's alcohol-free social club for 30+. Where grown folks come out to play.™</p>
      </header>

      <section className="links-events" aria-labelledby="links-next">
        <h2 id="links-next" className="links-label">Next up</h2>

        {loading && <p className="links-muted">Loading events…</p>}

        {!loading && !next && (
          <Link className="links-btn" to={withSrc("/events")}>See upcoming events</Link>
        )}

        {next && (
          <Link className="links-feature" to={withSrc(eventPath(next))}>
            {next.image && <img src={next.image} alt="" className="links-feature-img" loading="lazy" />}
            <span className="links-feature-body">
              <span className="links-feature-date">{formatEventDate(next.date)}</span>
              <span className="links-feature-title">{next.title}</span>
              <span className="links-feature-cta">
                <span>{priceText(next)}</span>
                <span className="links-feature-go">Get tickets →</span>
              </span>
            </span>
          </Link>
        )}

        {more.map((e) => (
          <Link key={e._id || e.eventbriteId} className="links-event" to={withSrc(eventPath(e))}>
            <span className="links-event-date">{formatEventDate(e.date)}</span>
            <span className="links-event-title">{e.title}</span>
            <span className="links-event-price">{priceText(e)}</span>
          </Link>
        ))}
      </section>

      <nav className="links-buttons" aria-label="More from GFC">
        {COMMUNITY.map((c) => (
          <a key={c.url} className="links-btn" href={c.url} target="_blank" rel="noreferrer">{c.label}</a>
        ))}
        {BUTTONS.map((b) => (
          <Link key={b.to} className="links-btn" to={withSrc(b.to)}>{b.label}</Link>
        ))}
        <a className="links-btn" href="#footer-signup" onClick={(e) => {
          const el = document.getElementById("footer-name");
          if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
        }}>Get on the list (email)</a>
      </nav>

      <nav className="links-socials" aria-label="Follow GFC">
        {SOCIALS.map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
        ))}
      </nav>
    </div>
  );
};

export default Links;
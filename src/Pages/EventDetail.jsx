import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { isPlusOne, plusOneMemberCents, isGroupTicket, groupSize } from '../Services/memberPricing';
import { formatEventDate, formatEventTime } from "../Services/eventService";
import {
  loadEventById,
  loadUpcomingEvents,
  idFromSlug,
  eventPath,
  getCategory,
  getPriceDisplay,
  getSpotsLeft,
  getTierStatus,
  getTierRemaining,
  parseCleanPrice,
  formatMoney,
  formatShortDate,
  getDirectionsUrl,
  truncate,
  isUpcoming,
  TIER_STATUS_LABELS,
} from "../Services/eventUtils";
import { useCart } from "../Context/CartContext";
import PriceTag from "../Components/PriceTag";
import "../Styles/EventListing.css";
import MeetTheArtists from "../Components/MeetTheArtists";
import NewsletterOffer from "../Components/NewsletterOffer.jsx";
import "../Styles/Join.css";
import { faqsForEvent, faqSchema, REFUND_TEXT } from "../content/eventFaqs";

// Google Calendar link (dates in UTC, e.g. 20261024T220000Z)
const calendarUrl = (event) => {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = event.date;
  const end = event.endDate || new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000);
  const loc = event.location || {};
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${truncate(event.plainDescription || "", 400)}\n\n${window.location.href}`,
    location: [loc.name, loc.address, loc.city, loc.state].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Ticket types people can see (not hidden, not member-only)
const visibleTiersFor = (event) =>
  (event.tiers || []).filter((t) => getTierStatus(t) !== "hidden" && !/member/i.test(t.name || ""));

// The next upcoming event like this one: same series name first ("Karaoke Bingo", "Acoustic & Infused"), then same category
const seriesName = (e) => String(e?.title || e?.name || "").split(/[:|(]/)[0].trim().toLowerCase();
const findNextSimilar = (event, upcoming = []) => {
  const later = upcoming
    .filter((e) => new Date(e.date) > new Date(event.date) && visibleTiersFor(e).some((t) => getTierStatus(t) === "available"))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const series = seriesName(event);
  const cat = getCategory(event)?.id;
  return (
    later.find((e) => series && seriesName(e) === series) ||
    later.find((e) => cat && cat !== "other" && getCategory(e)?.id === cat) ||
    null
  );
};

const EventDetail = () => {
  const { slug } = useParams();
  const { addToCart, memberWallet, memberPrice } = useCart();
  const [event, setEvent] = useState(null);
  const [moreEvents, setMoreEvents] = useState([]);
  const [allUpcoming, setAllUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lineup, setLineup] = useState([]); // showcase artists, for Google event data

  useEffect(() => {
    const id = idFromSlug(slug);
    setLoading(true);
    window.scrollTo(0, 0);
    loadEventById(id)
      .then(setEvent)
      .catch((err) => {
        console.error("Error loading event:", err);
        setEvent(null);
      })
      .finally(() => setLoading(false));

    loadUpcomingEvents()
      .then((all) => {
        const others = all.filter((e) => String(e._id) !== id && String(e.eventbriteId) !== id);
        setAllUpcoming(others);
        setMoreEvents(others.slice(0, 3));
      })
      .catch(() => setMoreEvents([]));
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: `Join me at ${event.title}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share sheet closed */
    }
  };

  if (loading) {
    return (
      <div className="gfc-detail-loading" aria-busy="true">
        <p>Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="gfc-empty gfc-detail-missing">
        <h1 className="playfair">We couldn't find that event.</h1>
        <p>It may have ended or been moved.</p>
        <Link to="/events" className="gfc-btn-primary">See Upcoming Events</Link>
      </div>
    );
  }

  const past = !isUpcoming(event);
  const loc = event.location || {};
  const category = getCategory(event);
  const price = getPriceDisplay(event.tiers);
  // Eventbrite can mark a paid event "free" (e.g. free scout tickets), so only show it when every ticket is free
  const allFree = (event.tiers || []).length > 0 && event.tiers.every((t) => parseCleanPrice(t) === 0);
  const highlights = (event.highlights || []).filter((h) => !/^free admission$/i.test(String(h).trim()) || allFree);
  const spotsLeft = getSpotsLeft(event.tiers);
  const directions = getDirectionsUrl(loc);

  // Full or nearly full: point people to the next event like this one
  const soldOut = !past && visibleTiersFor(event).length > 0 && visibleTiersFor(event).every((t) => getTierStatus(t) !== "available");
  const nearlyFull = !past && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10;
  const nextSimilar = soldOut || nearlyFull ? findNextSimilar(event, allUpcoming) : null;
  const nextTier = nextSimilar
    ? (nextSimilar.tiers || [])
        .filter((t) => getTierStatus(t) === "available" && !/member/i.test(t.name || "") && !isPlusOne(t.name) && !isGroupTicket(t.name))
        .sort((a, b) => parseCleanPrice(a) - parseCleanPrice(b))[0] || null
    : null;
  const visibleTiers = event.tiers
    .filter((t) => getTierStatus(t) !== "hidden")
    .sort((a, b) => parseCleanPrice(a) - parseCleanPrice(b));
  const metaDescription = truncate(
    event.plainDescription ||
      `${event.title} with Grown Folks™ Collective, ${formatEventDate(event.date)} in Atlanta.`,
    155
  );
  const pageUrl = `https://www.grownfolkscollective.com${eventPath(event)}`;

  // Event structured data, so Google can show this event in its events results
  const AVAILABILITY = {
    available: "https://schema.org/InStock",
    "sold-out": "https://schema.org/SoldOut",
    upcoming: "https://schema.org/PreOrder",
    ended: "https://schema.org/SoldOut",
  };
  const publicTiers = visibleTiers.filter((t) => !/member/i.test(t.name || ""));
  const faqs = faqsForEvent(event);
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: truncate(event.plainDescription || metaDescription, 500),
    startDate: new Date(event.date).toISOString(),
    ...(event.endDate && { endDate: new Date(event.endDate).toISOString() }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.image && { image: [event.image] }),
    url: pageUrl,
    location: {
      "@type": "Place",
      name: loc.name || "Atlanta, GA",
      address: {
        "@type": "PostalAddress",
        ...(loc.address && { streetAddress: loc.address }),
        addressLocality: loc.city || "Atlanta",
        addressRegion: loc.state || "GA",
        ...(loc.zip && { postalCode: loc.zip }),
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Grown Folks Collective",
      url: "https://www.grownfolkscollective.com",
    },
    ...(publicTiers.length > 0 && {
      offers: publicTiers.map((t) => {
        const start = t.salesStart || t.sales_start;
        return {
          "@type": "Offer",
          name: t.name,
          price: parseCleanPrice(t).toFixed(2),
          priceCurrency: "USD",
          availability: AVAILABILITY[getTierStatus(t)] || "https://schema.org/InStock",
          url: pageUrl,
          ...(start && { validFrom: new Date(start).toISOString() }),
        };
      }),
    }),
    // Who's on stage: the showcase lineup when there is one, otherwise GFC hosts the night
    performer: lineup.length
      ? lineup.map((a) => ({ "@type": "Person", name: a.artistName }))
      : { "@type": "PerformingGroup", name: "Grown Folks Collective", url: "https://www.grownfolkscollective.com" },
    typicalAgeRange: "30-",
  };

  return (
    <div className="gfc-detail">
      <Helmet>
        <title>{`${event.title} | Grown Folks™ Collective`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={event.image} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="event" />
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(faqs))}</script>
      </Helmet>

         {/* HERO: event graphic shown whole (it already has the title, date and logo) */}
      <header className="gfc-detail-hero">
        <div className="gfc-detail-hero-inner">
          <div className="gfc-detail-hero-text">
            <Link to="/events" className="gfc-back-link">← All events</Link>
            <span className="gfc-card-category static">{category.label}</span>
            <h1 className="playfair">{event.title}</h1>
            <p>
              {formatEventDate(event.date)} · {formatEventTime(event.date)}
              {loc.city && ` · ${loc.city}`}
            </p>
          </div>
          {event.image && <img src={event.image} alt="" className="gfc-detail-hero-img" />}
        </div>
      </header>

      <div className="gfc-detail-grid">
        {/* LEFT: DETAILS */}
        <div className="gfc-detail-content">
          {past && (
            <div className="gfc-past-note">
              This event has already happened. <Link to="/events">See what's coming up →</Link>
            </div>
          )}

          <dl className="gfc-facts">
            <div>
              <dt>Date &amp; Time</dt>
              <dd>
                {formatEventDate(event.date)}
                <br />
                {formatEventTime(event.date)}
                {event.endDate && ` – ${formatEventTime(event.endDate)}`}
                {!past && (
                  <>
                    <br />
                    <a href={calendarUrl(event)} target="_blank" rel="noopener noreferrer" className="gfc-fact-link">
                      Add to calendar
                    </a>
                  </>
                )}
              </dd>
            </div>
            {(loc.name || loc.address) && (
              <div>
                <dt>Location</dt>
                <dd>
                  {loc.name && <strong>{loc.name}</strong>}
                  {loc.address && <><br />{loc.address}</>}
                  {(loc.city || loc.state) && <><br />{[loc.city, loc.state].filter(Boolean).join(", ")}</>}
                  {directions && (
                    <>
                      <br />
                      <a href={directions} target="_blank" rel="noopener noreferrer" className="gfc-fact-link">
                        Get directions
                      </a>
                    </>
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt>The Vibe</dt>
              <dd>30+ · Alcohol-free · Come solo or bring a friend</dd>
            </div>
          </dl>

          {highlights.length > 0 && (
            <ul className="gfc-highlights" aria-label="Event highlights">
              {highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}

          {event.agenda?.length > 0 && (
            <section className="gfc-detail-section">
              <h2 className="playfair">Schedule</h2>
              <ol className="gfc-agenda">
                {event.agenda.map((item, i) => (
                  <li key={i}>
                    <span className="gfc-agenda-time">{item.time}</span>
                    <div>
                      {item.title && <strong>{item.title}</strong>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="gfc-detail-section">
            <h2 className="playfair">About This Event</h2>
            {event.description ? (
              <div className="gfc-rich-text" dangerouslySetInnerHTML={{ __html: event.description }} />
            ) : (
              <p>More details coming soon.</p>
            )}
          </section>

          <MeetTheArtists eventId={event._id} onLoaded={setLineup} />

          <section className="gfc-detail-section">
            <h2 className="playfair">Good to Know</h2>
            <div className="gfc-faqs">
              {faqs.map((faq) => (
                <details key={faq.q} className="gfc-faq">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                  {faq.link && <Link to={faq.link.to} className="gfc-faq-link">{faq.link.label} →</Link>}
                </details>
              ))}
            </div>
          </section>

          <section className="gfc-detail-section">
            <h2 className="playfair">Refund Policy</h2>
            <p className="gfc-policy">{REFUND_TEXT}</p>
          </section>
        </div>

        {/* RIGHT: TICKETS */}
        <aside className="gfc-ticket-panel" id="tickets" aria-labelledby="tickets-heading">
          <h2 id="tickets-heading" className="playfair">Tickets</h2>
          <PriceTag display={price} size="lg" />
          {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
            <p className="gfc-spots-alert">Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left</p>
          )}
          {nextSimilar && (
            <div className="gfc-next-up">
              <span>
                {soldOut ? "This one is sold out. " : "This one is almost full. "}
                Next up: <Link to={eventPath(nextSimilar)}>{nextSimilar.title}</Link> on {formatShortDate(nextSimilar.date)}.
                {!soldOut && " Grab both and save 5% on your order."}
              </span>
              {nextTier && (
                <button type="button" className="gfc-btn-outline small" onClick={() => addToCart(nextSimilar, nextTier)}>
                  Add {nextSimilar.title.split(/[:|(]/)[0].trim()} ({formatShortDate(nextSimilar.date)}) to bag
                </button>
              )}
            </div>
          )}

          {!past && (
            <ul className="gfc-tier-list">
              {visibleTiers.filter((t) => !/member/i.test(t.name || "")).map((tier, i) => {
                const status = getTierStatus(tier);
                const left = getTierRemaining(tier);
                const endsAt = tier.salesEnd || tier.sales_end;
                const startsAt = tier.salesStart || tier.sales_start;
                return (
                  <li key={tier.id || tier._id || i} className={`gfc-tier status-${status}`}>
                    <div className="gfc-tier-info">
                      <span className="gfc-tier-name">{tier.name}</span>
                      <span className="gfc-tier-price">
                        {parseCleanPrice(tier) === 0 ? "Free" : formatMoney(parseCleanPrice(tier))}
                      </span>
                      {isPlusOne(tier.name) && (
                        <span className="gfc-tier-note">Admits 2 · Buy 2, save $8 · Discount codes don't combine, but artist codes still count</span>
                      )}
                      {isGroupTicket(tier.name) && (
                        <span className="gfc-tier-note">Admits {groupSize(tier.name)} · Group price · Member pricing doesn't apply</span>
                      )}
                      {memberWallet?.memberPricing && parseCleanPrice(tier) > 0 && !isGroupTicket(tier.name) && (
                        <span className="gfc-tier-member">
                          {isPlusOne(tier.name) ? "Your member price for 2: " : "Your member price: "}
                          {formatMoney(
                            (isPlusOne(tier.name)
                              ? plusOneMemberCents(memberWallet, Math.round(parseCleanPrice(tier) * 100), event.title)
                              : memberPrice(Math.round(parseCleanPrice(tier) * 100), event.title)) / 100
                          )}
                        </span>
                      )}
                      {status === "available" && endsAt && (
                        <span className="gfc-tier-note">Available until {formatShortDate(endsAt)}</span>
                      )}
                      {status === "available" && left !== null && left <= 10 && (
                        <span className="gfc-tier-note urgent">{left} left</span>
                      )}
                      {status === "upcoming" && startsAt && (
                        <span className="gfc-tier-note">On sale {formatShortDate(startsAt)}</span>
                      )}
                      {tier.description && <span className="gfc-tier-desc">{tier.description}</span>}
                    </div>
                    {status === "available" ? (
                      <button className="gfc-btn-primary small" onClick={() => addToCart(event, tier)}>
                        Add to Bag
                      </button>
                    ) : (
                      <span className="gfc-tier-status">{TIER_STATUS_LABELS[status]}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

           <p className="gfc-ticket-perk">
            Book 2 different events and save 5%, or 3+ different events and save 10%.{" "}
            <Link to="/events">Browse events</Link>
          </p>
          {memberWallet ? (
            <p className="gfc-ticket-perk">
              {memberWallet.memberPricing ? "Your member price comes off in your bag" : "You're logged in as a member"}
              {memberWallet.balanceCents > 0
                ? `, and you have ${formatMoney(memberWallet.balanceCents / 100)} in event credit to use.`
                : "."}
            </p>
          ) : (
            <p className="gfc-ticket-perk">
              Members save on every ticket and get monthly event credit.{" "}
              <Link to="/login">Log in</Link> or <Link to="/membership">learn more</Link>
            </p>
          )}

          {!memberWallet && !past && (
            <div className="gfc-nl-offer">
              <h3 className="playfair">Not ready to buy?</h3>
              <p>Join our list and we'll email you $5 off your first ticket.</p>
              <NewsletterOffer compact source={`event:${event._id || event.eventbriteId}`} idPrefix="ev-nl" />
            </div>
          )}

          <button className="gfc-btn-outline full" onClick={handleShare}>
            {copied ? "Link copied!" : "Share this event"}
          </button>
        </aside>
      </div>

      {/* MORE EVENTS */}
      {moreEvents.length > 0 && (
        <section className="gfc-more">
          <h2 className="playfair">More Upcoming Events</h2>
          <div className="gfc-more-grid">
            {moreEvents.map((e) => (
              <Link key={e._id || e.eventbriteId} to={eventPath(e)} className="gfc-more-card">
                <span className="gfc-more-media">
                  <img src={e.image} alt="" loading="lazy" />
                </span>
                <span className="gfc-more-body">
                  <span className="gfc-card-when">{formatEventDate(e.date)}</span>
                  <strong>{e.title}</strong>
                  <span className="gfc-more-cta">View event →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventDetail;
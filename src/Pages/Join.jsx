import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsletterOffer from '../Components/NewsletterOffer.jsx';
import { loadUpcomingEvents, eventPath, formatShortDate } from '../Services/eventUtils';
import { isFoodEvent } from '../Services/memberPricing';
import '../Styles/Join.css';

// /join and /play — the one link for DMs, bios and QR codes: $5 off a first ticket for joining
// Come Out & Play, the GFC newsletter. Add ?src=ig (or fb, tiktok…) to see where signups came from.
const PHOTO = '/join-karaoke-bingo-group.jpg'; // Karaoke Bingo crew
const OG_IMAGE = 'https://www.grownfolkscollective.com/join-og.jpg';

const Join = () => {
  const [params] = useSearchParams();
  const src = (params.get('src') || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 20);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadUpcomingEvents()
      .then((all) => setEvents(all.filter((e) => !isFoodEvent(e.title)).slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="join-page">
      <Helmet>
        <title>Join Come Out & Play: $5 Off Your First Ticket | Grown Folks™ Collective</title>
        <meta name="description" content="Join Come Out & Play, the Grown Folks™ Collective newsletter, and get $5 off your first ticket: game nights, Karaoke Bingo and live music for Atlanta's 30+ crowd, all alcohol-free." />
        <link rel="canonical" href="https://www.grownfolkscollective.com/join" />
        <meta property="og:title" content="Join Come Out & Play and get $5 off your first ticket" />
        <meta property="og:image" content={OG_IMAGE} />
      </Helmet>

      <section className="join-hero">
        <div className="join-copy">
          <p className="join-kicker">Atlanta · 30+ · Alcohol-free</p>
          <h1 className="playfair">Join Come Out &amp; Play and get $5 off your first ticket.</h1>
          <p className="join-lead">
            Game nights, Karaoke Bingo and live music for grown folks who want good people and a real night out.
            Come Out &amp; Play is our newsletter. Join and we'll email you $5 off your first ticket.
          </p>
          <figure className="join-photo">
            <img src={PHOTO} alt="A big, smiling group of Grown Folks Collective guests together at Karaoke Bingo" width="1600" height="1200" />
            <figcaption>The crew at Karaoke Bingo</figcaption>
          </figure>
          <ul className="join-points">
            <li>Hear about new events before they fill up</li>
            <li>Come Out &amp; Play every week: what's coming up, never spam</li>
            <li>Unsubscribe with one click</li>
          </ul>
        </div>
        <div className="join-card">
          <NewsletterOffer source={src ? `join:${src}` : 'join'} idPrefix="join" />
        </div>
      </section>

      {events.length > 0 && (
        <section className="join-events" aria-labelledby="join-events-title">
          <h2 id="join-events-title" className="playfair">Where you could use it</h2>
          <ul>
            {events.map((e) => (
              <li key={e._id || e.eventbriteId}>
                <span>{formatShortDate(e.date)}</span>
                <Link to={eventPath(e)}>{e.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="join-tagline playfair">Where grown folks come out to play.™</p>
    </div>
  );
};

export default Join;

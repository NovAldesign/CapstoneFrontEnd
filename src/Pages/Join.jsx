import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsletterOffer from '../Components/NewsletterOffer.jsx';
import { loadUpcomingEvents, eventPath, formatShortDate } from '../Services/eventUtils';
import { isFoodEvent } from '../Services/memberPricing';
import '../Styles/Join.css';

// /join — the one link for DMs, bios and QR codes: $5 off a first ticket for joining the newsletter
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
        <title>Get $5 Off Your First Night | Grown Folks™ Collective</title>
        <meta name="description" content="Join the Grown Folks™ Collective list and get $5 off your first ticket: game nights, Karaoke Bingo and live music for Atlanta's 30+ crowd, all alcohol-free." />
        <link rel="canonical" href="https://www.grownfolkscollective.com/join" />
        <meta property="og:title" content="Get $5 off your first Grown Folks™ night" />
        <meta property="og:image" content={OG_IMAGE} />
      </Helmet>

      <section className="join-hero">
        <div className="join-copy">
          <p className="join-kicker">Atlanta · 30+ · Alcohol-free</p>
          <h1 className="playfair">Get $5 off your first Grown Folks™ night.</h1>
          <p className="join-lead">
            Game nights, Karaoke Bingo and live music for grown folks who want good people and a real night out.
            Join our list and we'll email you $5 off your first ticket.
          </p>
          <figure className="join-photo">
            <img src={PHOTO} alt="A big, smiling group of Grown Folks Collective guests together at Karaoke Bingo" width="1600" height="1200" />
            <figcaption>The crew at Karaoke Bingo</figcaption>
          </figure>
          <ul className="join-points">
            <li>Hear about new events before they fill up</li>
            <li>One or two emails a month, never spam</li>
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

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL, eventPath } from '../Services/eventUtils';
import ArtistCard from '../Components/ArtistCard.jsx';
import PerformLinks from '../Components/PerformLinks.jsx';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Perform.css';

// /on-our-stage: everyone booked for our showcases, grouped by show.
// Upcoming shows first (soonest first), then past shows (most recent first).
const TABS = [
  { id: 'all', label: 'Everyone' },
  { id: 'artist', label: 'Artists & Musicians' },
  { id: 'host', label: 'Hosts' },
  { id: 'visual', label: 'Live Artists' },
];

const fmtDay = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const OnOurStagePage = () => {
  const [params, setParams] = useSearchParams();
  const role = TABS.some((t) => t.id === params.get('role')) ? params.get('role') : 'all';
  const [people, setPeople] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${BACKEND_URL}/api/artists/stage?role=all&limit=300`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (active) setPeople(Array.isArray(list) ? list : []); })
      .catch(() => { if (active) setPeople([]); });
    return () => { active = false; };
  }, []);

  // Keep the API's show order and group people under their show
  const shows = useMemo(() => {
    const groups = [];
    const byId = new Map();
    for (const p of people || []) {
      if (role !== 'all' && p.role !== role) continue;
      if (!byId.has(p.eventId)) {
        const g = { id: p.eventId, name: p.showName, date: p.showDate, past: p.past, people: [] };
        byId.set(p.eventId, g);
        groups.push(g);
      }
      byId.get(p.eventId).people.push(p);
    }
    return groups;
  }, [people, role]);

  const pickTab = (id) => setParams(id === 'all' ? {} : { role: id }, { replace: true });

  return (
    <div className="contact-page perform-page">
      <Helmet>
        <title>On Our Stage | Atlanta Artists, Hosts & Live Artists | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Meet the Atlanta singers, musicians, hosts, and live artists who perform at Acoustic & Infused, the Grown Folks™ Collective live music showcase for grown folks 30+."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/on-our-stage" />
      </Helmet>

      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">Acoustic &amp; Infused</span>
            <h1 className="contact-hero-title">On Our Stage</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">
              The Atlanta singers, musicians, hosts, and live artists who bring our showcases to life, show by show.
              Catch them live, follow them, and share the love.
            </p>
            <nav className="contact-hero-links" aria-label="Page sections">
              <Link to="/events" className="contact-hero-link">See Upcoming Shows</Link>
            </nav>
            <PerformLinks current="" />
          </div>
        </div>
      </header>

      <section className="perform-info stage-page">
        <div className="perform-info-inner">
          <div className="stage-tabs" role="tablist" aria-label="Show">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={role === t.id}
                className={role === t.id ? 'on' : ''} onClick={() => pickTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {people === null && <p className="perform-stage-intro">Loading…</p>}
          {people !== null && shows.length === 0 && (
            <p className="perform-stage-intro">
              No one here yet. <Link to="/perform">Apply to be part of the next show →</Link>
            </p>
          )}

          {shows.map((s) => (
            <section key={s.id} className="stage-group" aria-label={`${s.name}, ${fmtDay(s.date)}`}>
              <div className="stage-group-head">
                <div>
                  <span className="stage-group-when">{s.past ? '' : 'Coming up · '}{fmtDay(s.date)}</span>
                  <h2 className="stage-group-name">{s.name}</h2>
                </div>
                <Link className="stage-group-link" to={eventPath({ _id: s.id, name: s.name })}>
                  {s.past ? 'View the show →' : 'Get tickets →'}
                </Link>
              </div>
              <div className="gfc-artists perform-stage-grid">
                {s.people.map((p) => <ArtistCard key={p.id} a={p} compact />)}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OnOurStagePage;

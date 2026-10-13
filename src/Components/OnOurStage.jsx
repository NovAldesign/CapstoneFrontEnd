import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
import ArtistCard from './ArtistCard.jsx';

// "On Our Stage": approved artists, hosts, and live artists from past and
// upcoming showcases, so new applicants see how their profile will look.
// Shows nothing until someone has been booked.
const HEADINGS = {
  artist: 'Artists on Our Stage',
  host: 'Hosts Who Ran the Room',
  visual: 'Live Artists in the Room',
  all: 'Talent on Our Stage',
};

const showLine = (p) => {
  const day = new Date(p.showDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${p.past ? '' : 'Coming up · '}${p.showName} · ${day}`;
};

const OnOurStage = ({ role = 'all', intro }) => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(`${BACKEND_URL}/api/artists/stage?role=${encodeURIComponent(role)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (active) setPeople(Array.isArray(list) ? list : []); })
      .catch(() => {});
    return () => { active = false; };
  }, [role]);

  if (!people.length) return null;

  return (
    <section className="perform-stage" aria-labelledby="stage-heading">
      <div className="perform-info-inner">
        <h2 id="stage-heading" className="perform-heading">{HEADINGS[role] || HEADINGS.all}</h2>
        <p className="perform-stage-intro">
          {intro || 'Every booked artist gets a profile like these on the event page.'}
        </p>
        <div className="gfc-artists perform-stage-grid">
          {people.map((p) => <ArtistCard key={p.id} a={p} showLine={showLine(p)} />)}
        </div>
      </div>
    </section>
  );
};

export default OnOurStage;

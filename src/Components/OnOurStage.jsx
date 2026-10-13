import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../Services/eventUtils';
import ArtistCard from './ArtistCard.jsx';

// Small "On Our Stage" preview for the Perform and Scout pages: the next few
// booked people (in show order) and a link to see everyone at /on-our-stage.
// Shows nothing until someone has been booked.
const HEADINGS = {
  artist: 'Artists on Our Stage',
  host: 'Hosts Who Run the Room',
  visual: 'Live Artists in the Room',
  all: 'Talent on Our Stage',
};
const PREVIEW = 4;

export const showLine = (p) => {
  const day = new Date(p.showDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${p.past ? '' : 'Coming up · '}${day}`;
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
  const allLink = role === 'all' ? '/on-our-stage' : `/on-our-stage?role=${role}`;

  return (
    <section className="perform-stage" aria-labelledby="stage-heading">
      <div className="perform-info-inner">
        <h2 id="stage-heading" className="perform-heading">{HEADINGS[role] || HEADINGS.all}</h2>
        <p className="perform-stage-intro">
          {intro || 'Every booked artist gets a profile like these on the event page.'}
        </p>
        <div className="gfc-artists perform-stage-grid">
          {people.slice(0, PREVIEW).map((p) => <ArtistCard key={p.id} a={p} compact showLine={showLine(p)} />)}
        </div>
        <p className="perform-stage-all">
          <Link to={allLink}>See everyone on our stage, show by show →</Link>
        </p>
      </div>
    </section>
  );
};

export default OnOurStage;

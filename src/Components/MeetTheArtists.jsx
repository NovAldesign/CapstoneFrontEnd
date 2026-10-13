import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
import ArtistCard from './ArtistCard.jsx';
import '../Styles/MeetTheArtists.css';

// Approved artists for an event (shows nothing if there are none)
const MeetTheArtists = ({ eventId, onLoaded }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    fetch(`${BACKEND_URL}/api/artists/public?eventId=${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      // The host is listed first, the live artist last
      .then((data) => {
        if (!active) return;
        const rank = (a) => (a.role === 'host' ? 0 : a.role === 'visual' ? 2 : 1);
        const list = (Array.isArray(data) ? data : []).sort((a, b) => rank(a) - rank(b));
        setArtists(list);
        onLoaded?.(list);
      })
      .catch(() => { if (active) { setArtists([]); onLoaded?.([]); } });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (!artists.length) return null;

  return (
    <section className="gfc-detail-section" aria-labelledby="meet-artists-heading">
      <h2 id="meet-artists-heading" className="playfair">
        {artists.some((a) => a.role === 'host') ? 'Meet the Artists & Your Host' : 'Meet the Artists'}
      </h2>
      <div className="gfc-artists">
        {artists.map((a) => <ArtistCard key={a.id} a={a} />)}
      </div>
    </section>
  );
};

export default MeetTheArtists;
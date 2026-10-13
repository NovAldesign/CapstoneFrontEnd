import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
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
        {artists.map((a) => (
          <article key={a.id} className="gfc-artist">
            {a.headshotUrl ? (
              <img
                className="gfc-artist-photo"
                src={a.headshotUrl.replace('/upload/', '/upload/c_fill,g_face,w_320,h_320,q_auto,f_auto/')}
                alt={`${a.artistName} headshot`}
                loading="lazy"
              />
            ) : (
              <div className="gfc-artist-photo gfc-artist-photo-empty" aria-hidden="true">{a.role === 'visual' ? '🎨' : '🎤'}</div>
            )}
            <div className="gfc-artist-body">
              <h3 className="gfc-artist-name">{a.artistName}</h3>
              {(a.role === 'host' || a.role === 'visual' || a.genres || a.hometown) && (
                <p className="gfc-artist-meta">
                  {[a.role === 'host' ? 'Your host' : a.role === 'visual' ? 'Live artist' : '', a.genres, a.hometown].filter(Boolean).join(' · ')}
                </p>
              )}
              {a.bio && <p className="gfc-artist-bio">{a.bio}</p>}
              <p className="gfc-artist-links">
                {a.instagram && (
                  <a href={`https://instagram.com/${a.instagram}`} target="_blank" rel="noopener noreferrer">
                    @{a.instagram}
                  </a>
                )}
                {a.listenUrl && (
                  <a href={a.listenUrl} target="_blank" rel="noopener noreferrer">
                    {a.role === 'host' ? 'Watch ▸' : a.role === 'visual' ? 'See the work ▸' : 'Listen ▸'}
                  </a>
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MeetTheArtists;
import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../Services/eventUtils';
import '../Styles/MeetTheArtists.css';

// Approved artists for an event (shows nothing if there are none)
const MeetTheArtists = ({ eventId }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    fetch(`${BACKEND_URL}/api/artists/public?eventId=${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      .then((data) => active && setArtists(Array.isArray(data) ? data : []))
      .catch(() => active && setArtists([]));
    return () => {
      active = false;
    };
  }, [eventId]);

  if (!artists.length) return null;

  return (
    <section className="gfc-detail-section" aria-labelledby="meet-artists-heading">
      <h2 id="meet-artists-heading" className="playfair">Meet the Artists</h2>
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
              <div className="gfc-artist-photo gfc-artist-photo-empty" aria-hidden="true">🎤</div>
            )}
            <div className="gfc-artist-body">
              <h3 className="gfc-artist-name">{a.artistName}</h3>
              {(a.genres || a.hometown) && (
                <p className="gfc-artist-meta">{[a.genres, a.hometown].filter(Boolean).join(' · ')}</p>
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
                    Listen ▸
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
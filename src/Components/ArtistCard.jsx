import React from 'react';
import '../Styles/MeetTheArtists.css';

// One artist, host, or live artist card. Used in Meet the Artists (event page),
// the "On Our Stage" gallery, and the live preview on the application forms.
const roleLabel = (role) => (role === 'host' ? 'Your host' : role === 'visual' ? 'Live artist' : '');
const linkLabel = (role) => (role === 'host' ? 'Watch ▸' : role === 'visual' ? 'See the work ▸' : 'Listen ▸');
const emptyIcon = (role) => (role === 'visual' ? '🎨' : role === 'host' ? '🎙️' : '🎤');

const photoSrc = (url = '') =>
  url.includes('/upload/') ? url.replace('/upload/', '/upload/c_fill,g_face,w_320,h_320,q_auto,f_auto/') : url;

const ArtistCard = ({ a, showLine = '', as: Tag = 'article' }) => {
  const meta = [roleLabel(a.role), a.genres, a.hometown].filter(Boolean).join(' · ');
  return (
    <Tag className="gfc-artist">
      {a.headshotUrl ? (
        <img className="gfc-artist-photo" src={photoSrc(a.headshotUrl)} alt={`${a.artistName || 'Artist'} headshot`} loading="lazy" />
      ) : (
        <div className="gfc-artist-photo gfc-artist-photo-empty" aria-hidden="true">{emptyIcon(a.role)}</div>
      )}
      <div className="gfc-artist-body">
        <h3 className="gfc-artist-name">{a.artistName}</h3>
        {meta && <p className="gfc-artist-meta">{meta}</p>}
        {showLine && <p className="gfc-artist-show">{showLine}</p>}
        {a.bio && <p className="gfc-artist-bio">{a.bio}</p>}
        {(a.instagram || a.listenUrl) && (
          <p className="gfc-artist-links">
            {a.instagram && (
              <a href={`https://instagram.com/${a.instagram}`} target="_blank" rel="noopener noreferrer">@{a.instagram}</a>
            )}
            {a.listenUrl && (
              <a href={a.listenUrl} target="_blank" rel="noopener noreferrer">{linkLabel(a.role)}</a>
            )}
          </p>
        )}
      </div>
    </Tag>
  );
};

export default ArtistCard;

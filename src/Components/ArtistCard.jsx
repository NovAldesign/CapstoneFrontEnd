import React, { useState } from 'react';
import '../Styles/MeetTheArtists.css';

// One artist, host, or live artist card. Used in Meet the Artists (event page),
// the "On Our Stage" gallery, and the live preview on the application forms.
const roleLabel = (role) => (role === 'host' ? 'Your host' : role === 'visual' ? 'Live artist' : '');
const linkLabel = (role) => (role === 'host' ? 'Watch ▸' : role === 'visual' ? 'See the work ▸' : 'Listen ▸');
const emptyIcon = (role) => (role === 'visual' ? '🎨' : role === 'host' ? '🎙️' : '🎤');

// "@name", "name", or "https://www.instagram.com/name/" → "name"
export const socialHandle = (value = '') =>
  String(value).trim()
    .replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\/@?/i, '')
    .replace(/^@/, '')
    .split(/[/?#\s]/)[0];

const photoSrc = (url = '') =>
  url.includes('/upload/') ? url.replace('/upload/', '/upload/c_fill,g_face,w_320,h_320,q_auto,f_auto/') : url;

// compact = gallery card: bio cut to 3 lines with a "Read more" toggle
const ArtistCard = ({ a, showLine = '', as: Tag = 'article', compact = false }) => {
  const [open, setOpen] = useState(false);
  const meta = [roleLabel(a.role), a.genres, a.hometown].filter(Boolean).join(' · ');
  const ig = socialHandle(a.instagram);
  const longBio = compact && (a.bio || '').length > 160;
  return (
    <Tag className={`gfc-artist${compact ? ' gfc-artist-compact' : ''}`}>
      {a.headshotUrl ? (
        <img className="gfc-artist-photo" src={photoSrc(a.headshotUrl)} alt={`${a.artistName || 'Artist'} headshot`} loading="lazy" />
      ) : (
        <div className="gfc-artist-photo gfc-artist-photo-empty" aria-hidden="true">{emptyIcon(a.role)}</div>
      )}
      <div className="gfc-artist-body">
        <h3 className="gfc-artist-name">{a.artistName}</h3>
        {meta && <p className="gfc-artist-meta">{meta}</p>}
        {showLine && <p className="gfc-artist-show">{showLine}</p>}
        {a.bio && (
          <p className={`gfc-artist-bio${longBio && !open ? ' gfc-artist-bio-clamp' : ''}`}>{a.bio}</p>
        )}
        {longBio && (
          <button type="button" className="gfc-artist-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Show less' : 'Read more'}
          </button>
        )}
        {(ig || a.listenUrl) && (
          <p className="gfc-artist-links">
            {ig && (
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">@{ig}</a>
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

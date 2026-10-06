// Where tickets come from: the platform (website, Eventbrite, Posh…) and,
// for website sales, the post or link that sent the buyer (?src= tag).

const KEY = 'gfc_src';
const DAYS = 30;

// Save the ?src= tag from the address bar (last one wins, kept for 30 days)
export const rememberSource = (search = '') => {
  try {
    const src = new URLSearchParams(search).get('src');
    if (!src) return;
    const clean = src.replace(/[^a-z0-9_-]/gi, '').slice(0, 40).toLowerCase();
    if (clean) localStorage.setItem(KEY, JSON.stringify({ v: clean, t: Date.now() }));
  } catch { /* storage blocked */ }
};

export const currentSource = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved?.v || Date.now() - saved.t > DAYS * 86400000) return '';
    return saved.v;
  } catch {
    return '';
  }
};

// Colors follow a colorblind-checked order (always shown next to a text label)
export const SOURCES = {
  website: { label: 'Website', color: '#2a78d6' },
  eventbrite: { label: 'Eventbrite', color: '#eb6834' },
  posh: { label: 'Posh', color: '#1baf7a' },
  door: { label: 'Door', color: '#eda100' },
  eventnoire: { label: 'Eventnoire', color: '#e87ba4' },
  comp: { label: 'Comp', color: '#008300' },
  meetup: { label: 'Meetup', color: '#8a8f98' },
  allevents: { label: 'AllEvents', color: '#8a8f98' },
  partner: { label: 'Partner', color: '#8a8f98' },
  other: { label: 'Other', color: '#8a8f98' },
};

export const sourceLabel = (s) => SOURCES[s]?.label || (s ? s[0].toUpperCase() + s.slice(1) : 'Other');
export const sourceColor = (s) => SOURCES[s]?.color || '#6B7280';

// Friendly name for a website ?src= tag
export const tagLabel = (tag = '') => {
  const t = String(tag).toLowerCase();
  if (!t || t === 'direct') return 'Direct / unknown';
  const suffix = t.endsWith('-m') ? " (men's post)" : t.endsWith('-w') ? " (women's post)" : '';
  const base = t.replace(/-(m|w)$/, '');
  const names = {
    threads: 'Threads', ig: 'Instagram', instagram: 'Instagram', tt: 'TikTok', tiktok: 'TikTok',
    fb: 'Facebook', facebook: 'Facebook', email: 'Email', newsletter: 'Email', welcome: 'Welcome email',
    sms: 'Text', text: 'Text', yt: 'YouTube', li: 'LinkedIn', x: 'X', lemon8: 'Lemon8', links: 'Link in bio',
    google: 'Google', flyer: 'Flyer', nfc: 'NFC tap', qr: 'QR code', partner: 'Partner',
  };
  return (names[base] || base.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase())) + suffix;
};

// One line for a guest, e.g. "Website · Threads (men's post) · code ARIA"
export const guestSourceLine = (g) =>
  [sourceLabel(g.source), g.source === 'website' && g.sourceDetail ? tagLabel(g.sourceDetail) : '', g.code ? `code ${g.code}` : '']
    .filter(Boolean).join(' · ');

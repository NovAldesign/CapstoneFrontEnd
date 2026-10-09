import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';
import { adminApi, downloadCSV, fmtDate, timeAgo } from '../../Services/adminApi';
import { PortalProgress, loadPartnerOverview, sendPortalLink } from './AdminPartners.jsx';

// Partnerships, Member Perks, private events, group bookings, messages, subscribers.
// One card per request: who, what, status, private notes, and quick reply links.

const name = (d) => [d.firstName, d.lastName].filter(Boolean).join(' ');
const tone = (s) =>
  ({
    pending: 'amber', new: 'amber', unread: 'amber',
    contacted: 'blue', quoted: 'blue', read: 'blue',
    accepted: 'green', active: 'green', booked: 'green', confirmed: 'green', approved: 'green',
    paused: '', closed: '', archived: '', expired: '',
    declined: 'red',
  }[s] || '');
const label = (s) => String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const OPEN = ['pending', 'new', 'unread', 'contacted', 'quoted'];

// What each list shows
const KINDS = {
  partners: {
    empty: 'No partner inquiries yet.',
    title: (d) => d.companyName,
    sub: (d) => `${d.contactPerson} · ${d.tierRequested || 'Partnership'} tier`,
    rows: (d) => [
      ['Contact', d.contactPerson],
      ['Tier', d.tierRequested],
      ['Events', (d.eventsInterested || []).join(', ')],
      ['Co-creation', d.hostingInterest],
      ['Details', d.details],
    ],
    csv: (d) => ({ Company: d.companyName, Contact: d.contactPerson, Email: d.email, Phone: d.phone, Tier: d.tierRequested, Status: d.status, Received: fmtDate(d.createdAt, { year: 'numeric', month: 'short', day: 'numeric' }) }),
  },
  private: {
    empty: 'No private event requests yet.',
    title: (d) => d.organization || name(d),
    sub: (d) => `${d.guestCount || '?'} guests${d.preferredDate ? ` · ${d.preferredDate}` : ''}${d.package ? ` · ${d.package}` : ''}`,
    rows: (d) => [
      ['Contact', name(d)],
      ['Type', d.clientType],
      ['Package', d.package],
      ['Guests', d.guestCount],
      ['Date', d.preferredDate],
      ['City', d.city],
      ['How often', d.frequency],
      ['Toast upgrade', d.toastUpgrade ? 'Yes' : ''],
      ['Their notes', d.notes],
    ],
    csv: (d) => ({ Name: name(d), Organization: d.organization, Email: d.email, Phone: d.phone, Guests: d.guestCount, Date: d.preferredDate, Package: d.package, Status: d.status }),
  },
  groups: {
    empty: 'No group bookings yet.',
    title: (d) => name(d),
    sub: (d) => `${d.occasion || 'Group'} · party of ${d.groupSize || '?'}${d.eventTitle ? ` · ${d.eventTitle}` : ''}`,
    rows: (d) => [
      ['Occasion', d.occasion],
      ['Event', d.eventTitle],
      ['Group size', d.groupSize],
      ['Guest of honor', d.guestOfHonor || (d.isGuestOfHonor ? 'Themselves' : '')],
      ['Surprise', d.isSurprise ? 'Yes, keep it quiet' : ''],
      ['Cake', d.bringingCake ? 'Bringing one' : ''],
      ['Special moment', d.wantsSpecialMoment ? 'Yes' : ''],
      ['Songs', d.songRequests],
      ['Their notes', d.notes],
    ],
    csv: (d) => ({ Name: name(d), Email: d.email, Phone: d.phone, Occasion: d.occasion, Event: d.eventTitle, Size: d.groupSize, Status: d.status }),
  },
  messages: {
    empty: 'No messages yet.',
    title: (d) => name(d),
    sub: (d) => d.reason || 'Message',
    rows: (d) => [
      ['Reason', d.reason],
      ['Message', d.message],
      ['Event type', d.eventDetails?.eventType],
      ['Guests', d.eventDetails?.guestCount],
      ['Date', d.eventDetails?.preferredDate],
      ['Budget', d.eventDetails?.budget],
    ],
    csv: (d) => ({ Name: name(d), Email: d.email, Phone: d.phone, Reason: d.reason, Message: d.message, Status: d.status }),
  },
};

const ItemCard = ({ kind, item, statuses, onSave }) => {
  const cfg = KINDS[kind];
  const [open, setOpen] = useState(OPEN.includes(item.status));
  const [notes, setNotes] = useState(item.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const email = item.email;
  const phone = item.phone;
  const firstName = item.firstName || (item.contactPerson || '').split(' ')[0] || 'there';

  const save = async (patch) => {
    setSaving(true);
    try { await onSave(item._id, patch); } finally { setSaving(false); }
  };

  return (
    <article className="ga-card" style={{ padding: '14px 18px' }}>
      <div className="ga-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ga-row" style={{ gap: 8 }}>
            <strong style={{ color: 'var(--ga-navy)' }}>{cfg.title(item)}</strong>
            <span className={`ga-pill ${tone(item.status)}`}>{label(item.status)}</span>
          </div>
          <div className="ga-small ga-muted">{cfg.sub(item)} · {timeAgo(item.createdAt)}</div>
        </div>
        <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Open'}</button>
      </div>

      {open && (
        <>
          <div className="ga-detail" style={{ marginTop: 12 }}>
            <dl>
              {email && (<><dt>Email</dt><dd><a href={`mailto:${email}`}>{email}</a></dd></>)}
              {phone && (<><dt>Phone</dt><dd><a href={`tel:${phone}`}>{phone}</a></dd></>)}
              {cfg.rows(item).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '').map(([k, v]) => (
                <React.Fragment key={k}><dt>{k}</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{String(v)}</dd></React.Fragment>
              ))}
              <dt>Received</dt><dd>{fmtDate(item.createdAt, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</dd>
            </dl>
          </div>
          <div className="ga-form-grid">
            <label className="ga-field">Status
              <select className="ga-select" value={item.status} disabled={saving} onChange={(e) => save({ status: e.target.value })}>
                {statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </label>
            <div className="ga-field">Reply
              <div className="ga-row">
                {email && (
                  <a className="ga-btn ga-btn-sm" href={`mailto:${email}?subject=${encodeURIComponent('Grown Folks™ Collective')}&body=${encodeURIComponent(`Hi ${firstName},\n\n`)}`}
                    onClick={() => item.status === 'unread' || item.status === 'new' || item.status === 'pending' ? save({ status: kind === 'messages' ? 'read' : 'contacted' }) : null}>
                    ✉️ Email
                  </a>
                )}
                {phone && <a className="ga-btn ga-btn-sm" href={`sms:${phone}`}>💬 Text</a>}
                {phone && <a className="ga-btn ga-btn-sm" href={`tel:${phone}`}>📞 Call</a>}
              </div>
            </div>
            {kind !== 'messages' && (
              <label className="ga-field ga-span-2">Private notes
                <textarea className="ga-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="Only you see these" />
                {notes !== (item.adminNotes || '') && (
                  <span><button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={saving} onClick={() => save({ adminNotes: notes })}>Save notes</button></span>
                )}
              </label>
            )}
          </div>
        </>
      )}
    </article>
  );
};

const useFilter = (items, keyOf) => {
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const shown = useMemo(() => (items || []).filter((d) => {
    if (filter === 'open' && !OPEN.includes(d.status)) return false;
    const q = search.trim().toLowerCase();
    return !q || keyOf(d).toLowerCase().includes(q);
  }), [items, filter, search, keyOf]);
  return { filter, setFilter, search, setSearch, shown };
};

const Toolbar = ({ filter, setFilter, search, setSearch, openCount, total, onExport }) => (
  <div className="ga-row" style={{ marginBottom: 14 }}>
    <div className="ga-seg">
      <button type="button" className={filter === 'open' ? 'on' : ''} onClick={() => setFilter('open')}>Open · {openCount}</button>
      <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All · {total}</button>
    </div>
    <span className="ga-spacer" />
    <input className="ga-input" style={{ width: 220 }} placeholder="Search" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    {onExport && <button type="button" className="ga-btn" onClick={onExport}>↓ CSV</button>}
  </div>
);

export const AdminInboxList = ({ kind }) => {
  const cfg = KINDS[kind];
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi(`/list/${kind}`).then(setData).catch((e) => setError(e.message));
  }, [kind]);
  useEffect(() => { setData(null); load(); }, [load]);

  const keyOf = useCallback((d) => `${cfg.title(d)} ${cfg.sub(d)} ${d.email || ''} ${d.message || ''}`, [cfg]);
  const f = useFilter(data?.items, keyOf);

  const onSave = async (id, patch) => {
    try {
      const { item } = await adminApi(`/list/${kind}/${id}`, { method: 'PATCH', body: patch });
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === id ? item : x)) }));
    } catch (e) { setError(e.message); }
  };

  if (!data) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading…</div>;
  return (
    <>
      {error && <p className="ga-note err">{error}</p>}
      <Toolbar {...f} openCount={data.items.filter((d) => OPEN.includes(d.status)).length} total={data.items.length}
        onExport={() => downloadCSV(f.shown.map(cfg.csv), `gfc-${kind}-${new Date().toISOString().slice(0, 10)}.csv`)} />
      {f.shown.length === 0 ? <div className="ga-card ga-empty">{f.filter === 'open' ? 'Nothing open. You’re caught up.' : cfg.empty}</div> : (
        <div className="ga-stack" style={{ gap: 12 }}>
          {f.shown.map((item) => <ItemCard key={item._id} kind={kind} item={item} statuses={data.statuses} onSave={onSave} />)}
        </div>
      )}
    </>
  );
};

// Member Perks use their own endpoints (/api/discount-partners/admin)
const PERK_STATUSES = ['pending', 'approved', 'paused', 'ended', 'declined'];
const perkApi = async (path = '', opts = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/discount-partners/admin${path}`, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}` },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};

// Shrinks a logo to 320px max and returns it as a small image the server can store
const shrinkLogo = (file) =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return reject(new Error('Use a PNG, JPG or WebP logo.'));
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      let out = canvas.toDataURL('image/png');
      for (let q = 0.9; out.length > 110000 && q > 0.3; q -= 0.15) out = canvas.toDataURL('image/webp', q);
      if (out.length > 110000) return reject(new Error('That logo is too detailed. Try a simpler or smaller file.'));
      resolve(out);
    };
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = URL.createObjectURL(file);
  });

const PerkLogo = ({ perk, onSave }) => {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try { await onSave(await shrinkLogo(file)); } catch (err) { alert(err.message); }
    setBusy(false);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 76px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f6f1e7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {perk.logo ? <img src={perk.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span className="ga-small ga-muted">No logo</span>}
      </div>
      <label className="ga-btn ga-btn-sm" style={{ cursor: 'pointer' }}>
        {busy ? 'Saving…' : perk.logo ? 'Change' : 'Add logo'}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} disabled={busy} style={{ display: 'none' }} />
      </label>
      {perk.logo && !busy && <button type="button" className="ga-small" style={{ background: 'none', border: 0, color: '#9b2c2c', cursor: 'pointer' }} onClick={() => onSave('')}>Remove</button>}
    </div>
  );
};

export const AdminPerks = () => {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [portals, setPortals] = useState(new Map()); // partner portal progress by perk id
  const [sentTo, setSentTo] = useState('');
  useEffect(() => {
    perkApi().then(setItems).catch((e) => setError(e.message));
    loadPartnerOverview().then((o) => setPortals(new Map(o.perks.map((r) => [String(r._id), r])))).catch(() => {});
  }, []);
  // Approve (if pending) and email the portal link
  const invite = async (d) => {
    setSentTo('');
    try {
      const r = await sendPortalLink('perk', d._id);
      setPortals((m) => new Map(m).set(String(d._id), r.item));
      setItems((list) => list.map((x) => (x._id === d._id ? { ...x, status: r.item.status } : x)));
      setSentTo(r.message);
    } catch (e) { setError(e.message); }
  };
  const keyOf = useCallback((d) => `${d.businessName} ${d.offer} ${d.contactName} ${d.category}`, []);
  const f = useFilter(items, keyOf);

  const update = async (id, patch) => {
    try {
      const doc = await perkApi(`/${id}`, { method: 'PATCH', body: patch });
      setItems((list) => list.map((x) => (x._id === id ? doc : x)));
    } catch (e) { setError(e.message); }
  };

  if (!items) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading Member Perks…</div>;
  return (
    <>
      {error && <p className="ga-note err">{error}</p>}
      <p className="ga-subtitle" style={{ marginTop: -12, marginBottom: 16 }}>Approved perks show on the Membership page right away, with their logo. Approving also emails the business their partner portal link, where they add a logo and photo, confirm the details, sign, and can pause or end the perk. Pause one to hide it.</p>
      {sentTo && <p className="ga-note" role="status">{sentTo}</p>}
      <Toolbar {...f} openCount={items.filter((d) => d.status === 'pending').length} total={items.length} />
      {f.shown.length === 0 ? <div className="ga-card ga-empty">{f.filter === 'open' ? 'No perks waiting for approval.' : 'No Member Perks yet.'}</div> : (
        <div className="ga-stack" style={{ gap: 12 }}>
          {f.shown.map((d) => (
            <article key={d._id} className="ga-card" style={{ padding: '14px 18px' }}>
              <div className="ga-row" style={{ alignItems: 'flex-start' }}>
                <PerkLogo perk={d} onSave={(logo) => update(d._id, { logo })} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ga-row" style={{ gap: 8 }}>
                    <strong style={{ color: 'var(--ga-navy)' }}>{d.businessName}</strong>
                    <span className={`ga-pill ${tone(d.status)}`}>{label(d.status)}</span>
                  </div>
                  <div style={{ fontWeight: 600, margin: '4px 0' }}>{d.offer}</div>
                  <div className="ga-small ga-muted">
                    {[d.category, d.where === 'both' ? 'In store & online' : label(d.where), d.redeem === 'promo-code' ? `Code ${d.promoCode}` : label(d.redeem)].filter(Boolean).join(' · ')}
                    {' · '}{timeAgo(d.createdAt)}
                  </div>
                  <PortalProgress row={portals.get(String(d._id))} compact />
                </div>
                <div className="ga-row" style={{ gap: 6 }}>
                  {d.status === 'pending' && <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => invite(d)}>Approve &amp; send portal link</button>}
                  {['approved', 'paused'].includes(d.status) && <button type="button" className="ga-btn ga-btn-sm" onClick={() => invite(d)}>{portals.get(String(d._id))?.portal.invitedAt ? 'Resend portal link' : 'Send portal link'}</button>}
                  {['paused', 'ended', 'declined'].includes(d.status) && <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => update(d._id, { status: 'approved' })}>Approve</button>}
                  {d.status === 'approved' && <button type="button" className="ga-btn ga-btn-sm" onClick={() => update(d._id, { status: 'paused' })}>Pause</button>}
                  {d.status === 'pending' && <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" onClick={() => update(d._id, { status: 'declined' })}>Decline</button>}
                </div>
              </div>
              <div className="ga-detail" style={{ marginTop: 10 }}>
                <dl>
                  <dt>Contact</dt><dd>{d.contactName} · <a href={`mailto:${d.email}`}>{d.email}</a>{d.phone ? <> · <a href={`tel:${d.phone}`}>{d.phone}</a></> : null}</dd>
                  {d.website && (<><dt>Website</dt><dd>{d.website}</dd></>)}
                  {d.address && (<><dt>Address</dt><dd>{d.address}</dd></>)}
                  {d.finePrint && (<><dt>Fine print</dt><dd>{d.finePrint}</dd></>)}
                  <dt>Runs</dt><dd>{d.startDate ? fmtDate(d.startDate) : 'Now'} → {d.endDate ? fmtDate(d.endDate) : 'ongoing'}</dd>
                </dl>
              </div>
              <label className="ga-field" style={{ marginTop: 6 }}>Status
                <select className="ga-select" style={{ maxWidth: 220 }} value={d.status} onChange={(e) => update(d._id, { status: e.target.value })}>
                  {PERK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
              </label>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export const AdminSubscribers = () => {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [audience, setAudience] = useState('guests'); // guests | corporate
  useEffect(() => { adminApi('/subscribers').then((d) => setItems(d.items)).catch((e) => setError(e.message)); }, []);

  // Corporate sign-ups (hosting pages) are kept apart from the guest list
  const isCorp = (s) => String(s.source || '').startsWith('corporate');
  const shown = useMemo(() => (items || []).filter((s) =>
    (audience === 'corporate' ? isCorp(s) : !isCorp(s)) &&
    (!search.trim() || `${s.fullName} ${s.email}`.toLowerCase().includes(search.trim().toLowerCase()))), [items, search, audience]);

  // Brevo import format: EMAIL, FIRSTNAME, LASTNAME, SMS (only for people who agreed to texts)
  const exportBrevo = () => {
    const rows = shown.map((s) => {
      const [first, ...rest] = String(s.fullName || '').trim().split(/\s+/);
      const digits = String(s.phoneNumber || '').replace(/\D/g, '');
      const sms = s.smsOptIn && digits ? (digits.length === 10 ? `+1${digits}` : `+${digits}`) : '';
      return { EMAIL: s.email, FIRSTNAME: first || '', LASTNAME: rest.join(' '), SMS: sms };
    });
    downloadCSV(rows, `brevo-${audience === 'corporate' ? 'corporate' : 'subscribers'}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (!items) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading subscribers…</div>;
  const week = items.filter((s) => Date.now() - new Date(s.createdAt) < 7 * 86400000).length;
  const texts = items.filter((s) => s.smsOptIn).length;

  return (
    <>
      <div className="ga-stats">
        <div className="ga-stat"><div className="ga-stat-num">{items.length}</div><div className="ga-stat-label">Subscribers</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{week}</div><div className="ga-stat-label">New this week</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{texts}</div><div className="ga-stat-label">OK to text</div></div>
      </div>
      <div className="ga-card">
        <div className="ga-card-head">
          <select className="ga-select" style={{ maxWidth: 200 }} aria-label="Which list" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="guests">Guests ({items.filter((s) => !isCorp(s)).length})</option>
            <option value="corporate">Corporate & property ({items.filter(isCorp).length})</option>
          </select>
          <input className="ga-input" style={{ maxWidth: 260 }} placeholder="Search" aria-label="Search subscribers" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="button" className="ga-btn ga-btn-gold" onClick={exportBrevo}>↓ Brevo import file ({shown.length})</button>
        </div>
        <p className="ga-small ga-muted" style={{ marginTop: -4 }}>In Brevo: Contacts → Import contacts → upload this file → list {audience === 'corporate' ? '“GFC Corporate & Property”' : '“GFC Past Guests”'}, with “Update existing contacts” on.</p>
        <div className="ga-table-wrap">
          <table className="ga-table">
            <thead><tr><th>Name</th><th>Email</th><th>Texts</th><th>From</th><th>Joined</th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s._id}>
                  <td>{s.fullName}</td>
                  <td><a href={`mailto:${s.email}`}>{s.email}</a></td>
                  <td>{s.smsOptIn ? <span className="ga-pill green">Yes</span> : <span className="ga-muted">No</span>}</td>
                  <td className="ga-small">{s.source || '—'}</td>
                  <td className="ga-small">{fmtDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

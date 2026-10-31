import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, fmtDate, fmtDay, timeAgo } from '../../Services/adminApi';

// Showcases: lineups, artist + host + live artist applications, ticket sales by code, payouts
const ARTIST_SLOTS = 3;
const HOLD_MIN = 3; // tickets needed one week before the show

const suggestCode = (name = '') =>
  (String(name).split(/\s+/)[0] || 'ARTIST').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

const Avatar = ({ p }) =>
  p.headshotUrl ? (
    <img className="ga-avatar" src={p.headshotUrl.replace('/upload/', '/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/')} alt="" />
  ) : (
    <div className="ga-avatar" aria-hidden="true">{p.role === 'host' ? '🎙️' : p.role === 'visual' ? '🎨' : '🎤'}</div>
  );

// Stage name with an Edit button (what shows on the event page, emails and gallery)
const NameField = ({ p }) => {
  const [name, setName] = useState(p.artistName || '');
  const [draft, setDraft] = useState(p.artistName || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await adminApi(`/applications/${p.id}`, { method: 'PATCH', body: { artistName: draft } });
      setName(r.artistName);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };
  if (editing) {
    return (
      <div>
        <input className="ga-input" maxLength={80} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Stage name" />
        <div className="ga-row" style={{ gap: 6, marginTop: 6 }}>
          <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={saving || !draft.trim()} onClick={save}>{saving ? 'Saving…' : 'Save name'}</button>
          <button type="button" className="ga-btn ga-btn-sm" disabled={saving} onClick={() => { setDraft(name); setEditing(false); }}>Cancel</button>
        </div>
        {error && <p className="ga-note err">{error}</p>}
      </div>
    );
  }
  return (
    <span>
      {name || '—'}{' '}
      <button type="button" className="ga-link" onClick={() => { setDraft(name); setEditing(true); setSaved(false); }}>Edit</button>
      {saved && <span className="ga-small ga-muted"> Saved. Refresh to see it in the list.</span>}
    </span>
  );
};

// Bio with an Edit button (fixes show on the event page right away)
const BioField = ({ p }) => {
  const [bio, setBio] = useState(p.bio || '');
  const [draft, setDraft] = useState(p.bio || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await adminApi(`/applications/${p.id}`, { method: 'PATCH', body: { bio: draft } });
      setBio(r.bio);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };
  if (editing) {
    return (
      <div>
        <textarea className="ga-textarea" rows={5} maxLength={600} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`Bio for ${p.artistName}`} />
        <div className="ga-row" style={{ gap: 6, marginTop: 6 }}>
          <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save bio'}</button>
          <button type="button" className="ga-btn ga-btn-sm" disabled={saving} onClick={() => { setDraft(bio); setEditing(false); }}>Cancel</button>
          <span className="ga-small ga-muted">{draft.length}/600</span>
        </div>
        {error && <p className="ga-note err">{error}</p>}
      </div>
    );
  }
  return (
    <span>
      {bio || '—'}{' '}
      <button type="button" className="ga-link" onClick={() => { setDraft(bio); setEditing(true); }}>Edit</button>
    </span>
  );
};

// Show or hide a booked person in the "On Our Stage" gallery on the Perform pages
const GalleryToggle = ({ p }) => {
  const [hidden, setHidden] = useState(Boolean(p.galleryHidden));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const flip = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await adminApi(`/applications/${p.id}`, { method: 'PATCH', body: { galleryHidden: !hidden } });
      setHidden(Boolean(r.galleryHidden));
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };
  return (
    <>
      {hidden ? 'Hidden' : 'Showing'}{' '}
      <button type="button" className="ga-btn ga-btn-sm" disabled={saving} onClick={flip}>
        {saving ? 'Saving…' : hidden ? 'Show again' : 'Hide'}
      </button>
      {error && <span className="ga-small" style={{ color: '#B3261E' }}> {error}</span>}
    </>
  );
};

const Details = ({ p }) => (
  <div className="ga-detail">
    <dl>
      <dt>{p.role === 'host' ? 'Host name' : 'Stage name'}</dt><dd><NameField p={p} /></dd>
      <dt>Name</dt><dd>{p.name}</dd>
      <dt>Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
      <dt>Phone</dt><dd><a href={`tel:${p.phone}`}>{p.phone}</a></dd>
      {p.genres && (<><dt>{p.role === 'host' ? 'Style' : p.role === 'visual' ? 'Medium' : 'Sound'}</dt><dd>{p.genres}</dd></>)}
      <dt>Bio</dt><dd><BioField p={p} /></dd>
      {p.links?.length > 0 && (
        <><dt>Links</dt><dd>{p.links.map((l) => <div key={l}><a href={l} target="_blank" rel="noreferrer">{l}</a></div>)}</dd></>
      )}
      {(p.instagram || p.tiktok) && (
        <><dt>Socials</dt><dd>{[p.instagram && `IG @${p.instagram}`, p.tiktok && `TikTok @${p.tiktok}`].filter(Boolean).join(' · ')}</dd></>
      )}
      {p.role !== 'host' && (<><dt>{p.role === 'visual' ? 'Bringing' : 'Equipment'}</dt><dd>{p.equipmentNotes || '—'}{p.needsPower ? ' · needs power' : ''}</dd></>)}
      <dt>Payout</dt><dd>{[p.payoutMethod, p.payoutHandle].filter(Boolean).join(': ') || '—'}</dd>
      <dt>On event page</dt><dd>{p.featureConsent ? 'Yes' : 'No (no permission)'}</dd>
      {p.status === 'approved' && p.featureConsent && (
        <><dt>On Our Stage gallery</dt><dd><GalleryToggle p={p} /></dd></>
      )}
      <dt>Applied</dt><dd>{timeAgo(p.createdAt)}{p.eventName ? ` · for ${p.eventName}` : ''}</dd>
    </dl>
  </div>
);

const ApproveDrawer = ({ person, showcases, onClose, onDone }) => {
  // Already booked for a show: this adds another show and keeps that booking
  const current = person.status === 'approved' ? showcases.find((s) => s.id === person.eventId && !s.past) : null;
  const options = showcases.filter((s) => !s.past && s.id !== current?.id);
  const [eventId, setEventId] = useState(
    options.some((s) => s.id === person.eventId) ? person.eventId : options[0]?.id || ''
  );
  const [code, setCode] = useState(person.code || suggestCode(person.artistName));
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const r = await adminApi(`/applications/${person.id}/approve`, { method: 'POST', body: { eventId, code, sendEmail } });
      onDone(`${person.artistName} is booked with code ${r.code}. ${r.emailNote}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="ga-drawer-back" role="dialog" aria-modal="true" aria-labelledby="approve-title" onClick={onClose}>
      <form className="ga-drawer" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="ga-drawer-head">
          <div>
            <p className="ga-kicker">{person.role === 'host' ? 'Book a host' : person.role === 'visual' ? 'Book a live artist' : 'Book an artist'}</p>
            <h2 id="approve-title" className="ga-card-title">{person.artistName}</h2>
          </div>
          <button type="button" className="ga-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="ga-drawer-body">
          {error && <p className="ga-note err">{error}</p>}
          <label className="ga-field">Showcase
            <select className="ga-select" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
              {options.length === 0 && <option value="">No upcoming showcases</option>}
              {options.map((s) => <option key={s.id} value={s.id}>{fmtDay(s.date)} · {s.name}</option>)}
            </select>
          </label>
          <label className="ga-field">Their ticket code
            <input className="ga-input" value={code} maxLength={14}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} required />
            <small>Letters and numbers. Every ticket bought with it counts toward their pay.</small>
          </label>
          <label className="ga-check">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            <span>Email {person.name.split(' ')[0]} their booking details and ticket link</span>
          </label>
          {current && (
            <p className="ga-note info">
              They stay booked for <strong>{current.name}</strong> ({fmtDay(current.date)}). This adds a second booking, and their code works for both shows. Tickets count separately for each show.
            </p>
          )}
          <p className="ga-note info">
            Booking creates their code{person.featureConsent ? ', adds them to the event page' : ''} and
            {sendEmail ? ' sends their booking email.' : " doesn't send an email."}
          </p>
          <Details p={person} />
        </div>
        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ga-btn ga-btn-navy" disabled={saving || !eventId}>
            {saving ? 'Booking…' : `Book ${person.role === 'host' ? 'host' : person.role === 'visual' ? 'live artist' : 'artist'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

// Take someone off a show and save them on the Roster (nothing is deleted)
const RosterDrawer = ({ person, show, onClose, onDone }) => {
  const [note, setNote] = useState('');
  const [cancelLive, setCancelLive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const booked = person.status === 'approved';
  const roleWord = person.role === 'host' ? 'host' : person.role === 'visual' ? 'live artist' : 'artist';

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi(`/applications/${person.id}/roster`, { method: 'POST', body: { note, cancelLive } });
      onDone(`${person.artistName} is saved on the Roster${booked && show ? ` and off ${show.name}` : ''}. Book a new ${roleWord} when you're ready.`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="ga-drawer-back" role="dialog" aria-modal="true" aria-labelledby="roster-title" onClick={onClose}>
      <form className="ga-drawer" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="ga-drawer-head">
          <div>
            <p className="ga-kicker">Save for later</p>
            <h2 id="roster-title" className="ga-card-title">{person.artistName}</h2>
          </div>
          <button type="button" className="ga-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="ga-drawer-body">
          {error && <p className="ga-note err">{error}</p>}
          <p className="ga-note info">
            {booked && show
              ? <>This takes {person.artistName} off <strong>{show.name}</strong> ({fmtDay(show.date)}) and opens the {roleWord} spot. </>
              : <>This moves {person.artistName}'s application out of this show. </>}
            Everything they sent (contact info, bio, photo, payout and signed agreement) stays saved on the Roster so you can book them again. No email is sent.
          </p>
          <label className="ga-field">Note (only you see this)
            <textarea className="ga-textarea" rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Out for surgery. Hosting after the new year." />
          </label>
          {booked && person.code && (
            <p className="ga-small ga-muted">Their ticket code {person.code} will stop working for this show. Tickets already sold stay on record.</p>
          )}
          {person.hasLive && (
            <label className="ga-check">
              <input type="checkbox" checked={cancelLive} onChange={(e) => setCancelLive(e.target.checked)} />
              <span>Take their Live off the schedule too (the details are kept)</span>
            </label>
          )}
        </div>
        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ga-btn ga-btn-navy" disabled={saving}>{saving ? 'Saving…' : 'Move to Roster'}</button>
        </div>
      </form>
    </div>
  );
};

// One person on the Roster: saved for later, or performed before
const RosterRow = ({ p, onBook, busy }) => {
  const [open, setOpen] = useState(false);
  const saved = p.status === 'roster';
  return (
    <div className="ga-person">
      <Avatar p={p} />
      <div style={{ minWidth: 0 }}>
        <div className="ga-row" style={{ gap: 8 }}>
          <span className="ga-person-name">{p.artistName}</span>
          <span className={`ga-pill ${p.role === 'host' ? 'blue' : p.role === 'visual' ? 'green' : 'gold'}`}>{p.role === 'host' ? 'Host' : p.role === 'visual' ? 'Live art' : 'Artist'}</span>
          {p.bookedNext && <span className="ga-pill green">Booked {fmtDate(p.bookedNext.date)}</span>}
        </div>
        <div className="ga-person-sub">
          {saved ? (
            <>
              Saved {timeAgo(p.rosteredAt)}
              {p.history?.length > 0 && <> · was booked for {p.history[p.history.length - 1].eventName}</>}
              {p.rosterNote && <> · <em>{p.rosterNote}</em></>}
            </>
          ) : (
            <>
              {p.shows.length === 1 ? 'Performed' : `Performed ${p.shows.length} times`} · last {fmtDay(p.shows[0].date)}
            </>
          )}
        </div>
      </div>
      <div className="ga-person-actions">
        <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Details'}</button>
        <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => onBook(p)} disabled={busy}>Book for a show</button>
      </div>
      {open && (
        <>
          {!saved && (
            <p className="ga-small ga-muted" style={{ gridColumn: '1 / -1', margin: '6px 0 0' }}>
              Shows: {p.shows.map((s) => `${s.name} (${fmtDate(s.date)})`).join(' · ')}
            </p>
          )}
          <Details p={p} />
        </>
      )}
    </div>
  );
};

const RosterView = ({ roster, onBook, busy }) => {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const match = (p) =>
    (role === 'all' || (p.role || 'artist') === role) &&
    (!q.trim() || [p.artistName, p.name, p.email, p.genres].join(' ').toLowerCase().includes(q.trim().toLowerCase()));
  const saved = (roster?.saved || []).filter(match);
  const past = (roster?.past || []).filter(match);

  return (
    <>
      <div className="ga-row" style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="ga-input" style={{ maxWidth: 280 }} type="search" placeholder="Search name, email, sound…" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Search the roster" />
        <select className="ga-select" style={{ maxWidth: 180 }} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="all">Everyone</option>
          <option value="host">Hosts</option>
          <option value="artist">Artists</option>
          <option value="visual">Live artists</option>
        </select>
      </div>

      <section className="ga-card" style={{ marginBottom: 18 }}>
        <p className="ga-kicker">Saved for later · {saved.length}</p>
        <h2 className="ga-card-title">On the Roster</h2>
        <p className="ga-small ga-muted">People you took off a show or saved for a future date. Everything they sent is kept.</p>
        {saved.length === 0
          ? <p className="ga-small ga-muted">Nobody saved yet. Use "Move to roster" on anyone in an upcoming lineup.</p>
          : saved.map((p) => <RosterRow key={p.id} p={p} onBook={onBook} busy={busy} />)}
      </section>

      <section className="ga-card">
        <p className="ga-kicker">Performed before · {past.length}</p>
        <h2 className="ga-card-title">Past artists, hosts and live artists</h2>
        <p className="ga-small ga-muted">Booking them again makes a new booking, so their past shows stay in their history.</p>
        {past.length === 0
          ? <p className="ga-small ga-muted">No one yet.</p>
          : past.map((p) => <RosterRow key={`${p.id}-past`} p={p} onBook={onBook} busy={busy} />)}
      </section>
    </>
  );
};

const PersonRow = ({ p, show, onApprove, onDecline, onPaid, onRoster, busy }) => {
  const [open, setOpen] = useState(false);
  const booked = p.status === 'approved';
  const holdBy = show ? new Date(new Date(show.date).getTime() - 7 * 86400000) : null;
  const behind = booked && show && !show.past && Date.now() > holdBy - 3 * 86400000 && p.tickets < HOLD_MIN;

  return (
    <div className="ga-person">
      <Avatar p={p} />
      <div style={{ minWidth: 0 }}>
        <div className="ga-row" style={{ gap: 8 }}>
          <span className="ga-person-name">{p.artistName}</span>
          <span className={`ga-pill ${p.role === 'host' ? 'blue' : p.role === 'visual' ? 'green' : 'gold'}`}>{p.role === 'host' ? 'Host' : p.role === 'visual' ? 'Live art' : 'Artist'}</span>
          {!booked && <span className="ga-pill amber">New</span>}
        </div>
        <div className="ga-person-sub">
          {booked ? (
            <>
              <span className="ga-code">{p.code}</span>{' '}
              {p.tickets < 5 ? `${p.tickets} of 5 tickets` : `${p.tickets} tickets ✓`} · ${p.owed} earned
              {behind && <> · <span className="ga-pill amber">Needs {HOLD_MIN} by {fmtDate(holdBy)}</span></>}
            </>
          ) : (
            <>{p.genres || (p.role === 'host' ? 'Host' : p.role === 'visual' ? 'Live artist' : 'Artist')} · applied {timeAgo(p.createdAt)}</>
          )}
        </div>
      </div>
      <div className="ga-person-actions">
        <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Hide' : 'Details'}
        </button>
        {!booked && (
          <>
            <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => onApprove(p)} disabled={busy}>Book</button>
            <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" onClick={() => onDecline(p)} disabled={busy}>Decline</button>
          </>
        )}
        {booked && show && !show.past && (
          <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => onApprove(p)} disabled={busy}
            title="Keep this booking and add them to another showcase">
            Book another show
          </button>
        )}
        {onRoster && !show?.past && (
          <button type="button" className="ga-btn ga-btn-sm" onClick={() => onRoster(p, show)} disabled={busy}
            title="Off this show, but keep everything they sent">
            {booked ? 'Move to roster' : 'Save for later'}
          </button>
        )}
        {booked && show?.past && (
          p.payoutPaidAt ? (
            <>
              <span className="ga-pill green">Paid ${p.payoutAmount} · {fmtDate(p.payoutPaidAt)}</span>
              <button type="button" className="ga-link" onClick={() => onPaid(p, false)} disabled={busy}>Undo</button>
            </>
          ) : p.owed > 0 ? (
            <button type="button" className="ga-btn ga-btn-sm ga-btn-gold" onClick={() => onPaid(p, true)} disabled={busy}>
              Mark ${p.owed} paid
            </button>
          ) : (
            <span className="ga-pill">Nothing owed</span>
          )
        )}
      </div>
      {open && <Details p={p} />}
    </div>
  );
};

const AdminShowcases = () => {
  const [data, setData] = useState(null);
  const [view, setView] = useState('upcoming');
  const [approving, setApproving] = useState(null);
  const [rostering, setRostering] = useState(null); // { person, show }
  const onRoster = (person, show) => setRostering({ person, show });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const load = useCallback(() => {
    adminApi('/showcases').then(setData).catch((e) => setNote({ type: 'err', text: e.message }));
  }, []);
  useEffect(load, [load]);

  const shows = useMemo(() => {
    const list = data?.showcases || [];
    return view === 'upcoming' ? list.filter((s) => !s.past) : list.filter((s) => s.past).reverse();
  }, [data, view]);

  const decline = async (p) => {
    if (!window.confirm(`Decline ${p.artistName}? No email is sent; you can reply to them personally.`)) return;
    setBusy(true);
    try {
      await adminApi(`/applications/${p.id}/decline`, { method: 'POST' });
      setNote({ type: 'ok', text: `${p.artistName} was declined.` });
      load();
    } catch (e) {
      setNote({ type: 'err', text: e.message });
    } finally { setBusy(false); }
  };

  // Remove an empty duplicate showcase (no tickets, nobody booked or applied)
  const removeShow = async (s) => {
    if (!window.confirm(`Remove this copy of "${s.name}" (${fmtDay(s.date)})? It has no tickets and nobody booked. It disappears from the website, the perform page and this list.`)) return;
    setBusy(true);
    try {
      await adminApi(`/showcases/${s.id}/remove`, { method: 'POST' });
      setNote({ type: 'ok', text: `Removed the empty copy of ${s.name}.${s.eventbrite ? ' If it comes back after an Eventbrite sync, delete it in Eventbrite too.' : ''}` });
      load();
    } catch (e) {
      setNote({ type: 'err', text: e.message });
    } finally { setBusy(false); }
  };

  const paid = async (p, isPaid) => {
    setBusy(true);
    try {
      await adminApi(`/applications/${p.id}`, { method: 'PATCH', body: { paid: isPaid, amount: p.owed } });
      setNote({ type: 'ok', text: isPaid ? `Marked $${p.owed} paid to ${p.artistName}.` : 'Payout un-marked.' });
      load();
    } catch (e) {
      setNote({ type: 'err', text: e.message });
    } finally { setBusy(false); }
  };

  if (!data) return note ? <p className={`ga-note ${note.type}`}>{note.text}</p> : <div className="ga-loading">Loading showcases…</div>;

  const unpaid = (data.showcases || []).filter((s) => s.past)
    .flatMap((s) => [...s.artists, ...s.hosts, ...(s.visuals || [])])
    .filter((p) => !p.payoutPaidAt && p.owed > 0);
  const owedTotal = unpaid.reduce((n, p) => n + p.owed, 0);

  return (
    <>
      {note && <p className={`ga-note ${note.type}`} role="status">{note.text}</p>}

      <div className="ga-row" style={{ marginBottom: 16 }}>
        <div className="ga-seg" role="tablist" aria-label="Which showcases">
          <button type="button" className={view === 'upcoming' ? 'on' : ''} onClick={() => setView('upcoming')}>Upcoming</button>
          <button type="button" className={view === 'past' ? 'on' : ''} onClick={() => setView('past')}>
            Past{unpaid.length ? ` · $${owedTotal} to pay` : ''}
          </button>
          <button type="button" className={view === 'roster' ? 'on' : ''} onClick={() => setView('roster')}>
            Roster{data.roster?.saved?.length ? ` · ${data.roster.saved.length} saved` : ''}
          </button>
        </div>
        <span className="ga-spacer" />
        <span className="ga-small ga-muted">Pay: ${data.payPerTicket} a ticket, up to ${data.payCap}</span>
      </div>

      {view === 'roster' && <RosterView roster={data.roster} onBook={setApproving} busy={busy} />}

      {view === 'upcoming' && data.unassigned?.length > 0 && (
        <section className="ga-card" style={{ marginBottom: 18 }}>
          <p className="ga-kicker">New applications</p>
          <h2 className="ga-card-title">Applied for any showcase</h2>
          {data.unassigned.map((p) => (
            <PersonRow key={p.id} p={p} onApprove={setApproving} onDecline={decline} onPaid={paid} onRoster={onRoster} busy={busy} />
          ))}
        </section>
      )}

      {view !== 'roster' && shows.length === 0 && (
        <div className="ga-card ga-empty">
          {view === 'upcoming' ? 'No upcoming showcases. Publish one in Events first.' : 'No past showcases in the last 45 days.'}
        </div>
      )}

      {view !== 'roster' && shows.map((s) => {
        const artistsFull = s.artists.length >= ARTIST_SLOTS;
        const hostFull = s.hosts.length >= 1;
        const visuals = s.visuals || [];
        const visualFull = visuals.length >= 1;
        return (
          <section key={s.id} className="ga-show" aria-label={s.name}>
            <div className="ga-show-head">
              <div className="ga-date-chip" aria-hidden="true">
                <span>{fmtDate(s.date, { month: 'short' })}</span>
                <b>{fmtDate(s.date, { day: 'numeric' })}</b>
              </div>
              <div>
                <h2 className="ga-show-name">{s.name}</h2>
                <div className="ga-show-meta">{fmtDay(s.date)} · {s.sold} tickets sold{s.capacity ? ` of ${s.capacity}` : ''}</div>
              </div>
              <div className="ga-slots">
                <span className={`ga-slot ${artistsFull ? 'full' : ''}`}>Artists {s.artists.length}/{ARTIST_SLOTS}</span>
                <span className={`ga-slot ${hostFull ? 'full' : ''}`}>Host {s.hosts.length}/1</span>
                <span className={`ga-slot ${visualFull ? 'full' : ''}`}>Live art {visuals.length}/1</span>
                {s.removable && view === 'upcoming' && (
                  <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" disabled={busy} onClick={() => removeShow(s)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="ga-show-body">
              <p className="ga-sub-head">Lineup</p>
              {s.hosts.length + s.artists.length + visuals.length === 0 && <p className="ga-small ga-muted">Nobody booked yet.</p>}
              {[...s.hosts, ...s.artists, ...visuals].map((p) => (
                <PersonRow key={p.id} p={p} show={s} onApprove={setApproving} onDecline={decline} onPaid={paid} onRoster={onRoster} busy={busy} />
              ))}
              {s.applicants.length > 0 && (
                <>
                  <p className="ga-sub-head">Applied for this show · {s.applicants.length}</p>
                  {s.applicants.map((p) => (
                    <PersonRow key={p.id} p={p} show={s} onApprove={setApproving} onDecline={decline} onPaid={paid} onRoster={onRoster} busy={busy} />
                  ))}
                </>
              )}
            </div>
          </section>
        );
      })}

      {rostering && (
        <RosterDrawer
          person={rostering.person}
          show={rostering.show}
          onClose={() => setRostering(null)}
          onDone={(text) => { setRostering(null); setNote({ type: 'ok', text }); load(); }}
        />
      )}

      {approving && (
        <ApproveDrawer
          person={approving}
          showcases={data.showcases || []}
          onClose={() => setApproving(null)}
          onDone={(text) => { setApproving(null); setNote({ type: 'ok', text }); load(); }}
        />
      )}
    </>
  );
};

export default AdminShowcases;

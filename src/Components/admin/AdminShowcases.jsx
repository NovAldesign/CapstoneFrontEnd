import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, fmtDate, fmtDay, timeAgo } from '../../Services/adminApi';

// Showcases: lineups, artist + host applications, ticket sales by code, payouts
const ARTIST_SLOTS = 3;
const HOLD_MIN = 3; // tickets needed one week before the show

const suggestCode = (name = '') =>
  (String(name).split(/\s+/)[0] || 'ARTIST').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

const Avatar = ({ p }) =>
  p.headshotUrl ? (
    <img className="ga-avatar" src={p.headshotUrl.replace('/upload/', '/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/')} alt="" />
  ) : (
    <div className="ga-avatar" aria-hidden="true">{p.role === 'host' ? '🎙️' : '🎤'}</div>
  );

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

const Details = ({ p }) => (
  <div className="ga-detail">
    <dl>
      <dt>Name</dt><dd>{p.name}</dd>
      <dt>Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
      <dt>Phone</dt><dd><a href={`tel:${p.phone}`}>{p.phone}</a></dd>
      {p.genres && (<><dt>{p.role === 'host' ? 'Style' : 'Sound'}</dt><dd>{p.genres}</dd></>)}
      <dt>Bio</dt><dd><BioField p={p} /></dd>
      {p.links?.length > 0 && (
        <><dt>Links</dt><dd>{p.links.map((l) => <div key={l}><a href={l} target="_blank" rel="noreferrer">{l}</a></div>)}</dd></>
      )}
      {(p.instagram || p.tiktok) && (
        <><dt>Socials</dt><dd>{[p.instagram && `IG @${p.instagram}`, p.tiktok && `TikTok @${p.tiktok}`].filter(Boolean).join(' · ')}</dd></>
      )}
      {p.role !== 'host' && (<><dt>Equipment</dt><dd>{p.equipmentNotes || '—'}{p.needsPower ? ' · needs power' : ''}</dd></>)}
      <dt>Payout</dt><dd>{[p.payoutMethod, p.payoutHandle].filter(Boolean).join(': ') || '—'}</dd>
      <dt>On event page</dt><dd>{p.featureConsent ? 'Yes' : 'No (no permission)'}</dd>
      <dt>Applied</dt><dd>{timeAgo(p.createdAt)}{p.eventName ? ` · for ${p.eventName}` : ''}</dd>
    </dl>
  </div>
);

const ApproveDrawer = ({ person, showcases, onClose, onDone }) => {
  const options = showcases.filter((s) => !s.past);
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
            <p className="ga-kicker">{person.role === 'host' ? 'Book a host' : 'Book an artist'}</p>
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
          <p className="ga-note info">
            Booking creates their code{person.featureConsent ? ', adds them to the event page' : ''} and
            {sendEmail ? ' sends their booking email.' : " doesn't send an email."}
          </p>
          <Details p={person} />
        </div>
        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ga-btn ga-btn-navy" disabled={saving || !eventId}>
            {saving ? 'Booking…' : `Book ${person.role === 'host' ? 'host' : 'artist'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const PersonRow = ({ p, show, onApprove, onDecline, onPaid, busy }) => {
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
          <span className={`ga-pill ${p.role === 'host' ? 'blue' : 'gold'}`}>{p.role === 'host' ? 'Host' : 'Artist'}</span>
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
            <>{p.genres || (p.role === 'host' ? 'Host' : 'Artist')} · applied {timeAgo(p.createdAt)}</>
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
    .flatMap((s) => [...s.artists, ...s.hosts])
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
        </div>
        <span className="ga-spacer" />
        <span className="ga-small ga-muted">Pay: ${data.payPerTicket} a ticket, up to ${data.payCap}</span>
      </div>

      {view === 'upcoming' && data.unassigned?.length > 0 && (
        <section className="ga-card" style={{ marginBottom: 18 }}>
          <p className="ga-kicker">New applications</p>
          <h2 className="ga-card-title">Applied for any showcase</h2>
          {data.unassigned.map((p) => (
            <PersonRow key={p.id} p={p} onApprove={setApproving} onDecline={decline} onPaid={paid} busy={busy} />
          ))}
        </section>
      )}

      {shows.length === 0 && (
        <div className="ga-card ga-empty">
          {view === 'upcoming' ? 'No upcoming showcases. Publish one in Events first.' : 'No past showcases in the last 45 days.'}
        </div>
      )}

      {shows.map((s) => {
        const artistsFull = s.artists.length >= ARTIST_SLOTS;
        const hostFull = s.hosts.length >= 1;
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
              </div>
            </div>
            <div className="ga-show-body">
              <p className="ga-sub-head">Lineup</p>
              {s.hosts.length + s.artists.length === 0 && <p className="ga-small ga-muted">Nobody booked yet.</p>}
              {[...s.hosts, ...s.artists].map((p) => (
                <PersonRow key={p.id} p={p} show={s} onApprove={setApproving} onDecline={decline} onPaid={paid} busy={busy} />
              ))}
              {s.applicants.length > 0 && (
                <>
                  <p className="ga-sub-head">Applied for this show · {s.applicants.length}</p>
                  {s.applicants.map((p) => (
                    <PersonRow key={p.id} p={p} show={s} onApprove={setApproving} onDecline={decline} onPaid={paid} busy={busy} />
                  ))}
                </>
              )}
            </div>
          </section>
        );
      })}

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

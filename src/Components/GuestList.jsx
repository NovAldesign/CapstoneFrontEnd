import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { guestSourceLine, sourceColor, sourceLabel } from '../Services/ticketSources';
import '../Styles/CheckIn.css';

// One guest list for the door and the dashboard.
// api: { load(refresh), checkIn(key, count), addGuest(body), removeGuest?(id) }
// admin: shows emails, phones, prices, export and remove.

const WALKIN_SOURCES = [
  ['door', 'Paid at the door'], ['posh', 'Posh'], ['eventnoire', 'Eventnoire'], ['meetup', 'Meetup'],
  ['comp', 'Comp (free)'], ['partner', 'Partner'], ['other', 'Other'],
];

const time = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
const money = (c) => `$${((c || 0) / 100).toFixed(2).replace(/\.00$/, '')}`;

const csvDownload = (rows, filename) => {
  if (!rows.length) return;
  const head = Object.keys(rows[0]);
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AddGuest = ({ admin, onAdd, onClose }) => {
  const [f, setF] = useState({ name: '', quantity: 1, source: 'door', phone: '', email: '', amountPaid: '', checkIn: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setError('Add their name.');
    setSaving(true);
    try {
      await onAdd(f);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="gl-sheet-back" role="dialog" aria-modal="true" aria-labelledby="gl-add-title" onClick={onClose}>
      <form className="gl-sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="gl-sheet-head">
          <h2 id="gl-add-title">Add a guest</h2>
          <button type="button" className="gl-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {error && <p className="gl-error" role="alert">{error}</p>}
        <label className="gl-field">Name
          <input value={f.name} onChange={set('name')} autoFocus maxLength={120} autoComplete="off" />
        </label>
        <div className="gl-two">
          <label className="gl-field">Tickets
            <input type="number" min="1" max="20" value={f.quantity} onChange={set('quantity')} inputMode="numeric" />
          </label>
          <label className="gl-field">Where they got their ticket
            <select value={f.source} onChange={set('source')}>
              {WALKIN_SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <div className="gl-two">
          <label className="gl-field">Phone <small>(optional)</small>
            <input type="tel" value={f.phone} onChange={set('phone')} maxLength={30} inputMode="tel" />
          </label>
          <label className="gl-field">Amount paid <small>(optional, $)</small>
            <input type="number" min="0" step="1" value={f.amountPaid} onChange={set('amountPaid')} inputMode="decimal" />
          </label>
        </div>
        {admin && (
          <label className="gl-field">Email <small>(optional)</small>
            <input type="email" value={f.email} onChange={set('email')} maxLength={120} />
          </label>
        )}
        <label className="gl-check">
          <input type="checkbox" checked={f.checkIn} onChange={set('checkIn')} />
          <span>They're here now. Check them in.</span>
        </label>
        <button type="submit" className="gl-btn gl-btn-go gl-wide" disabled={saving}>{saving ? 'Adding…' : 'Add guest'}</button>
      </form>
    </div>
  );
};

const GuestRow = ({ g, admin, busy, onSet, onRemove }) => {
  const [open, setOpen] = useState(false);
  const allIn = g.checkedIn >= g.tickets;
  const some = g.checkedIn > 0 && !allIn;
  return (
    <li className={`gl-row ${allIn ? 'in' : ''} ${some ? 'some' : ''}`}>
      <span className="gl-dot" style={{ background: sourceColor(g.source) }} aria-hidden="true" />
      <button type="button" className="gl-who" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="gl-name">{g.name}</span>
        <span className="gl-meta">
          {g.tickets} {g.tickets === 1 ? 'ticket' : 'tickets'}{g.ticketName ? ` · ${g.ticketName}` : ''} · {guestSourceLine(g)}
        </span>
        {allIn && <span className="gl-meta gl-in-time">✓ In{g.checkedInAt ? ` at ${time(g.checkedInAt)}` : ''}</span>}
      </button>
      <div className="gl-actions">
        {g.tickets > 1 ? (
          <div className="gl-stepper" aria-label={`${g.checkedIn} of ${g.tickets} checked in`}>
            <button type="button" className="gl-step" disabled={busy || g.checkedIn === 0} onClick={() => onSet(g, g.checkedIn - 1)} aria-label="One less">−</button>
            <span className="gl-count"><b>{g.checkedIn}</b>/{g.tickets}</span>
            <button type="button" className="gl-step gl-step-go" disabled={busy || allIn} onClick={() => onSet(g, g.checkedIn + 1)} aria-label="Check in one more">+</button>
            {!allIn && <button type="button" className="gl-btn gl-btn-go gl-btn-sm" disabled={busy} onClick={() => onSet(g, g.tickets)}>All</button>}
          </div>
        ) : allIn ? (
          <button type="button" className="gl-btn gl-btn-undo" disabled={busy} onClick={() => onSet(g, 0)}>Undo</button>
        ) : (
          <button type="button" className="gl-btn gl-btn-go" disabled={busy} onClick={() => onSet(g, 1)}>Check in</button>
        )}
      </div>
      {open && (
        <div className="gl-detail">
          {g.confirmation && <div><span>Confirmation</span>{g.confirmation}</div>}
          <div><span>Bought on</span>{guestSourceLine(g)}</div>
          {admin && g.email && <div><span>Email</span><a href={`mailto:${g.email}`}>{g.email}</a></div>}
          {admin && g.phone && <div><span>Phone</span><a href={`tel:${g.phone}`}>{g.phone}</a></div>}
          {admin && <div><span>Paid</span>{money(g.paidCents)}</div>}
          {g.notes && <div><span>Notes</span>{g.notes}</div>}
          {admin && g.manual && onRemove && (
            <button type="button" className="gl-link-danger" onClick={() => onRemove(g)}>Remove this guest</button>
          )}
        </div>
      )}
    </li>
  );
};

const GuestList = ({ api, admin = false, title, doorUrl }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('waiting');
  const [busyKey, setBusyKey] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const pending = useRef(0);

  const load = useCallback(async (refresh = false) => {
    try {
      const d = await api.load(refresh);
      if (pending.current === 0) setData(d); // don't overwrite a check-in in flight
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);
  // Keep every phone at the door in sync
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 20000);
    return () => clearInterval(t);
  }, [load]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const setCount = async (g, count) => {
    const before = g.checkedIn;
    pending.current += 1;
    setBusyKey(g.key);
    setData((d) => ({
      ...d,
      guests: d.guests.map((x) => (x.key === g.key ? { ...x, checkedIn: count, checkedInAt: count ? new Date().toISOString() : null } : x)),
      totals: { ...d.totals, checkedIn: d.totals.checkedIn + (count - before) },
    }));
    try {
      await api.checkIn(g.key, count);
      if (count > before) flash(`${g.name.split(' ')[0]} is checked in${g.tickets > 1 ? ` (${count}/${g.tickets})` : ''}`);
    } catch (e) {
      setData((d) => ({
        ...d,
        guests: d.guests.map((x) => (x.key === g.key ? { ...x, checkedIn: before } : x)),
        totals: { ...d.totals, checkedIn: d.totals.checkedIn - (count - before) },
      }));
      setError(e.message);
    } finally {
      pending.current -= 1;
      setBusyKey('');
    }
  };

  const shown = useMemo(() => {
    const list = data?.guests || [];
    const q = search.trim().toLowerCase();
    return list.filter((g) => {
      if (q) return `${g.name} ${g.confirmation} ${g.email || ''} ${g.code}`.toLowerCase().includes(q);
      if (filter === 'waiting') return g.checkedIn < g.tickets;
      if (filter === 'here') return g.checkedIn > 0;
      return true;
    });
  }, [data, search, filter]);

  if (!data) {
    return (
      <div className="gl-wrap">
        {error ? <p className="gl-error" role="alert">{error}</p> : <div className="gl-loading">Loading the guest list…</div>}
      </div>
    );
  }

  const { totals, event, eventbrite } = data;
  const pct = totals.tickets ? Math.round((totals.checkedIn / totals.tickets) * 100) : 0;
  const waiting = data.guests.filter((g) => g.checkedIn < g.tickets).length;
  const here = data.guests.filter((g) => g.checkedIn > 0).length;

  const exportCSV = () => csvDownload(data.guests.map((g) => ({
    Name: g.name, Email: g.email || '', Phone: g.phone || '', Tickets: g.tickets, 'Checked in': g.checkedIn,
    Ticket: g.ticketName, 'Bought on': guestSourceLine(g), Paid: money(g.paidCents), Confirmation: g.confirmation,
  })), `${(event.name || 'guests').replace(/[^a-z0-9]+/gi, '-').slice(0, 50)}-guest-list.csv`);

  const copyDoor = async () => {
    try { await navigator.clipboard.writeText(doorUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.prompt('Copy this door link:', doorUrl); }
  };

  return (
    <div className={`gl-wrap${admin ? " gl-admin" : ""}`}>
      <header className="gl-head">
        <p className="gl-kicker">{title || 'Check-in'}</p>
        <h1 className="gl-title">{event.name}</h1>
        <p className="gl-sub">
          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {event.location ? ` · ${event.location}` : ''}
        </p>

        <div className="gl-progress" aria-label={`${totals.checkedIn} of ${totals.tickets} checked in`}>
          <div className="gl-progress-num"><b>{totals.checkedIn}</b> of {totals.tickets} here</div>
          <div className="gl-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="gl-sources">
          {Object.entries(totals.bySource).sort((a, b) => b[1].tickets - a[1].tickets).map(([s, v]) => (
            <span key={s} className="gl-chip"><i style={{ background: sourceColor(s) }} />{sourceLabel(s)} {v.checkedIn}/{v.tickets}</span>
          ))}
        </div>

        {admin && (
          <div className="gl-tools">
            {doorUrl && <button type="button" className="gl-btn gl-btn-ghost" onClick={copyDoor}>{copied ? '✓ Door link copied' : '🔗 Copy door link'}</button>}
            {doorUrl && <a className="gl-btn gl-btn-ghost" href={doorUrl} target="_blank" rel="noreferrer">Open door view</a>}
            <button type="button" className="gl-btn gl-btn-gold" onClick={() => setAdding(true)}>＋ Add guest</button>
            <button type="button" className="gl-btn gl-btn-ghost" onClick={exportCSV}>↓ CSV</button>
            <button type="button" className="gl-btn gl-btn-ghost" onClick={() => load(true)}>↻ Refresh</button>
          </div>
        )}
        {eventbrite?.connected && !eventbrite.ok && <p className="gl-warn">{eventbrite.error}</p>}
      </header>

      <div className="gl-bar-sticky">
        <input
          className="gl-search"
          type="search"
          placeholder="Search name or confirmation #"
          aria-label="Search guests"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="gl-filter" role="tablist" aria-label="Show">
          <button type="button" className={filter === 'waiting' ? 'on' : ''} onClick={() => setFilter('waiting')}>Not here · {waiting}</button>
          <button type="button" className={filter === 'here' ? 'on' : ''} onClick={() => setFilter('here')}>Here · {here}</button>
          <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All · {data.guests.length}</button>
        </div>
      </div>

      {error && <p className="gl-error" role="alert">{error}</p>}

      {shown.length === 0 ? (
        <div className="gl-empty">
          {search ? `No one named “${search}”. Add them as a walk-in?` : filter === 'waiting' ? 'Everyone is checked in. 🎉' : 'No guests yet.'}
        </div>
      ) : (
        <ul className="gl-list">
          {shown.map((g) => (
            <GuestRow key={g.key} g={g} admin={admin} busy={busyKey === g.key} onSet={setCount}
              onRemove={api.removeGuest ? async (x) => {
                if (!window.confirm(`Remove ${x.name} from this guest list?`)) return;
                try { await api.removeGuest(x.id); load(); } catch (e) { setError(e.message); }
              } : null} />
          ))}
        </ul>
      )}

      {!admin && <button type="button" className="gl-fab" onClick={() => setAdding(true)}>＋ Walk-in / add guest</button>}
      {adding && (
        <AddGuest admin={admin} onClose={() => setAdding(false)}
          onAdd={async (body) => { await api.addGuest(body); flash(`${body.name.split(' ')[0]} added`); await load(); }} />
      )}
      {toast && <div className="gl-toast" role="status">{toast}</div>}
    </div>
  );
};

export default GuestList;

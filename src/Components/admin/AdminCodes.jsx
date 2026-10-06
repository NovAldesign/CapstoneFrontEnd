import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, fmtDate, fmtDay, timeAgo } from '../../Services/adminApi';

// Discount Codes: create, edit, pause. No coding needed.
const KINDS = [
  { id: 'amount', label: '$ off' },
  { id: 'percent', label: '% off' },
  { id: 'free', label: 'Free ticket' },
  { id: 'tracking', label: 'Track only' },
];

const kindOf = (c) => (c.type === 'percent' && c.value >= 100 ? 'free' : c.type);

const BLANK = {
  code: '', label: '', kind: 'amount', value: 5, oncePerOrder: true, firstTimeOnly: false,
  maxUses: '', allEvents: true, eventIds: [], expires: '', active: true, notes: '',
};

const toForm = (c) => ({
  code: c.code, label: c.label, kind: kindOf(c), value: c.value, oncePerOrder: c.oncePerOrder,
  firstTimeOnly: c.firstTimeOnly, maxUses: c.maxUses || '', allEvents: !c.eventIds.length && !c.events.length,
  eventIds: c.eventIds, expires: c.expires || '', active: c.active, notes: c.notes || '',
});

const toBody = (f) => {
  const free = f.kind === 'free';
  return {
    label: f.label,
    type: free ? 'percent' : f.kind,
    value: free ? 100 : f.kind === 'tracking' ? 0 : Number(f.value) || 0,
    oncePerOrder: free ? true : f.oncePerOrder,
    firstTimeOnly: f.firstTimeOnly,
    maxUses: Number(f.maxUses) || 0,
    eventIds: f.allEvents ? [] : f.eventIds,
    expires: f.expires || '',
    active: f.active,
    notes: f.notes,
  };
};

const worksFor = (c, eventsById) => {
  if (c.eventIds.length) {
    const names = c.eventIds.map((id) => eventsById[id]).filter(Boolean);
    if (names.length === 1) return names[0];
    return `${c.eventIds.length} events`;
  }
  if (c.events.length) return `Events with “${c.events.join('”, “')}”`;
  if (c.eventsOnOrBefore) return `Events through ${fmtDate(c.eventsOnOrBefore + 'T12:00:00')}`;
  return 'All events';
};

const status = (c) => {
  if (!c.active) return { text: 'Paused', cls: '' };
  if (!c.live) return { text: 'Ended', cls: 'red' };
  if (c.maxUses && c.orders >= c.maxUses) return { text: 'Used up', cls: 'amber' };
  return { text: 'Active', cls: 'green' };
};

const CodeDrawer = ({ editing, events, onClose, onSaved }) => {
  const [f, setF] = useState(() => {
    if (!editing) return BLANK;
    const form = toForm(editing);
    // Older codes match events by a word in the name; pre-check those events
    if (!form.allEvents && !form.eventIds.length && editing.events.length) {
      form.eventIds = events
        .filter((ev) => editing.events.some((w) => String(ev.name || '').toLowerCase().includes(String(w).toLowerCase())))
        .map((ev) => String(ev._id));
    }
    return form;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const upcoming = events.filter((ev) => new Date(ev.date) >= new Date(Date.now() - 86400000));

  const toggleEvent = (id) =>
    setF((p) => ({ ...p, eventIds: p.eventIds.includes(id) ? p.eventIds.filter((x) => x !== id) : [...p.eventIds, id] }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!f.allEvents && !f.eventIds.length) return setError('Pick at least one event, or choose All events.');
    setSaving(true);
    try {
      const body = toBody(f);
      const r = editing
        ? await adminApi(`/codes/${editing.code}`, { method: 'PATCH', body })
        : await adminApi('/codes', { method: 'POST', body: { ...body, code: f.code } });
      onSaved(r.code, editing ? 'saved' : 'created');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const preview = (() => {
    if (f.kind === 'tracking') return 'Counts sales. No discount.';
    if (f.kind === 'free') return '1 free ticket per order';
    const amt = f.kind === 'percent' ? `${f.value || 0}% off` : `$${f.value || 0} off`;
    return `${amt} ${f.oncePerOrder ? 'one ticket' : 'every ticket'}${f.firstTimeOnly ? ', first-time buyers only' : ''}`;
  })();

  return (
    <div className="ga-drawer-back" role="dialog" aria-modal="true" aria-labelledby="code-title" onClick={onClose}>
      <form className="ga-drawer" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <div className="ga-drawer-head">
          <div>
            <p className="ga-kicker">{editing ? 'Edit code' : 'New code'}</p>
            <h2 id="code-title" className="ga-card-title">{editing ? editing.code : 'Create a discount code'}</h2>
          </div>
          <button type="button" className="ga-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="ga-drawer-body">
          {error && <p className="ga-note err">{error}</p>}
          {!editing && (
            <label className="ga-field">Code
              <input className="ga-input" value={f.code} maxLength={20} placeholder="e.g. FALL5" autoFocus required
                onChange={(e) => setF((p) => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))} />
              <small>What people type at checkout. Letters and numbers, no spaces.</small>
            </label>
          )}
          <label className="ga-field">Who it's for <small>(shows in your sale alerts)</small>
            <input className="ga-input" value={f.label} onChange={set('label')} maxLength={120} placeholder="e.g. Welcome email, $5 off Game Night" />
          </label>

          <div className="ga-field">What it does
            <div className="ga-seg" role="radiogroup" aria-label="Discount type">
              {KINDS.map((k) => (
                <button key={k.id} type="button" role="radio" aria-checked={f.kind === k.id}
                  className={f.kind === k.id ? 'on' : ''} onClick={() => setF((p) => ({ ...p, kind: k.id }))}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {(f.kind === 'amount' || f.kind === 'percent') && (
            <div className="ga-form-grid">
              <label className="ga-field">{f.kind === 'amount' ? 'Dollars off' : 'Percent off'}
                <input className="ga-input" type="number" min="1" max={f.kind === 'percent' ? 99 : 500} step="1" value={f.value} onChange={set('value')} required />
              </label>
              <label className="ga-check" style={{ alignSelf: 'end', paddingBottom: 10 }}>
                <input type="checkbox" checked={f.oncePerOrder} onChange={set('oncePerOrder')} />
                <span>Only one ticket per order</span>
              </label>
            </div>
          )}

          <p className="ga-note info" style={{ margin: 0 }}>{preview}</p>

          <div className="ga-field">Works for
            <div className="ga-seg">
              <button type="button" className={f.allEvents ? 'on' : ''} onClick={() => setF((p) => ({ ...p, allEvents: true }))}>All events</button>
              <button type="button" className={!f.allEvents ? 'on' : ''} onClick={() => setF((p) => ({ ...p, allEvents: false }))}>Pick events</button>
            </div>
            {!f.allEvents && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, maxHeight: 220, overflowY: 'auto' }}>
                {upcoming.length === 0 && <span className="ga-small ga-muted">No upcoming events.</span>}
                {upcoming.map((ev) => (
                  <label key={ev._id} className="ga-check">
                    <input type="checkbox" checked={f.eventIds.includes(String(ev._id))} onChange={() => toggleEvent(String(ev._id))} />
                    <span>{fmtDay(ev.date)} · {ev.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="ga-form-grid">
            <label className="ga-field">Last day it works <small>(optional)</small>
              <input className="ga-input" type="date" value={f.expires} onChange={set('expires')} />
            </label>
            <label className="ga-field">Use limit <small>(orders, blank = no limit)</small>
              <input className="ga-input" type="number" min="0" step="1" value={f.maxUses} onChange={set('maxUses')} placeholder="No limit" />
            </label>
          </div>

          <label className="ga-check">
            <input type="checkbox" checked={f.firstTimeOnly} onChange={set('firstTimeOnly')} />
            <span>First-time buyers only <small className="ga-muted">(checkout asks for their email and checks it)</small></span>
          </label>
          <label className="ga-check">
            <input type="checkbox" checked={f.active} onChange={set('active')} />
            <span>Code is on</span>
          </label>
          <label className="ga-field">Private notes <small>(optional)</small>
            <textarea className="ga-textarea" value={f.notes} onChange={set('notes')} maxLength={500} />
          </label>
        </div>
        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ga-btn ga-btn-navy" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create code'}</button>
        </div>
      </form>
    </div>
  );
};

const AdminCodes = ({ events = [] }) => {
  const [codes, setCodes] = useState(null);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null); // { editing } or {}
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    adminApi('/codes').then((d) => setCodes(d.codes)).catch((e) => setNote({ type: 'err', text: e.message }));
  }, []);
  useEffect(load, [load]);

  const eventsById = useMemo(() => Object.fromEntries(events.map((e) => [String(e._id), e.name])), [events]);

  const shown = useMemo(() => (codes || []).filter((c) => {
    const s = status(c).text;
    if (filter === 'active' && s !== 'Active') return false;
    if (filter === 'off' && s === 'Active') return false;
    if (filter === 'artist' && c.source !== 'artist') return false;
    const q = search.trim().toLowerCase();
    return !q || `${c.code} ${c.label} ${c.notes}`.toLowerCase().includes(q);
  }), [codes, filter, search]);

  const toggle = async (c) => {
    setBusy(c.code);
    try {
      await adminApi(`/codes/${c.code}`, { method: 'PATCH', body: { active: !c.active } });
      setNote({ type: 'ok', text: `${c.code} is ${c.active ? 'paused' : 'back on'}.` });
      load();
    } catch (e) { setNote({ type: 'err', text: e.message }); }
    finally { setBusy(''); }
  };

  const takeOver = async (c) => {
    setBusy(c.code);
    try {
      await adminApi(`/codes/${c.code}/take-over`, { method: 'POST' });
      setNote({ type: 'ok', text: `${c.code} is now managed here. You can edit or pause it.` });
      load();
    } catch (e) { setNote({ type: 'err', text: e.message }); }
    finally { setBusy(''); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.code}? This can't be undone.`)) return;
    setBusy(c.code);
    try {
      await adminApi(`/codes/${c.code}`, { method: 'DELETE' });
      setNote({ type: 'ok', text: `${c.code} was deleted.` });
      load();
    } catch (e) { setNote({ type: 'err', text: e.message }); }
    finally { setBusy(''); }
  };

  const counts = useMemo(() => {
    const list = codes || [];
    return {
      active: list.filter((c) => status(c).text === 'Active').length,
      off: list.filter((c) => status(c).text !== 'Active').length,
      artist: list.filter((c) => c.source === 'artist').length,
      all: list.length,
    };
  }, [codes]);

  return (
    <>
      {note && <p className={`ga-note ${note.type}`} role="status">{note.text}</p>}
      <div className="ga-card">
        <div className="ga-card-head">
          <div className="ga-seg" role="tablist" aria-label="Filter codes">
            {[['active', 'Active'], ['off', 'Paused & ended'], ['artist', 'Artist & host'], ['all', 'All']].map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
                {label} · {counts[id]}
              </button>
            ))}
          </div>
          <div className="ga-row">
            <input className="ga-input" style={{ width: 200 }} placeholder="Search codes" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search codes" />
            <button type="button" className="ga-btn ga-btn-gold" onClick={() => setDrawer({})}>＋ New code</button>
          </div>
        </div>

        {!codes ? <div className="ga-loading">Loading codes…</div> : shown.length === 0 ? (
          <div className="ga-empty">No codes here yet.</div>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead>
                <tr><th>Code</th><th>What it does</th><th>Works for</th><th>Ends</th><th className="ga-num">Used</th><th>Status</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const st = status(c);
                  return (
                    <tr key={c.code} className={st.text === 'Active' ? '' : 'ga-off'}>
                      <td>
                        <span className="ga-code">{c.code}</span>
                        <div className="ga-small ga-muted" style={{ marginTop: 4 }}>{c.label}</div>
                        {c.builtIn && <span className="ga-pill" style={{ marginTop: 4 }}>Built-in</span>}
                        {c.source === 'artist' && <span className="ga-pill gold" style={{ marginTop: 4 }}>Artist/host</span>}
                      </td>
                      <td>{c.type === 'tracking' ? 'Tracks sales (no discount)' : c.description}</td>
                      <td className="ga-small">{worksFor(c, eventsById)}</td>
                      <td className="ga-small">{c.expires ? fmtDate(c.expires + 'T12:00:00') : '—'}</td>
                      <td className="ga-num">
                        {c.orders}{c.maxUses ? ` / ${c.maxUses}` : ''}
                        <div className="ga-small ga-muted">{c.tickets} tickets{c.lastUsed ? ` · ${timeAgo(c.lastUsed)}` : ''}</div>
                      </td>
                      <td><span className={`ga-pill ${st.cls}`}>{st.text}</span></td>
                      <td>
                        <div className="ga-row" style={{ justifyContent: 'flex-end', gap: 6, flexWrap: 'nowrap' }}>
                          {c.builtIn ? (
                            <button type="button" className="ga-btn ga-btn-sm" onClick={() => takeOver(c)} disabled={busy === c.code}>Manage here</button>
                          ) : (
                            <>
                              <button type="button" className="ga-btn ga-btn-sm" onClick={() => toggle(c)} disabled={busy === c.code}>{c.active ? 'Pause' : 'Turn on'}</button>
                              <button type="button" className="ga-btn ga-btn-sm" onClick={() => setDrawer({ editing: c })}>Edit</button>
                              {c.orders === 0 && <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" onClick={() => remove(c)} disabled={busy === c.code}>Delete</button>}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="ga-small ga-muted" style={{ marginTop: 12 }}>
          “Used” counts paid website orders. Built-in codes live in the website's code; choose “Manage here” to edit or pause one from the dashboard.
        </p>
      </div>

      {drawer && (
        <CodeDrawer
          editing={drawer.editing}
          events={events}
          onClose={() => setDrawer(null)}
          onSaved={(c, how) => { setDrawer(null); setNote({ type: 'ok', text: `${c.code} ${how}. ${c.description}.` }); load(); }}
        />
      )}
    </>
  );
};

export default AdminCodes;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, downloadCSV, fmtDate, timeAgo } from '../../Services/adminApi';

// People (CRM): everyone who has bought a ticket, been on a guest list, subscribed,
// joined, applied or written in. One row per email, with your own notes, tags,
// details and an "Added to Brevo" checkbox.

const DETAIL_FIELDS = [
  ['nickname', 'Nickname', 'What they like to be called'],
  ['birthday', 'Birthday', 'e.g. Oct 17'],
  ['howWeMet', 'How we met', 'e.g. Karaoke Bingo, came solo'],
  ['referredBy', 'Referred by', 'Who brought them'],
  ['favoriteGame', 'Favorite game', 'e.g. Spades'],
  ['sideOfTown', 'Side of town', 'e.g. Decatur'],
  ['interests', 'Interests', 'Anything to remember'],
];

const firstLast = (name = '') => {
  const parts = String(name).trim().split(/\s+/);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') };
};

const PersonDrawer = ({ person, allTags, onClose, onSaved }) => {
  const [form, setForm] = useState(() => Object.fromEntries(DETAIL_FIELDS.map(([k]) => [k, person[k] || ''])));
  const [tags, setTags] = useState((person.tags || []).join(', '));
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(person.notes || []);
  const [brevo, setBrevo] = useState(Boolean(person.addedToBrevo));
  const [brevoAt, setBrevoAt] = useState(person.addedToBrevoAt);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async (extra = {}) => {
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        ...form,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        ...extra,
      };
      const r = await adminApi(`/crm/people/${encodeURIComponent(person.email)}`, { method: 'PATCH', body });
      setNotes(r.notes);
      setBrevo(r.addedToBrevo);
      setBrevoAt(r.addedToBrevoAt);
      setTags((r.tags || []).join(', '));
      onSaved({ ...person, ...r });
      setMsg({ type: 'ok', text: 'Saved.' });
      return true;
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    if (await save({ addNote: note.trim() })) setNote('');
  };

  const toggleBrevo = () => save({ addedToBrevo: !brevo });
  const removeNote = (id) => { if (window.confirm('Delete this note?')) save({ removeNote: id }); };
  const addTag = (t) => {
    const list = tags.split(',').map((x) => x.trim()).filter(Boolean);
    if (!list.includes(t)) setTags([...list, t].join(', '));
  };

  return (
    <div className="ga-drawer-back" role="dialog" aria-modal="true" aria-labelledby="person-title" onClick={onClose}>
      <div className="ga-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ga-drawer-head">
          <div>
            <p className="ga-kicker">{person.sources.join(' · ')}</p>
            <h2 id="person-title" className="ga-card-title">{person.name}{form.nickname ? ` (“${form.nickname}”)` : ''}</h2>
            <p className="ga-small">
              <a href={`mailto:${person.email}`}>{person.email}</a>
              {person.phone && <> · <a href={`tel:${person.phone}`}>{person.phone}</a></>}
            </p>
          </div>
          <button type="button" className="ga-x" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="ga-drawer-body">
          {msg && <p className={`ga-note ${msg.type}`}>{msg.text}</p>}

          <label className="ga-check">
            <input type="checkbox" checked={brevo} disabled={saving} onChange={toggleBrevo} />
            <span>
              Added to Brevo
              {brevo && brevoAt && <span className="ga-muted"> · {fmtDate(brevoAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </span>
          </label>

          <h3 className="ga-sub-head">Notes</h3>
          <textarea className="ga-textarea" rows={3} maxLength={1000} placeholder="Something to remember about them…"
            value={note} onChange={(e) => setNote(e.target.value)} aria-label="New note" />
          <div className="ga-row" style={{ gap: 6, marginTop: 6 }}>
            <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={saving || !note.trim()} onClick={addNote}>Add note</button>
          </div>
          {notes.length > 0 && (
            <ul className="ga-feed" style={{ marginTop: 12 }}>
              {notes.map((n) => (
                <li key={n.id} className="ga-feed-item">
                  <div className="ga-feed-body">
                    <div className="ga-feed-detail" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
                    <div className="ga-feed-time">
                      {fmtDate(n.at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}<button type="button" className="ga-link" onClick={() => removeNote(n.id)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="ga-sub-head">Details</h3>
          {person.memberBirthday && !form.birthday && (
            <p className="ga-small ga-muted">Birthday from their membership: {person.memberBirthday}</p>
          )}
          <div className="ga-form-grid">
            {DETAIL_FIELDS.map(([k, label, ph]) => (
              <label key={k} className={`ga-field ${k === 'interests' ? 'ga-span-2' : ''}`}>{label}
                <input className="ga-input" value={form[k]} placeholder={ph}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
              </label>
            ))}
            <label className="ga-field ga-span-2">Tags
              <input className="ga-input" value={tags} placeholder="regular, vip, volunteer" onChange={(e) => setTags(e.target.value)} />
              <small>Separate with commas.</small>
            </label>
          </div>
          {allTags.length > 0 && (
            <div className="ga-row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {allTags.map((t) => (
                <button key={t} type="button" className="ga-pill" style={{ border: 0, cursor: 'pointer' }} onClick={() => addTag(t)}>+ {t}</button>
              ))}
            </div>
          )}

          <h3 className="ga-sub-head">Events ({person.events.length})</h3>
          {person.events.length === 0 ? (
            <p className="ga-small ga-muted">No GFC tickets or guest list spots on the website yet. Eventbrite, Posh and Meetup tickets don't show here.</p>
          ) : (
            <ul className="ga-small" style={{ paddingLeft: 18, margin: 0 }}>
              {person.events.map((e) => (
                <li key={e.id}>
                  {e.date ? fmtDate(e.date, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} · {e.name || 'Event'}
                  <span className="ga-muted"> · {e.how}{e.checkedIn ? ' · checked in' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Close</button>
          <button type="button" className="ga-btn ga-btn-navy" disabled={saving} onClick={() => save()}>{saving ? 'Saving…' : 'Save details'}</button>
        </div>
      </div>
    </div>
  );
};

const AdminPeople = () => {
  const [people, setPeople] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all'); // all | todo | done
  const [tag, setTag] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const load = useCallback(() => {
    adminApi('/crm/people')
      .then((d) => { setPeople(d.people); setAllTags(d.tags); })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (people || []).filter((p) => {
      if (view === 'todo' && p.addedToBrevo) return false;
      if (view === 'done' && !p.addedToBrevo) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return `${p.name} ${p.nickname} ${p.email} ${p.phone} ${p.tags.join(' ')} ${p.howWeMet} ${p.sideOfTown}`.toLowerCase().includes(q);
    });
  }, [people, search, view, tag]);

  const updateOne = (next) => {
    setPeople((list) => list.map((p) => (p.email === next.email ? { ...p, ...next } : p)));
    setAllTags((t) => [...new Set([...t, ...(next.tags || [])])].sort());
  };

  const togglePick = (email) => setPicked((s) => {
    const n = new Set(s);
    if (n.has(email)) n.delete(email); else n.add(email);
    return n;
  });
  const allPicked = shown.length > 0 && shown.every((p) => picked.has(p.email));
  const pickAll = () => setPicked(allPicked ? new Set() : new Set(shown.map((p) => p.email)));

  const markBrevo = async (added) => {
    const emails = [...picked];
    if (!emails.length) return;
    setBusy(true);
    setNote(null);
    try {
      await adminApi('/crm/brevo', { method: 'POST', body: { emails, added } });
      const now = new Date().toISOString();
      setPeople((list) => list.map((p) => (picked.has(p.email)
        ? { ...p, addedToBrevo: added, addedToBrevoAt: added ? (p.addedToBrevoAt || now) : null }
        : p)));
      setNote({ type: 'ok', text: `${emails.length} ${emails.length === 1 ? 'person' : 'people'} marked ${added ? 'added to' : 'not in'} Brevo.` });
      setPicked(new Set());
    } catch (e) {
      setNote({ type: 'err', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  // Brevo import file for everyone not in Brevo yet (within the current search/tag)
  const exportTodo = () => {
    const rows = shown.filter((p) => !p.addedToBrevo).map((p) => {
      const { first, last } = firstLast(p.name);
      return { EMAIL: p.email, FIRSTNAME: first, LASTNAME: last, SMS: p.phone || '' };
    });
    downloadCSV(rows, `brevo-new-people-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (!people) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading people…</div>;

  const todoCount = people.filter((p) => !p.addedToBrevo).length;
  const notedCount = people.filter((p) => p.notes.length || p.tags.length).length;

  return (
    <>
      <div className="ga-stats">
        <div className="ga-stat"><div className="ga-stat-num">{people.length}</div><div className="ga-stat-label">People</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{todoCount}</div><div className="ga-stat-label">Not in Brevo yet</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{notedCount}</div><div className="ga-stat-label">With notes or tags</div></div>
      </div>

      <div className="ga-card">
        <div className="ga-card-head" style={{ flexWrap: 'wrap', gap: 8 }}>
          <input className="ga-input" style={{ maxWidth: 240 }} placeholder="Search name, email, tag…" aria-label="Search people"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="ga-seg" role="tablist" aria-label="Brevo filter">
            {[['all', 'Everyone'], ['todo', 'Not in Brevo yet'], ['done', 'In Brevo']].map(([id, label]) => (
              <button key={id} type="button" className={view === id ? 'on' : ''} onClick={() => setView(id)}>{label}</button>
            ))}
          </div>
          {allTags.length > 0 && (
            <select className="ga-select" style={{ maxWidth: 170 }} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by tag">
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <span className="ga-spacer" />
          <button type="button" className="ga-btn ga-btn-gold" onClick={exportTodo} disabled={!shown.some((p) => !p.addedToBrevo)}>
            ↓ Brevo import file ({shown.filter((p) => !p.addedToBrevo).length})
          </button>
        </div>

        {picked.size > 0 && (
          <div className="ga-row" style={{ gap: 8, margin: '4px 0 10px', flexWrap: 'wrap' }}>
            <strong className="ga-small">{picked.size} selected</strong>
            <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={busy} onClick={() => markBrevo(true)}>✓ Mark added to Brevo</button>
            <button type="button" className="ga-btn ga-btn-sm" disabled={busy} onClick={() => markBrevo(false)}>Mark not in Brevo</button>
            <button type="button" className="ga-link" onClick={() => setPicked(new Set())}>Clear</button>
          </div>
        )}
        {note && <p className={`ga-note ${note.type}`}>{note.text}</p>}

        <p className="ga-small ga-muted" style={{ marginTop: -4 }}>
          Download the Brevo file, import it in Brevo (Contacts → Import contacts), then select those people here and click “Mark added to Brevo.” Click anyone to add notes.
        </p>

        {shown.length === 0 ? (
          <p className="ga-small ga-muted">Nobody matches.</p>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}><input type="checkbox" checked={allPicked} onChange={pickAll} aria-label="Select everyone shown" /></th>
                  <th>Name</th><th>Where from</th><th>Events</th><th>Tags & notes</th><th>Brevo</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.email}>
                    <td><input type="checkbox" checked={picked.has(p.email)} onChange={() => togglePick(p.email)} aria-label={`Select ${p.name}`} /></td>
                    <td>
                      <button type="button" className="ga-link" style={{ fontWeight: 700, textAlign: 'left' }} onClick={() => setOpen(p)}>
                        {p.name}{p.nickname ? ` (“${p.nickname}”)` : ''}
                      </button>
                      <div className="ga-small">{p.email}</div>
                      {p.phone && <div className="ga-small ga-muted">{p.phone}</div>}
                    </td>
                    <td className="ga-small">{p.sources.join(', ')}<div className="ga-muted">{timeAgo(p.lastSeen)}</div></td>
                    <td className="ga-small">
                      {p.eventCount || '—'}
                      {p.lastEvent && <div className="ga-muted">Last: {fmtDate(p.lastEvent.date)} · {p.lastEvent.name}</div>}
                    </td>
                    <td className="ga-small">
                      {p.tags.map((t) => <span key={t} className="ga-pill gold" style={{ marginRight: 4 }}>{t}</span>)}
                      {p.notes[0] && <div className="ga-muted" style={{ marginTop: 4 }}>“{p.notes[0].text.slice(0, 70)}{p.notes[0].text.length > 70 ? '…' : ''}”</div>}
                      {!p.tags.length && !p.notes.length && <span className="ga-muted">—</span>}
                    </td>
                    <td className="ga-small">
                      {p.addedToBrevo
                        ? <span className="ga-pill green">✓ Added{p.addedToBrevoAt ? ` ${fmtDate(p.addedToBrevoAt)}` : ''}</span>
                        : <span className="ga-pill amber">Not yet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <PersonDrawer
          key={open.email}
          person={open}
          allTags={allTags}
          onClose={() => setOpen(null)}
          onSaved={(next) => { updateOne(next); setOpen((o) => (o ? { ...o, ...next } : o)); }}
        />
      )}
    </>
  );
};

export default AdminPeople;

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, fmtDay } from '../../Services/adminApi';

// Lives: TikTok, Instagram or Facebook Lives with booked artists, hosts and live artists.
// Set date choices + questions → copy their private link → they confirm → questions are here on the day.
const PLATFORM = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook' };
const ROLE = { host: 'Host', visual: 'Live art', artist: 'Artist' };
const profileUrl = (platform, handle) =>
  handle
    ? platform === 'tiktok' ? `https://www.tiktok.com/@${handle}`
      : platform === 'facebook' ? `https://www.facebook.com/${handle}`
      : `https://www.instagram.com/${handle}/`
    : '';

const Avatar = ({ p }) =>
  p.headshotUrl ? (
    <img className="ga-avatar" src={p.headshotUrl.replace('/upload/', '/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/')} alt="" />
  ) : (
    <div className="ga-avatar" aria-hidden="true">{p.role === 'host' ? '🎙️' : p.role === 'visual' ? '🎨' : '🎤'}</div>
  );

const CopyLink = ({ link }) => {
  const [copied, setCopied] = useState(false);
  if (!link) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy their Live link:', link);
    }
  };
  return (
    <button type="button" className="ga-btn ga-btn-sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy their link'}</button>
  );
};

// The questions with their notes, big enough to read off your phone during the Live
export const LiveQuestions = ({ live, big = false }) => (
  <>
    <ol className={`gl-questions ${big ? 'big' : ''}`}>
      {live.questions.map((q, i) => (
        <li key={`${i}-${q}`}>
          {q}
          {live.notes[i] && <small>Their note: {live.notes[i]}</small>}
        </li>
      ))}
      {live.extraQuestion && <li>{live.extraQuestion}<small>Their idea</small></li>}
    </ol>
    {live.plug && <p className="ga-small"><strong>Plug:</strong> {live.plug}</p>}
  </>
);

// Today's Live, shown at the top here and on the Today tab
export const LiveTodayCard = ({ p }) => {
  const l = p.live;
  const url = profileUrl(l.platform, l.handle);
  return (
    <section className="ga-card gl-today" aria-label={`Live today with ${p.artistName}`}>
      <div className="ga-card-head">
        <div>
          <p className="ga-kicker">🔴 Live today · {l.dateLabel.split(' at ')[1]}</p>
          <h2 className="ga-card-title">{p.artistName} on {PLATFORM[l.platform]}</h2>
          <p className="ga-small ga-muted">
            {url ? <a href={url} target="_blank" rel="noreferrer">@{l.handle}</a> : 'No handle'}
            {(l.livePhone || p.phone) && <> · Text: <a href={`sms:${l.livePhone || p.phone}`}>{l.livePhone || p.phone}</a></>}
            {p.code && <> · Their code: <strong>{p.code}</strong></>}
            {p.event && <> · {p.event.name} ({fmtDay(p.event.date)})</>}
          </p>
        </div>
      </div>
      <LiveQuestions live={l} big />
    </section>
  );
};

const LiveEditor = ({ p, maxOptions, maxQuestions, onSaved, onCancel }) => {
  const l = p.live;
  const [options, setOptions] = useState(l.options.length ? l.options.map((o) => o.value) : ['']);
  const [questions, setQuestions] = useState((l.questions.length ? l.questions : p.defaultQuestions).join('\n'));
  const [setMine, setSetMine] = useState(l.status === 'needs-date');
  const [date, setDate] = useState(l.dateValue || '');
  const [platform, setPlatform] = useState(l.platform || 'tiktok');
  const suggested = (pl) => (pl === 'tiktok' ? p.tiktok : pl === 'instagram' ? p.instagram : '') || '';
  const [handle, setHandle] = useState(l.handle || suggested(l.platform || 'tiktok'));
  const pickPlatform = (pl) => {
    setPlatform(pl);
    if (!handle || handle === suggested(platform)) setHandle(suggested(pl));
  };
  const [email, setEmail] = useState(true);
  const [sendInvite, setSendInvite] = useState(!l.status || l.status === 'invited' && !l.inviteSentAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    const qs = questions.split('\n').map((q) => q.trim()).filter(Boolean);
    const opts = options.filter(Boolean);
    if (!qs.length) return setError('Add at least one question.');
    if (!setMine && !opts.length) return setError('Add at least one date choice.');
    if (setMine && (!date || !platform)) return setError('Pick the date and platform.');
    setSaving(true);
    try {
      const body = { options: opts, questions: qs, platform, handle };
      if (setMine) Object.assign(body, { date, sendConfirmation: email });
      else body.sendInvite = sendInvite;
      const r = await adminApi(`/lives/${p.id}`, { method: 'POST', body });
      onSaved(r.person, r.emailSent, r.inviteSent);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="gl-editor">
      <div className="ga-form-grid">
        <label className="ga-field">
          Platform
          <select className="ga-select" value={platform} onChange={(e) => pickPlatform(e.target.value)}>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </label>
        <label className="ga-field">
          Their {PLATFORM[platform]} {platform === 'facebook' ? 'name or profile link' : 'handle'}
          <input className="ga-input" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder={platform === 'facebook' ? 'Name or facebook.com/…' : '@name'} />
        </label>
      </div>
      <div className="ga-field">
        Date choices they can pick from <small>Atlanta time. Weekday evenings work best.</small>
        {options.map((v, i) => (
          <div key={i} className="ga-row">
            <input
              type="datetime-local"
              className="ga-input gl-date"
              value={v}
              onChange={(e) => setOptions((o) => o.map((x, j) => (j === i ? e.target.value : x)))}
              aria-label={`Date choice ${i + 1}`}
            />
            {options.length > 1 && (
              <button type="button" className="ga-link" onClick={() => setOptions((o) => o.filter((_, j) => j !== i))}>Remove</button>
            )}
          </div>
        ))}
        {options.length < maxOptions && (
          <button type="button" className="ga-link gl-add" onClick={() => setOptions((o) => [...o, ''])}>+ Add another date</button>
        )}
      </div>

      <label className="ga-field">
        Questions <small>One per line, up to {maxQuestions}. They see these on their form and in their confirmation.</small>
        <textarea className="ga-textarea" rows={Math.min(12, Math.max(6, questions.split('\n').length + 1))} value={questions} onChange={(e) => setQuestions(e.target.value)} />
      </label>
      <button type="button" className="ga-link" onClick={() => setQuestions(p.defaultQuestions.join('\n'))}>Reset to starter questions</button>

      {!setMine && (
        <label className="ga-check gl-check">
          <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} />
          Email them their link now (the platform, date choices and questions){l.inviteSentAt ? ' · already sent once' : ''}
        </label>
      )}
      <label className="ga-check gl-check">
        <input type="checkbox" checked={setMine} onChange={(e) => setSetMine(e.target.checked)} />
        I'll set the date myself (they gave me a time, or none of the dates worked)
      </label>
      {setMine && (
        <div className="ga-form-grid">
          <label className="ga-field">
            Live date and time
            <input type="datetime-local" className="ga-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="ga-check gl-check">
            <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
            Email them the confirmation (date, how to join and all the questions)
          </label>
        </div>
      )}

      {error && <p className="ga-note err">{error}</p>}
      <div className="ga-row">
        <button type="button" className="ga-btn ga-btn-navy" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : l.status ? 'Save changes' : 'Save and get their link'}
        </button>
        <button type="button" className="ga-btn" disabled={saving} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

const LivePerson = ({ p, maxOptions, maxQuestions, onChange }) => {
  const l = p.live;
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const url = profileUrl(l.platform, l.handle);

  const clear = async () => {
    if (!window.confirm(`Clear ${p.artistName}'s Live? Their link will stop working.`)) return;
    try {
      await adminApi(`/lives/${p.id}`, { method: 'DELETE' });
      onChange({ ...p, live: { ...l, status: '', link: '', options: [], questions: [], notes: [], date: null, dateLabel: '', platform: '', handle: '' } });
    } catch (err) {
      setMsg(err.message);
    }
  };

  const markDone = async (done) => {
    try {
      const r = await adminApi(`/lives/${p.id}/done`, { method: 'POST', body: { done } });
      onChange(r.person);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const pill = l.completedAt ? <span className="ga-pill">Archived</span> : {
    confirmed: <span className="ga-pill green">Confirmed</span>,
    invited: <span className="ga-pill amber">Waiting on them</span>,
    'needs-date': <span className="ga-pill red">Needs a new date</span>,
  }[l.status] || <span className="ga-pill">Not set up</span>;

  return (
    <li className="gl-person">
      <div className="ga-person">
        <Avatar p={p} />
        <div>
          <div className="ga-person-name">
            {p.artistName} <span className={`ga-pill ${p.role === 'host' ? 'blue' : p.role === 'visual' ? 'green' : 'gold'}`}>{ROLE[p.role] || 'Artist'}</span> {pill}
          </div>
          <div className="ga-person-sub">
            {l.status === 'confirmed' && <><strong>{l.dateLabel}</strong> · {PLATFORM[l.platform]}{url && <> · <a href={url} target="_blank" rel="noreferrer">@{l.handle}</a></>}</>}
            {l.status === 'invited' && <>Choices: {l.options.map((o) => o.label.replace(' ET', '')).join(' · ') || '—'}</>}
            {l.status === 'needs-date' && <>Times that work: "{l.customRequest}" · {PLATFORM[l.platform] || ''} {l.handle && `@${l.handle}`}</>}
            {!l.status && <>{p.event ? `${p.event.name} · ${fmtDay(p.event.date)}` : 'Booked'}</>}
          </div>
        </div>
        <div className="ga-person-actions">
          {l.status && (
            <label className="ga-check gl-done" title="Check when the Live is finished. It moves to Archived.">
              <input type="checkbox" checked={Boolean(l.completedAt)} onChange={(e) => markDone(e.target.checked)} />
              Done
            </label>
          )}
          {l.status && !l.completedAt && <CopyLink link={l.link} />}
          {l.status === 'confirmed' && (
            <button type="button" className="ga-btn ga-btn-sm" onClick={() => setOpen((o) => !o)}>{open ? 'Hide questions' : 'Questions'}</button>
          )}
          <button type="button" className={`ga-btn ga-btn-sm ${l.status ? '' : 'ga-btn-gold'}`} onClick={() => { setEditing((e) => !e); setMsg(''); }}>
            {editing ? 'Close' : l.status ? 'Edit' : 'Set up Live'}
          </button>
        </div>
      </div>
      {msg && <p className="ga-note ok">{msg}</p>}
      {open && !editing && <div className="gl-qwrap"><LiveQuestions live={l} /></div>}
      {editing && (
        <>
          <LiveEditor
            p={p}
            maxOptions={maxOptions}
            maxQuestions={maxQuestions}
            onCancel={() => setEditing(false)}
            onSaved={(person, emailSent, inviteSent) => {
              onChange(person);
              setEditing(false);
              setMsg(inviteSent ? 'Saved and their Live link was emailed to them (a copy went to events@).'
                : emailSent ? 'Saved and their confirmation email went out (a copy went to events@).'
                : person.live.status === 'invited' && !l.status ? 'Saved. Tap "Copy their link" to send it yourself.' : 'Saved.');
            }}
          />
          {l.status && <button type="button" className="ga-link gl-clear" onClick={clear}>Clear this Live</button>}
        </>
      )}
    </li>
  );
};

const AdminLives = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(() => {
    adminApi('/lives').then(setData).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (error) return <p className="ga-note err">{error}</p>;
  if (!data) return <div className="ga-loading">Loading Lives…</div>;

  const update = (person) =>
    setData((d) => ({ ...d, people: d.people.map((x) => (x.id === person.id ? person : x)) }));
  const now = Date.now();
  const { people: everyone, maxOptions, maxQuestions } = data;
  const archived = everyone.filter((p) => p.live.completedAt)
    .sort((a, b) => new Date(b.live.completedAt) - new Date(a.live.completedAt));
  const people = everyone.filter((p) => !p.live.completedAt);
  const today = people.filter((p) => p.live.today && p.live.status === 'confirmed');
  const groups = [
    ['Coming up', people.filter((p) => p.live.status === 'confirmed' && !p.live.today && new Date(p.live.date).getTime() > now)
      .sort((a, b) => new Date(a.live.date) - new Date(b.live.date))],
    ['Needs a new date', people.filter((p) => p.live.status === 'needs-date')],
    ['Waiting on them', people.filter((p) => p.live.status === 'invited')],
    ['Not set up yet', people.filter((p) => !p.live.status && p.event && new Date(p.event.date).getTime() > now)],
    ['Finished, not checked off', people.filter((p) => p.live.status === 'confirmed' && !p.live.today && new Date(p.live.date).getTime() <= now)],
  ];

  return (
    <div className="ga-stack">
      <p className="ga-subtitle" style={{ marginTop: -12 }}>
        Set up a Live and choose TikTok, Instagram or Facebook. They're emailed their link automatically, pick a date, and get a confirmation
        with the questions (events@ gets a copy of every email). On the day everything is right here and on Today. Check <strong>Done</strong> when it's finished to archive it.
      </p>
      {today.map((p) => (
        <div key={p.id}>
          <LiveTodayCard p={p} />
          <ul className="gl-list"><LivePerson p={p} maxOptions={maxOptions} maxQuestions={maxQuestions} onChange={update} /></ul>
        </div>
      ))}
      {groups.map(([title, list]) => list.length > 0 && (
        <section key={title} className="ga-card">
          <div className="ga-card-head">
            <h2 className="ga-card-title">{title} <span className="ga-small ga-muted">({list.length})</span></h2>
          </div>
          <ul className="gl-list">
            {list.map((p) => <LivePerson key={p.id} p={p} maxOptions={maxOptions} maxQuestions={maxQuestions} onChange={update} />)}
          </ul>
        </section>
      ))}
      {archived.length > 0 && (
        <section className="ga-card">
          <div className="ga-card-head">
            <h2 className="ga-card-title">Archived <span className="ga-small ga-muted">({archived.length})</span></h2>
            <button type="button" className="ga-btn ga-btn-sm" onClick={() => setShowArchived((v) => !v)}>{showArchived ? 'Hide' : 'Show'}</button>
          </div>
          {showArchived && (
            <ul className="gl-list">
              {archived.map((p) => <LivePerson key={p.id} p={p} maxOptions={maxOptions} maxQuestions={maxQuestions} onChange={update} />)}
            </ul>
          )}
        </section>
      )}
      {people.length === 0 && archived.length === 0 && (
        <div className="ga-empty"><div className="ga-empty-big">🔴</div>No booked artists for upcoming showcases yet.</div>
      )}
    </div>
  );
};

export default AdminLives;

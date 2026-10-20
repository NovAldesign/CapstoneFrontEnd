import React, { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';
import { fmtDate, timeAgo } from '../../Services/adminApi';

// Recess Talks: speaker applications and the "be first to know" list
const STATUS = [
  { id: 'new', label: 'New', pill: 'amber' },
  { id: 'talking', label: 'Talking', pill: 'blue' },
  { id: 'booked', label: 'Booked', pill: 'green' },
  { id: 'not-now', label: 'Not now', pill: '' },
];
const statusOf = (id) => STATUS.find((s) => s.id === id) || STATUS[0];

const api = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/recess${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your login expired. Please log out and log back in.');
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

const csv = (rows) =>
  rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

const download = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const Speaker = ({ s, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(s.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const st = statusOf(s.status);

  const save = async (body) => {
    setSaving(true);
    setError('');
    try {
      onSaved(await api(`/admin/speakers/${s._id}`, { method: 'PATCH', body }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ga-person">
      <div className="ga-avatar" aria-hidden="true">🖍️</div>
      <div style={{ minWidth: 0 }}>
        <div className="ga-row" style={{ gap: 8 }}>
          <span className="ga-person-name">{s.firstName} {s.lastName}</span>
          <span className="ga-pill gold">{s.speakerType}</span>
          <span className={`ga-pill ${st.pill}`}>{st.label}</span>
        </div>
        <div className="ga-person-sub">“{s.talkTitle}” · applied {timeAgo(s.createdAt)}</div>
      </div>
      <div className="ga-person-actions">
        <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Details'}</button>
      </div>
      {open && (
        <div className="ga-detail">
          <dl>
            <dt>Talk</dt><dd><strong>{s.talkTitle}</strong><div style={{ whiteSpace: 'pre-line', marginTop: 4 }}>{s.talkSummary}</div></dd>
            {s.interactive && (<><dt>Play element</dt><dd style={{ whiteSpace: 'pre-line' }}>{s.interactive}</dd></>)}
            <dt>Email</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a></dd>
            {s.phone && (<><dt>Phone</dt><dd><a href={`tel:${s.phone}`}>{s.phone}</a></dd></>)}
            {s.organization && (<><dt>Organization</dt><dd>{s.organization}</dd></>)}
            {s.about && (<><dt>Background</dt><dd style={{ whiteSpace: 'pre-line' }}>{s.about}</dd></>)}
            <dt>Books</dt><dd>{[s.books, s.bookTitles].filter(Boolean).join(' · ') || '—'}</dd>
            {s.website && (<><dt>Website</dt><dd><a href={s.website} target="_blank" rel="noreferrer">{s.website}</a></dd></>)}
            {s.instagram && (<><dt>Instagram</dt><dd><a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer">@{s.instagram}</a></dd></>)}
            {s.videoLink && (<><dt>Past talk</dt><dd><a href={s.videoLink} target="_blank" rel="noreferrer">{s.videoLink}</a></dd></>)}
            <dt>Available</dt><dd>{s.availability?.join(', ') || '—'}</dd>
            {s.notes && (<><dt>Their notes</dt><dd style={{ whiteSpace: 'pre-line' }}>{s.notes}</dd></>)}
            <dt>Applied</dt><dd>{fmtDate(s.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</dd>
            <dt>Status</dt>
            <dd>
              <div className="ga-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {STATUS.map((x) => (
                  <button key={x.id} type="button" disabled={saving || s.status === x.id}
                    className={`ga-btn ga-btn-sm ${s.status === x.id ? 'ga-btn-navy' : ''}`} onClick={() => save({ status: x.id })}>
                    {x.label}
                  </button>
                ))}
              </div>
            </dd>
            <dt>Your notes</dt>
            <dd>
              <textarea className="ga-textarea" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Only you see this" aria-label={`Notes about ${s.firstName}`} />
              <button type="button" className="ga-btn ga-btn-sm" style={{ marginTop: 6 }} disabled={saving || notes === (s.adminNotes || '')}
                onClick={() => save({ adminNotes: notes })}>
                {saving ? 'Saving…' : 'Save notes'}
              </button>
            </dd>
          </dl>
          {error && <p className="ga-note err">{error}</p>}
        </div>
      )}
    </div>
  );
};

const AdminRecess = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    api('/admin').then(setData).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (!data) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading Recess Talks™…</div>;

  const speakers = filter === 'all' ? data.speakers : data.speakers.filter((s) => s.status === filter);
  const count = (id) => data.speakers.filter((s) => s.status === id).length;
  const saved = (s) => setData((d) => ({ ...d, speakers: d.speakers.map((x) => (x._id === s._id ? s : x)) }));

  const exportList = () =>
    download('recess-talks-interest-list.csv', csv([
      ['Name', 'Email', 'Signed up', 'Source'],
      ...data.interest.map((p) => [p.name, p.email, new Date(p.createdAt).toLocaleDateString('en-US'), p.source]),
    ]));

  return (
    <>
      <section className="ga-card" style={{ marginBottom: 18 }}>
        <div className="ga-card-head">
          <div>
            <p className="ga-kicker">Call for speakers · {data.speakers.length}</p>
            <h2 className="ga-card-title">Speaker applications</h2>
          </div>
          <a className="ga-btn ga-btn-sm" href="/recess#speak" target="_blank" rel="noreferrer">View the form</a>
        </div>
        <div className="ga-seg" role="tablist" aria-label="Filter speakers" style={{ marginBottom: 10 }}>
          <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
          {STATUS.map((x) => (
            <button key={x.id} type="button" className={filter === x.id ? 'on' : ''} onClick={() => setFilter(x.id)}>
              {x.label}{count(x.id) ? ` · ${count(x.id)}` : ''}
            </button>
          ))}
        </div>
        {speakers.length === 0
          ? <p className="ga-small ga-muted">{data.speakers.length ? 'Nobody here.' : 'No applications yet. Share grownfolkscollective.com/recess with authors, professors and experts.'}</p>
          : speakers.map((s) => <Speaker key={s._id} s={s} onSaved={saved} />)}
      </section>

      <section className="ga-card">
        <div className="ga-card-head">
          <div>
            <p className="ga-kicker">Be first to know · {data.interest.length}</p>
            <h2 className="ga-card-title">Interest list</h2>
          </div>
          {data.interest.length > 0 && (
            <button type="button" className="ga-btn ga-btn-sm" onClick={exportList}>Download for Brevo</button>
          )}
        </div>
        {data.interest.length === 0 ? (
          <p className="ga-small ga-muted">No sign-ups yet.</p>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Name</th><th>Email</th><th>Signed up</th></tr></thead>
              <tbody>
                {data.interest.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td><a href={`mailto:${p.email}`}>{p.email}</a></td>
                    <td>{fmtDate(p.createdAt, { month: 'short', day: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminRecess;

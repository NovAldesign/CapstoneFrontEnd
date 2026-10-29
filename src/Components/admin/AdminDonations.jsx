import React, { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';
import { fmtDate, timeAgo } from '../../Services/adminApi';

// In-kind donation offers from the Partnerships page
const STATUS = [
  { id: 'new', label: 'New', pill: 'amber' },
  { id: 'accepted', label: 'Accepted', pill: 'blue' },
  { id: 'received', label: 'Received', pill: 'green' },
  { id: 'declined', label: 'Declined', pill: '' },
];
const statusOf = (id) => STATUS.find((s) => s.id === id) || STATUS[0];

const api = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/donations${path}`, {
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

const Donation = ({ d, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(d.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const st = statusOf(d.status);
  const who = d.companyName || d.contactName;

  const save = async (body) => {
    setSaving(true);
    setError('');
    try {
      onSaved(await api(`/admin/${d._id}`, { method: 'PATCH', body }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ga-person">
      <div className="ga-avatar" aria-hidden="true">🎁</div>
      <div style={{ minWidth: 0 }}>
        <div className="ga-row" style={{ gap: 8 }}>
          <span className="ga-person-name">{who}</span>
          <span className={`ga-pill ${st.pill}`}>{st.label}</span>
          {!d.recognition && <span className="ga-pill">Anonymous</span>}
        </div>
        <div className="ga-person-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.items} · {timeAgo(d.createdAt)}
        </div>
      </div>
      <div className="ga-person-actions">
        <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Details'}</button>
      </div>
      {open && (
        <div className="ga-detail">
          <dl>
            <dt>Donating</dt><dd style={{ whiteSpace: 'pre-line' }}>{d.items}</dd>
            {d.kinds?.length > 0 && (<><dt>Type</dt><dd>{d.kinds.join(', ')}</dd></>)}
            {d.quantity && (<><dt>How much</dt><dd>{d.quantity}</dd></>)}
            {d.events?.length > 0 && (<><dt>For</dt><dd>{d.events.join(', ')}</dd></>)}
            <dt>Delivery</dt><dd>{d.delivery}{d.availableBy ? ` · ${d.availableBy}` : ''}</dd>
            <dt>From</dt><dd>{[d.companyName, d.contactName].filter(Boolean).join(' · ')} ({d.donorType === 'individual' ? 'individual' : 'business'})</dd>
            <dt>Email</dt><dd><a href={`mailto:${d.email}`}>{d.email}</a></dd>
            {d.phone && (<><dt>Phone</dt><dd><a href={`tel:${d.phone}`}>{d.phone}</a></dd></>)}
            <dt>Thank-you</dt>
            <dd>
              {d.recognition ? 'Shout-out, social tag and newsletter mention' : 'Keep it anonymous'}
              {d.recognition && d.instagram && <> · <a href={`https://instagram.com/${d.instagram}`} target="_blank" rel="noreferrer">@{d.instagram}</a></>}
              {d.recognition && d.website && <> · <a href={d.website} target="_blank" rel="noreferrer">website</a></>}
            </dd>
            {d.notes && (<><dt>Their notes</dt><dd style={{ whiteSpace: 'pre-line' }}>{d.notes}</dd></>)}
            <dt>Offered</dt><dd>{fmtDate(d.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}{d.receivedAt ? ` · received ${fmtDate(d.receivedAt)}` : ''}</dd>
            <dt>Status</dt>
            <dd>
              <div className="ga-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {STATUS.map((x) => (
                  <button key={x.id} type="button" disabled={saving || d.status === x.id}
                    className={`ga-btn ga-btn-sm ${d.status === x.id ? 'ga-btn-navy' : ''}`} onClick={() => save({ status: x.id })}>
                    {x.label}
                  </button>
                ))}
              </div>
            </dd>
            <dt>Your notes</dt>
            <dd>
              <textarea className="ga-textarea" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Only you see this" aria-label={`Notes about ${who}`} />
              <button type="button" className="ga-btn ga-btn-sm" style={{ marginTop: 6 }} disabled={saving || notes === (d.adminNotes || '')}
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

const AdminDonations = () => {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    api('/admin').then(setList).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (!list) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading donations…</div>;

  const shown = filter === 'all' ? list : list.filter((d) => d.status === filter);
  const count = (id) => list.filter((d) => d.status === id).length;
  const saved = (d) => setList((prev) => prev.map((x) => (x._id === d._id ? d : x)));

  return (
    <section className="ga-card">
      <div className="ga-card-head">
        <div>
          <p className="ga-kicker">In-kind · {list.length}</p>
          <h2 className="ga-card-title">Donation offers</h2>
        </div>
        <a className="ga-btn ga-btn-sm" href="/donate" target="_blank" rel="noreferrer">View the form</a>
      </div>
      <div className="ga-seg" role="tablist" aria-label="Filter donations" style={{ marginBottom: 10 }}>
        <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
        {STATUS.map((x) => (
          <button key={x.id} type="button" className={filter === x.id ? 'on' : ''} onClick={() => setFilter(x.id)}>
            {x.label}{count(x.id) ? ` · ${count(x.id)}` : ''}
          </button>
        ))}
      </div>
      {shown.length === 0
        ? <p className="ga-small ga-muted">{list.length ? 'Nothing here.' : 'No donation offers yet. Share grownfolkscollective.com/donate with local businesses.'}</p>
        : shown.map((d) => <Donation key={d._id} d={d} onSaved={saved} />)}
    </section>
  );
};

export default AdminDonations;

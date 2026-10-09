import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';
import { adminApi, downloadCSV, fmtDate, timeAgo } from '../../Services/adminApi';

// =============================================================
// Partners tab: sponsor inquiries + partner portal progress.
// Approve sends the portal link. GFC fills in amount, event,
// load-in and recap; the partner fills in everything else.
// =============================================================

const partnerApi = async (path, opts = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/partner/admin${path}`, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}` },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your login expired. Please log out and log back in.');
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};
export const loadPartnerOverview = () => partnerApi('/overview');
export const sendPortalLink = (kind, id) => partnerApi(`/${kind}/${id}/invite`, { method: 'POST' });

const STATUSES = ['pending', 'contacted', 'accepted', 'active', 'declined', 'expired'];
const OPEN = ['pending', 'contacted'];
const tone = (s) => ({ pending: 'amber', contacted: 'blue', accepted: 'green', active: 'green', declined: 'red' }[s] || '');
const label = (s) => String(s || '').replace(/^\w/, (c) => c.toUpperCase());
const money = (c = 0) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 ? 2 : 0 })}`;

// Progress pill + mini checklist, shared with the Member Perks list
export const PortalProgress = ({ row, compact = false }) => {
  if (!row?.portalOpen) return null;
  const { done, total } = row.progress;
  const complete = done === total;
  return (
    <div style={{ marginTop: 8 }}>
      <div className="ga-row" style={{ gap: 8 }}>
        <span className={`ga-pill ${complete ? 'green' : 'gold'}`}>Portal {done}/{total}</span>
        <span className="ga-small ga-muted">
          {row.portal.invitedAt ? `Link sent ${fmtDate(row.portal.invitedAt)}` : 'Link not sent yet'}
          {row.portal.lastLoginAt ? ` · last opened ${timeAgo(row.portal.lastLoginAt)}` : row.portal.invitedAt ? ' · not opened yet' : ''}
          {row.portal.remindersSent ? ` · ${row.portal.remindersSent} reminder${row.portal.remindersSent === 1 ? '' : 's'}` : ''}
        </span>
      </div>
      {!compact && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 4 }}>
          {row.checklist.map((i) => (
            <li key={i.key} className="ga-small" style={{ color: i.done ? 'var(--ga-green)' : 'var(--ga-ink)' }}>
              {i.done ? '✓' : '○'} {i.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Steps = ({ steps }) => (
  <div className="ga-row" style={{ gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
    {steps.map((s, i) => (
      <React.Fragment key={s.key}>
        {i > 0 && <span className="ga-small ga-muted" aria-hidden="true">→</span>}
        <span className={`ga-pill ${s.done ? 'green' : ''}`}>{s.label}</span>
      </React.Fragment>
    ))}
  </div>
);

// What the partner sent in through the portal
const Submitted = ({ p }) => {
  const rows = [
    ['Description', p.blurb],
    ['Website', p.website],
    ['Instagram', p.instagram],
    ['Facebook', p.facebook],
    ['TikTok', p.tiktok],
    ['Brand colors', p.brandColors],
    ['On-site contact', [p.onsiteName, p.onsitePhone].filter(Boolean).join(' · ')],
    ['Table', p.tableNeeds],
    ['Signage', p.signageNeeds],
    ['Sampling', p.samplingPlan],
    ['Agreement', p.agreement ? `Signed by ${p.agreement.name}, ${fmtDate(p.agreement.signedAt, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''],
  ].filter(([, v]) => v);
  if (!rows.length && !p.logoUrl && !p.photos?.length) return <p className="ga-small ga-muted">Nothing from the partner yet.</p>;
  return (
    <>
      {(p.logoUrl || p.photos?.length > 0) && (
        <div className="ga-row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {p.logoUrl && <a href={p.logoUrl} target="_blank" rel="noopener noreferrer" title="Logo (opens full size)"><img src={p.logoUrl} alt="Logo" style={{ width: 72, height: 72, objectFit: 'contain', background: '#f6f1e7', borderRadius: 8 }} /></a>}
          {(p.photos || []).map((u) => <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt="Partner photo" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} /></a>)}
        </div>
      )}
      <dl>
        {rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{v}</dd></React.Fragment>)}
      </dl>
    </>
  );
};

// GFC side: amount, event, load-in, recap, manual payment
const GfcFields = ({ row, events, onSaved, setError }) => {
  const p = row.portal;
  const initial = {
    amount: p.amountCents ? String(p.amountCents / 100) : '',
    eventId: p.eventId || '',
    loadIn: p.loadIn || '',
    recapUrl: p.recapUrl || '',
    recapNote: p.recapNote || '',
    newsletterUrl: p.newsletterUrl || '',
  };
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = async (extra = {}) => {
    setBusy(true);
    try {
      const body = { ...extra };
      if (!('markPaid' in extra)) {
        Object.assign(body, { eventId: f.eventId, loadIn: f.loadIn, recapUrl: f.recapUrl, recapNote: f.recapNote, newsletterUrl: f.newsletterUrl });
        if (!p.paidAt) body.amountCents = Math.round(Number(f.amount || 0) * 100);
      }
      const { item } = await partnerApi(`/sponsor/${row._id}`, { method: 'PATCH', body });
      onSaved(item);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="ga-form-grid" style={{ marginTop: 10 }}>
      <label className="ga-field">Amount (USD)
        <input className="ga-input" inputMode="decimal" value={f.amount} onChange={set('amount')} disabled={Boolean(p.paidAt)} placeholder={row.defaultAmountCents ? String(row.defaultAmountCents / 100) : '0'} />
        <small>{p.paidAt ? `Paid ${fmtDate(p.paidAt)}` : `${row.tierLabel || 'Custom'} is ${row.defaultAmountCents ? money(row.defaultAmountCents) : 'custom'} per event`}</small>
      </label>
      <label className="ga-field">Event
        <select className="ga-select" value={f.eventId} onChange={set('eventId')}>
          <option value="">Not set yet</option>
          {events.map((e) => <option key={e._id} value={e._id}>{fmtDate(e.date)} · {e.name}</option>)}
        </select>
      </label>
      <label className="ga-field">Load-in
        <input className="ga-input" value={f.loadIn} onChange={set('loadIn')} placeholder="e.g. 5:30 PM, side entrance" maxLength={120} />
      </label>
      <label className="ga-field">Recap link
        <input className="ga-input" value={f.recapUrl} onChange={set('recapUrl')} placeholder="https:// (photo gallery)" />
      </label>
      <label className="ga-field">Newsletter feature link
        <input className="ga-input" value={f.newsletterUrl} onChange={set('newsletterUrl')} placeholder="https://" />
      </label>
      <label className="ga-field ga-span-2">Recap note for the partner
        <textarea className="ga-textarea" value={f.recapNote} onChange={set('recapNote')} maxLength={1000} placeholder="Turnout, highlights, thank-you" />
      </label>
      <div className="ga-row ga-span-2" style={{ gap: 8 }}>
        <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={!dirty || busy} onClick={() => save()}>Save</button>
        {!p.paidAt && p.amountCents > 0 && <button type="button" className="ga-btn ga-btn-sm" disabled={busy} onClick={() => save({ markPaid: true })}>Mark paid (check / Zelle)</button>}
        {p.paidAt && !p.receiptUrl && <button type="button" className="ga-btn ga-btn-sm" disabled={busy} onClick={() => save({ markPaid: false })}>Mark unpaid</button>}
        {p.receiptUrl && <a className="ga-btn ga-btn-sm" href={p.receiptUrl} target="_blank" rel="noopener noreferrer">Stripe receipt</a>}
      </div>
    </div>
  );
};

const SponsorCard = ({ inquiry, row, events, onInquiry, onRow, setError }) => {
  const [open, setOpen] = useState(OPEN.includes(inquiry.status));
  const [notes, setNotes] = useState(inquiry.adminNotes || '');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const firstName = (inquiry.contactPerson || '').split(' ')[0] || 'there';

  const patch = async (body) => {
    setBusy(true);
    try { onInquiry((await adminApi(`/list/partners/${inquiry._id}`, { method: 'PATCH', body })).item); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const invite = async () => {
    setBusy(true);
    setSent('');
    try {
      const r = await sendPortalLink('sponsor', inquiry._id);
      onRow(r.item);
      onInquiry({ ...inquiry, status: r.item.status });
      setSent(r.message);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <article className="ga-card" style={{ padding: '14px 18px' }}>
      <div className="ga-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ga-row" style={{ gap: 8 }}>
            <strong style={{ color: 'var(--ga-navy)' }}>{inquiry.companyName}</strong>
            <span className={`ga-pill ${tone(inquiry.status)}`}>{label(inquiry.status)}</span>
            {row?.portal.paidAt && <span className="ga-pill green">Paid {money(row.portal.amountCents)}</span>}
          </div>
          <div className="ga-small ga-muted">{inquiry.contactPerson} · {inquiry.tierRequested || 'Partnership'} tier{row?.event ? ` · ${fmtDate(row.event.date)} ${row.event.name}` : ''} · {timeAgo(inquiry.createdAt)}</div>
          {row?.portalOpen && <Steps steps={row.steps} />}
          <PortalProgress row={row} compact />
        </div>
        <div className="ga-row" style={{ gap: 6 }}>
          {inquiry.status !== 'declined' && (
            <button type="button" className={`ga-btn ga-btn-sm ${row?.portalOpen ? '' : 'ga-btn-navy'}`} disabled={busy} onClick={invite}>
              {row?.portalOpen ? (row.portal.invitedAt ? 'Resend portal link' : 'Send portal link') : 'Approve & send portal link'}
            </button>
          )}
          <button type="button" className="ga-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Open'}</button>
        </div>
      </div>
      {sent && <p className="ga-note" role="status" style={{ marginTop: 8 }}>{sent}</p>}

      {open && (
        <>
          <div className="ga-detail" style={{ marginTop: 12 }}>
            <dl>
              <dt>Email</dt><dd><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></dd>
              {inquiry.phone && (<><dt>Phone</dt><dd><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></dd></>)}
              {inquiry.eventsInterested?.length > 0 && (<><dt>Events</dt><dd>{inquiry.eventsInterested.join(', ')}</dd></>)}
              {inquiry.hostingInterest && (<><dt>Co-creation</dt><dd>{inquiry.hostingInterest}</dd></>)}
              {inquiry.details && (<><dt>Their note</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{inquiry.details}</dd></>)}
              <dt>Received</dt><dd>{fmtDate(inquiry.createdAt, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</dd>
            </dl>
          </div>

          {row?.portalOpen && (
            <>
              <h4 className="ga-small" style={{ margin: '14px 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ga-muted)' }}>From the partner</h4>
              <div className="ga-detail"><Submitted p={row.portal} /></div>
              <PortalProgress row={row} />
              <h4 className="ga-small" style={{ margin: '14px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ga-muted)' }}>Your side</h4>
              <GfcFields key={`${row._id}-${row.portal.paidAt}`} row={row} events={events} onSaved={onRow} setError={setError} />
            </>
          )}

          <div className="ga-form-grid" style={{ marginTop: 14 }}>
            <label className="ga-field">Status
              <select className="ga-select" value={inquiry.status} disabled={busy} onChange={(e) => patch({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </label>
            <div className="ga-field">Reply
              <div className="ga-row">
                <a className="ga-btn ga-btn-sm" href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Grown Folks™ Collective partnership')}&body=${encodeURIComponent(`Hi ${firstName},\n\n`)}`}
                  onClick={() => (inquiry.status === 'pending' ? patch({ status: 'contacted' }) : null)}>✉️ Email</a>
                {inquiry.phone && <a className="ga-btn ga-btn-sm" href={`sms:${inquiry.phone}`}>💬 Text</a>}
                {inquiry.phone && <a className="ga-btn ga-btn-sm" href={`tel:${inquiry.phone}`}>📞 Call</a>}
              </div>
            </div>
            <label className="ga-field ga-span-2">Private notes
              <textarea className="ga-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="Only you see these" />
              {notes !== (inquiry.adminNotes || '') && (
                <span><button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={busy} onClick={() => patch({ adminNotes: notes })}>Save notes</button></span>
              )}
            </label>
          </div>
        </>
      )}
    </article>
  );
};

export const AdminPartners = () => {
  const [inquiries, setInquiries] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    adminApi('/list/partners').then((d) => setInquiries(d.items)).catch((e) => setError(e.message));
    loadPartnerOverview().then(setOverview).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => new Map((overview?.sponsors || []).map((r) => [String(r._id), r])), [overview]);
  const needsWork = (d) => {
    if (OPEN.includes(d.status)) return true;
    const r = rows.get(String(d._id));
    return Boolean(r?.portalOpen && (r.progress.done < r.progress.total || !r.steps.every((s) => s.done)));
  };
  const shown = (inquiries || []).filter((d) => {
    if (filter === 'open' && !needsWork(d)) return false;
    const q = search.trim().toLowerCase();
    return !q || `${d.companyName} ${d.contactPerson} ${d.email} ${d.tierRequested}`.toLowerCase().includes(q);
  });

  if (!inquiries) return error ? <p className="ga-note err">{error}</p> : <div className="ga-loading">Loading partners…</div>;
  return (
    <>
      {error && <p className="ga-note err" role="alert">{error}</p>}
      <p className="ga-subtitle" style={{ marginTop: -12, marginBottom: 16 }}>
        Approving emails the partner a private portal link. They upload their logo, fill in details, sign and pay there. Reminders go out automatically for anything missing.
      </p>
      <div className="ga-row" style={{ marginBottom: 14 }}>
        <div className="ga-seg">
          <button type="button" className={filter === 'open' ? 'on' : ''} onClick={() => setFilter('open')}>In progress · {inquiries.filter(needsWork).length}</button>
          <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All · {inquiries.length}</button>
        </div>
        <span className="ga-spacer" />
        <input className="ga-input" style={{ width: 220 }} placeholder="Search" aria-label="Search partners" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="ga-btn" onClick={() => downloadCSV(shown.map((d) => ({ Company: d.companyName, Contact: d.contactPerson, Email: d.email, Phone: d.phone, Tier: d.tierRequested, Status: d.status, Portal: rows.get(String(d._id))?.portalOpen ? `${rows.get(String(d._id)).progress.done}/${rows.get(String(d._id)).progress.total}` : '', Received: fmtDate(d.createdAt, { year: 'numeric', month: 'short', day: 'numeric' }) })), `gfc-partners-${new Date().toISOString().slice(0, 10)}.csv`)}>↓ CSV</button>
      </div>
      {shown.length === 0 ? <div className="ga-card ga-empty">{filter === 'open' ? 'Nothing in progress. You’re caught up.' : 'No partner inquiries yet.'}</div> : (
        <div className="ga-stack" style={{ gap: 12 }}>
          {shown.map((d) => (
            <SponsorCard
              key={d._id}
              inquiry={d}
              row={rows.get(String(d._id))}
              events={overview?.events || []}
              setError={setError}
              onInquiry={(item) => setInquiries((list) => list.map((x) => (x._id === item._id ? { ...x, ...item } : x)))}
              onRow={(item) => setOverview((o) => ({ ...o, sponsors: o.sponsors.some((s) => s._id === item._id) ? o.sponsors.map((s) => (s._id === item._id ? item : s)) : [...o.sponsors, item] }))}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AdminPartners;

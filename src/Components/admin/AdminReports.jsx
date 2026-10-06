import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, downloadCSV, fmtDay } from '../../Services/adminApi';
import { sourceColor, sourceLabel, tagLabel } from '../../Services/ticketSources';

// Reports: tickets, revenue, attendance and where tickets came from, for any date range
const ymd = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const money = (c) => `$${Math.round((c || 0) / 100).toLocaleString()}`;
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const RANGES = [
  ['month', 'This month'],
  ['last', 'Last month'],
  ['90', 'Last 90 days'],
  ['next', 'Next 60 days'],
  ['year', 'This year'],
  ['custom', 'Custom'],
];

const rangeFor = (id) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (id === 'month') return [new Date(y, m, 1), new Date(y, m + 1, 0)];
  if (id === 'last') return [new Date(y, m - 1, 1), new Date(y, m, 0)];
  if (id === '90') return [new Date(Date.now() - 90 * 86400000), now];
  if (id === 'next') return [now, new Date(Date.now() + 60 * 86400000)];
  if (id === 'year') return [new Date(y, 0, 1), new Date(y, 11, 31)];
  return null;
};

// Horizontal bars: one measure across a few categories, every bar labeled
const Bars = ({ rows, unit = 'tickets', colorFor }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="ga-small ga-muted">Nothing yet in this range.</p>;
  return (
    <ul className="rp-bars">
      {rows.map((r) => (
        <li key={r.key} className="rp-bar-row" title={`${r.label}: ${r.value} ${unit}${r.extra ? ` · ${r.extra}` : ''}`}>
          <span className="rp-bar-label">
            {colorFor && <i className="rp-swatch" style={{ background: colorFor(r.key) }} aria-hidden="true" />}
            {r.label}
          </span>
          <span className="rp-bar-track" aria-hidden="true"><i style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="rp-bar-value">{r.value}{r.extra ? <small> · {r.extra}</small> : null}</span>
        </li>
      ))}
    </ul>
  );
};

const AdminReports = ({ openGuests }) => {
  const [range, setRange] = useState('month');
  const [custom, setCustom] = useState(() => { const [a, b] = rangeFor('month'); return { from: ymd(a), to: ymd(b) }; });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dates = useMemo(() => {
    if (range === 'custom') return custom;
    const [a, b] = rangeFor(range);
    return { from: ymd(a), to: ymd(b) };
  }, [range, custom]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi(`/reports?from=${dates.from}&to=${dates.to}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dates]);
  useEffect(load, [load]);

  const sources = useMemo(() => Object.entries(data?.bySource || {})
    .map(([k, v]) => ({ key: k, label: sourceLabel(k), value: v.tickets, extra: money(v.paidCents) }))
    .sort((a, b) => b.value - a.value), [data]);
  const tags = useMemo(() => Object.entries(data?.websiteTags || {})
    .map(([k, v]) => ({ key: k, label: tagLabel(k), value: v }))
    .sort((a, b) => b.value - a.value).slice(0, 12), [data]);
  const codes = useMemo(() => Object.entries(data?.codes || {})
    .map(([k, v]) => ({ code: k, tickets: v })).sort((a, b) => b.tickets - a.tickets), [data]);

  const exportEvents = () => downloadCSV((data?.events || []).map((e) => ({
    Date: fmtDay(e.date), Event: e.name, Tickets: e.tickets, Capacity: e.capacity || '',
    Website: e.bySource.website?.tickets || 0, Eventbrite: e.bySource.eventbrite?.tickets || 0,
    Other: e.tickets - (e.bySource.website?.tickets || 0) - (e.bySource.eventbrite?.tickets || 0),
    Revenue: money(e.paidCents), 'Checked in': e.past ? e.checkedIn : '', 'Show rate': e.past && e.checkedIn ? pct(e.checkedIn, e.tickets) : '',
  })), `gfc-report-${dates.from}-to-${dates.to}.csv`);

  const t = data?.totals;
  return (
    <>
      <div className="ga-row" style={{ marginBottom: 16 }}>
        <div className="ga-seg" role="tablist" aria-label="Date range">
          {RANGES.map(([id, label]) => (
            <button key={id} type="button" className={range === id ? 'on' : ''} onClick={() => setRange(id)}>{label}</button>
          ))}
        </div>
        {range === 'custom' && (
          <div className="ga-row">
            <input className="ga-input" style={{ width: 160 }} type="date" value={custom.from} aria-label="From"
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
            <span className="ga-muted">to</span>
            <input className="ga-input" style={{ width: 160 }} type="date" value={custom.to} aria-label="To"
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
          </div>
        )}
        <span className="ga-spacer" />
        <button type="button" className="ga-btn" onClick={exportEvents} disabled={!data?.events?.length}>↓ CSV</button>
      </div>

      {error && <p className="ga-note err">{error}</p>}
      {!data ? <div className="ga-loading">Building your report…</div> : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
          <div className="ga-stats">
            <div className="ga-stat"><div className="ga-stat-num">{t.events}</div><div className="ga-stat-label">Events</div></div>
            <div className="ga-stat"><div className="ga-stat-num">{t.tickets}</div><div className="ga-stat-label">Tickets</div></div>
            <div className="ga-stat"><div className="ga-stat-num">{money(t.paidCents)}</div><div className="ga-stat-label">Ticket revenue</div></div>
            <div className="ga-stat">
              <div className={`ga-stat-num ${t.trackedEvents ? '' : 'zero'}`}>{t.trackedEvents ? pct(t.trackedCheckedIn, t.trackedTickets) : '—'}</div>
              <div className="ga-stat-label">{t.trackedEvents ? `Showed up (${t.trackedCheckedIn} of ${t.trackedTickets})` : 'Show rate (use check-in to track)'}</div>
            </div>
          </div>

          <div className="ga-grid-2" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
            <section className="ga-card">
              <p className="ga-kicker">Where tickets came from</p>
              <h2 className="ga-card-title" style={{ marginBottom: 12 }}>By platform</h2>
              <Bars rows={sources} colorFor={sourceColor} />
            </section>
            <section className="ga-card">
              <p className="ga-kicker">Website sales</p>
              <h2 className="ga-card-title" style={{ marginBottom: 12 }}>Which posts and links sold tickets</h2>
              <Bars rows={tags} />
              <p className="ga-small ga-muted" style={{ marginTop: 10 }}>From the ?src= tag on your links. “Direct” means they came without a tagged link.</p>
            </section>
          </div>

          <section className="ga-card" style={{ marginTop: 18 }}>
            <div className="ga-card-head">
              <div>
                <p className="ga-kicker">Event by event</p>
                <h2 className="ga-card-title">{fmtDay(data.from)} to {fmtDay(data.to)}</h2>
              </div>
            </div>
            {data.events.length === 0 ? <div className="ga-empty">No events in this range.</div> : (
              <div className="ga-table-wrap">
                <table className="ga-table rp-table">
                  <thead>
                    <tr><th>Date</th><th>Event</th><th className="ga-num">Tickets</th><th>Where from</th><th className="ga-num">Revenue</th><th className="ga-num">Showed up</th><th aria-label="Open" /></tr>
                  </thead>
                  <tbody>
                    {data.events.map((e) => (
                      <tr key={e.id}>
                        <td className="ga-small" style={{ whiteSpace: 'nowrap' }}>{fmtDay(e.date)}</td>
                        <td className="rp-name" style={{ fontWeight: 600, color: 'var(--ga-navy)' }}>{e.name}{e.eventbriteError && <div className="ga-small" style={{ color: 'var(--ga-amber)' }}>Eventbrite didn't load</div>}</td>
                        <td className="ga-num" data-label="Tickets">{e.tickets}{e.capacity ? <div className="ga-small ga-muted">of {e.capacity}</div> : null}</td>
                        <td className="rp-where">
                          <div className="rp-split" aria-hidden="true">
                            {Object.entries(e.bySource).sort((a, b) => b[1].tickets - a[1].tickets).map(([s, v]) => (
                              <i key={s} style={{ flexGrow: v.tickets, background: sourceColor(s) }} />
                            ))}
                          </div>
                          <div className="ga-small ga-muted">
                            {Object.entries(e.bySource).sort((a, b) => b[1].tickets - a[1].tickets).map(([s, v]) => `${sourceLabel(s)} ${v.tickets}`).join(' · ') || '—'}
                          </div>
                        </td>
                        <td className="ga-num" data-label="Revenue">{money(e.paidCents)}</td>
                        <td className="ga-num" data-label="Showed up">{!e.past ? <span className="ga-muted ga-small">Upcoming</span> : e.checkedIn ? `${e.checkedIn} · ${pct(e.checkedIn, e.tickets)}` : <span className="ga-muted ga-small">Not tracked</span>}</td>
                        <td><button type="button" className="ga-btn ga-btn-sm" onClick={() => openGuests?.(e.id)}>Guests</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {codes.length > 0 && (
            <section className="ga-card" style={{ marginTop: 18 }}>
              <p className="ga-kicker">Codes</p>
              <h2 className="ga-card-title" style={{ marginBottom: 12 }}>Tickets sold with a code</h2>
              <Bars rows={codes.map((c) => ({ key: c.code, label: c.code, value: c.tickets }))} />
            </section>
          )}
          <p className="ga-small ga-muted" style={{ marginTop: 14 }}>
            Revenue is what buyers paid: website prices after discounts, Eventbrite gross, and amounts you entered for guests added by hand.
          </p>
        </div>
      )}
    </>
  );
};

export default AdminReports;

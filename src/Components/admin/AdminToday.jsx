import React, { useEffect, useState } from 'react';
import { adminApi, fmtDate, timeAgo } from '../../Services/adminApi';

// Today: everything waiting on you, plus the next events
const ICONS = {
  artist: '🎤', host: '🎙️', perk: '🏷️', partner: '🤝', hosting: '🥂',
  group: '🎉', message: '✉️', review: '⭐',
};

const TILES = [
  { key: 'artists', label: 'Artist applications', tab: 'showcases' },
  { key: 'hosts', label: 'Host applications', tab: 'showcases' },
  { key: 'perks', label: 'Member Perks to approve', tab: 'perks' },
  { key: 'partners', label: 'Partner inquiries', tab: 'partners' },
  { key: 'hosting', label: 'Private event requests', tab: 'private' },
  { key: 'groups', label: 'Group bookings', tab: 'groups' },
  { key: 'messages', label: 'Unread messages', tab: 'messages' },
  { key: 'reviews', label: 'Reviews to approve', tab: 'reviews' },
  { key: 'select', label: 'New GFC Select™ applications', tab: 'select' },
];

const AdminToday = ({ go, onCounts }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    adminApi('/inbox')
      .then((d) => {
        if (!alive) return;
        setData(d);
        onCounts?.(d.counts);
      })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [onCounts]);

  if (error) return <p className="ga-note err">{error}</p>;
  if (!data) return <div className="ga-loading">Loading your day…</div>;

  const { counts, items, upcoming } = data;
  const waiting = TILES.reduce((n, t) => n + (counts[t.key] || 0), 0);

  return (
    <>
      <p className="ga-subtitle" style={{ marginTop: -12, marginBottom: 18 }}>
        {waiting === 0 ? "You're all caught up. Nothing is waiting on you." : `${waiting} ${waiting === 1 ? 'thing is' : 'things are'} waiting on you.`}
      </p>

      <div className="ga-stats">
        {TILES.map((t) => (
          <button key={t.key} type="button" className="ga-stat" onClick={() => go(t.tab)}>
            <div className={`ga-stat-num ${counts[t.key] ? '' : 'zero'}`}>{counts[t.key] || 0}</div>
            <div className="ga-stat-label">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="ga-grid-2">
        <section className="ga-card" aria-labelledby="today-feed">
          <div className="ga-card-head">
            <div>
              <p className="ga-kicker">Needs you</p>
              <h2 id="today-feed" className="ga-card-title">Waiting for a reply</h2>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="ga-empty"><div className="ga-empty-big">✓</div>Nothing new. Enjoy the quiet.</div>
          ) : (
            <ul className="ga-feed">
              {items.slice(0, 30).map((it) => (
                <li key={`${it.type}-${it.id}`} className="ga-feed-item">
                  <span className="ga-feed-icon" aria-hidden="true">{ICONS[it.type] || '•'}</span>
                  <div className="ga-feed-body">
                    <div className="ga-feed-title">{it.title}</div>
                    <div className="ga-feed-detail">{it.detail}</div>
                  </div>
                  <span className="ga-feed-time">{timeAgo(it.createdAt)}</span>
                  <button type="button" className="ga-btn ga-btn-sm" onClick={() => go(it.tab)}>Open</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="ga-stack">
          <section className="ga-card" aria-labelledby="today-events">
            <div className="ga-card-head">
              <div>
                <p className="ga-kicker">Coming up</p>
                <h2 id="today-events" className="ga-card-title">Next events</h2>
              </div>
              <button type="button" className="ga-link" onClick={() => go('events')}>All events</button>
            </div>
            {upcoming.length === 0 ? (
              <div className="ga-empty">No upcoming events published.</div>
            ) : upcoming.map((e) => {
              const pct = e.capacity ? Math.min(100, Math.round((e.sold / e.capacity) * 100)) : 0;
              return (
                <div key={e.id} className="ga-event-row">
                  <div className="ga-date-chip" aria-hidden="true">
                    <span>{fmtDate(e.date, { month: 'short' })}</span>
                    <b>{fmtDate(e.date, { day: 'numeric' })}</b>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ga-feed-title">{e.name}</div>
                    <div className="ga-feed-detail">
                      {e.sold} sold{e.capacity ? ` of ${e.capacity}` : ''}
                    </div>
                    {e.capacity > 0 && <div className="ga-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="ga-card" aria-labelledby="today-people">
            <p className="ga-kicker">This week</p>
            <h2 id="today-people" className="ga-card-title">Your community</h2>
            <div className="ga-row" style={{ marginTop: 12, gap: 18 }}>
              <div><div className="ga-stat-num">{counts.newSubscribers || 0}</div><div className="ga-stat-label">New newsletter sign-ups (7 days)</div></div>
              <div><div className="ga-stat-num">{counts.pendingMembers || 0}</div><div className="ga-stat-label">Memberships not paid yet</div></div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminToday;

import React, { useEffect, useMemo, useState } from 'react';
import GuestList from '../GuestList.jsx';
import { adminApi, fmtDate, fmtDay } from '../../Services/adminApi';

// Guest lists & check-in: pick an event, check people in, share the door link
const AdminGuests = ({ startEventId = '', onOpen }) => {
  const [when, setWhen] = useState('upcoming');
  const [events, setEvents] = useState(null);
  const [openId, setOpenId] = useState(startEventId);
  const [error, setError] = useState('');
  const [doorUrl, setDoorUrl] = useState('');

  useEffect(() => { setOpenId(startEventId); }, [startEventId]);

  useEffect(() => {
    setEvents(null);
    adminApi(`/events?when=${when}`).then((d) => setEvents(d.events)).catch((e) => setError(e.message));
  }, [when]);

  const api = useMemo(() => (openId ? {
    load: async (refresh) => {
      const d = await adminApi(`/events/${openId}/guests${refresh ? '?refresh=1' : ''}`);
      setDoorUrl(d.doorUrl);
      return d;
    },
    checkIn: (key, count) => adminApi(`/events/${openId}/checkin`, { method: 'POST', body: { key, count } }),
    addGuest: async (body) => {
      const r = await adminApi(`/events/${openId}/guests`, { method: 'POST', body });
      if (body.checkIn) await adminApi(`/events/${openId}/checkin`, { method: 'POST', body: { key: `guest:${r.id}`, count: Number(body.quantity) || 1 } });
      return r;
    },
    removeGuest: (id) => adminApi(`/events/${openId}/guests/${id}`, { method: 'DELETE' }),
  } : null), [openId]);

  if (openId && api) {
    return (
      <>
        <button type="button" className="ga-btn ga-btn-sm" style={{ marginBottom: 14 }} onClick={() => { setOpenId(''); onOpen?.(''); }}>← All events</button>
        <GuestList key={openId} api={api} admin title="Guest list & check-in" doorUrl={doorUrl} />
      </>
    );
  }

  return (
    <>
      {error && <p className="ga-note err">{error}</p>}
      <div className="ga-row" style={{ marginBottom: 16 }}>
        <div className="ga-seg">
          <button type="button" className={when === 'upcoming' ? 'on' : ''} onClick={() => setWhen('upcoming')}>Upcoming</button>
          <button type="button" className={when === 'past' ? 'on' : ''} onClick={() => setWhen('past')}>Past</button>
        </div>
        <span className="ga-spacer" />
        <span className="ga-small ga-muted">Open an event to check people in or copy its door link for a volunteer.</span>
      </div>
      {!events ? <div className="ga-loading">Loading events…</div> : events.length === 0 ? (
        <div className="ga-card ga-empty">No {when} events.</div>
      ) : (
        <div className="ga-card" style={{ padding: '6px 20px' }}>
          {events.map((e) => {
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
                    {fmtDay(e.date)} · {e.sold} sold{e.capacity ? ` of ${e.capacity}` : ''}{e.eventbrite ? ' · includes Eventbrite' : ''}
                  </div>
                  {e.capacity > 0 && <div className="ga-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>}
                </div>
                <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" onClick={() => { setOpenId(e.id); onOpen?.(e.id); }}>
                  {when === 'upcoming' ? 'Guest list' : 'View'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AdminGuests;

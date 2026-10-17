import React, { useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';

// "Sync tickets from Eventbrite": pulls new ticket types, prices and sale dates
// onto the website right away (normally Eventbrite's update does this by itself).
const syncApi = async (eventId) => {
  const res = await fetch(`${BACKEND_URL}/api/events/admin/sync-eventbrite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}`,
    },
    body: JSON.stringify(eventId ? { eventId } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your login expired. Please log out and log back in.');
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

const day = (d) => new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' });

const EventbriteSync = ({ eventId, onDone, label }) => {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    setResults(null);
    try {
      const data = await syncApi(eventId);
      setResults(data.results);
      onDone?.(data.results);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="eb-sync">
      <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={busy} onClick={run}>
        {busy ? 'Syncing…' : label || (eventId ? '↻ Sync tickets from Eventbrite' : '↻ Sync all tickets from Eventbrite')}
      </button>
      {error && <p className="ga-note err">{error}</p>}
      {results && (
        <div className="ga-note ok eb-sync-results" role="status">
          {results.length === 0 && <p>No upcoming events to sync.</p>}
          {results.map((r) => (
            <div key={r.id} className="eb-sync-row">
              <strong>{r.ok ? '✓' : '⚠️'} {r.name}</strong> <span className="ga-small">({day(r.date)})</span>
              {r.ok ? (
                <ul>
                  {r.tickets.map((t) => (
                    <li key={t.name}>
                      {t.name}: ${Number(t.price).toFixed(2)}
                      {t.hidden ? ' · Hidden on Eventbrite, so not shown on the site' : ''}
                      {t.onSaleStatus === 'NOT_YET_ON_SALE' ? ' · Not on sale yet' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ga-small">{r.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventbriteSync;

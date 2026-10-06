import React, { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GuestList from '../Components/GuestList.jsx';
import { BACKEND_URL } from '../Services/eventUtils';
import { adminApi } from '../Services/adminApi';

// /checkin/:eventId?key=...  Door check-in for volunteers (no login needed with the key).
// Without a key, an admin who is logged in can use it too.
const doorFetch = async (url, opts = {}) => {
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
};

const isAdmin = () => {
  try { return JSON.parse(localStorage.getItem('gfc_user') || 'null')?.role === 'admin'; } catch { return false; }
};

const CheckIn = () => {
  const { eventId } = useParams();
  const [params] = useSearchParams();
  const key = params.get('key') || '';
  const admin = !key && isAdmin();

  const api = useMemo(() => {
    if (key) {
      const base = `${BACKEND_URL}/api/door/${eventId}`;
      const q = `?key=${encodeURIComponent(key)}`;
      return {
        load: () => doorFetch(`${base}${q}`),
        checkIn: (k, count) => doorFetch(`${base}/checkin${q}`, { method: 'POST', body: { key: k, count } }),
        addGuest: (body) => doorFetch(`${base}/walkin${q}`, { method: 'POST', body }),
      };
    }
    return {
      load: (refresh) => adminApi(`/events/${eventId}/guests${refresh ? '?refresh=1' : ''}`),
      checkIn: (k, count) => adminApi(`/events/${eventId}/checkin`, { method: 'POST', body: { key: k, count } }),
      addGuest: async (body) => {
        const r = await adminApi(`/events/${eventId}/guests`, { method: 'POST', body });
        if (body.checkIn) await adminApi(`/events/${eventId}/checkin`, { method: 'POST', body: { key: `guest:${r.id}`, count: Number(body.quantity) || 1 } });
        return r;
      },
      removeGuest: (id) => adminApi(`/events/${eventId}/guests/${id}`, { method: 'DELETE' }),
    };
  }, [eventId, key]);

  return (
    <div className="gl-page">
      <Helmet>
        <title>Check-in | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="gl-brandbar">
        <span>Grown Folks™</span>
        <small>Door check-in</small>
      </div>
      {key || admin ? (
        <GuestList api={api} admin={admin} title="Door check-in" />
      ) : (
        <div className="gl-wrap">
          <p className="gl-error">This page needs a door link. Ask Vaughn to text you the check-in link, or <Link to="/login">log in</Link>.</p>
        </div>
      )}
    </div>
  );
};

export default CheckIn;

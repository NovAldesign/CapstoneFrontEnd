import { BACKEND_URL } from './eventUtils';

// Calls the admin dashboard API (/api/admin-hub) with your login token.
// Throws an Error with a friendly message when something fails.
export const adminApi = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/admin-hub${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    throw new Error('Your login expired. Please log out and log back in.');
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

// Members list lives on the older admin API
export const adminLegacy = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Something went wrong.');
  return data;
};

export const fmtDate = (d, opts = { month: 'short', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', ...opts }) : '';

export const fmtDay = (d) => fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric' });

export const timeAgo = (d) => {
  if (!d) return '';
  const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
};

export const downloadCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

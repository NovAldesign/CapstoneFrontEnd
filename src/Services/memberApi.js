// Member login (magic link) + member dashboard API
import { BACKEND_URL } from './eventUtils';

const API = `${BACKEND_URL}/api/member`;

export class SessionExpired extends Error {}

const call = async (path, { method = 'GET', body, auth = true } = {}) => {
  const token = localStorage.getItem('gfc_token');
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty reply */ }
  if (auth && (res.status === 401 || res.status === 403)) {
    throw new SessionExpired(data.error || 'Please log in again.');
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

const memberApi = {
  requestLink: (email) => call('/login-link', { method: 'POST', body: { email }, auth: false }),

  // Trade the emailed link for a login session
  verify: async (token) => {
    const data = await call('/verify', { method: 'POST', body: { token }, auth: false });
    localStorage.setItem('gfc_token', data.token);
    localStorage.setItem('gfc_user', JSON.stringify(data.user));
    return data.user;
  },

  me: () => call('/me'),
  update: (changes) => call('/me', { method: 'PATCH', body: changes }),
  pause: (months) => call('/pause', { method: 'POST', body: { months } }),
  resume: () => call('/resume', { method: 'POST' }),
  cancel: (reason) => call('/cancel', { method: 'POST', body: { reason } }),
  keep: () => call('/keep', { method: 'POST' }),
  perks: () => call('/perks'),
};

export default memberApi;

// Partner portal API (sponsors + Member Perks partners).
// Partners have their own sign-in, kept apart from member and staff logins.
import { BACKEND_URL } from './eventUtils';

const API = `${BACKEND_URL}/api/partner`;
const KEY = 'gfc_partner_token';

export class SessionExpired extends Error {}

export const partnerToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
const saveToken = (t) => { try { localStorage.setItem(KEY, t); } catch { /* private mode */ } };
export const signOutPartner = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

const call = async (path, { method = 'GET', body, auth = true } = {}) => {
  const token = partnerToken();
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
    throw new SessionExpired(data.error || 'Please sign in again.');
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

// Upload an image straight to Cloudinary with a signature from our server
const uploadImage = async (file) => {
  const sig = await call('/upload-signature');
  const data = new FormData();
  data.append('file', file);
  data.append('api_key', sig.apiKey);
  data.append('timestamp', sig.timestamp);
  data.append('folder', sig.folder);
  data.append('signature', sig.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: data });
  const result = await res.json().catch(() => ({}));
  if (!result.secure_url) throw new Error("That file didn't upload. Please try a PNG, JPG or SVG.");
  return result.secure_url;
};

const partnerApi = {
  requestLink: (email) => call('/login-link', { method: 'POST', body: { email }, auth: false }),
  verify: async (token) => {
    const data = await call('/verify', { method: 'POST', body: { token }, auth: false });
    saveToken(data.token);
    return data.partner;
  },
  me: () => call('/me'),
  save: (changes) => call('/me', { method: 'PATCH', body: changes }),
  agree: (name) => call('/agree', { method: 'POST', body: { name, agree: true } }),
  pay: () => call('/pay', { method: 'POST' }),
  confirmPayment: (sessionId) => call('/pay/confirm', { method: 'POST', body: { sessionId } }),
  perkStatus: (action) => call('/perk/status', { method: 'POST', body: { action } }),
  switchTo: async (kind, id) => {
    const data = await call('/switch', { method: 'POST', body: { kind, id } });
    saveToken(data.token);
    return data.partner;
  },
  uploadImage,
};

export default partnerApi;

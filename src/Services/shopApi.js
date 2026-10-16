import { BACKEND_URL } from './eventUtils';

// Shop: Holiday Passes, gift cards, merch pre-orders and printable downloads
// Holiday Passes appear at 12:00 AM ET on Black Friday (keep in sync with the backend shopCatalog.js)
export const PASS_RELEASE = '2026-11-27T00:00:00-05:00';
export const passesLive = (now = new Date()) => now >= new Date(PASS_RELEASE);

export const money = (cents = 0) => {
  const d = Number(cents) / 100;
  return `$${Number.isInteger(d) ? d : d.toFixed(2)}`;
};

const call = async (path, options = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/shop${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

export const getCatalog = () => call('/catalog');
export const startCheckout = (body) => call('/checkout', { method: 'POST', body: JSON.stringify(body) });
export const startMerchCheckout = (body) => call('/checkout/merch', { method: 'POST', body: JSON.stringify(body) });
export const startDigitalCheckout = (body) => call('/checkout/digital', { method: 'POST', body: JSON.stringify(body) });
export const getDownloads = (token) => call(`/downloads/${encodeURIComponent(token)}`);
export const downloadUrl = (token, file) => `${BACKEND_URL}/api/shop/download/${encodeURIComponent(token)}/${encodeURIComponent(file)}`;
export const unlockSample = (body) => call('/sample', { method: 'POST', body: JSON.stringify(body) });
export const sampleUrl = () => `${BACKEND_URL}/api/shop/sample/file`;
export const checkCard = (code) => call(`/card/${encodeURIComponent(String(code).trim())}`);
export const getShopOrder = (sessionId) => call(`/order/${encodeURIComponent(sessionId)}`);

export const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric' });

// "2026-10-07" in Eastern time (for date inputs)
export const todayYMD = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

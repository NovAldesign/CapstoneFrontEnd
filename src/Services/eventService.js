import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* -------------------------------------------------------
   Fetch all published GFC events from your backend
------------------------------------------------------- */
export const fetchGfcEvents = async () => {
  try {
    const { data } = await axios.get(`${API}/api/events`);
    return data;
  } catch (err) {
    console.error('fetchGfcEvents error:', err);
    return [];
  }
};

/* -------------------------------------------------------
   Fetch a single event by ID
------------------------------------------------------- */
export const fetchEventById = async (id) => {
  try {
    const { data } = await axios.get(`${API}/api/events/${id}`);
    return data;
  } catch (err) {
    console.error('fetchEventById error:', err);
    return null;
  }
};

/* -------------------------------------------------------
   Validate a promo code
------------------------------------------------------- */
export const validatePromoCode = async (eventId, code, ticketTypeId, quantity) => {
  const { data } = await axios.post(
    `${API}/api/events/${eventId}/validate-promo`,
    { code, ticketTypeId, quantity }
  );
  return data;
};

/* -------------------------------------------------------
   Create a Stripe PaymentIntent
   Returns { clientSecret, orderId, total, subtotal, discount }
------------------------------------------------------- */
export const createPaymentIntent = async ({
  eventId,
  ticketTypeId,
  quantity,
  buyerName,
  buyerEmail,
  promoCode,
}) => {
  const { data } = await axios.post(
    `${API}/api/events/${eventId}/create-payment-intent`,
    { ticketTypeId, quantity, buyerName, buyerEmail, promoCode }
  );
  return data;
};

/* -------------------------------------------------------
   Format cents to display dollars
   e.g. 5000 → '$50.00'
------------------------------------------------------- */
export const formatPrice = (cents) => {
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

/* -------------------------------------------------------
   Format event date for display
   e.g. 'Saturday, April 5, 2025'
------------------------------------------------------- */
export const formatEventDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/* -------------------------------------------------------
   Format event time for display
   e.g. '7:00 PM'
------------------------------------------------------- */
export const formatEventTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// -------------------------------------------------------
// Auth helper — reads your stored token for admin calls
// -------------------------------------------------------
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* -------------------------------------------------------
   PUBLIC — Fetch all published events
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
   PUBLIC — Fetch a single event by ID
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
   PUBLIC — Validate a promo code
------------------------------------------------------- */
export const validatePromoCode = async (eventId, code, ticketTypeId, quantity) => {
  const { data } = await axios.post(
    `${API}/api/events/${eventId}/validate-promo`,
    { code, ticketTypeId, quantity }
  );
  return data;
};

/* -------------------------------------------------------
   PUBLIC — Create a Stripe PaymentIntent
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
   ADMIN — Fetch all events (all statuses: draft, published, etc.)
------------------------------------------------------- */
export const getAllEvents = async () => {
  try {
    const { data } = await axios.get(`${API}/api/events/admin/all`, {
      headers: authHeader(),
    });
    return data;
  } catch (err) {
    console.error('getAllEvents error:', err);
    return [];
  }
};

/* -------------------------------------------------------
   ADMIN — Create a new event (multipart/form-data for image)
------------------------------------------------------- */
export const createEvent = async (formData) => {
  const { data } = await axios.post(`${API}/api/events`, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/* -------------------------------------------------------
   ADMIN — Update an existing event
------------------------------------------------------- */
export const updateEvent = async (id, formData) => {
  const { data } = await axios.put(`${API}/api/events/${id}`, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/* -------------------------------------------------------
   ADMIN — Delete an event
------------------------------------------------------- */
export const deleteEvent = async (id) => {
  const { data } = await axios.delete(`${API}/api/events/${id}`, {
    headers: authHeader(),
  });
  return data;
};

/* -------------------------------------------------------
   ADMIN — Fetch all orders for a specific event
------------------------------------------------------- */
export const fetchEventOrders = async (eventId) => {
  try {
    const { data } = await axios.get(`${API}/api/events/${eventId}/orders`, {
      headers: authHeader(),
    });
    return data;
  } catch (err) {
    console.error('fetchEventOrders error:', err);
    return [];
  }
};

/* -------------------------------------------------------
   UTIL — Format cents to display dollars
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
   UTIL — Format event date for display
   e.g. 'Saturday, April 5, 2025'
------------------------------------------------------- */
export const formatEventDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  });
};

/* -------------------------------------------------------
   UTIL — Format event time for display
   e.g. '7:00 PM'
------------------------------------------------------- */
export const formatEventTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
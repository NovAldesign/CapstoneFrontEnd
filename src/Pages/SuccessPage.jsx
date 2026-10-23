import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../Services/eventUtils';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../Context/CartContext.jsx';

const SuccessPage = () => {
  const { clearCart, applyPromoCode } = useCart();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get('session_id') || '';
  const [offer, setOffer] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Empty the bag once the purchase is complete
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // "Add another event in the next 15 minutes and keep your discount" (a real, server-side deadline)
  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    let tries = 0;
    const load = () =>
      fetch(`${BACKEND_URL}/api/events/addon-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!live) return;
          if (d.ok) setOffer(d);
          else if (d.reason === 'not-paid' && tries++ < 4) setTimeout(load, 2500); // payment still confirming
        })
        .catch(() => {});
    load();
    return () => { live = false; };
  }, [sessionId]);

  useEffect(() => {
    if (!offer) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [offer]);

  const msLeft = offer ? new Date(offer.expiresAt).getTime() - now : 0;
  const clock = `${Math.floor(Math.max(0, msLeft) / 60000)}:${String(Math.floor((Math.max(0, msLeft) % 60000) / 1000)).padStart(2, '0')}`;
  const useOffer = () => {
    applyPromoCode(offer.code);
    navigate('/events');
  };

  return (
    <div
      className="success-page-container"
      style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 20px', textAlign: 'center' }}
    >
      <Helmet>
        <title>You're In! | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{ fontSize: '60px', color: '#C5A059', marginBottom: '20px' }}>✓</div>

      <h1 className="playfair" style={{ fontSize: '36px', color: '#002147', marginBottom: '15px' }}>
        You're In!
      </h1>

      <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '35px' }}>
        Thanks for grabbing your tickets! Your ticket email with your confirmation code
        is on its way. If you don't see it in a few minutes, check your spam folder.
      </p>

      {offer && msLeft > 0 && (
        <div
          role="region"
          aria-label="Add another event"
          style={{ border: '2px dashed #C5A059', background: '#FBF8F3', borderRadius: '8px', padding: '22px', marginBottom: '28px', textAlign: 'left' }}
        >
          <p style={{ margin: '0 0 6px', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#7A5A1E', fontWeight: 700 }}>
            Keep your discount · {clock} left
          </p>
          <h2 className="playfair" style={{ margin: '0 0 8px', color: '#002147', fontSize: '22px' }}>
            Add another event and save {offer.percent}%
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '15px', color: '#444', lineHeight: 1.6 }}>
            Grab tickets to one more event in the next 15 minutes and get the same {offer.percent}% you'd get booking them together.
            Your code <strong>{offer.code}</strong> is applied when you tap below.
          </p>
          <button
            type="button"
            onClick={useOffer}
            style={{ background: '#002147', color: '#fff', border: 0, padding: '12px 22px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
          >
            Pick another event
          </button>
        </div>
      )}

      <div
        className="success-badge-box"
        style={{
          background: '#f9f9f9',
          border: '1px solid #EAEAEA',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '40px',
          textAlign: 'left',
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', color: '#002147', fontSize: '18px' }}>What's Next</h2>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <li>Add the event to your calendar from your ticket email.</li>
          <li>At check-in, just give your name or show your ticket email.</li>
          <li>
            Celebrating something? <Link to="/celebrate" style={{ color: '#7A5A1E', fontWeight: 600 }}>Bring your crew</Link>.
          </li>
        </ul>
      </div>

      <Link
        to="/events"
        className="btn-gold-card"
        style={{
          display: 'inline-block',
          backgroundColor: '#002147',
          color: '#fff',
          textDecoration: 'none',
          padding: '14px 30px',
          borderRadius: '4px',
          fontWeight: 'bold',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#C5A059')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#002147')}
      >
        See More Events
      </Link>
    </div>
  );
};

export default SuccessPage;
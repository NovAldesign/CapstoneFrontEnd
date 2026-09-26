import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext.jsx';

const SuccessPage = () => {
  const { clearCart } = useCart();

  // Empty the bag once the purchase is complete
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div
      className="success-page-container"
      style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 20px', textAlign: 'center' }}
    >
      <div style={{ fontSize: '60px', color: '#C5A059', marginBottom: '20px' }}>✓</div>

      <h1 className="playfair" style={{ fontSize: '36px', color: '#002147', marginBottom: '15px' }}>
        You're In! 🎉
      </h1>

      <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '35px' }}>
        Thanks for grabbing your tickets! Your ticket email with your confirmation code
        is on its way. If you don't see it in a few minutes, check your spam folder.
      </p>

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
        <h3 style={{ margin: '0 0 10px 0', color: '#002147', fontSize: '18px' }}>✨ What's Next</h3>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <li>Add the event to your calendar from your ticket email.</li>
          <li>At check-in, just give your name or show your ticket email.</li>
          <li>
            Celebrating something? <Link to="/celebrate" style={{ color: '#9A7630', fontWeight: 600 }}>Bring your crew</Link>.
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
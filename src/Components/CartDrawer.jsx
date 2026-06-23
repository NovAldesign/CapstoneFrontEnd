import React, { useState } from 'react';
import { useCart } from '../Context/CartContext.jsx';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, subtotalInCents, discountInCents, totalInCents, discountRate, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  // 1. Get the current user email from local storage or context if they are logged in
  const getCustomerEmail = () => {
    // If you store user data in localStorage after login, grab it here
    const savedUser = localStorage.getItem('user'); 
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) return parsed.email;
      } catch (e) {
        console.error("Error reading logged-in user email:", e);
      }
    }
    // Default fallback if a guest is checking out
    return 'guest@example.com'; 
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://capstonebackend-production-87ed.up.railway.app';
      
      // Target the exact single-intent backend endpoint we built for your member discounts
      const targetUrl = `${baseUrl}/api/checkout/create-intent`;
      
      // Pull the primary ticket item currently selected in the cart drawer
      const activeItem = cartItems[0];
      const buyerEmail = getCustomerEmail();

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeItem.eventId,
          eventName: activeItem.eventName,      // <--- PASSED SAFELY HERE FOR STRIPE LOOKUPS
          ticketType: activeItem.ticketTypeName,
          quantity: activeItem.quantity,
          buyerName: 'GFC Valued Guest',         // Fallback placeholder (or pass logged-in name)
          buyerEmail: buyerEmail,                // Verified email used to check Stripe Subscriptions
          unitPrice: activeItem.priceInCents / 100 // Convert cents back to basic dollar value (e.g. 35)
        })
      });

      const data = await response.json();

      // Route the secret to your frontend Stripe elements modal container or payment page
      if (data.clientSecret) {
        // Redirects to your custom payment element page passing the checkout configuration tokens
        window.location.href = `/payment-checkout?secret=${data.clientSecret}&order=${data.orderId}`;
      } else {
        alert(data.error || 'Checkout initialization failed.');
      }
    } catch (err) {
      console.error("Stripe payment intent creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, display: 'flex' }}>
      {/* Dark Overlay background shadow dismisses the drawer when clicked */}
      <div onClick={onClose} style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)', transition: 'opacity 0.3s' }} />

      {/* Sliding Main Panel Area */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: '100%', maxWidth: '450px', height: '100%', backgroundColor: '#fff', boxShadow: '-4px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '30px' }}>
        
        {/* Drawer Header Layout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#002147', margin: 0, fontSize: '24px' }}>Your Connection Pass</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        {/* Dynamic Ticket Mapping Container */}
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#777', marginTop: '40px' }}>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: '13px' }}>Select an upcoming gathering to begin intentional real-world connections.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.eventId}-${item.ticketTypeId}`} style={{ borderBottom: '1px solid #f9f9f9', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#002147', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px' }}>{item.eventName}</span>
                  <span>${((item.priceInCents * item.quantity) / 100).toFixed(2)}</span>
                </div>
                <div style={{ color: '#C5A059', fontSize: '13px', marginBottom: '10px' }}>{item.ticketTypeName}</div>
                
                {/* Quantity adjustments row selectors */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)} style={{ padding: '4px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)} style={{ padding: '4px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.eventId, item.ticketTypeId)} style={{ background: 'none', border: 'none', color: '#cc0000', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary calculations and dynamic Discount displays */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '8px', fontSize: '14px' }}>
              <span>Subtotal</span>
              <span>${(subtotalInCents / 100).toFixed(2)}</span>
            </div>
            {discountInCents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                <span>Bundle Discount ({discountRate * 100}%)</span>
                <span>-${(discountInCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '19px', fontWeight: 'bold', color: '#002147', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <span>Total Due</span>
              <span>${(totalInCents / 100).toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={loading} 
              style={{ width: '100%', marginTop: '20px', backgroundColor: '#002147', color: '#fff', padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#C5A059')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#002147')}
            >
              {loading ? 'Processing Member Perks...' : 'Checkout & Claim Tickets'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
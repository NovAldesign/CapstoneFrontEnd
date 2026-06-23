import React, { useState } from 'react';
import { useCart } from '../Context/CartContext.jsx';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, subtotalInCents, discountInCents, totalInCents, discountRate, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // New local state to capture customer details directly in the drawer
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Validation check: Ensure they provide an email so Stripe can scan for memberships
    if (!emailInput.trim()) {
      alert('Please enter your email address to check for membership perks and process your tickets.');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://railway.app';
      const targetUrl = `${baseUrl}/api/checkout/create-intent`;
      
      // Pull the primary ticket item currently selected in the cart drawer
      const activeItem = cartItems[0]; 

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeItem.eventId,
          eventName: activeItem.eventName,      
          ticketType: activeItem.ticketTypeName,
          quantity: activeItem.quantity,
          buyerName: nameInput.trim() || 'GFC Valued Guest',         
          buyerEmail: emailInput.trim().toLowerCase(), // Sent to backend to verify Stripe subscription
          unitPrice: activeItem.priceInCents / 100 
        })
      });

      const data = await response.json();

      if (data.clientSecret) {
        // Redirects to your custom payment processing template page
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
      <div onClick={onClose} style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)', transition: 'opacity 0.3s' }} />

      <div style={{ position: 'absolute', right: 0, top: 0, width: '100%', maxWidth: '450px', height: '100%', backgroundColor: '#fff', boxShadow: '-4px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '30px' }}>
        
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

        {/* Guest Customer Information Form Block */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingBottom: '15px', paddingTop: '15px' }}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#002147', margin: '0 0 10px 0', fontSize: '15px' }}>
              Subscriber & Attendee Validation
            </h4>
            <p style={{ fontSize: '11px', color: '#666', marginTop: 0, marginBottom: '10px' }}>
              Members: Enter your exact subscription email address to auto-apply your free passes and tier discounts.
            </p>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
            />
            <input 
              type="email" 
              placeholder="Email Address (Required)" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Summary calculations and dynamic displays */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
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
            
            <p style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '10px', marginBottom: 0 }}>
              * Final discounts are validated and shown on the next payment screen.
            </p>

            <button 
              onClick={handleCheckout} 
              disabled={loading} 
              style={{ width: '100%', marginTop: '12px', backgroundColor: '#002147', color: '#fff', padding: '14px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#C5A059')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#002147')}
            >
              {loading ? 'Verifying Member Profile...' : 'Continue to Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
// import React, { useState } from 'react';

// export default function EventTicketSelector({ event, customerEmail }) {
//   // Track quantities selected for each ticket type
//   // ticketTypes structure matches your Mongoose backend array
//   const [quantities, setQuantities] = useState({});

//   if (!event || !event.ticketTypes || event.ticketTypes.length === 0) {
//     return (
//       <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 text-center">
//         <p className="text-gray-600 font-medium">Standard Entry Tickets coming soon.</p>
//       </div>
//     );
//   }

//   // Handle local quantity updates safely
//   const handleQuantityChange = (ticketTypeId, amount, maxAvailable) => {
//     const currentQty = quantities[ticketTypeId] || 0;
//     const newQty = Math.max(0, currentQty + amount);
    
//     if (newQty > maxAvailable) {
//       alert(`Only ${maxAvailable} tickets left for this pass tier.`);
//       return;
//     }

//     setQuantities({
//       ...quantities,
//       [ticketTypeId]: newQty,
//     });
//   };

//   // Compute live subtotal dynamically based on selection layout cents
//   const selectedItems = event.ticketTypes
//     .filter((tier) => (quantities[tier._id] || 0) > 0)
//     .map((tier) => ({
//       eventId: event._id,
//       eventName: event.name,
//       ticketTypeId: tier._id,
//       ticketTypeName: tier.name,
//       priceInCents: tier.price * 100, // Frontend uses standard dollars, backend handles integer cents
//       quantity: quantities[tier._id],
//     }));

//   const totalTicketsSelected = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
//   const rawSubtotalInCents = selectedItems.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
//   const rawSubtotalDollars = (rawSubtotalInCents / 100).toFixed(2);

//   // Initialize secure Stripe Session handshake
//   const handleCheckout = async () => {
//     if (selectedItems.length === 0) {
//       alert('Please select at least one ticket pass to proceed to checkout.');
//       return;
//     }

//     try {
//       // Direct call executing your POST /api/events/checkout endpoint layout logic
//       const response = await fetch('https://capstonebackend-production-87ed.up.railway.app/api/events/checkout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           customerEmail: customerEmail || undefined,
//           cartItems: selectedItems,
//         }),
//       });

//       const data = await response.json();

//       if (data.url) {
//         // 🚀 Redirect out cleanly to safe external Stripe checkout window wrapper
//         window.location.href = data.url;
//       } else {
//         alert(data.error || 'Failed to initialize payment process window.');
//       }
//     } catch (err) {
//       console.error('Network Error checking out:', err);
//       alert('Could not establish connection to the server payment system.');
//     }
//   };

//   return (
//     <div className="w-full max-w-md border border-gray-200 rounded-2xl bg-white shadow-sm p-6 mt-6">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Select Passes</h3>
      
//       <div className="space-y-4 mb-6">
//         {event.ticketTypes.map((tier) => {
//           const selectedQty = quantities[tier._id] || 0;
//           const remainingTickets = tier.quantity - (tier.sold || 0);
//           const isSoldOut = remainingTickets <= 0;

//           return (
//             <div key={tier._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-slate-50">
//               <div className="flex-1 pr-4">
//                 <p className="font-semibold text-slate-800 text-sm">{tier.name}</p>
//                 <p className="text-amber-700 font-bold text-sm mt-0.5">${tier.price}</p>
//                 {tier.description && <p className="text-xs text-gray-500 mt-1">{tier.description}</p>}
//               </div>

//               {isSoldOut ? (
//                 <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Sold Out</span>
//               ) : (
//                 <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-1">
//                   <button
//                     type="button"
//                     onClick={() => handleQuantityChange(tier._id, -1, remainingTickets)}
//                     className="w-7 h-7 text-sm font-bold flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
//                   >
//                     –
//                   </button>
//                   <span className="w-4 text-center font-semibold text-slate-800 text-sm">{selectedQty}</span>
//                   <button
//                     type="button"
//                     onClick={() => handleQuantityChange(tier._id, 1, remainingTickets)}
//                     className="w-7 h-7 text-sm font-bold flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
//                   >
//                     +
//                   </button>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {totalTicketsSelected > 0 && (
//         <div className="pt-4 border-t border-gray-100 mb-4">
//           <div className="flex justify-between items-center text-sm mb-2">
//             <span className="text-gray-600">Total Tickets:</span>
//             <span className="font-semibold text-slate-800">{totalTicketsSelected}</span>
//           </div>
//           <div className="flex justify-between items-center text-base font-bold">
//             <span className="text-slate-900">Subtotal:</span>
//             <span className="text-slate-900">${rawSubtotalDollars}</span>
//           </div>
//           <p className="text-[11px] text-gray-400 mt-2 italic leading-tight">
//             * Adding tickets from different events automatically triggers your multi-event checkout bundle discount tiers.
//           </p>
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={handleCheckout}
//         disabled={totalTicketsSelected === 0}
//         className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
//           totalTicketsSelected > 0
//             ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
//             : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//         }`}
//       >
//         Proceed to Secure Checkout
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; 
import {
  fetchGfcEvents,
  formatEventDate,
  formatEventTime,
} from "../Services/eventService";
import "../Styles/Events.css";

const EventbriteCardContent = ({ eventbriteId, fallbackImage, fallbackTitle, children }) => {
  const [externalData, setExternalData] = useState(null);

  useEffect(() => {
    if (!eventbriteId) return;
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app';
    
    fetch(`${backendUrl}/api/events/external/${eventbriteId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setExternalData(data);
      })
      .catch((err) => console.error("Error loading Eventbrite asset package:", err));
  }, [eventbriteId]);

  const displayImage = externalData?.image || fallbackImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800";
  const displayTitle = externalData?.title || fallbackTitle;

  return (
    <>
      <div className="event-img-wrapper" style={{ width: '100%', height: '240px', overflow: 'hidden', backgroundColor: '#002147' }}>
        <img 
          src={displayImage} 
          alt={displayTitle} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>
      <div className="event-info">
        {children(displayTitle, externalData?.description, displayImage, externalData?.ticketTiers)}
      </div>
    </>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedModalEvent, setSelectedModalEvent] = useState(null);
  const [isExpandedOverview, setIsExpandedOverview] = useState(false);
  
  // Basket State Controls
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchGfcEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching GFC events:", error);
        setEvents([]); 
      } finally {
        setLoading(false);
      }
    };
    getEvents();
  }, []);

  const parseCleanPrice = (ticket) => {
    if (ticket.priceInCents) return ticket.priceInCents / 100;
    const rawNum = Number(ticket.price || 0);
    return (rawNum > 0 && rawNum < 1) ? rawNum * 100 : rawNum;
  };

  const handleAddToCart = (eventInstance, selectedTier) => {
    const calculatedPrice = parseCleanPrice(selectedTier);
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.ticketTypeId === (selectedTier.id || selectedTier._id));
      
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      
      return [...prevCart, {
        eventId:        eventInstance._id,
        eventName:      eventInstance.name || eventInstance.resolvedTitle,
        ticketTypeId:   selectedTier.id || selectedTier._id || "standard-pass",
        ticketTypeName: selectedTier.name,
        priceInCents:   Math.round(calculatedPrice * 100), 
        quantity:       1
      }];
    });

    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (ticketTypeId) => {
    setCart(prevCart => prevCart.filter(item => item.ticketTypeId !== ticketTypeId));
  };

  const handleCartStripeCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app';
      
      const response = await fetch(`${backendUrl}/api/events/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: undefined,
          cartItems: cart
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initialize checkout gateway.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Could not establish communication with checkout servers.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const now = new Date();
  const upcomingEvents = (Array.isArray(events) ? events : [])
    .filter((e) => e && new Date(e.date) >= now && e.status?.toLowerCase() === "published")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const uniqueEventIdsInCart = [...new Set(cart.map(item => item.eventId))];
  let currentDiscountLabel = "";
  if (uniqueEventIdsInCart.length === 2) currentDiscountLabel = "10% Multi-Event Discount Applied!";
  if (uniqueEventIdsInCart.length >= 3) currentDiscountLabel = "15% Mega-Bundle Discount Applied!";

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.priceInCents * item.quantity) / 100), 0);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading GFC Experiences...</div>
      </div>
    );
  }

  return (
    <div className="events-page-wrapper" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Meta Data for SEO */}
      <Helmet>
        <title>Events | Grown Folks Collective</title>
        <meta 
          name="description" 
          content="Join our next curated gathering in Atlanta. Trade networking for true belonging in a sanctuary designed for high-level connection, joy, and alcohol-free community." 
        />
      </Helmet>

      {/* Floating Sticky Cart Drawer Trigger Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#002147', color: '#fff', border: '2px solid #C5A059', borderRadius: '50%', width: '65px', height: '65px', cursor: 'pointer', zIndex: 900, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: '18px' }}>👜</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#C5A059' }}>{cartTotalItems}</span>
        </button>
      )}

      {/* HERO */}
      <header className="page-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">The Experience</span>
            <h1 className="playfair luxe-title-white">Curated<br />Gatherings.</h1>
            <div className="gold-spacer-v2"></div>
            <p className="narrative-lead-white" style={{ marginBottom: '25px' }}>Intimate spaces in Atlanta designed for deep connection.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
              <button 
                onClick={() => window.location.href = '/membership'}
                style={{ backgroundColor: '#C5A059', color: '#002147', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
              >
                Join the Collective to Save
              </button>
              <button 
                onClick={() => window.location.href = '/partnerships'}
                style={{ backgroundColor: 'transparent', color: '#fff', border: '2px solid #fff', padding: '12px 24px', fontSize: '14px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
              >
                Partner with Us
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* RESTORED FAMILY NARRATIVE */}
      <section className="family-narrative-section" style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div className="family-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            
            <div className="family-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" 
                alt="Grown Folks Collective Connection" 
                style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }} 
              />
            </div>

            <div className="family-text-content">
              <h2 className="playfair" style={{ color: '#002147', fontSize: '38px', margin: '0 0 20px 0', fontWeight: 'normal' }}>Connection.</h2>
              <p className="narrative-lead" style={{ color: '#C5A059', fontSize: '18px', lineHeight: '1.6', fontWeight: '500', marginBottom: '20px' }}>
                Whether you are leading a firm, scaling a startup, or mastering a craft — the view at the top can be isolating.
              </p>
              <p style={{ color: '#444', fontSize: '15px', lineHeight: '1.7', marginBottom: '15px' }}>
                The <strong>Grown Folks Collective</strong> brings together professionals and entrepreneurs from all fields who are ready to trade "networking" for <strong>true belonging.</strong> We gather to find joy in shared passions and conversations that only happen when you're among peers who understand the weight of responsibility.
              </p>
              <p style={{ color: '#444', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px' }}>
                This is your space to <strong>unplug from professional stress</strong> and reconnect with the things you love. We aren't just building a network; we are building a family.
              </p>

              <div className="family-values" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', borderTop: '1px solid #eee', paddingTop: '25px' }}>
                <div className="value-item">
                  <strong style={{ color: '#002147', display: 'block', fontSize: '14px', marginBottom: '4px' }}>Diverse Expertise</strong>
                  <span style={{ color: '#666', fontSize: '12.5px', lineHeight: '1.4' }}>Leaders from every industry, united by values.</span>
                </div>
                <div className="value-item">
                  <strong style={{ color: '#002147', display: 'block', fontSize: '14px', marginBottom: '4px' }}>Human First</strong>
                  <span style={{ color: '#666', fontSize: '12.5px', lineHeight: '1.4' }}>Connecting as individuals, not just job titles.</span>
                </div>
                <div className="value-item">
                  <strong style={{ color: '#002147', display: 'block', fontSize: '14px', marginBottom: '4px' }}>Pure Joy</strong>
                  <span style={{ color: '#666', fontSize: '12.5px', lineHeight: '1.4' }}>Rediscovering life beyond the daily grind.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EVENTS REGION */}
      <div className="container main-content-padding">
        <section className="section-spacing" style={{ paddingTop: '20px' }}>
          <div className="section-header-center">
            <span className="gold-label">Upcoming</span>
            <h2 className="playfair section-title-navy">The Next Chapter</h2>
            <div className="gold-spacer-small"></div>
          </div>

          {upcomingEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#555" }}>
              <p className="narrative-lead" style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto 20px" }}>
                Our next intentional gathering is currently being curated. Join the family to be the first to know.
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <div key={event._id || Math.random()} className="event-card">
                  <EventbriteCardContent
                    eventbriteId={event.eventbriteId}
                    fallbackImage={event.coverImage}
                    fallbackTitle={event.name}
                  >
                    {(resolvedTitle, resolvedDescription, resolvedImage, externalTiers) => {
                      const availableTiers = event.ticketTypes && event.ticketTypes.length > 0 
                        ? event.ticketTypes 
                        : externalTiers || [];

                      return (
                        <>
                          <span className="event-date-tag">
                            {formatEventDate(event.date)} &nbsp;·&nbsp; {formatEventTime(event.date)}
                          </span>
                          
                          <h3 
                            className="playfair" 
                            style={{ cursor: "pointer", color: '#002147' }}
                            onClick={() => {
                              setIsExpandedOverview(false);
                              setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers });
                            }}
                          >
                            {resolvedTitle}
                          </h3>
                          
                          {event.location && (event.location.name || event.location.address || event.location.city) && (
                            <div className="event-location" style={{ marginBottom: '12px' }}>
                              {event.location.name}{event.location.address && ` - ${event.location.address}`}{event.location.city && `, ${event.location.city}`}
                            </div>
                          )}

                          <p 
                            onClick={() => {
                              setIsExpandedOverview(false);
                              setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers });
                            }}
                            style={{ fontSize: '13px', color: '#C5A059', cursor: 'pointer', marginBottom: '18px', fontWeight: '600' }}
                          >
                            View Details & Tiers →
                          </p>

                          <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                            {availableTiers.map((ticket, index) => {
                              const finalPrice = parseCleanPrice(ticket);
                              return (
                                <div 
                                  key={ticket._id || index} 
                                  onClick={() => {
                                    setIsExpandedOverview(false);
                                    setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers });
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                  <span style={{ fontWeight: '600', color: '#002147' }}>{ticket.name}</span>
                                  <span style={{ color: '#C5A059', fontWeight: 'bold' }}>${finalPrice.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    }}
                  </EventbriteCardContent>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* SHOPPING BAG SIDEBAR OVERLAY LAYER */}
      {isCartOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 33, 71, 0.4)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setIsCartOpen(false)}
        >
          <div 
            style={{ width: '100%', maxWidth: '420px', height: '100%', backgroundColor: '#fff', boxShadow: '-10px 0 35px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '30px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h3 className="playfair" style={{ color: '#002147', margin: 0, fontSize: '22px' }}>Your Pass Selections</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#777' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#777', padding: '40px 0' }}>
                  <p style={{ fontSize: '15px' }}>Your shopping bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.ticketTypeId} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', position: 'relative', background: '#fcfcfc' }}>
                    <button 
                      onClick={() => handleRemoveFromCart(item.ticketTypeId)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Remove
                    </button>
                    <div style={{ fontWeight: '700', color: '#002147', fontSize: '14px', maxWidth: '85%' }}>{item.eventName}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{item.ticketTypeName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#333' }}>Qty: <strong>{item.quantity}</strong></span>
                      <span style={{ fontWeight: '700', color: '#C5A059', fontSize: '14px' }}>${((item.priceInCents * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                {currentDiscountLabel && (
                  <div style={{ background: '#e6fffa', color: '#006652', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '12px', textAlign: 'center', border: '1px solid #b2f5ea' }}>
                    🎉 {currentDiscountLabel}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#002147', marginBottom: '20px' }}>
                  <span>Subtotal:</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCartStripeCheckout}
                  disabled={checkoutLoading}
                  style={{ width: '100%', padding: '14px', backgroundColor: checkoutLoading ? '#ccc' : '#002147', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: checkoutLoading ? 'not-allowed' : 'pointer' }}
                >
                  {checkoutLoading ? 'Connecting to Stripe...' : 'Proceed to Secure Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedModalEvent && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 33, 71, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedModalEvent(null)}
        >
          <div 
            style={{ backgroundColor: '#fff', width: '100%', maxWidth: '750px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedModalEvent(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', color: '#002147', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              ✕
            </button>

            <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative', backgroundColor: '#002147' }}>
              <img 
                src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage} 
                alt={selectedModalEvent.resolvedTitle} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.95))', padding: '20px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* LOCATION */}
              {selectedModalEvent.location && (selectedModalEvent.location.name || selectedModalEvent.location.address) && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Location</h3>
                  <div style={{ fontSize: '14px', color: '#333', background: '#fbf8f3', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', lineHeight: '1.5' }}>
                    {selectedModalEvent.location.name && <strong>{selectedModalEvent.location.name}<br /></strong>}
                    {selectedModalEvent.location.address && <>{selectedModalEvent.location.address}<br /></>}
                    {selectedModalEvent.location.city}{selectedModalEvent.location.state && `, ${selectedModalEvent.location.state}`}
                  </div>
                </div>
              )}

              {/* AGENDA */}
              {selectedModalEvent.agenda && selectedModalEvent.agenda.length > 0 && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                    {selectedModalEvent.agenda.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                        <strong style={{ color: '#C5A059', minWidth: '70px' }}>{item.time}</strong>
                        <span style={{ color: '#444' }}>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OVERVIEW */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Event Overview</h3>
                <div 
                  style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', maxHeight: isExpandedOverview ? 'none' : '160px', overflow: 'hidden', position: 'relative' }}
                  dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || "No overview available." }}
                />
                
                {(selectedModalEvent.resolvedDescription || selectedModalEvent.description) && (
                  <button 
                    onClick={() => setIsExpandedOverview(!isExpandedOverview)}
                    style={{ background: 'none', border: 'none', color: '#C5A059', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: '6px 0', display: 'block', marginTop: '6px' }}
                  >
                    {isExpandedOverview ? "Read Less" : "Read More..."}
                  </button>
                )}
              </div>

              {/* FAQS */}
              {selectedModalEvent.faqs && selectedModalEvent.faqs.length > 0 && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Frequently Asked Questions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                    {selectedModalEvent.faqs.map((faq, idx) => (
                      <div key={idx}>
                        <strong style={{ color: '#002147', display: 'block' }}>Q: {faq.question}</strong>
                        <span style={{ color: '#555', lineHeight: '1.5', display: 'block', marginTop: '2px' }}>A: {faq.answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TERMS */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Policies & Terms</h3>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', background: '#fff5f5', padding: '14px', borderRadius: '8px', border: '1px solid #fed7d7', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>Refund Policy:</strong> All sales are final. Admission passes are entirely non-refundable.
                  </div>
                  <div style={{ color: '#555', fontWeight: '600', borderTop: '1px dashed #fecaca', paddingTop: '8px', marginTop: '4px', fontSize: '12px' }}>
                    By purchasing a ticket and attending this event, guests acknowledge and accept that Grown Folks Collective and its affiliated organizers shall not be held liable for any personal injury, loss, or damages incurred during the event. Attendance is at the guest's own risk.
                  </div>
                </div>
              </div>

            </div>

            {/* PURCHASING STRIP FOOTER */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#777', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Ticket Tier
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedModalEvent.availableTiers || []).map((tier, index) => {
                  const finalPrice = parseCleanPrice(tier);

                  return (
                    <div key={tier._id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#002147', fontSize: '13.5px' }}>{tier.name}</div>
                        <div style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '13.5px' }}>${finalPrice.toFixed(2)}</div>
                      </div>

                      <button
                        onClick={() => {
                          handleAddToCart(selectedModalEvent, tier);
                          setSelectedModalEvent(null);
                        }}
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#002147', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Add Pass to Bag
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
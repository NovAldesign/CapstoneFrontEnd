import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; 
import { useCart } from "../Context/CartContext.jsx"; 
import {
  fetchGfcEvents,
  formatEventDate,
  formatEventTime,
} from "../Services/eventService";
import CartDrawer from "../Components/CartDrawer.jsx"; 
import "../Styles/Events.css";

// --- SUB-COMPONENT TO DYNAMICALLY FETCH & INJECT EVENTBRITE DETAILS ---
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
      .catch((err) => console.error("Error sync loading Eventbrite asset package:", err));
  }, [eventbriteId]);

  const displayImage = externalData?.image || fallbackImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800";
  const displayTitle = externalData?.title || fallbackTitle;

  return (
    <>
      <div className="event-img-wrapper">
        <img
          src={displayImage}
          alt={displayTitle}
          className="event-img"
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
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  
  // Modal State Management
  const [selectedModalEvent, setSelectedModalEvent] = useState(null);

  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchGfcEvents();
        console.log("📊 RAW EVENTS FROM BACKEND DATABASE:", data);
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

  // Secure dynamic single-ticket Stripe session router trigger
  const handleDirectStripeCheckout = async (eventInstance, selectedTier) => {
    try {
      setCheckoutLoading(`${eventInstance._id}-${selectedTier.name}`);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app';
      
      const targetPayload = {
        customerEmail: undefined, 
        cartItems: [
          {
            eventId: eventInstance._id,
            eventName: eventInstance.name || eventInstance.resolvedTitle,
            ticketTypeId: selectedTier.id || selectedTier._id || "standard-pass",
            ticketTypeName: selectedTier.name,
            priceInCents: selectedTier.priceInCents || (selectedTier.price * 100) || 3500, 
            quantity: 1
          }
        ]
      };

      const response = await fetch(`${backendUrl}/api/events/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetPayload),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initialize payment gateway checkout window.");
      }
    } catch (err) {
      console.error("Stripe Network Checkout Initialization Error:", err);
      alert("Could not establish communication with backend checkout servers.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const now = new Date();

  const upcomingEvents = (Array.isArray(events) ? events : [])
    .filter((e) => e && new Date(e.date) >= now && e.status?.toLowerCase() === "published")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = (Array.isArray(events) ? events : [])
    .filter((e) => e && new Date(e.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalCartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading GFC Events...</div>
      </div>
    );
  }

  return (
    <div className="events-page-wrapper">
      <Helmet>
        <title>Events | Grown Folks Collective</title>
        <meta 
          name="description" 
          content="Join our next curated gathering in Atlanta. Trade networking for true belonging in a sanctuary designed for high-level connection." 
        />
      </Helmet>

      {/* HERO SECTION */}
      <header className="page-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">The Experience</span>
            <h1 className="playfair luxe-title-white">
              Curated
              <br />
              Gatherings.
            </h1>
            <div className="gold-spacer-v2"></div>
            <p className="narrative-lead-white">
              From intimate dinners in Atlanta to dynamic local socials. Find your sanctuary.
            </p>
          </div>
        </div>
      </header>

      {/* MAIN EVENTS LIST */}
      <div className="container main-content-padding">
        <section className="section-spacing">
          <div className="section-header-center">
            <span className="gold-label">Upcoming</span>
            <h2 className="playfair section-title-navy">The Next Chapter</h2>
            <div className="gold-spacer-small"></div>
          </div>

          <div className="events-grid">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                return (
                  <div key={event._id || Math.random()} className="event-card">
                    <EventbriteCardContent
                      eventbriteId={event.eventbriteId}
                      fallbackImage={event.coverImage}
                      fallbackTitle={event.name}
                    >
                      {(resolvedTitle, resolvedDescription, resolvedImage, externalTiers) => {
                        // Fallback logic to establish available tiers dynamically
                        const availableTiers = event.ticketTypes && event.ticketTypes.length > 0 
                          ? event.ticketTypes.map(t => ({ name: t.name, price: t.price, _id: t._id, sold: t.sold, quantity: t.quantity }))
                          : externalTiers || [
                              { name: "Early Bird Admission Pass", price: 30.00, priceInCents: 3000 },
                              { name: "General Admission Pass", price: 35.00, priceInCents: 3500 }
                            ];

                        return (
                          <>
                            <span className="event-date-tag">
                              {formatEventDate(event.date)} &nbsp;·&nbsp; {formatEventTime(event.date)}
                            </span>
                            
                            <h3 
                              className="playfair" 
                              style={{ cursor: "pointer", transition: "color 0.2s" }}
                              onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
                              onMouseEnter={(e) => (e.target.style.color = '#C5A059')}
                              onMouseLeave={(e) => (e.target.style.color = '#002147')}
                            >
                              {resolvedTitle}
                            </h3>
                            
                            <div className="event-location" style={{ marginBottom: '15px' }}>
                              {event.location?.name} {event.location?.city && `, ${event.location.city}`}
                            </div>

                            <p 
                              onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
                              style={{ fontSize: '13px', color: '#C5A059', cursor: 'pointer', marginBottom: '15px', fontWeight: '600' }}
                            >
                              ✨ Click here to view Full Details, FAQs & Tiers →
                            </p>

                            {/* Ticket Tier Overview Layout Rows */}
                            <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                              {availableTiers.map((ticket, index) => {
                                const displayPrice = ticket.priceInCents ? (ticket.priceInCents / 100).toFixed(2) : Number(ticket.price).toFixed(2);
                                return (
                                  <div key={ticket._id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '6px 10px', borderRadius: '6px', marginBottom: '4px', fontSize: '12px' }}>
                                    <span style={{ fontWeight: '600', color: '#002147' }}>{ticket.name}</span>
                                    <span style={{ color: '#C5A059', fontWeight: 'bold' }}>${displayPrice}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }}
                    </EventbriteCardContent>
                  </div>
                );
              })
            ) : (
              <p className="no-events-msg">Our next intentional gathering is currently being curated.</p>
            )}
          </div>
        </section>

        {/* PAST EVENTS ARCHIVE */}
        {pastEvents.length > 0 && (
          <section className="past-events-archive">
            <div className="section-header-left">
              <span className="gold-label">Memories</span>
              <h2 className="playfair archive-title">The Legacy of Connection</h2>
              <div className="gold-spacer-v2"></div>
            </div>
            <div className="past-events-compact-grid">
              {pastEvents.map((event) => (
                <div key={event._id || Math.random()} className="past-event-mini-card">
                  <div className="past-img-wrapper">
                    <img src={event.coverImage || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400"} alt={event.name} className="past-img-grayscale" />
                  </div>
                  <div className="past-info-compact">
                    <h4 className="playfair">{event.name}</h4>
                    <p className="past-meta">{formatEventDate(event.date)}</p>
                    <span className="concluded-tag">Family Gathering Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ======================================================= */}
      {/* 🌟 EXPANDED DETAIL, FAQ & MULTI-PRICING MODAL LAYER */}
      {/* ======================================================= */}
      {selectedModalEvent && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 33, 71, 0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedModalEvent(null)}
        >
          <div 
            style={{ backgroundColor: '#fff', width: '100%', maxWidth: '750px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '92vh', animation: 'fadeInUp 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Cross */}
            <button 
              onClick={() => setSelectedModalEvent(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.95)', border: 'none', width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', color: '#002147', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              ✕
            </button>

            {/* Banner Header Image */}
            <div style={{ width: '100%', height: '260px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage} 
                alt={selectedModalEvent.resolvedTitle} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.95))', padding: '25px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
                  📅 {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '28px', tracking: '-0.5px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            {/* Scrollable Content Bay */}
            <div style={{ padding: '30px', overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
              
              {/* Event Location Block */}
              <div style={{ fontSize: '14px', color: '#333', background: '#fbf8f3', padding: '14px 18px', borderRadius: '10px', borderLeft: '4px solid #C5A059', marginBottom: '25px' }}>
                📍 <strong>Location Details:</strong> {selectedModalEvent.location?.name} {selectedModalEvent.location?.address && ` — ${selectedModalEvent.location.address}`}, {selectedModalEvent.location?.city}
              </div>

              {/* SECTION 1: FULL DESCRIPTION */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Experience Overview</h3>
              <div 
                style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#444', marginBottom: '30px' }}
                dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || "Join us for an intentional, curated social space designed for deep connection." }}
              />

              {/* SECTION 2: FREQUENTLY ASKED QUESTIONS (FAQs) */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Frequently Asked Questions</h3>
              <div style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#555', marginBottom: '30px', background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#002147', display: 'block' }}>Q: What is the dress code for this gathering?</strong>
                  <span style={{ display: 'block', marginTop: '2px' }}>A: Smart casual / upscale casual. We create premium environments that match our curated venues.</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#002147', display: 'block' }}>Q: Is this an environment that accommodates smoke-free preferences?</strong>
                  <span style={{ display: 'block', marginTop: '2px' }}>A: Absolutely. All GFC spaces are strictly 100% smoke-free and designed around clear wellness integration.</span>
                </div>
                <div>
                  <strong style={{ color: '#002147', display: 'block' }}>Q: Can I register at the door?</strong>
                  <span style={{ display: 'block', marginTop: '2px' }}>A: To preserve the curated, intimate setting of our experiences, all entry passes must be secured in advance via checkout.</span>
                </div>
              </div>

              {/* SECTION 3: TERMS & REFUND POLICY */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Refund & Transfer Policy</h3>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', marginBottom: '10px' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  • <strong>All Sales Final:</strong> Due to the curated arrangements, advance catering, and venue partnership structures, individual tickets are non-refundable.
                </p>
                <p style={{ margin: 0 }}>
                  • <strong>Pass Transfers:</strong> If professional priorities conflict, you may transfer your entry reservation pass to another qualified member of the collective up to 24 hours before the session. Simply reach out to sync coordinator profiles.
                </p>
              </div>

            </div>

            {/* SECTION 4: FLEXIBLE MULTI-PRICING CHECKOUT DOCK */}
            <div style={{ padding: '20px 30px', borderTop: '1px solid #eee', background: '#fdfdfd' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#999', marginBottom: '12px', fontWeight: 'bold' }}>
                Select Your Pass Tier to Complete Checkout
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedModalEvent.availableTiers.map((tier, index) => {
                  const displayPrice = tier.priceInCents ? (tier.priceInCents / 100).toFixed(2) : Number(tier.price).toFixed(2);
                  const isTierLoading = checkoutLoading === `${selectedModalEvent._id}-${tier.name}`;

                  return (
                    <div 
                      key={tier._id || index} 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#002147', fontSize: '14px' }}>{tier.name}</div>
                        <div style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '14px', marginTop: '2px' }}>${displayPrice}</div>
                      </div>

                      <button
                        onClick={() => handleDirectStripeCheckout(selectedModalEvent, tier)}
                        disabled={checkoutLoading !== null}
                        style={{ 
                          padding: '10px 20px', 
                          fontSize: '12px', 
                          borderRadius: '6px', 
                          border: 'none', 
                          backgroundColor: isTierLoading ? '#ccc' : '#002147', 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          cursor: checkoutLoading !== null ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 6px rgba(0,33,71,0.1)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => { if(checkoutLoading === null) e.target.style.backgroundColor = '#C5A059'; }}
                        onMouseLeave={(e) => { if(checkoutLoading === null) e.target.style.backgroundColor = '#002147'; }}
                      >
                        {isTierLoading ? 'Connecting Stripe...' : 'Purchase Pass'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      {totalCartItemsCount > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#C5A059', color: '#fff', border: 'none', padding: '15px 25px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 99, fontSize: '14px' }}
        >
          🛒 View Selected Passes ({totalCartItemsCount})
        </button>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Events;
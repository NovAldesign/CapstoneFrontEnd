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
      <div className="event-img-wrapper">
        <img src={displayImage} alt={displayTitle} className="event-img" />
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
  const [selectedModalEvent, setSelectedModalEvent] = useState(null);

  const { addToCart, cartItems } = useCart();

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

  // Safe decimal parsing strategy helper to protect currency conversions
  const cleanTicketPrice = (ticket) => {
    let basePrice = ticket.priceInCents ? (ticket.priceInCents / 100) : Number(ticket.price || 0);
    // 🌟 DECIMAL CORRECTION FIX: If the price database value is arriving as an unresolved decimal fraction under $1, restore it to full dollars
    if (basePrice > 0 && basePrice < 1.0) {
      basePrice = basePrice * 100;
    }
    return basePrice;
  };

  const handleDirectStripeCheckout = async (eventInstance, selectedTier) => {
    try {
      const calculatedPrice = cleanTicketPrice(selectedTier);
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
            priceInCents: Math.round(calculatedPrice * 100), 
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
        alert(data.error || "Failed to initialize checkout gateway.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Could not establish communication with checkout servers.");
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
      </Helmet>

      <header className="page-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">The Experience</span>
            <h1 className="playfair luxe-title-white">Curated<br />Gatherings.</h1>
            <div className="gold-spacer-v2"></div>
            <p className="narrative-lead-white">Intimate spaces in Atlanta designed for deep connection.</p>
          </div>
        </div>
      </header>

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
                              onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
                            >
                              {resolvedTitle}
                            </h3>
                            
                            <div className="event-location" style={{ marginBottom: '12px' }}>
                              {event.location?.name} {event.location?.city && `, ${event.location.city}`}
                            </div>

                            {/* Click Action Hint Link to pop up details layout drawer */}
                            <p 
                              onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
                              style={{ fontSize: '13px', color: '#C5A059', cursor: 'pointer', marginBottom: '18px', fontWeight: '600' }}
                            >
                              ✨ Click here to view Full Details, FAQs & Tiers →
                            </p>

                            <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                              {availableTiers.map((ticket, index) => {
                                const finalPrice = cleanTicketPrice(ticket);
                                return (
                                  <div key={ticket._id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
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
                );
              })
            ) : (
              <p className="no-events-msg">Our next intentional gathering is currently being curated.</p>
            )}
          </div>
        </section>
      </div>

      {/* ======================================================= */}
      {/* 🌟 EXPANDED DETAIL MODAL DISPLAY LAYER */}
      {/* ======================================================= */}
      {selectedModalEvent && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 33, 71, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedModalEvent(null)}
        >
          <div 
            style={{ backgroundColor: '#fff', width: '100%', maxWidth: '750px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedModalEvent(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', color: '#002147', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              ✕
            </button>

            <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
              <img src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage} alt={selectedModalEvent.resolvedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.95))', padding: '20px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  📅 {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            {/* Scrollable Container Body */}
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              
              <div style={{ fontSize: '13.5px', color: '#333', background: '#fbf8f3', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', marginBottom: '20px' }}>
                📍 <strong>Location:</strong> {selectedModalEvent.location?.name} {selectedModalEvent.location?.address && ` — ${selectedModalEvent.location.address}`}, {selectedModalEvent.location?.city || 'Atlanta'}
              </div>

              {/* DYNAMIC EXPERIENCE DESCRIPTION FROM EVENTBRITE */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Experience Overview</h3>
              <div 
                style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', marginBottom: '25px' }}
                dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || "Join us for an intentional, curated social space designed for deep connection." }}
              />

              {/* NATIVE FAQs INTEGRATION BLOCK */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Frequently Asked Questions</h3>
              <div style={{ fontSize: '13.5px', color: '#555', marginBottom: '25px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#002147' }}>Q: What is included with my entry pass?</strong>
                  <p style={{ margin: '2px 0 0 0' }}>A: Access to the curated environment, custom heavy hors d'oeuvres, and our signature premium GFC mocktails.</p>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#002147' }}>Q: Is this a smoke-free/alcohol-free venue layout?</strong>
                  <p style={{ margin: '2px 0 0 0' }}>A: Yes, all Grown Folks Collective spaces are strictly 100% smoke-free and alcohol-free environments focused on premium experiences.</p>
                </div>
              </div>

              {/* TERMS & REFUNDS POLICY */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Refund & Transfer Policy</h3>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#666', background: '#fff5f5', padding: '12px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
                <p style={{ margin: '0 0 6px 0' }}>• <strong>All Sales Final:</strong> Due to the curated arrangements, custom catering, and venue commitments, passes are non-refundable.</p>
                <p style={{ margin: 0 }}>• <strong>Pass Transfers:</strong> You can completely transfer your seat ticket to another member of the collective up to 24 hours prior to the event window.</p>
              </div>

            </div>

            {/* SELECTION AND PRICING CHECKOUT ZONE */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#777', marginBottom: '10px', fontWeight: 'bold' }}>
                Select a Tier to Purchase Pass
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedModalEvent.availableTiers || []).map((tier, index) => {
                  const displayPrice = cleanTicketPrice(tier);
                  const isTierLoading = checkoutLoading === `${selectedModalEvent._id}-${tier.name}`;

                  return (
                    <div key={tier._id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#002147', fontSize: '13.5px' }}>{tier.name}</div>
                        <div style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '13.5px' }}>${displayPrice.toFixed(2)}</div>
                      </div>

                      <button
                        onClick={() => handleDirectStripeCheckout(selectedModalEvent, tier)}
                        disabled={checkoutLoading !== null}
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '4px', border: 'none', backgroundColor: isTierLoading ? '#ccc' : '#002147', color: '#fff', fontWeight: 'bold', cursor: checkoutLoading !== null ? 'not-allowed' : 'pointer' }}
                      >
                        {isTierLoading ? 'Connecting...' : 'Purchase Pass'}
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
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

  // Secure pricing parsing helper to handle standard dollar rates cleanly
  const parseCleanPrice = (ticket) => {
    if (ticket.priceInCents) return ticket.priceInCents / 100;
    const rawNum = Number(ticket.price || 0);
    // If arriving as an unintentional decimal format like 0.20 or 0.45 from earlier sync, scale it to full dollars
    return (rawNum > 0 && rawNum < 1) ? rawNum * 100 : rawNum;
  };

  const handleDirectStripeCheckout = async (eventInstance, selectedTier) => {
    try {
      const calculatedPrice = parseCleanPrice(selectedTier);
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

  const totalCartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading GFC Experiences...</div>
      </div>
    );
  }

  return (
    <div className="events-page-wrapper">
      <Helmet>
        <title>Experiences | Grown Folks Collective</title>
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
            {upcomingEvents.map((event) => {
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

                          <p 
                            onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
                            style={{ fontSize: '13px', color: '#C5A059', cursor: 'pointer', marginBottom: '18px', fontWeight: '600' }}
                          >
                            ✨ View Details, Schedule & Full FAQs →
                          </p>

                          <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                            {availableTiers.map((ticket, index) => {
                              const finalPrice = parseCleanPrice(ticket);
                              return (
                                <div 
                                  key={ticket._id || index} 
                                  onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers })}
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
              );
            })}
          </div>
        </section>
      </div>

      {/* ======================================================= */}
      {/* 🌟 COMPLETELY UPGRADED DYNAMIC DETAIL MODAL LAYER */}
      {/* ======================================================= */}
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

            <div style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
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
              
              {/* GOOD TO KNOW INFRASTRUCTURE PANEL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
                <div>⏱️ <strong>Duration:</strong> 3 hours 30 minutes</div>
                <div>👤 <strong>Age Filter:</strong> Adults 35+ Preferred (21+ Strict)</div>
                <div>🚗 <strong>Parking Arrangement:</strong> 100% Free On-Site Parking Available</div>
                <div>🚪 <strong>Arrival Window:</strong> Doors Open at 5:30 PM</div>
              </div>

              <div style={{ fontSize: '13.5px', color: '#333', background: '#fbf8f3', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', marginBottom: '25px' }}>
                📍 <strong>Venue Location Details:</strong> {selectedModalEvent.location?.name || 'The Humming Bird Restaurant'} {selectedModalEvent.location?.address && ` — ${selectedModalEvent.location.address}`}, {selectedModalEvent.location?.city || 'Decatur'}, {selectedModalEvent.location?.state || 'GA'}
              </div>

              {/* DYNAMIC EXPERIENCE DESCRIPTION FROM LINK TARGET */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Experience Overview</h3>
              <div 
                style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', marginBottom: '25px' }}
                dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || `
                  <p><strong>The New Standard for Connection.</strong> Spades, Uno & classics. Rotating teams. 35+ professionals. Alcohol-free. Find your people here.</p>
                  <p>Tired of spending Saturday nights on the couch scrolling? So are we. This isn't just game night. It's your outlet.</p>
                  <p><strong>WHAT'S HAPPENING:</strong></p>
                  <ul>
                    <li><strong>Spades Tournament</strong> - Real competition. Real trash talk. Real connections.</li>
                    <li><strong>The Classics</strong> - Uno, Taboo, Dominoes, Connect Four</li>
                    <li><strong>Karaoke</strong> - Because sometimes you just need to let loose.</li>
                  </ul>
                  <p>Here's what makes this different: We rotate players and mix teams all night. You'll meet everyone in the room—not just sit with the person you came with.</p>
                ` }}
              />

              {/* DETAILED COMMUNITY FAQS */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Frequently Asked Questions</h3>
              <div style={{ fontSize: '13.5px', color: '#555', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: '#002147' }}>Q: Who is this space designed for?</strong>
                  <p style={{ margin: '2px 0 0 0' }}>A: This environment is intentionally curated for 35+ professional community operators looking for genuine connections outside of standard bars and work environments.</p>
                </div>
                <div>
                  <strong style={{ color: '#002147' }}>Q: What are the layout environment parameters?</strong>
                  <p style={{ margin: '2px 0 0 0' }}>A: All Grown Folks Collective lounges and spaces are strictly 100% alcohol-free and smoke-free settings focused on authentic interaction.</p>
                </div>
                <div>
                  <strong style={{ color: '#002147' }}>Q: Can I attend by myself?</strong>
                  <p style={{ margin: '2px 0 0 0' }}>A: Absolutely! We deliberately rotate team structures and tables all night long so that every single person leaves with new connections in their corner.</p>
                </div>
              </div>

              {/* ACCOUNTABILITY & REFUND INFRASTRUCTURE */}
              <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Refund & Transfer Policy</h3>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#666', background: '#fff5f5', padding: '12px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
                <p style={{ margin: '0 0 6px 0' }}>• <strong>All Sales Final:</strong> Due to curated structural planning, venue partnership locks, and advance custom food orders, passes are completely non-refundable.</p>
                <p style={{ margin: 0 }}>• <strong>Pass Assignment:</strong> Pass access credentials can be seamlessly transferred to another individual up to 24 hours prior to launch time.</p>
              </div>

            </div>

            {/* SELECTION AND PRICING SECURE CHECKOUT LAYER */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#777', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Entry Tier Pass
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedModalEvent.availableTiers || []).map((tier, index) => {
                  const finalPrice = parseCleanPrice(tier);
                  const isTierLoading = checkoutLoading === `${selectedModalEvent._id}-${tier.name}`;

                  return (
                    <div key={tier._id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#002147', fontSize: '13.5px' }}>{tier.name}</div>
                        <div style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '13.5px' }}>${finalPrice.toFixed(2)}</div>
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
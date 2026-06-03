import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; 
import { useCart } from "../Context/CartContext.jsx"; 
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
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [selectedModalEvent, setSelectedModalEvent] = useState(null);
  const [isExpandedOverview, setIsExpandedOverview] = useState(false);

  const { cartItems } = useCart();

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchGfcEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching GFC events:", error);
        setEvents([]); 
      } beautiful: {
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
                            onClick={() => {
                              setIsExpandedOverview(false);
                              setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers });
                            }}
                          >
                            {resolvedTitle}
                          </h3>
                          
                          <div className="event-location" style={{ marginBottom: '12px' }}>
                            {event.location?.name} {event.location?.city && `, ${event.location.city}`}
                          </div>

                          <p 
                            onClick={() => {
                              setIsExpandedOverview(false);
                              setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage, availableTiers });
                            }}
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
              );
            })}
          </div>
        </section>
      </div>

      {/* ======================================================= */}
      {/* 🌟 SCROLLABLE READ-MORE DETAIL DRAWERS MODAL */}
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
            {/* Close Button */}
            <button 
              onClick={() => setSelectedModalEvent(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', color: '#002147', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              ✕
            </button>

            {/* Header / Image Cover Banner */}
            <div style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
              <img src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage} alt={selectedModalEvent.resolvedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.95))', padding: '20px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  📅 {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            {/* Main Content Area (Scrollable container to handle all long paragraphs safely) */}
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* SECTION: Quick Event Parameters Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                <div>⏱️ <strong>Duration:</strong> 3 hours 30 minutes</div>
                <div>👤 <strong>Age Demographics:</strong> Adults 35+ Community Filter</div>
                <div>🚗 <strong>Parking Facility:</strong> 100% Free On-Site Parking Space</div>
                <div>🚪 <strong>Door Timeline:</strong> Gathering Entry opens at 5:30 PM</div>
              </div>

              {/* SECTION: The Full Structured Location Breakdown */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>📍 Experience Location</h3>
                <div style={{ fontSize: '14px', color: '#333', background: '#fbf8f3', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', lineHeight: '1.5' }}>
                  <strong>{selectedModalEvent.location?.name || "The Humming Bird Restaurant & Lounge"}</strong><br />
                  {selectedModalEvent.location?.address || "Decatur Area Curated Space"} <br />
                  {selectedModalEvent.location?.city || "Atlanta Metro Area"}, {selectedModalEvent.location?.state || "GA"}
                  <p style={{ margin: '8px 0 0 0', fontSize: '12.5px', color: '#666', fontStyle: 'italic' }}>
                    *Note: This venue has been fully selected to support premium, smoke-free, and alcohol-free adult gatherings.
                  </p>
                </div>
              </div>

              {/* SECTION: Timeline Agenda Schedule */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>🕒 Gathering Agenda Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', paddingLeft: '4px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}><strong style={{ color: '#C5A059', minWidth: '65px' }}>5:30 PM</strong> <span style={{ color: '#444' }}>Doors Open & Curated Pre-Game Social Check-In</span></div>
                  <div style={{ display: 'flex', gap: '15px' }}><strong style={{ color: '#C5A059', minWidth: '65px' }}>6:00 PM</strong> <span style={{ color: '#444' }}>Welcome Address & Dynamic Rotation Seating Setup</span></div>
                  <div style={{ display: 'flex', gap: '15px' }}><strong style={{ color: '#C5A059', minWidth: '65px' }}>6:15 PM</strong> <span style={{ color: '#444' }}>Spades Tournament Launch & Classic Board Game Bays Open</span></div>
                  <div style={{ display: 'flex', gap: '15px' }}><strong style={{ color: '#C5A059', minWidth: '65px' }}>8:00 PM</strong> <span style={{ color: '#444' }}>Heavy Hors D'oeuvres Service & Open Karaoke Block</span></div>
                  <div style={{ display: 'flex', gap: '15px' }}><strong style={{ color: '#C5A059', minWidth: '65px' }}>9:00 PM</strong> <span style={{ color: '#444' }}>Closing Circles & Community Connect Networking Mixer</span></div>
                </div>
              </div>

              {/* SECTION: Overview Description with READ MORE Accordion Integration */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>📝 Experience Overview</h3>
                <div 
                  style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', maxHeight: isExpandedOverview ? 'none' : '150px', overflow: 'hidden', position: 'relative' }}
                  dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || `
                    <p><strong>Tired of spending Saturday nights scrolling on the couch? So are we.</strong> The Grown Folks Collective is shifting the landscape for how adults gather, build, and interact in Atlanta.</p>
                    <p>This isn't your standard game night. It's an intentional outlet tailored for creators, business professionals, and elite operators to network, connect, and thrive outside of corporate stress or loud club settings.</p>
                    <p><strong>WHAT WE ARE FEATURING:</strong></p>
                    <ul>
                      <li><strong>The Spades Tournament Block:</strong> Real, friendly competition. Partners will rotate, matching you with dynamic operators across the room.</li>
                      <li><strong>The Retro Classic Lounge:</strong> Full access to Uno, Taboo, Giant Jenga, Dominoes, and Connect Four.</li>
                      <li><strong>Social Flow:</strong> Curated structures designed to mix players constantly so you'll naturally converse with everyone in attendance.</li>
                    </ul>
                  `}}
                />
                
                {/* Read More Toggle Trigger Link */}
                <button 
                  onClick={() => setIsExpandedOverview(!isExpandedOverview)}
                  style={{ background: 'none', border: 'none', color: '#C5A059', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: '6px 0', display: 'block', marginTop: '6px' }}
                >
                  {isExpandedOverview ? "🔼 Read Less Overview" : "🔽 Read More Overview & Details..."}
                </button>
              </div>

              {/* SECTION: Exhaustive Frequently Asked Questions (Full Link Lineup) */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>💬 Frequently Asked Questions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                  
                  <div>
                    <strong style={{ color: '#002147', display: 'block' }}>Q: What is included with my reservation entry pass?</strong>
                    <span style={{ color: '#555', lineHeight: '1.5', display: 'block', marginTop: '2px' }}>
                      A: Every registration pass provides unlimited access to all board game configurations, entry into the tournament rotation structures, a complimentary premium signature GFC artisan mocktail, and passed heavy appetizers.
                    </span>
                  </div>

                  <div>
                    <strong style={{ color: '#002147', display: 'block' }}>Q: Why is this experience strictly an alcohol-free and smoke-free environment?</strong>
                    <span style={{ color: '#555', lineHeight: '1.5', display: 'block', marginTop: '2px' }}>
                      A: Our mission centers on building true spaces for genuine, authentic human connection. By intentionally eliminating standard social crutches like alcohol, we preserve a premium setting tailored for clear minds, real laughters, and lasting community ties.
                    </span>
                  </div>

                  <div>
                    <strong style={{ color: '#002147', display: 'block' }}>Q: Can I attend this gathering alone?</strong>
                    <span style={{ color: '#555', lineHeight: '1.5', display: 'block', marginTop: '2px' }}>
                      A: Absolutely! Over 60% of our community members sign up independently. We intentionally mix the table seating structures, card assignments, and social groupings constantly throughout the evening so you will feel right at home immediately.
                    </span>
                  </div>

                  <div>
                    <strong style={{ color: '#002147', display: 'block' }}>Q: What is the recommended dress code configuration?</strong>
                    <span style={{ color: '#555', lineHeight: '1.5', display: 'block', marginTop: '2px' }}>
                      A: Think smart, intentional casual or stylish lounge comfort. We want you relaxed enough to laugh comfortably, but sharp enough to network effectively with founders and peers.
                    </span>
                  </div>

                </div>
              </div>

              {/* SECTION: Policies & Guardrails */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>🛡️ Refund & Liability Terms</h3>
                <div style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#666', background: '#fff5f5', padding: '14px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
                  <p style={{ margin: '0 0 6px 0' }}>• <strong>All Sales Final Policy:</strong> Due to curated food ordering windows, specific catering adjustments, and locked restaurant venue arrangements, all ticket pass sales are entirely non-refundable.</p>
                  <p style={{ margin: 0 }}>• <strong>Pass Assignment Delegation:</strong> If an unexpected professional commitment arrives, you can fully re-assign your seat pass over to another member of the collective by notifying our coordinators up to 24 hours prior to the event timeline.</p>
                </div>
              </div>

            </div>

            {/* Locked Footer Action Zone: Tiers Selector and Purchase Buttons */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#777', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Entry Tier Pass to Secure Registration
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
                        {isTierLoading ? 'Connecting...' : 'Secure Pass'}
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
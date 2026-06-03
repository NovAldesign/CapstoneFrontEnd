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
        {children(displayTitle, externalData?.description, displayImage)}
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
  const handleDirectStripeCheckout = async (eventInstance) => {
    try {
      setCheckoutLoading(eventInstance._id);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app';
      
      const targetPayload = {
        customerEmail: undefined, 
        cartItems: [
          {
            eventId: eventInstance._id,
            eventName: eventInstance.name,
            ticketTypeId: eventInstance.eventbriteId || "standard-pass",
            ticketTypeName: "General Admission Pass",
            priceInCents: 3500, 
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

      {/* NARRATIVE SECTION */}
      <section className="family-narrative-section">
        <div className="container">
          <div className="family-grid">
            <div className="family-image-wrapper">
              <img
                src="https://media.cnn.com/api/v1/images/stellar/prod/230725152449-01-group-friend-vacation-tips-top.jpg?c=16x9&q=h_653,w_1160,c_fill/f_avif"
                alt="Diverse Professionals Connecting"
                className="family-hero-img"
              />
              <div className="family-gold-accent"></div>
            </div>
            <div className="family-content">
              <span className="gold-label">Beyond the Title</span>
              <h2 className="playfair navy-text">
                A Sanctuary for
                <br />
                High-Level Connection.
              </h2>
              <p className="lead-text">
                Whether you are leading a firm, scaling a startup, or mastering a craft — the view at the top can be isolating.
              </p>
              <p>
                The <strong>Grown Folks Collective</strong> brings together professionals from all fields who are ready to trade "networking" for <strong>true belonging.</strong>
              </p>
              <p>
                This is your space to <strong>unplug from professional stress</strong> and reconnect.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                      {(resolvedTitle, resolvedDescription, resolvedImage) => (
                        <>
                          <span className="event-date-tag">
                            {formatEventDate(event.date)} &nbsp;·&nbsp; {formatEventTime(event.date)}
                          </span>
                          
                          {/* Make title clickable to open modal */}
                          <h3 
                            className="playfair" 
                            style={{ cursor: "pointer", transition: "color 0.2s" }}
                            onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage })}
                            onMouseEnter={(e) => (e.target.style.color = '#C5A059')}
                            onMouseLeave={(e) => (e.target.style.color = '#002147')}
                          >
                            {resolvedTitle}
                          </h3>
                          
                          <div className="event-location" style={{ marginBottom: '15px' }}>
                            {event.location?.name} {event.location?.city && `, ${event.location.city}`}
                          </div>

                          {/* Line-clamped short preview of description to hint users to click for details */}
                          {resolvedDescription && (
                            <p 
                              onClick={() => setSelectedModalEvent({ ...event, resolvedTitle, resolvedDescription, resolvedImage })}
                              style={{ fontSize: '13px', color: '#666', cursor: 'pointer', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                              Click card to read full intentional experience profile details...
                            </p>
                          )}

                          {/* Inline Admission Row for lightning fast click-to-buy updates */}
                          <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                            {event.ticketTypes && event.ticketTypes.length > 0 ? (
                              event.ticketTypes.map((ticket) => {
                                const cartMatch = cartItems.find(item => item.eventId === event._id && item.ticketTypeId === ticket._id);
                                const quantityInCart = cartMatch ? cartMatch.quantity : 0;
                                const ticketSoldOut = ticket.sold >= ticket.quantity;

                                return (
                                  <div key={ticket._id} className="ticket-tier-row" style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                                    <div>
                                      <div style={{ fontWeight: '600', color: '#002147' }}>{ticket.name}</div>
                                      <div style={{ color: '#C5A059', fontWeight: 'bold' }}>${(ticket.price / 100).toFixed(2)}</div>
                                    </div>
                                    <button
                                      onClick={() => addToCart(event, ticket)}
                                      disabled={ticketSoldOut}
                                      className={ticketSoldOut ? "btn-sold-out-mini" : "btn-gold-card-mini"}
                                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', border: 'none', backgroundColor: ticketSoldOut ? '#ccc' : '#002147', color: '#fff', fontWeight: 'bold' }}
                                    >
                                      {ticketSoldOut ? 'Sold Out' : quantityInCart > 0 ? `In Cart (${quantityInCart})` : 'Add Ticket'}
                                    </button>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="ticket-tier-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}>
                                <div>
                                  <div style={{ fontWeight: '600', color: '#002147' }}>General Admission Pass</div>
                                  <div style={{ color: '#C5A059', fontWeight: 'bold', fontSize: '13px', marginTop: '2px' }}>$35.00</div>
                                </div>
                                <button
                                  onClick={() => handleDirectStripeCheckout(event)}
                                  disabled={checkoutLoading === event._id}
                                  style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px', border: 'none', backgroundColor: checkoutLoading === event._id ? '#ccc' : '#C5A059', color: '#fff', fontWeight: 'bold' }}
                                >
                                  {checkoutLoading === event._id ? 'Connecting...' : 'Purchase Pass'}
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
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
      {/* 🌟 LUXE POP-UP EXPANSION MODAL LAYER */}
      {/* ======================================================= */}
      {selectedModalEvent && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 33, 71, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedModalEvent(null)}
        >
          <div 
            style={{ backgroundColor: '#fff', width: '100%', maxWidth: '680px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'fadeInUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside it
          >
            {/* Close Button Anchor */}
            <button 
              onClick={() => setSelectedModalEvent(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.85)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', fontWeight: 'bold', color: '#002147', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              ✕
            </button>

            {/* Modal Image Wrapper */}
            <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage} 
                alt={selectedModalEvent.resolvedTitle} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.8))', padding: '20px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
                  {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            {/* Modal Context Body Scrollbox */}
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '14px', color: '#555', background: '#fcf8f2', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #C5A059' }}>
                <div>📍 <strong>Location:</strong> {selectedModalEvent.location?.name} {selectedModalEvent.location?.address && ` — ${selectedModalEvent.location.address}`}, {selectedModalEvent.location?.city}</div>
              </div>

              <h4 style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: '#002147', marginBottom: '10px', fontWeight: 'bold' }}>
                Gathering Overview
              </h4>
              
              <div 
                style={{ fontSize: '15px', lineHeight: '1.7', color: '#444', marginBottom: '25px' }}
                dangerouslySetInnerHTML={{ __html: selectedModalEvent.resolvedDescription || selectedModalEvent.description || "Intentionally creating social space for deep connection." }}
              />
            </div>

            {/* Bottom Checkout Action Area */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fdfdfd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#777', display: 'block' }}>Admission Price</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#C5A059' }}>$35.00</span>
              </div>
              <button
                onClick={() => {
                  handleDirectStripeCheckout(selectedModalEvent);
                  setSelectedModalEvent(null);
                }}
                disabled={checkoutLoading === selectedModalEvent._id}
                style={{ padding: '12px 30px', fontSize: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#002147', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,33,71,0.15)' }}
              >
                {checkoutLoading === selectedModalEvent._id ? 'Connecting...' : 'Secure Tickets via Stripe'}
              </button>
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
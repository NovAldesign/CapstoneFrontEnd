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
      <div className="event-img-wrapper" style={{ width: '100%', height: '240px', overflow: 'hidden', backgroundColor: '#002147' }}>
        <img 
          src={displayImage} 
          alt={displayTitle} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>
      <div className="event-info">
        {children(
          displayTitle,
          externalData?.description,
          displayImage,
          externalData?.ticketTiers,
          externalData?.agenda,
          externalData?.highlights,
          externalData?.location
        )}
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

  const handleDirectStripeCheckout = async (eventInstance, selectedTier) => {
    try {
      const calculatedPrice = parseCleanPrice(selectedTier);
      setCheckoutLoading(`${eventInstance._id}-${selectedTier.name}`);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app';
      
      const targetPayload = {
        customerEmail: undefined, 
        cartItems: [
          {
            eventId:        eventInstance._id,
            eventName:      eventInstance.name || eventInstance.resolvedTitle,
            ticketTypeId:   selectedTier.id || selectedTier._id || "standard-pass",
            ticketTypeName: selectedTier.name,
            priceInCents:   Math.round(calculatedPrice * 100), 
            quantity:       1
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

  const openModal = (event, resolvedTitle, resolvedDescription, resolvedImage, externalTiers, externalAgenda, externalHighlights, externalLocation) => {
    const availableTiers = event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes
      : externalTiers || [];

    // Merge location: prefer DB location, fall back to Eventbrite location
    const resolvedLocation = (event.location?.name || event.location?.address)
      ? event.location
      : externalLocation || null;

    // Merge agenda: prefer DB agenda, fall back to Eventbrite agenda
    const resolvedAgenda = event.agenda && event.agenda.length > 0
      ? event.agenda
      : externalAgenda || [];

    // Merge highlights: prefer DB highlights, fall back to Eventbrite highlights
    const resolvedHighlights = event.highlights && event.highlights.length > 0
      ? event.highlights
      : externalHighlights || [];

    setIsExpandedOverview(false);
    setSelectedModalEvent({
      ...event,
      resolvedTitle,
      resolvedDescription,
      resolvedImage,
      availableTiers,
      resolvedLocation,
      resolvedAgenda,
      resolvedHighlights,
    });
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
            {upcomingEvents.map((event) => (
              <div key={event._id || Math.random()} className="event-card">
                <EventbriteCardContent
                  eventbriteId={event.eventbriteId}
                  fallbackImage={event.coverImage}
                  fallbackTitle={event.name}
                >
                  {(resolvedTitle, resolvedDescription, resolvedImage, externalTiers, externalAgenda, externalHighlights, externalLocation) => {
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
                          onClick={() => openModal(event, resolvedTitle, resolvedDescription, resolvedImage, externalTiers, externalAgenda, externalHighlights, externalLocation)}
                        >
                          {resolvedTitle}
                        </h3>
                        
                        {event.location && (event.location.name || event.location.address || event.location.city) && (
                          <div className="event-location" style={{ marginBottom: '12px' }}>
                            {event.location.name}{event.location.address && ` - ${event.location.address}`}{event.location.city && `, ${event.location.city}`}
                          </div>
                        )}

                        <p 
                          onClick={() => openModal(event, resolvedTitle, resolvedDescription, resolvedImage, externalTiers, externalAgenda, externalHighlights, externalLocation)}
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
                                onClick={() => openModal(event, resolvedTitle, resolvedDescription, resolvedImage, externalTiers, externalAgenda, externalHighlights, externalLocation)}
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
        </section>
      </div>

      {/* ======================================================= */}
      {/* SCROLLABLE MODAL                                         */}
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

            {/* Modal Image Header */}
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
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>
                  {selectedModalEvent.resolvedTitle}
                </h2>
              </div>
            </div>

            {/* Main Details Body */}
            <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* HIGHLIGHTS */}
              {selectedModalEvent.resolvedHighlights && selectedModalEvent.resolvedHighlights.length > 0 && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Event Highlights
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedModalEvent.resolvedHighlights.map((item, idx) => (
                      <span 
                        key={idx} 
                        style={{ background: '#f4f0e8', color: '#002147', borderLeft: '3px solid #C5A059', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* LOCATION */}
              {selectedModalEvent.resolvedLocation && (selectedModalEvent.resolvedLocation.name || selectedModalEvent.resolvedLocation.address) && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Location
                  </h3>
                  <div style={{ fontSize: '14px', color: '#333', background: '#fbf8f3', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', lineHeight: '1.5' }}>
                    {selectedModalEvent.resolvedLocation.name && (
                      <strong>{selectedModalEvent.resolvedLocation.name}<br /></strong>
                    )}
                    {selectedModalEvent.resolvedLocation.address && (
                      <>{selectedModalEvent.resolvedLocation.address}<br /></>
                    )}
                    {selectedModalEvent.resolvedLocation.city}
                    {selectedModalEvent.resolvedLocation.state && `, ${selectedModalEvent.resolvedLocation.state}`}
                    {selectedModalEvent.resolvedLocation.zip && ` ${selectedModalEvent.resolvedLocation.zip}`}
                  </div>
                </div>
              )}

              {/* AGENDA / SCHEDULE */}
              {selectedModalEvent.resolvedAgenda && selectedModalEvent.resolvedAgenda.length > 0 && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Schedule
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    {selectedModalEvent.resolvedAgenda.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <strong style={{ color: '#C5A059', minWidth: '70px', flexShrink: 0 }}>{item.time}</strong>
                        <div>
                          {item.title && (
                            <div style={{ fontWeight: '700', color: '#002147', marginBottom: '2px' }}>{item.title}</div>
                          )}
                          {item.description && (
                            <div style={{ color: '#444', lineHeight: '1.5' }}>{item.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EVENT OVERVIEW / DESCRIPTION */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  Event Overview
                </h3>
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
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Frequently Asked Questions
                  </h3>
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

              {/* POLICIES & TERMS */}
              <div>
                <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  Policies & Terms
                </h3>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#555', background: '#fafafa', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <strong style={{ color: '#002147' }}>Refund Policy:</strong> All sales are final. Admission passes are entirely non-refundable. Pass entries may be transferred to another individual up to 24 hours prior to the event start time.
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '12px', color: '#666' }}>
                    <strong style={{ color: '#002147' }}>Limitation of Liability:</strong> By purchasing a ticket and attending this event, guests acknowledge and accept that The Grown Folks Collective and its affiliated organizers shall not be held liable for any personal injury, loss, theft, or damages incurred during or in connection with the event. Attendance is voluntary and at the guest's own risk.
                  </div>
                </div>
              </div>

            </div>

            {/* Ticket Purchase Footer */}
            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#777', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Ticket Tier
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
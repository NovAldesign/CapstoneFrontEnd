import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async"; 
import { useCart } from "../Context/CartContext.jsx"; // 1. Hooking into your new cart architecture
import {
  fetchGfcEvents,
  formatEventDate,
  formatEventTime,
} from "../Services/eventService";
import "../Styles/Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Extracting core actions and cart layout data from context
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

  const now = new Date();

  const upcomingEvents = (Array.isArray(events) ? events : [])
    .filter((e) => e && new Date(e.date) >= now && e.status === "published")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = (Array.isArray(events) ? events : [])
    .filter((e) => e && new Date(e.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
              From intimate dinners in Atlanta to dynamic local socials. Find your
              sanctuary.
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
                Whether you are leading a firm, scaling a startup, or mastering
                a craft — the view at the top can be isolating.
              </p>
              <p>
                The <strong>Grown Folks Collective</strong> brings together
                professionals from all fields who are ready to
                trade "networking" for <strong>true belonging.</strong>
              </p>
              <p>
                This is your space to <strong>unplug from professional stress</strong> and reconnect.
              </p>
              <div className="family-values">
                <div className="value-item">
                  <strong>Diverse Expertise</strong>
                  <p>Leaders from every industry, united by values.</p>
                </div>
                <div className="value-item">
                  <strong>Human First</strong>
                  <p>Connecting as individuals, not just job titles.</p>
                </div>
                <div className="value-item">
                  <strong>Pure Joy</strong>
                  <p>Rediscovering life beyond the daily grind.</p>
                </div>
              </div>
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
                const isSoldOut = event.ticketTypes?.every(
                  (t) => t.sold >= t.quantity,
                );

                return (
                  <div key={event._id || Math.random()} className="event-card">
                    <div className="event-img-wrapper">
                      <img
                        src={event.coverImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"}
                        alt={event.name}
                        className="event-img"
                      />
                    </div>
                    <div className="event-info">
                      <span className="event-date-tag">
                        {formatEventDate(event.date)} &nbsp;·&nbsp; {formatEventTime(event.date)}
                      </span>
                      <h3 className="playfair">{event.name}</h3>
                      <div className="event-location" style={{ marginBottom: '15px' }}>
                        {event.location?.name} {event.location?.city && `, ${event.location.city}`}
                      </div>

                      {/* NEW: Clean Tiered Ticket Selection Area */}
                      <div className="ticket-tiers-selection-zone" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: 'auto' }}>
                        <h4 style={{ fontSize: '11px', uppercase: true, color: '#aaa', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
                          Select Passes
                        </h4>
                        
                        {event.ticketTypes && event.ticketTypes.length > 0 ? (
                          event.ticketTypes.map((ticket) => {
                            // Match cart memory positions dynamically
                            const cartMatch = cartItems.find(
                              item => item.eventId === event._id && item.ticketTypeId === ticket._id
                            );
                            const quantityInCart = cartMatch ? cartMatch.quantity : 0;
                            const ticketSoldOut = ticket.sold >= ticket.quantity;

                            return (
                              <div 
                                key={ticket._id} 
                                className="ticket-tier-row" 
                                style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}
                              >
                                <div>
                                  <div style={{ fontWeight: '600', color: '#002147' }}>{ticket.name}</div>
                                  <div style={{ color: '#C5A059', fontWeight: 'bold' }}>
                                    ${(ticket.price / 100).toFixed(2)}
                                  </div>
                                </div>

                                <button
                                  onClick={() => addToCart(event, ticket)}
                                  disabled={ticketSoldOut}
                                  className={ticketSoldOut ? "btn-sold-out-mini" : "btn-gold-card-mini"}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: ticketSoldOut ? 'not-allowed' : 'pointer',
                                    backgroundColor: ticketSoldOut ? '#ccc' : '#002147',
                                    color: '#fff',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => !ticketSoldOut && (e.target.style.backgroundColor = '#C5A059')}
                                  onMouseLeave={(e) => !ticketSoldOut && (e.target.style.backgroundColor = '#002147')}
                                >
                                  {ticketSoldOut ? 'Sold Out' : quantityInCart > 0 ? `In Cart (${quantityInCart})` : 'Add Ticket'}
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span style={{ fontSize: '12px', color: '#999' }}>General Admission Pass Entry only</span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-events-msg">
                Our next intentional gathering is currently being curated. Join the family to be the first to know.
              </p>
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
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400"}
                      alt={event.name}
                      className="past-img-grayscale"
                    />
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
    </div>
  );
};

export default Events;
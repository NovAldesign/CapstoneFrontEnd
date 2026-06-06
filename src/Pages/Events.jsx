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
      .then((data) => { if (data) setExternalData(data); })
      .catch((err) => console.error("Error loading Eventbrite asset package:", err));
  }, [eventbriteId]);

  const displayImage = externalData?.image || fallbackImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800";
  const displayTitle = externalData?.title || fallbackTitle;

  return (
    <>
      <div className="event-img-wrapper" style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
        <img
          src={displayImage}
          alt={displayTitle}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
        body: JSON.stringify({ customerEmail: undefined, cartItems: cart }),
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
  let currentDiscountMultiplier = 1.0;
  if (uniqueEventIdsInCart.length === 2) {
    currentDiscountLabel = "5% Multi-Event Discount Applied!";
    currentDiscountMultiplier = 0.95;
  }
  if (uniqueEventIdsInCart.length >= 3) {
    currentDiscountLabel = "10% Mega-Bundle Discount Applied!";
    currentDiscountMultiplier = 0.90;
  }

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal   = cart.reduce((sum, item) => sum + ((item.priceInCents * item.quantity) / 100), 0);
  const cartTotal      = cartSubtotal * currentDiscountMultiplier;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading GFC Experiences...</div>
      </div>
    );
  }

  return (
    <div className="events-page-wrapper" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Helmet>
        <title>Events | Grown Folks Collective</title>
        <meta
          name="description"
          content="Join our next curated gathering in Atlanta. Trade networking for true belonging in a sanctuary designed for high-level connection, joy, and alcohol-free community."
        />
      </Helmet>

      {/* Floating Cart Button */}
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
          </div>
        </div>
      </header>

      {/* FAMILY NARRATIVE */}
      <section className="family-narrative-section" style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div className="family-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div className="family-image-wrapper">
              <img
                src="https://media.cnn.com/api/v1/images/stellar/prod/230725152449-01-group-friend-vacation-tips-top.jpg?c=16x9&q=h_653,w_1160,c_fill/f_avif"
                alt="Grown Folks Collective Connection"
                style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
              />
            </div>
            <div className="family-text-content">
              <h2 className="playfair" style={{ color: '#002147', fontSize: '38px', margin: '0 0 20px 0', fontWeight: 'normal' }}>Building Genuine Connections.</h2>
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

          {/* MULTI-EVENT DISCOUNT BANNER */}
          <div style={{ maxWidth: '600px', margin: '0 auto 30px auto', background: '#fbf8f3', border: '1px solid #eef2f6', borderLeft: '4px solid #C5A059', borderRadius: '4px', padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#002147', fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>
              <strong>Breathe deeper, connect longer.</strong> Planning to join us for multiple experiences? Your rewards accumulate automatically at checkout:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '13px', fontWeight: 'bold', flexWrap: 'wrap' }}>
              <span style={{ color: '#C5A059' }}>Select 2 Different Events — Get 5% Off Everything</span>
              <span style={{ color: '#002147' }}>Select 3+ Different Events — Get 10% Off Everything</span>
            </div>
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
                      const availableTiers = event.ticketTypes?.length ? event.ticketTypes : externalTiers || [];
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

      {/* OVERHAULED INVOLVEMENT SECTION (FULL WIDTH GRID BACKGROUND) */}
      <section style={{ backgroundColor: '#0a1628', padding: '5rem 2rem', margin: '60px 0 0 0', color: '#ffffff', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: "'Trebuchet MS', sans-serif", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(204, 214, 240, 0.6)' }}>
              Get Involved
            </span>
            <h2 className="playfair" style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '400', margin: '0.25rem 0 0' }}>
              Join the Movement Against Social Isolation
            </h2>
            <div style={{ width: '50px', height: '1px', background: 'rgba(201, 168, 76, 0.3)', margin: '15px auto 0 auto' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Membership Card */}
            <div style={{ backgroundColor: '#111e35', border: '1px solid rgba(201, 168, 76, 0.55)', borderRadius: '4px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="playfair" style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '400', margin: '0 0 1rem 0' }}>Join The Collective</h3>
                <p style={{ fontFamily: "Georgia, serif", fontSize: '0.95rem', lineHeight: '1.8', color: '#ccd6f0', fontStyle: 'italic', margin: '0 0 2rem 0' }}>
                  Studies show that loneliness among high-achieving adults is at an all-time high — and professional success doesn't make it easier. The Grown Folks Collective exists to change that. Join a curated community of Atlanta professionals who gather intentionally, connect authentically, and leave every experience feeling genuinely seen. This isn't networking. This is belonging.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/membership'}
                style={{ width: 'fit-content', padding: '12px 24px', backgroundColor: 'transparent', color: '#c9a84c', border: '1px solid rgba(201, 168, 76, 0.6)', borderRadius: '4px', fontFamily: "'Trebuchet MS', sans-serif", fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                Join The Collective
              </button>
            </div>

            {/* Partnerships Card */}
            <div style={{ backgroundColor: '#111e35', border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '4px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="playfair" style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '400', margin: '0 0 1rem 0' }}>Partner With Us</h3>
                <p style={{ fontFamily: "Georgia, serif", fontSize: '0.95rem', lineHeight: '1.8', color: '#ccd6f0', fontStyle: 'italic', margin: '0 0 2rem 0' }}>
                  We partner with brands, venues, and organizations that share our commitment to real human connection. Whether you're looking to co-host an experience, sponsor an event, or place your brand in front of a room full of engaged Atlanta professionals — we want to hear from you. Let's build something that actually matters.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/partnerships'}
                style={{ width: 'fit-content', padding: '12px 24px', backgroundColor: 'transparent', color: '#ccd6f0', border: '1px solid rgba(204, 214, 240, 0.3)', borderRadius: '4px', fontFamily: "'Trebuchet MS', sans-serif", fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                Explore Partnerships
              </button>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', fontFamily: "'Trebuchet MS', sans-serif", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(204, 214, 240, 0.5)' }}>
            ✦ Intentional spaces • Verified local experiences ✦
          </div>

        </div>
      </section>

      {/* SHOPPING CART SIDEBAR */}
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
                  <div style={{ background: '#f0faf7', color: '#006652', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '12px', textAlign: 'center', border: '1px solid #b2f5ea' }}>
                    {currentDiscountLabel}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#777', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {currentDiscountMultiplier < 1.0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#006652', fontWeight: '600', marginBottom: '6px' }}>
                    <span>Discount ({currentDiscountMultiplier === 0.95 ? '5%' : '10%'}):</span>
                    <span>- ${(cartSubtotal - cartTotal).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#002147', marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
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

            <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={selectedModalEvent.resolvedImage || selectedModalEvent.coverImage}
                alt={selectedModalEvent.resolvedTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,33,71,0.95))', padding: '20px' }}>
                <span style={{ color: '#C5A059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  {formatEventDate(selectedModalEvent.date)} @ {formatEventTime(selectedModalEvent.date)}
                </span>
                <h2 className="playfair" style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '24px' }}>{selectedModalEvent.resolvedTitle}</h2>
              </div>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {selectedModalEvent.location && (selectedModalEvent.location.name || selectedModalEvent.location.address) && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Location</h3>
                  <div style={{ fontSize: '14px', color: '#333', background: '#fbf8f3', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #C5A059', lineHeight: '1.5' }}>
                    {selectedModalEvent.location.name    && <strong>{selectedModalEvent.location.name}<br /></strong>}
                    {selectedModalEvent.location.address && <>{selectedModalEvent.location.address}<br /></>}
                    {selectedModalEvent.location.city}{selectedModalEvent.location.state && `, ${selectedModalEvent.location.state}`}
                  </div>
                </div>
              )}

              {selectedModalEvent.agenda?.length > 0 && (
                <div>
                  <h3 className="playfair" style={{ color: '#002147', fontSize: '18px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Schedule</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    {selectedModalEvent.agenda.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <strong style={{ color: '#C5A059', minWidth: '70px', flexShrink: 0 }}>{item.time}</strong>
                        <div>
                          {item.title       && <div style={{ fontWeight: '700', color: '#002147', marginBottom: '2px' }}>{item.title}</div>}
                          {item.description && <div style={{ color: '#444', lineHeight: '1.5' }}>{item.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            </div>

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
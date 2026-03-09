import React, { useState, useEffect } from "react";
import { fetchGfcEvents } from "../Services/eventService"; 
import "../Styles/Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEvents = async () => {
      const data = await fetchGfcEvents();
      setEvents(data);
      setLoading(false);
    };
    getEvents();
  }, []);

  const now = new Date();
  
  // Separate into Upcoming and Past
  const upcomingEvents = events
    .filter((event) => event.start?.local && new Date(event.start.local) >= now)
    .sort((a, b) => new Date(a.start.local) - new Date(b.start.local));

  const pastEvents = events
    .filter((event) => event.start?.local && new Date(event.start.local) < now)
    .sort((a, b) => new Date(b.start.local) - new Date(a.start.local));

  if (loading) return <div className="loader">Loading GFC Events...</div>;

 return (
    <div className="events-page-wrapper">
      {/* 1. LUXE HERO HEADER */}
      <header className="page-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">The Experience</span>
            <h1 className="playfair luxe-title-white">Curated <br/> Gatherings.</h1>
            <div className="gold-spacer-v2"></div>
            <p className="narrative-lead-white">
              From intimate dinners in Atlanta to global retreats. 
              Find your sanctuary.
            </p>
          </div>
        </div>
      </header>

      {/* 2. THE FAMILY NARRATIVE */}
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
              <h2 className="playfair navy-text">A Sanctuary for <br/>High-Level Connection.</h2>
              <p className="lead-text">
                Whether you are leading a firm, scaling a startup, or mastering a craft—the view at the top can be isolating.
              </p>
              <p>
                The <strong>Grown Folks Collective</strong> brings together professionals 
                and entrepreneurs from all fields who are ready to trade "networking" for 
                <strong>true belonging.</strong> We gather to find joy in shared passions and 
                conversations that only happen when you're among peers who understand the 
                weight of responsibility.
              </p>
              <p>
                This is your space to <strong>unplug from professional stress</strong> and 
                reconnect with the things you love. We aren't just building a network; 
                we are building a family.
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

      <div className="container main-content-padding">
        {/* --- UPCOMING SECTION --- */}
        <section className="section-spacing">
          <div className="section-header-center">
            <span className="gold-label">Upcoming</span>
            <h2 className="playfair section-title-navy">The Next Chapter</h2>
            <div className="gold-spacer-small"></div>
          </div>
          
          <div className="events-grid">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((item) => (
                <div key={item.id} className="event-card">
                  <div className="event-img-wrapper">
                    <img 
                      src={item.logo?.original?.url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"} 
                      alt={item.name.text} 
                      className="event-img"
                    />
                  </div>
                  <div className="event-info">
                    <span className="event-date-tag">{new Date(item.start?.local).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <h3 className="playfair">{item.name?.text}</h3>
                    <a href={item.url} target="_blank" rel="noreferrer" className="btn-gold-card">Reserve Your Space</a>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-events-msg">Our next intentional gathering is currently being curated. Join the family to be the first to know.</p>
            )}
          </div>
        </section>

        {/* --- PAST SECTION: COMPACT & DISTINCT --- */}
      {pastEvents.length > 0 && (
        <section className="past-events-archive">
          <div className="container">
            <div className="section-header-left">
              <span className="gold-label">Memories</span>
              <h2 className="playfair archive-title">The Legacy of Connection</h2>
              <div className="gold-spacer-v2"></div>
            </div>
            
            <div className="past-events-compact-grid">
              {pastEvents.map((item) => (
                <div key={item.id} className="past-event-mini-card">
                  <div className="past-img-wrapper">
                    <img 
                      src={item.logo?.original?.url || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400"} 
                      alt={item.name.text} 
                      className="past-img-grayscale" 
                    />
                  </div>
                  <div className="past-info-compact">
                    <h4 className="playfair">{item.name?.text}</h4>
                    <p className="past-meta">{new Date(item.start?.local).toLocaleDateString()}</p>
                    <span className="concluded-tag">Family Gathering Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      </div>
    </div>
  );
};

export default Events;
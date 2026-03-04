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
    <div className="container page-content">
      <header className="events-header">
        <h1>Grown Folks Collective Events</h1>
      </header>

      {/* --- UPCOMING SECTION --- */}
      <section>
        <h2>Upcoming Gatherings</h2>
        <div className="events-grid">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((item) => (
              <div key={item.id} className="event-card">
                {/* EVENT IMAGE */}
                <img 
                  src={item.logo?.original?.url || "https://via.placeholder.com/400x200?text=GFC+Event"} 
                  alt={item.name.text} 
                  className="event-img"
                />
                <div className="event-info">
                  <h3>{item.name?.text}</h3>
                  <p>{new Date(item.start?.local).toLocaleDateString()}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="btn">Register</a>
                </div>
              </div>
            ))
          ) : (
            <p>No upcoming events. Stay tuned!</p>
          )}
        </div>
      </section>

      {/* --- PAST SECTION --- */}
      {pastEvents.length > 0 && (
        <section className="past-events-section">
          <hr className="divider" />
          <h2 className="past-title">Previous Gatherings</h2>
          <div className="events-grid past-grid">
            {pastEvents.map((item) => (
              <div key={item.id} className="event-card past-card">
                <img 
                  src={item.logo?.original?.url || "https://via.placeholder.com/400x200?text=GFC+Past+Event"} 
                  alt={item.name.text} 
                  className="event-img grayscale" 
                />
                <div className="event-info">
                  <h3>{item.name?.text}</h3>
                  <p>{new Date(item.start?.local).toLocaleDateString()}</p>
                  <button className="btn-disabled" disabled>Connection Concluded</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Events;
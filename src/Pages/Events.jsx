import React, { useState, useEffect } from "react";
import "./Events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const AUTH_TOKEN = import.meta.env.VITE_EVENTBRITE_TOKEN;

  // --- FILTERING EVENTS ---

  const now = new Date();
  
  const upcomingEvents = events
    .filter((event) => new Date(event.start.local) >= now)
    .sort((a, b) => new Date(a.start.local) - new Date(b.start.local));

  const pastEvents = events
    .filter((event) => new Date(event.start.local) < now)
    .sort((a, b) => new Date(b.start.local) - new Date(a.start.local));

  useEffect(() => {
    if (!AUTH_TOKEN) return;

    fetch(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${AUTH_TOKEN}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.organizations && data.organizations.length > 0) {
          const orgId = data.organizations[0].id;
          return fetch(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?token=${AUTH_TOKEN}`);
        }
        throw new Error("No organizations found.");
      })
      .then((res) => res.json())
      .then((eventData) => {
        if (eventData.events) setEvents(eventData.events);
        setLoading(false);
      })
      .catch((err) => {
        console.error("GFC API Error:", err);
        setLoading(false);
      });
  }, [AUTH_TOKEN]);

  return (
    <div className="container page-content">
      <header className="events-header">
        <h1>Grown Folks Collective Events</h1>
        <p>Join our next gathering for 35+ professionals seeking genuine connection.</p>
      </header>

      {loading ? (
        <div className="loader">Syncing the latest connections...</div>
      ) : (
        <>
          {/* UPCOMING SECTION */}
          <div className="events-grid">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((item) => (
                <div key={item.id} className="event-card upcoming">
                  <h3>{item.name.text}</h3>
                  <p className="date">{new Date(item.start.local).toLocaleDateString()}</p>
                  <a href={item.url} className="btn" target="_blank" rel="noopener noreferrer">
                    Save My Spot
                  </a>
                </div>
              ))
            ) : (
              <p className="no-events">No upcoming events. Check back soon for new connections!</p>
            )}
          </div>

          {/* PAST EVENTS SECTION */}
          {pastEvents.length > 0 && (
            <section className="past-events-section">
              <hr className="divider" />
              <h2 className="past-title">Previous Gatherings</h2>
              <div className="events-grid past-grid">
                {pastEvents.map((item) => (
                  <div key={item.id} className="event-card past-card">
                    <h3>{item.name.text}</h3>
                    <p className="date">{new Date(item.start.local).toLocaleDateString()}</p>
                    <button className="btn-disabled" disabled>Connection Concluded</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
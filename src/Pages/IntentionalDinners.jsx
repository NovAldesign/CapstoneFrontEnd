import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Checkout from "../Components/CheckoutForm.jsx";
import { fetchGfcEvents } from "../Services/eventService.js";
import "../Styles/IntentionalDinners.css";

const COURSES = [
  {
    number: "01",
    title: "Arrival & Welcome",
    description:
      "A signature mocktail is waiting at your seat. A single question on your table card. No pressure — just permission to be curious about the person beside you.",
    prompt: "What brought you to a room like this tonight?",
  },
  {
    number: "02",
    title: "First Course",
    description:
      "The host introduces the evening's theme. A conversation prompt is placed at every table. The room gets quieter. The conversations get better.",
    prompt: "What is something you used to believe that you no longer do?",
  },
  {
    number: "03",
    title: "Main Course",
    description:
      "The deeper prompt. This is where the evening turns. Phones are face-down. Eye contact is made. You remember what it feels like to be fully present.",
    prompt: "What does genuine connection look like in your life right now?",
  },
  {
    number: "04",
    title: "Dessert",
    description:
      "Open table. The conversation finds its own direction. By now you know the people next to you. Something has shifted in the room.",
    prompt: "Open floor — the conversation belongs to you now.",
  },
];

const IntentionalDinners = () => {
  const [dinnerEvents, setDinnerEvents] = useState([]);
  const [checkoutEvent, setCheckoutEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEvents = async () => {
      const all = await fetchGfcEvents();
      const dinners = all.filter(
        (e) =>
          e.eventType === "Intentional Conversations Over Dinner" &&
          new Date(e.date) >= new Date(),
      );
      setDinnerEvents(dinners);
      setLoading(false);
    };
    getEvents();
  }, []);

  const openCheckout = (event) => {
    setCheckoutEvent(event);
    document.body.style.overflow = "hidden";
  };

  const closeCheckout = () => {
    setCheckoutEvent(null);
    document.body.style.overflow = "";
  };

  const lowestPrice = (event) => {
    if (!event.ticketTypes?.length) return null;
    return Math.min(...event.ticketTypes.map((t) => t.price));
  };

  return (
    <div className="ic-page">
      {/* =============================================
          HERO - FULL WIDTH CENTERED DARK
         ============================================= */}
      <header className="ic-hero">
        <div className="ic-hero-inner">
          <span className="ic-eyebrow">An Evening With the Collective</span>
          <h1 className="playfair ic-hero-title">
            Intentional Conversations
            <br />
            Over Dinner.
          </h1>
          <div className="ic-gold-rule"></div>
          <p className="ic-hero-lead">
            A curated dinner experience built around one thing most adults have
            forgotten how to do — talk to each other. Really talk.
          </p>
          <a href="#ic-tickets" className="ic-hero-cta">
            Reserve Your Seat
          </a>
        </div>
      </header>

      {/* =============================================
          WHAT IT IS
         ============================================= */}
      <section className="ic-what-section">
        <div className="ic-what-inner">
          <div className="ic-what-text">
            <span className="ic-section-eyebrow">The Experience</span>
            <h2 className="playfair ic-section-title">More Than a Meal.</h2>
            <p>
              Intentional Conversations Over Dinner is GFC's most intimate
              event. Each month, 24–36 members gather at a private dining room
              or chef's table for a multi-course dinner built around guided
              conversation.
            </p>
            <p>
              Every course comes with a prompt. Every prompt is designed to go
              somewhere real. We don't talk about work. We don't do networking.
              We sit down together as humans and we go somewhere most dinner
              parties never reach.
            </p>
            <p>
              The chef changes every month. The venue changes every month. The
              conversation topic changes every month. But the feeling — of being
              seen, heard, and genuinely connected — stays every time.
            </p>
          </div>

          <div className="ic-what-details">
            <div className="ic-detail-card">
              <div className="ic-detail-number">24–36</div>
              <div className="ic-detail-label">Guests per dinner</div>
            </div>
            <div className="ic-detail-card">
              <div className="ic-detail-number">4</div>
              <div className="ic-detail-label">Guided courses</div>
            </div>
            <div className="ic-detail-card">
              <div className="ic-detail-number">Monthly</div>
              <div className="ic-detail-label">Rotating venue & chef</div>
            </div>
            <div className="ic-detail-card">
              <div className="ic-detail-number">0%</div>
              <div className="ic-detail-label">Alcohol — always</div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          THE FORMAT — COURSES
         ============================================= */}
      <section className="ic-format-section">
        <div className="ic-format-inner">
          <span className="ic-section-eyebrow light">The Format</span>
          <h2 className="playfair ic-section-title light">
            How the Evening Unfolds.
          </h2>
          <p className="ic-format-subhead">
            Each course has a purpose. Each prompt has a direction. The
            conversation does the rest.
          </p>

          <div className="ic-courses">
            {COURSES.map((course) => (
              <div key={course.number} className="ic-course-card">
                <div className="ic-course-number">{course.number}</div>
                <div className="ic-course-content">
                  <div className="ic-course-title">{course.title}</div>
                  <p className="ic-course-desc">{course.description}</p>
                  <div className="ic-course-prompt">
                    <span className="ic-prompt-label">Sample prompt</span>
                    <span className="ic-prompt-text">"{course.prompt}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          WHO IT'S FOR
         ============================================= */}
      <section className="ic-who-section">
        <div className="ic-who-inner">
          <span className="ic-section-eyebrow">Who This Is For</span>
          <h2 className="playfair ic-section-title">
            You're Ready for This If...
          </h2>

          <div className="ic-who-grid">
            <div className="ic-who-card">
              <div className="ic-who-icon">&#9671;</div>
              <p>
                You've had a thousand surface-level conversations and you're
                hungry for one that actually goes somewhere.
              </p>
            </div>
            <div className="ic-who-card">
              <div className="ic-who-icon">&#9671;</div>
              <p>
                You're single, accomplished, and at the age where you know the
                difference between being in a room full of people and actually
                being connected.
              </p>
            </div>
            <div className="ic-who-card">
              <div className="ic-who-icon">&#9671;</div>
              <p>
                You're 35 or older, a professional or entrepreneur, and your
                Saturday nights deserve better than what you've been settling
                for.
              </p>
            </div>
            <div className="ic-who-card">
              <div className="ic-who-icon">&#9671;</div>
              <p>
                You're ready to be known — not just recognized. This dinner is
                for the version of you that's done performing and ready to
                connect.
              </p>
            </div>
          </div>

          <div className="ic-who-note">
            <p>
              This is not a networking event. There are no business cards. No
              elevator pitches. No "what do you do?" as an opener. Just people —
              and what happens when you give them the right questions.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          PRICING
         ============================================= */}
      <section className="ic-pricing-section">
        <div className="ic-pricing-inner">
          <span className="ic-section-eyebrow light">Pricing</span>
          <h2 className="playfair ic-section-title light">
            What It Costs to Be Present.
          </h2>

          <div className="ic-pricing-grid">
            <div className="ic-price-card">
              <div className="ic-price-label">General Admission</div>
              <div className="ic-price-amount">$100–$125</div>
              <div className="ic-price-note">per person, per dinner</div>
              <div className="ic-price-divider"></div>
              <ul className="ic-price-features">
                <li>Multi-course seated dinner</li>
                <li>Curated mocktail pairings with each course</li>
                <li>Guided conversation facilitated by Vaughn</li>
                <li>Rotating chef & cuisine each month</li>
                <li>Private dining room or chef's table venue</li>
                <li>Optional 30-minute open mixer after dinner</li>
              </ul>
              <a href="#ic-tickets" className="ic-price-btn">
                Reserve a Seat
              </a>
            </div>

            <div className="ic-price-card ic-price-featured">
              <div className="ic-price-badge">Member Pricing</div>
              <div className="ic-price-label">GFC Members</div>
              <div className="ic-price-amount">$85–$110</div>
              <div className="ic-price-note">$15 off every dinner</div>
              <div className="ic-price-divider"></div>
              <ul className="ic-price-features">
                <li>All General Admission benefits</li>
                <li>$15 discount applied automatically</li>
                <li>Priority access before public sale opens</li>
                <li>First to know when topic is announced</li>
                <li>Reserved seating preference</li>
                <li>Access to post-dinner member community recap</li>
              </ul>
              <Link to="/membership" className="ic-price-btn ic-price-btn-gold">
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          UPCOMING DINNERS — TICKET PURCHASE
         ============================================= */}
      <section className="ic-tickets-section" id="ic-tickets">
        <div className="ic-tickets-inner">
          <span className="ic-section-eyebrow">Upcoming Dinners</span>
          <h2 className="playfair ic-section-title">Reserve Your Seat.</h2>
          <p className="ic-tickets-subhead">
            Dinners sell out quickly. Members receive access before tickets open
            to the public.
          </p>

          {loading ? (
            <div className="ic-loading">Checking availability...</div>
          ) : dinnerEvents.length > 0 ? (
            <div className="ic-dinner-list">
              {dinnerEvents.map((event) => {
                const isSoldOut = event.ticketTypes?.every(
                  (t) => t.sold >= t.quantity,
                );
                const price = lowestPrice(event);

                return (
                  <div key={event._id} className="ic-dinner-row">
                    <div className="ic-dinner-info">
                      <div className="ic-dinner-date">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" · "}
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      <div className="ic-dinner-name">{event.name}</div>
                      <div className="ic-dinner-location">
                        {event.location?.name}
                        {event.location?.city && `, ${event.location.city}`}
                      </div>
                    </div>
                    <div className="ic-dinner-action">
                      {price !== null && (
                        <div className="ic-dinner-price">
                          From <strong>${(price / 100).toFixed(0)}</strong>
                        </div>
                      )}
                      {isSoldOut ? (
                        <span className="ic-dinner-sold-out">Sold Out</span>
                      ) : (
                        <button
                          className="ic-dinner-btn"
                          onClick={() => openCheckout(event)}
                        >
                          Get Tickets
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ic-no-events">
              <p>Our next Intentional Conversations dinner is being curated.</p>
              <p>
                <Link to="/membership" className="ic-inline-link">
                  Become a member
                </Link>{" "}
                to be the first to know when the next date is announced.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CHECKOUT MODAL */}
      {checkoutEvent && (
        <Checkout event={checkoutEvent} onClose={closeCheckout} />
      )}
    </div>
  );
};

export default IntentionalDinners;

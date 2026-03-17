import React from "react";
import '../Styles/Home.css';
import { Link } from "react-router-dom";
 
const Home = () => {
  return (
    <main className="home-wrapper">
 
      {/* 1. HERO */}
      <header className="home-hero-visual">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">Atlanta & Beyond</span>
            {/* FIXED: removed <br/> — CSS handles visual break */}
            <h1 className="playfair luxe-title-white">The Antidote.</h1>
            <div className="gold-spacer-v2"></div>
            {/* FIXED: narrative lead copy updated, font size reduced in CSS */}
            <p className="narrative-lead-white">
              Success shouldn't be a solo journey. Join a collective where 
              excellence meets genuine connection.
            </p>
            <Link to="/events" className="gold-fill-btn">Explore the Collective →</Link>
          </div>
        </div>
      </header>
 
      {/* 2. ISOLATION STATS */}
      <section className="isolation-stats-gold">
        <div className="stats-container">
          <div className="stats-header">
            <span className="navy-label">The Silent Epidemic</span>
            <h2 className="playfair navy-text">Why Connection is Non-Negotiable</h2>
            <div className="navy-spacer-small"></div>
          </div>
          {/* FIXED: removed <br /> — margin-top on stats-grid handles spacing */}
          <div className="stats-grid">
            <div className="stat-card-navy">
              <div className="stat-number-navy">15</div>
              <div className="stat-label-navy">Cigarettes a Day</div>
              <div className="navy-line-small"></div>
              <p>The physiological impact of isolation is as damaging as smoking 15 cigarettes daily.</p>
            </div>
            <div className="stat-card-navy">
              <div className="stat-number-navy">50%</div>
              <div className="stat-label-navy">Dementia Risk</div>
              <div className="navy-line-small"></div>
              <p>Prolonged isolation is linked to a 50% increase in the risk of cognitive decline.</p>
            </div>
            <div className="stat-card-navy">
              <div className="stat-number-navy">$406B</div>
              <div className="stat-label-navy">Economic Cost</div>
              <div className="navy-line-small"></div>
              <p>Loneliness costs the U.S. economy billions annually in lost productivity.</p>
            </div>
          </div>
        </div>
      </section>
 
      {/* 3. STORY SECTION */}
      <section className="story-section">
        <div className="story-block">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800"
              alt="Deep Connection"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Connection</span>
            <h2 className="playfair">No Small Talk</h2>
            <p>
              Our alcohol-free environments facilitate the conversations that matter.
              We value every interaction and are here to serve you as you transition
              from isolated to integrated.
            </p>
          </div>
        </div>
 
        <div className="story-block reverse">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
              alt="Sophisticated Travel"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Experience</span>
            <h2 className="playfair">Travel for the Soul</h2>
            <p>
              Travel is for fun and seeing the world. We curate journeys where
              the destination is just the backdrop for building lifelong bonds.
            </p>
          </div>
        </div>
      </section>
 
      {/* 4. PROOF OF TRACTION — NEW SECTION */}
      <section className="traction-section">
        <div>
          <span className="traction-eyebrow">By The Numbers</span>
          <h2 className="playfair traction-heading">Built in Under 90 Days.</h2>
          <p className="traction-subhead">No ad spend. No paid promotions. Just showing up.</p>
 
          <div className="traction-grid">
            <div className="traction-stat">
              <div className="traction-number">4</div>
              <div className="traction-label">Events Hosted</div>
              <div className="traction-desc">Since January 2025</div>
            </div>
            <div className="traction-stat">
              <div className="traction-number">2</div>
              <div className="traction-label">Sold Out</div>
              <div className="traction-desc">Of our first four events</div>
            </div>
            <div className="traction-stat">
              <div className="traction-number">200%+</div>
              <div className="traction-label">Venue Sales Lift</div>
              <div className="traction-desc">Documented every event night</div>
            </div>
          </div>
 
          <div className="traction-bottom-row">
            <div className="traction-platform-strip">
              <div className="traction-platform-num">700+</div>
              <div className="traction-platform-name">TikTok Followers</div>
            </div>
            <div className="traction-platform-strip">
              <div className="traction-platform-num">~100</div>
              <div className="traction-platform-name">Meetup Members</div>
            </div>
            <div className="traction-platform-strip">
              <div className="traction-platform-num">65</div>
              <div className="traction-platform-name">Email Subscribers</div>
            </div>
          </div>
        </div>
      </section>
 
      {/* 5. PARTNERSHIP */}
      <section className="partnership-editorial-section">
        <div className="editorial-frame">
          <div className="editorial-content">
            <span className="editorial-label">Strategic Growth</span>
            <h2 className="playfair editorial-title">Align with the Collective</h2>
            <div className="editorial-divider"></div>
            <p className="editorial-body">
              We invite Atlanta's distinguished brands and luxury service providers to invest
              in the infrastructure of social wellness. Your partnership powers the sanctuaries
              where connection thrives.
            </p>
            <Link to="/partnerships" className="gold-editorial-btn">
              Explore Strategic Opportunities
            </Link>
            <p className="portal-hint">
              Partner with the Collective to transform the landscape of social wellness
              and help us engineer the end of Atlanta's quiet epidemic of isolation.
            </p>
          </div>
        </div>
      </section>
 
      {/* 6. HOST NOTE */}
      <section className="host-note-visual">
        <div className="host-overlay-container">
          <p className="host-quote">
            "I believe the best life strategies start with a genuine human connection.
            Let's stop the scroll and start the conversation."
          </p>
          <p className="signature">— Vaughn, GFC Founder</p>
          <Link to="/membership" className="btn-gold-outline-white">Join the Collective</Link>
        </div>
      </section>
 
    </main>
  );
};
 
export default Home;
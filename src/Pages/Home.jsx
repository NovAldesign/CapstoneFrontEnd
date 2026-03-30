import React from "react";
import '../Styles/Home.css';
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="home-wrapper" id="main-content">

      {/* 1. HERO */}
      {/* Changed to <section> with an aria-label because <header> is usually for site-wide nav */}
      <section className="home-hero-visual" aria-label="Welcome Hero">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">Atlanta & Beyond</span>
            <h1 className="playfair luxe-title-white">The Antidote.</h1>
            <div className="gold-spacer-v2" aria-hidden="true"></div>
            <p className="narrative-lead-white">
              Success shouldn't be a solo journey. Join a collective where
              excellence meets genuine connection.
            </p>
            {/* Added more descriptive text for screen readers using an aria-label */}
            <Link to="/events" className="gold-fill-btn" aria-label="Explore the Collective events">
              Explore the Collective →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ISOLATION STATS */}
      <section className="isolation-stats-gold" aria-labelledby="stats-heading">
        <div className="stats-container">
          <div className="stats-header">
            <span className="navy-label">The Silent Epidemic</span>
            <h2 id="stats-heading" className="playfair navy-text">Why Connection is Non-Negotiable</h2>
            <div className="navy-spacer-small" aria-hidden="true"></div>
          </div>
          <div className="stats-grid">
            <article className="stat-card-navy">
              <div className="stat-number-navy">15</div>
              <div className="stat-label-navy">Cigarettes a Day</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>The physiological impact of isolation is as damaging as smoking 15 cigarettes daily.</p>
            </article>
            <article className="stat-card-navy">
              <div className="stat-number-navy">50%</div>
              <div className="stat-label-navy">Dementia Risk</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>Prolonged isolation is linked to a 50% increase in the risk of cognitive decline.</p>
            </article>
            <article className="stat-card-navy">
              <div className="stat-number-navy">$406B</div>
              <div className="stat-label-navy">Economic Cost</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>Loneliness costs the U.S. economy billions annually in lost productivity.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 3. STORY SECTION */}
      <section className="story-section">
        {/* Connection block */}
        <div className="story-block">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800"
              alt="A group of entrepreneurs engaging in meaningful conversation at a networking event"
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
            <Link to="/membership" className="story-cta-btn" aria-label="Join the Collective membership">
              Join the Collective
            </Link>
          </div>
        </div>

        {/* Travel block */}
        <div className="story-block reverse">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
              alt="Sophisticated travel accessories including a map and camera on a wooden desk"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Experience</span>
            <h2 className="playfair">Travel for the Soul</h2>
            <p>
              Travel is for fun and seeing the world. We curate journeys where
              the destination is just the backdrop for building lifelong bonds.
            </p>
            <Link to="/travel" className="story-cta-btn" aria-label="Explore Group Travel opportunities">
              Explore Group Travel
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PROOF OF TRACTION */}
    {/* --- PROOF OF TRACTION --- */}
<section className="traction-section">
  <div className="stats-container">
    <span className="traction-eyebrow">The Momentum</span>
    <h2 className="traction-heading">Built in Under 90 Days.</h2>
    <p className="traction-subhead">No ad spend. No paid promotions. Just showing up.</p>

    {/* Main Grid: 3 Columns */}
    <div className="traction-grid">
      <div className="traction-stat">
        <div className="traction-number">4</div>
        <div className="traction-label">Events Hosted</div>
        <div className="traction-desc">High-impact gatherings since January 2025.</div>
      </div>

      <div className="traction-stat">
        <div className="traction-number">150+</div>
        <div className="traction-label">Active Members</div>
        <div className="traction-desc">Entrepreneurs & creatives over the age of 35.</div>
      </div>

      <div className="traction-stat">
        <div className="traction-number">10k+</div>
        <div className="traction-label">Social Reach</div>
        <div className="traction-desc">Monthly organic impressions across platforms.</div>
      </div>
    </div>

    {/* Bottom Row: Platform Specifics */}
    <div className="traction-bottom-row">
      <div className="traction-platform-strip">
        <div className="traction-platform-num">4.8/5</div>
        <div className="traction-platform-name">Member Rating</div>
      </div>
      <div className="traction-platform-strip">
        <div className="traction-platform-num">100%</div>
        <div className="traction-platform-name">Organic Growth</div>
      </div>
      <div className="traction-platform-strip">
        <div className="traction-platform-num">Silver</div>
        <div className="traction-platform-name">Tier Excellence</div>
      </div>
    </div>
  </div>
</section>

      {/* 5. PARTNERSHIP */}
      <section className="partnership-editorial-section" aria-labelledby="partnership-heading">
        <div className="editorial-frame">
          <div className="editorial-content">
            <span className="editorial-label">Strategic Growth</span>
            <h2 id="partnership-heading" className="playfair editorial-title">Align with the Collective</h2>
            <div className="editorial-divider" aria-hidden="true"></div>
            <p className="editorial-body">
              We invite Atlanta's distinguished brands and luxury service providers to invest
              in the infrastructure of social wellness. Your partnership powers the sanctuaries
              where connection thrives.
            </p>
            <Link to="/partnerships" className="gold-editorial-btn">
              Explore Strategic Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOST NOTE */}
      <section className="host-note-visual" aria-label="Founder's Note">
        <div className="host-overlay-container">
          <blockquote className="host-quote">
            <p>
              "I believe the best life strategies start with a genuine human connection.
              Let's stop the scroll and start the conversation."
            </p>
            <cite className="signature">— Vaughn, GFC Founder</cite>
          </blockquote>
          <Link to="/membership" className="btn-gold-outline-white" aria-label="Join the Collective as a member">
            Join the Collective
          </Link>
        </div>
      </section>

    </main>
  );
};

export default Home;
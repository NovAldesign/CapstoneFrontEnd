import React from "react";
import "../Styles/Home.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HomeReviews from "../Components/HomeReviews.jsx";
 
const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Meta Data for SEO */}
      <Helmet>
        <title>Grown Folks Collective | Atlanta's 30+ Social Community</title>
        <meta
          name="description"
          content="Grown Folks Collective is Atlanta's third space for adults 30+ who want more fun and joy in their lives. Game nights, dinners, and group travel built for genuine connection."
        />
      </Helmet>
 
      {/* 1. HERO */}
      {/* Changed to <section> with an aria-label because <header> is usually for site-wide nav */}
      <section className="home-hero-visual" aria-label="Welcome Hero">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">Atlanta & Beyond · 30+</span>
            <h1 className="playfair luxe-title-white">The Antidote.</h1>
            <p className="hero-slogan">Where grown folks come out to play.<sup>™</sup></p>
            <div className="gold-spacer-v2" aria-hidden="true"></div>
            <p className="narrative-lead-white">
              Grown life shouldn't be a solo journey. Join Atlanta's 30+
              collective for good times, real connection, and a few more
              sparks of joy in your life.
            </p>
            {/* Added more descriptive text for screen readers using an aria-label */}
            <Link
              to="/events"
              className="gold-fill-btn"
              aria-label="Explore the Collective events"
            >
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
            <h2 id="stats-heading" className="playfair navy-text">
              Why Connection is Non-Negotiable
            </h2>
            <div className="navy-spacer-small" aria-hidden="true"></div>
          </div>
          <div className="stats-grid">
            <article className="stat-card-navy">
              <div className="stat-number-navy">15</div>
              <div className="stat-label-navy">Cigarettes a Day</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>
                The physiological impact of isolation is as damaging as smoking
                15 cigarettes daily.
              </p>
            </article>
            <article className="stat-card-navy">
              <div className="stat-number-navy">50%</div>
              <div className="stat-label-navy">Dementia Risk</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>
                Prolonged isolation is linked to a 50% increase in the risk of
                cognitive decline.
              </p>
            </article>
            <article className="stat-card-navy">
              <div className="stat-number-navy">$406B</div>
              <div className="stat-label-navy">Economic Cost</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>
                Loneliness costs the U.S. economy billions annually in lost
                productivity.
              </p>
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
              alt="A group of friends sharing a relaxed conversation around a table"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Connection</span>
            <h2 className="playfair">No Small Talk</h2>
            <p>
              Our alcohol-free gatherings make room for the conversations that
              matter. No posturing, no pressure, and no "So, what do you do?"
              Just grown folks showing up as themselves and moving from isolated
              to integrated.
            </p>
            <Link
              to="/membership"
              className="story-cta-btn"
              aria-label="Join the Collective membership"
            >
              Join the Collective
            </Link>
          </div>
        </div>
 
        {/* Travel block */}
        <div className="story-block reverse">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"
              alt="Travel accessories including a map and camera on a wooden desk"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Experience</span>
            <h2 className="playfair">Travel for the Soul</h2>
            <p>
              From weekend getaways to international trips, we see the world
              together. The destination is the backdrop. The bonds you build
              are the real souvenir.
            </p>
            <Link
              to="/travel"
              className="story-cta-btn"
              aria-label="Explore Group Travel opportunities"
            >
              Explore Group Travel
            </Link>
          </div>
        </div>
      </section>
 
      {/* 4. SOCIAL PROOF (approved reviews from the admin dashboard) */}
      <HomeReviews />
 
      {/* 5. PARTNERSHIP */}
      <section
        className="partnership-editorial-section"
        aria-labelledby="partnership-heading"
      >
        <div className="editorial-frame">
          <div className="editorial-content">
            <span className="editorial-label">Community Partners</span>
            <h2 id="partnership-heading" className="playfair editorial-title">
              Align with the Collective
            </h2>
            <div className="editorial-divider" aria-hidden="true"></div>
            <p className="editorial-body">
              We invite Atlanta's brands, venues, and local businesses to invest
              in social wellness. Your partnership helps power the spaces where
              grown folks connect, recharge, and find their people.
            </p>
            <Link to="/partnerships" className="gold-editorial-btn">
              Explore Partnership Opportunities
            </Link>
          </div>
        </div>
      </section>
 
      {/* 6. HOST NOTE */}
      <section className="host-note-visual" aria-label="Founder's Note">
        <div className="host-overlay-container">
          <blockquote className="host-quote">
            <p>
              "I believe the best life strategies start with a genuine human
              connection. Let's stop the scroll and start the conversation."
            </p>
            <cite className="signature">— Vaughn, GFC Founder</cite>
          </blockquote>
          <Link
            to="/membership"
            className="btn-gold-outline-white"
            aria-label="Join the Collective as a member"
          >
            Join the Collective
          </Link>
        </div>
      </section>
    </div>
  );
};
 
export default Home;
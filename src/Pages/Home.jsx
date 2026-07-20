import React from "react";
import "../Styles/Home.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async"; 

const Home = () => {
  return (
    <main className="home-wrapper" id="main-content">
      {/* Meta Data for SEO */}
      <Helmet>
        <title>Grown Folks Collective | Your Third Space</title>
        <meta 
          name="description" 
          content="End social isolation and find your joy. Grown Folks Collective is your third space for building genuine connections and meaningful community experiences." 
        />
      </Helmet>

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
              alt="A group of entrepreneurs engaging in meaningful conversation at a networking event"
            />
          </div>
          <div className="story-text">
            <span className="gold-label">The Connection</span>
            <h2 className="playfair">No Small Talk</h2>
            <p>
              Our alcohol-free environments facilitate the conversations that
              matter. We value every interaction and are here to serve you as
              you transition from isolated to integrated.
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

     {/* 4. SOCIAL PROOF */}
<section className="testimonials-section" aria-labelledby="testimonials-heading">
  <div className="testimonials-container">
    <span className="gold-label">Real Voices</span>
    <h2 id="testimonials-heading" className="playfair testimonials-title">
      Don't Take Our Word for It
    </h2>
    <div className="gold-spacer-v2" aria-hidden="true"></div>

    <div className="testimonials-grid">
      {/* Featured member review */}
      <article className="testimonial-card testimonial-card-featured">
        <div className="testimonial-quote-mark" aria-hidden="true">"</div>
        <blockquote className="testimonial-text">
          Game night with Vaughn and the Grown Folks Collective was exactly what
          grown folks game night should be. The theme set the tone right out the
          gate. The vibe was cool but competitive — friendly on the surface,
          serious once the games started. The karaoke heads were in their bag.
          The spades table was a whole different arena: heavy trash talk, laughs,
          side-eyes, and strategy.
          <br /><br />
          What stood out most was the people. Everybody was down to earth,
          welcoming, and real. No weird energy. No posturing. Just good folks
          showing up as themselves.
          <br /><br />
          It didn't just feel like a game night — it felt like home. I'd run it
          back without hesitation.
        </blockquote>
        <div className="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <cite className="testimonial-reviewer">— Lee · Game Night Attendee</cite>
      </article>

      {/* Platform ratings */}
      <div className="testimonial-card testimonial-rating-card" aria-label="Platform ratings">
        <div className="platform-block">
          <p className="rating-platform-name">Eventbrite Verified</p>
          <div className="rating-number">4.8</div>
          <div className="testimonial-stars large" aria-label="4.8 out of 5">★★★★★</div>
          <p className="rating-label">Average event rating</p>
        </div>
        <div className="platform-block">
          <p className="rating-platform-name">Meetup Verified</p>
          <div className="rating-number">4.7</div>
          <div className="testimonial-stars large" aria-label="4 out of 5">★★★★☆</div>
          <p className="rating-label">Average event rating</p>
        </div>
      </div>  {/* ← closes testimonial-rating-card */}
    </div>  {/* ← closes testimonials-grid */}

    <p className="testimonials-cta-text">
      Attend an event and write the next chapter
    </p>
  </div>  
</section>

      {/* 5. PARTNERSHIP */}
      <section
        className="partnership-editorial-section"
        aria-labelledby="partnership-heading"
      >
        <div className="editorial-frame">
          <div className="editorial-content">
            <span className="editorial-label">Strategic Growth</span>
            <h2 id="partnership-heading" className="playfair editorial-title">
              Align with the Collective
            </h2>
            <div className="editorial-divider" aria-hidden="true"></div>
            <p className="editorial-body">
              We invite Atlanta's distinguished brands and luxury service
              providers to invest in the infrastructure of social wellness. Your
              partnership powers the sanctuaries where connection thrives.
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
    </main>
  );
};

export default Home;
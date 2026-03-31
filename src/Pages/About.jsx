import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import '../Styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Meta Data for SEO */}
      <Helmet>
        <title>About Us | Grown Folks Collective</title>
        <meta 
          name="description" 
          content="Discover the story of Grown Folks Collective. Built in Atlanta for accomplished individuals, we provide a third space to end social isolation and find joy through genuine, alcohol-free connection." 
        />
      </Helmet>

      {/* HERO */}
      <header className="about-hero">
        <div className="about-hero-inner">
          <span className="about-eyebrow">Est. January 2026 · Atlanta, GA</span>
          <h1 className="playfair about-hero-title">
            Built for the Room<br />That Didn't Exist Yet.
          </h1>
          <div className="about-gold-spacer"></div>
          <p className="about-hero-subhead">
            GFC exists because Atlanta's accomplished singles deserved better
            than a bar and more than an empty apartment on a Saturday night.
          </p>
        </div>
      </header>

      {/* THE STORY */}
      <section className="about-story-section">
        <div className="about-story-grid">
          <div className="about-story-image-col">
            <div className="about-story-img-wrapper">
              <img
                src="https://i0.wp.com/www.reemployability.com/wp-content/uploads/2023/04/Untitled-design-2023-04-13T151843.899.png?resize=1080%2C675&ssl=1auto=format&fit=crop&q=80&w=800"
                alt="Grown Folks Collective community"
                className="about-story-img"
              />
              <div className="about-img-gold-corner"></div>
            </div>
          </div>

          <div className="about-story-text-col">
            <span className="about-section-label">The Story</span>
            <h2 className="playfair about-section-heading">Why We Started</h2>
            <div className="about-gold-rule"></div>

            <p className="about-body-large">
              There's a specific kind of loneliness that belongs to successful people. You've built the career. You've built the life. But somewhere along the way, the friendships got harder to maintain and the social calendar got thinner.
            </p>
            <p className="about-body">
              The options that used to work — the bars, the lounges, the loud rooms full of strangers — stopped feeling right.
            </p>
            <p className="about-body">
              Grown Folks Collective was founded in Atlanta in January 2026 to fill that gap.
            </p>
            <p className="about-body">
              We didn't start with a business plan. We started with a game night in a small Decatur restaurant and 36 people who showed up because they were tired of sitting at home. It sold out. Then we did it again. Sold out again.
            </p>
            <p className="about-body">
              In under 90 days, we built a community of over 865 people — with zero advertising, zero paid promotion, and zero compromise on our values. Our guests drive from Monroe, Smyrna, Fayetteville, Lawrenceville, and Douglasville to be in our room on a Saturday night. Not because there's nothing else to do. Because this is the only room built for them.
            </p>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS */}
      <section className="about-stats-section">
        <div className="about-stats-inner">
          <span className="about-eyebrow-light">By The Numbers</span>
          <h2 className="playfair about-stats-heading">Built in Under 90 Days.</h2>
          <p className="about-stats-subhead">No ad spend. No paid promotions. Just showing up.</p>

          <div className="about-stats-grid">
            <div className="about-stat">
              <div className="about-stat-number">4</div>
              <div className="about-stat-label">Events Hosted</div>
              <div className="about-stat-desc">Since January 2025</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">2</div>
              <div className="about-stat-label">Sold Out</div>
              <div className="about-stat-desc">Of our first four events</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">250%+</div>
              <div className="about-stat-label">Venue Sales Lift</div>
              <div className="about-stat-desc">Documented every event night</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">1000+</div>
              <div className="about-stat-label">Community Members</div>
              <div className="about-stat-desc">Across all platforms</div>
            </div>
          </div>

          <div className="about-platform-row">
            <div className="about-platform">
              <div className="about-platform-num">820+</div>
              <div className="about-platform-name">TikTok Followers</div>
            </div>
            <div className="about-platform-divider"></div>
            <div className="about-platform">
              <div className="about-platform-num">100+</div>
              <div className="about-platform-name">Meetup Members</div>
            </div>
            <div className="about-platform-divider"></div>
            <div className="about-platform">
              <div className="about-platform-num">85</div>
              <div className="about-platform-name">Email Subscribers</div>
            </div>
            <div className="about-platform-divider"></div>
            <div className="about-platform">
              <div className="about-platform-num">36</div>
              <div className="about-platform-name">Guests Per Event — Always</div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="about-values-section">
        <div className="about-values-inner">
          <span className="about-section-label">What We Stand For</span>
          <h2 className="playfair about-section-heading centered">Our Values</h2>
          <div className="about-gold-rule centered"></div>

          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-number">01</div>
              <div className="about-value-title">Intentionality</div>
              <p className="about-value-body">
                Every event is curated. Every guest is considered. We cap attendance at 36 people not because we can't grow, but because intimacy is the point.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-number">02</div>
              <div className="about-value-title">Sobriety</div>
              <p className="about-value-body">
                Every GFC event is fully alcohol-free and tobacco-free. We believe the best version of you shows up when you're clear-headed, present, and genuinely yourself.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-number">03</div>
              <div className="about-value-title">Excellence</div>
              <p className="about-value-body">
                We are not a meetup. We are not a mixer. We are a premium experience for adults who have earned the right to expect more — and we deliver it every time.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-number">04</div>
              <div className="about-value-title">Community</div>
              <p className="about-value-body">
                We are building something that outlasts any single event. GFC is a network of accomplished Atlanta professionals who choose each other — and keep choosing each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="about-who-section">
        <div className="about-who-grid">
          <div className="about-who-text">
            <span className="about-section-label">Who We Serve</span>
            <h2 className="playfair about-section-heading">You Belong Here If...</h2>
            <div className="about-gold-rule"></div>
            <ul className="about-who-list">
              <li>You're 35 or older and single</li>
              <li>You're an entrepreneur, executive, or professional</li>
              <li>You earn $80K or more and you've outgrown the nightlife scene</li>
              <li>You want to meet people who match your energy — not just your zip code</li>
              <li>You're done sitting at home on Saturday nights</li>
            </ul>
            <Link to="/membership" className="about-cta-btn">
              Join the Collective
            </Link>
          </div>
          <div className="about-who-image">
            <img
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800"
              alt="GFC community members"
              className="about-who-img"
            />
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="about-founder-section">
        <div className="about-founder-inner">
          <div className="about-founder-content">
            <span className="about-eyebrow-light">A Word From Our Founder</span>
            <blockquote className="about-founder-quote">
              "I believe the best life strategies start with a genuine human connection.
              Let's stop the scroll and start the conversation."
            </blockquote>
            <div className="about-founder-sig">
              <div className="about-founder-name">Vaughn</div>
              <div className="about-founder-title">Founder, Grown Folks Collective</div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="about-bottom-cta">
        <div className="about-bottom-cta-inner">
          <h2 className="playfair about-bottom-heading">
            This Is Your Seat at the Table.
          </h2>
          <p className="about-bottom-body">
            Join the collective that's building real community in Atlanta — one intentional Saturday night at a time.
          </p>
          <div className="about-cta-row">
            <Link to="/events" className="about-btn-primary">View Upcoming Events</Link>
            <Link to="/membership" className="about-btn-secondary">Become a Member</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
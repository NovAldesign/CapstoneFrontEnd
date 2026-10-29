import React, { useEffect, useState } from "react";
import "../Styles/Home.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HomeReviews from "../Components/HomeReviews.jsx";
import { useSiteStats, plus } from "../Services/siteStats";
import { loadUpcomingEvents, eventPath, getPriceDisplay, formatMoney } from "../Services/eventUtils";

// Every need, matched to the night that answers it
const NIGHTS = [
  {
    need: "New to Atlanta?",
    night: "Game Night",
    href: "/events?night=game-night",
    feel: "Pull up a chair and you'll have a spades partner by the second hand.",
    facts: "Spades, dominoes and Uno · from $25",
  },
  {
    need: "Your friends got busy?",
    night: "Karaoke Bingo",
    href: "/events?night=karaoke-bingo",
    feel: "A whole room singing the songs you grew up on. Nobody stays a stranger.",
    facts: "Bingo cards, big hooks, prizes · from $25",
  },
  {
    need: "Miss live music without the bar?",
    night: "Acoustic & Infused™",
    href: "/events?night=acoustic-infused",
    feel: "Atlanta's best local artists, right in front of you, while a painter creates live beside the stage. By the last set, the whole room is on its feet.",
    facts: "Live music, live art, dancing · from $30",
  },
];

// Launching January 2027
const COMING = [
  {
    kicker: "For singles 30+",
    need: "Done with the apps?",
    name: "GFC Select™",
    body: "A private masquerade evening for Atlanta singles. Twenty women and twenty men, every guest vetted, camera-free and confidential. No swiping, no speed-dating bells. Just a real room where everyone came to meet someone.",
    facts: "40 seats · By invitation · January 2027",
    links: [
      { to: "/select/ladies", label: "For the ladies" },
      { to: "/select/gentlemen", label: "For the gentlemen" },
      { to: "/select/invitation", label: "Open your invitation →", primary: true },
    ],
  },
  {
    kicker: "For curious minds",
    need: "Want to learn something new?",
    name: "Recess Talks™",
    body: "One Saturday morning a month, a professor, author or local voice gives a talk worth getting up for. Coffee and a light breakfast, something to color while you listen, and conversation that keeps going after.",
    facts: "Monthly Saturdays · Starts January 2027",
    links: [
      { to: "/recess#speak", label: "Apply to speak" },
      { to: "/recess#list", label: "Join the list →", primary: true },
    ],
  },
];

const dayLabel = (d) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });

// The next few nights on the calendar
const NextNights = () => {
  const [events, setEvents] = useState(null);
  useEffect(() => {
    let live = true;
    loadUpcomingEvents()
      .then((list) => live && setEvents(list.slice(0, 3)))
      .catch(() => live && setEvents([]));
    return () => { live = false; };
  }, []);
  if (!events || events.length === 0) return null;
  return (
    <section className="hx-next" aria-labelledby="hx-next-title">
      <div className="hx-wrap">
        <p className="hx-eyebrow">On the calendar</p>
        <h2 id="hx-next-title" className="playfair hx-h2">Your next night out</h2>
        <div className="hx-next-grid">
          {events.map((e) => {
            const price = getPriceDisplay(e.tiers || []);
            return (
              <Link key={e._id || e.id} to={eventPath(e)} className="hx-next-card">
                <img src={e.image} alt="" loading="lazy" />
                <div className="hx-next-body">
                  <span className="hx-next-date">{dayLabel(e.date)}</span>
                  <span className="hx-next-name">{e.title || e.name}</span>
                  {price?.price != null && <span className="hx-next-price">From {formatMoney(price.price)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
        <Link to="/events" className="hx-link">See every night →</Link>
      </div>
    </section>
  );
};

const Home = () => {
  const stats = useSiteStats();
  return (
    <div className="home-wrapper">
      <Helmet>
        <title>Grown Folks™ Collective | Atlanta's Home for Real Connection, 30+</title>
        <meta
          name="description"
          content="A hosted third space for adults 30+ in Atlanta. Curated nights of live music and play where strangers become regulars and regulars become friends."
        />
      </Helmet>

      {/* 1. HERO: the problem, then the answer */}
      <section className="home-hero-visual" aria-label="Welcome">
        <div className="hero-dark-overlay">
          <div className="hero-content-luxe">
            <span className="location-tag-gold">Atlanta · 30+ · Alcohol-free</span>
            <h1 className="playfair luxe-title-white hx-hero-title">Another weekend in the house? Not anymore.</h1>
            <p className="hero-slogan">Where grown folks come out to play.<sup>™</sup></p>
            <div className="gold-spacer-v2" aria-hidden="true"></div>
            <p className="narrative-lead-white">
              Atlanta's home for real connection. Live music, game nights and Karaoke Bingo,
              hosted for grown folks who want good people and a real night out.
            </p>
            <div className="hx-hero-ctas">
              <Link to="/events" className="gold-fill-btn">Find your night →</Link>
              <Link to="/play" className="hx-btn-ghost">Get $5 off your first ticket</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROOF */}
      <section className="hx-proof" aria-label="Grown Folks Collective by the numbers">
        <div className="hx-proof-row">
          <div><strong>{stats.soldOut}</strong><span>sold-out nights</span></div>
          <div><strong>{plus(stats.communityTotal)}</strong><span>grown folks in our community</span></div>
          <div><strong>{stats.eventsHosted}</strong><span>nights hosted</span></div>
          <div><strong>Metro ATL</strong><span>guests drive in from Monroe to Buford</span></div>
        </div>
      </section>

      {/* 3. THE ANSWER: a night for every need */}
      <section className="hx-nights" aria-labelledby="hx-nights-title">
        <div className="hx-wrap">
          <p className="hx-eyebrow">Whatever brought you here</p>
          <h2 id="hx-nights-title" className="playfair hx-h2">There's a night for that.</h2>
          <p className="hx-sub">
            Every night is hosted, alcohol-free and built so you never stand alone.
            Come solo, with your person, or bring your whole group.
          </p>
          <div className="hx-nights-grid">
            {NIGHTS.map((n) => (
              <Link key={n.night} to={n.href || "/events"} className="hx-night-card">
                <span className="hx-night-need">{n.need}</span>
                <span className="playfair hx-night-name">{n.night}</span>
                <span className="hx-night-feel">{n.feel}</span>
                <span className="hx-night-facts">{n.facts}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3b. COMING JANUARY 2027 */}
      <section className="hx-coming" aria-labelledby="hx-coming-title">
        <div className="hx-wrap">
          <p className="hx-eyebrow hx-eyebrow-light">New in January 2027</p>
          <h2 id="hx-coming-title" className="playfair hx-h2 hx-light">Two new rooms. Get on the list first.</h2>
          <div className="hx-coming-grid">
            {COMING.map((c) => (
              <article key={c.name} className="hx-coming-card">
                <span className="hx-biz-kicker">{c.kicker}</span>
                <span className="hx-coming-need">{c.need}</span>
                <h3 className="playfair hx-coming-name">{c.name}</h3>
                <p className="hx-biz-body">{c.body}</p>
                <span className="hx-coming-facts">{c.facts}</span>
                <div className="hx-coming-links">
                  {c.links.map((l) => (
                    <Link key={l.to} to={l.to} className={l.primary ? "hx-coming-btn" : "hx-coming-link"}>{l.label}</Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEXT NIGHTS (live from the calendar) */}
      <NextNights />

      {/* 5. YOUR FIRST NIGHT */}
      <section className="hx-first" aria-labelledby="hx-first-title">
        <div className="hx-wrap hx-first-grid">
          <div className="hx-first-panel" aria-hidden="true">
            <span className="hx-first-panel-kicker">Grown Folks™ Collective</span>
            <span className="playfair hx-first-panel-line">Walk in a stranger.</span>
            <span className="playfair hx-first-panel-line hx-gold">Leave with names.</span>
            <span className="hx-first-panel-rule"></span>
            <span className="hx-first-panel-tag">Where grown folks come out to play.™</span>
          </div>
          <div>
            <p className="hx-eyebrow">Never been?</p>
            <h2 id="hx-first-title" className="playfair hx-h2">Here's your first night.</h2>
            <ol className="hx-steps">
              <li><strong>You walk in and someone welcomes you.</strong> No standing by the door wondering where to go.</li>
              <li><strong>There's something to do right away.</strong> A game, a song, a stage. Conversation comes easy when your hands are busy.</li>
              <li><strong>You leave knowing names.</strong> Nobody leads with what they do for a living. We just want to know you.</li>
            </ol>
            <div className="hx-ways" aria-label="However you come">
              <p className="hx-ways-title">However you come, there's room for you.</p>
              <div className="hx-way">
                <strong>Coming solo?</strong>
                <span>You won't be the only one. We'll pull you into the first game, and you'll have a team by the second round.</span>
              </div>
              <div className="hx-way">
                <strong>Bringing your person?</strong>
                <span>A date night with something to do besides stare at a menu. Plus One saves $8 on two seats.</span>
              </div>
              <div className="hx-way">
                <strong>Rolling with your crew?</strong>
                <span>Your group stays together and still meets the room. Groups of 5 save 20%, groups of 10 save 25%.</span>
              </div>
            </div>
            <Link to="/events" className="story-cta-btn">Find your night</Link>
          </div>
        </div>
      </section>

      {/* 6. WHY IT MATTERS */}
      <section className="isolation-stats-gold" aria-labelledby="stats-heading">
        <div className="stats-container">
          <div className="stats-header">
            <span className="navy-label">Why it matters</span>
            <h2 id="stats-heading" className="playfair navy-text">Connection is good for you.</h2>
          </div>
          <div className="stats-grid hx-stats-two">
            <article className="stat-card-navy">
              <div className="stat-number-navy">1 in 2</div>
              <div className="stat-label-navy">Adults feel lonely</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>About half of U.S. adults say they've felt lonely. If that's you, you're in good company.</p>
            </article>
            <article className="stat-card-navy">
              <div className="stat-number-navy">15</div>
              <div className="stat-label-navy">Cigarettes a day</div>
              <div className="navy-line-small" aria-hidden="true"></div>
              <p>The U.S. Surgeon General compares the health risk of disconnection to smoking up to 15 cigarettes a day. The fix feels a lot better: your people.</p>
            </article>
          </div>
          <p className="hx-mission">Our mission: ending social isolation, one event at a time.</p>
        </div>
      </section>

      {/* 7. REVIEWS */}
      <HomeReviews />

      {/* 8. FOR BRANDS AND COMPANIES */}
      <section className="hx-biz" aria-labelledby="hx-biz-title">
        <div className="hx-wrap">
          <p className="hx-eyebrow hx-eyebrow-light">For brands, companies and communities</p>
          <h2 id="hx-biz-title" className="playfair hx-h2 hx-light">The room Atlanta's grown folks show up for.</h2>
          <p className="hx-sub hx-light-sub">
            Our guests are grown, local and present: phones down, talking, and in the mood to try something new.
            That's a rare room, and it's open to the right partners.
          </p>
          <div className="hx-biz-grid">
            <Link to="/partnerships" className="hx-biz-card">
              <span className="hx-biz-kicker">Brands and sponsors</span>
              <span className="playfair hx-biz-title">Put your brand in the room.</span>
              <span className="hx-biz-body">Sponsor a night, put your product in guests' hands, and get named from the stage. Packages built around real experiences, not banner ads.</span>
              <span className="hx-biz-cta">Partner with us →</span>
            </Link>
            <Link to="/host" className="hx-biz-card">
              <span className="hx-biz-kicker">Companies and apartment communities</span>
              <span className="playfair hx-biz-title">We'll host it for you.</span>
              <span className="hx-biz-body">Team nights, holiday parties and resident events your people actually want to attend. We plan it, run it and take it off your plate.</span>
              <span className="hx-biz-cta">Book a hosted night →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOUNDER NOTE */}
      <section className="host-note-visual" aria-label="A note from our Chief Playmaker">
        <div className="host-overlay-container">
          <blockquote className="host-quote">
            <p>
              "I believe the best life strategies start with a genuine human
              connection. Let's stop the scroll and start the conversation."
            </p>
            <cite className="signature">Vaughn, Chief Playmaker</cite>
          </blockquote>
          <Link to="/events" className="btn-gold-outline-white">Find your night</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

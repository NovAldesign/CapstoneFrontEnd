// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Helmet } from 'react-helmet-async';
 
// import '../Styles/About.css';
 
// const About = () => {
//   return (
//     <div className="about-page">
 
//       {/* ─── ADA FIX #1: Skip Navigation Link ───────────────────────────────
//           WCAG 2.4.1 – Bypass Blocks (Level A)
//           Screen-reader & keyboard users must be able to skip repeated nav.
//           Add matching CSS: .skip-link { position:absolute; top:-100%; left:0; }
//                             .skip-link:focus { top:0; z-index:9999; } */}
//       <a href="#main-content" className="skip-link">
//         Skip to main content
//       </a>
 
//       {/* Meta Data for SEO */}
//       <Helmet>
//         <title>About Us | Grown Folks Collective</title>
//         {/* ─── ADA FIX #2: Language attribute ──────────────────────────────
//             WCAG 3.1.1 – Language of Page (Level A)
//             Set lang on <html> in your index.html / root: <html lang="en">
//             Noted here as a reminder — can't set it in Helmet on some setups. */}
//         <meta
//           name="description"
//           content="Discover the story of Grown Folks Collective. Built in Atlanta for accomplished individuals, we provide a third space to end social isolation and find joy through genuine, alcohol-free connection."
//         />
//       </Helmet>
 
//       {/* HERO */}
//       {/* ─── ADA FIX #3: <header> landmark is correct here, but it must wrap  
//           a <main> landmark below for proper document structure.             */}
//       <header className="about-hero" role="banner">
//         <div className="about-hero-inner">
//           {/* ─── ADA FIX #4: Decorative spans should not be in headings ───
//               The eyebrow text is fine as-is but needs visible focus styles
//               on any interactive children (none here — OK).                 */}
//           <span className="about-eyebrow" aria-label="Established January 2026 in Atlanta, Georgia">
//             Est. January 2026 · Atlanta, GA
//           </span>
//           <h1 className="playfair about-hero-title">
//             {/* ─── ADA FIX #5: <br> in headings is fine for visual layout,
//                 but add aria-label if the line break changes meaning.       */}
//             Built for the Room That Didn't Exist Yet.
//           </h1>
//           {/* ─── ADA FIX #6: Decorative dividers must be hidden from AT ──
//               WCAG 1.3.1 – Info and Relationships (Level A)                */}
//           <div className="about-gold-spacer" aria-hidden="true"></div>
//           <p className="about-hero-subhead">
//             GFC exists because Atlanta's accomplished professionals, entreprenuers, & executives deserved better
//             than a bar and more than an empty apartment on a Saturday night.
//           </p>
//         </div>
//       </header>
 
//       {/* ─── ADA FIX #7: Wrap all page content in <main> ─────────────────
//           WCAG 1.3.6 / 2.4.1 – Landmark regions (Level AA)
//           Screen readers navigate by landmarks; <main> is required.        */}
//       <main id="main-content">
 
//         {/* THE STORY */}
//         <section className="about-story-section" aria-labelledby="story-heading">
//           <div className="about-story-grid">
//             <div className="about-story-image-col">
//               <div className="about-story-img-wrapper">
//                 {/* ─── ADA FIX #8: Meaningful alt text ───────────────────
//                     WCAG 1.1.1 – Non-text Content (Level A)
//                     Previous alt was generic. Describe what's actually in  
//                     the image so screen-reader users get equivalent info.   
//                     Also: the URL had a malformed query string               
//                     (...899.png?resize=...ssl=1auto=format...) — fixed below */}
//                 <img
//                   src="https://i0.wp.com/www.reemployability.com/wp-content/uploads/2023/04/Untitled-design-2023-04-13T151843.899.png?resize=1080%2C675&ssl=1&auto=format&fit=crop&q=80&w=800"
//                   alt="A group of professionals gathered around a table engaged in lively conversation at a Grown Folks Collective event"
//                   className="about-story-img"
//                   /* ─── ADA FIX #9: Add width/height to prevent layout shift (CLS) */
//                   width="800"
//                   height="500"
//                   loading="lazy"
//                 />
//                 {/* Decorative corner element — hidden from assistive tech */}
//                 <div className="about-img-gold-corner" aria-hidden="true"></div>
//               </div>
//             </div>
 
//             <div className="about-story-text-col">
//               {/* ─── ADA FIX #10: Section labels used as visual headings ──
//                   WCAG 1.3.1 – These decorative labels are fine as <span>,
//                   but the actual heading needs an id so aria-labelledby works */}
//               <span className="about-section-label" aria-hidden="true">The Story</span>
//               <h2 className="playfair about-section-heading" id="story-heading">
//                 Why We Started
//               </h2>
//               {/* Decorative rule — hidden from AT */}
//               <div className="about-gold-rule" aria-hidden="true"></div>
 
//               <p className="about-body-large">
//                 There's a specific kind of loneliness that belongs to successful people. You've built the career. You've built the life. But somewhere along the way, the friendships got harder to maintain and the social calendar got thinner.
//               </p>
//               <p className="about-body">
//                 The options that used to work — the bars, the lounges, the loud rooms full of strangers — stopped feeling right.
//               </p>
//               <p className="about-body">
//                 Grown Folks Collective was founded in Atlanta in January 2026 to fill that gap.
//               </p>
//               <p className="about-body">
//                 We didn't start with a business plan. We started with a game night in a small Decatur restaurant and 36 people who showed up because they were tired of sitting at home. It sold out. Then we did it again. Sold out again.
//               </p>
//               <p className="about-body">
//                 In under 90 days, we built a community of over 1200 people — with zero advertising, zero paid promotion, and zero compromise on our values. Our guests drive from Monroe, Smyrna, Fayetteville, Lawrenceville, and Douglasville to be in our room on a Saturday night. Not because there's nothing else to do. Because this is the only room built for them.
//               </p>
//             </div>
//           </div>
//         </section>
 
//         {/* BY THE NUMBERS */}
//         {/* ─── ADA FIX #11: Section needs aria-labelledby for landmark nav */}
//         <section className="about-stats-section" aria-labelledby="stats-heading">
//           <div className="about-stats-inner">
//             <span className="about-eyebrow-light" aria-hidden="true">By The Numbers</span>
//             <h2 className="playfair about-stats-heading" id="stats-heading">
//               Built in Under 90 Days.
//             </h2>
//             <p className="about-stats-subhead">No ad spend. No paid promotions. Just showing up.</p>
 
//             {/* ─── ADA FIX #12: Stat cards need semantic meaning for AT ───
//                 WCAG 1.3.1 – Each stat must be readable as a unit.
//                 Use <dl> (description list) for key-value stat pairs so
//                 screen readers announce "4: Events Hosted, Since January 2025" */}
//             <dl className="about-stats-grid">
//               <div className="about-stat" role="group" aria-label="Events Hosted">
//                 <dt className="about-stat-number">4</dt>
//                 <dd className="about-stat-label">Events Hosted</dd>
//                 <dd className="about-stat-desc">Since January 2026</dd>
//               </div>
//               <div className="about-stat" role="group" aria-label="Sold Out Events">
//                 <dt className="about-stat-number">3</dt>
//                 <dd className="about-stat-label">Sold Out</dd>
//                 <dd className="about-stat-desc">Of our first five events</dd>
//               </div>
//               <div className="about-stat" role="group" aria-label="Venue Sales Lift">
//                 <dt className="about-stat-number">250%+</dt>
//                 <dd className="about-stat-label">Venue Sales Lift</dd>
//                 <dd className="about-stat-desc">Documented every event night</dd>
//               </div>
//               <div className="about-stat" role="group" aria-label="Community Members">
//                 <dt className="about-stat-number">1200+</dt>
//                 <dd className="about-stat-label">Community Members</dd>
//                 <dd className="about-stat-desc">Across all platforms</dd>
//               </div>
//             </dl>
 
//             {/* Platform stats — also use <dl> for semantic key-value pairs */}
//             <dl className="about-platform-row">
//               <div className="about-platform">
//                 <dt className="about-platform-num">885+</dt>
//                 <dd className="about-platform-name">TikTok Followers</dd>
//               </div>
//               {/* Decorative dividers must be hidden from AT */}
//               <div className="about-platform-divider" aria-hidden="true"></div>
//               <div className="about-platform">
//                 <dt className="about-platform-num">100+</dt>
//                 <dd className="about-platform-name">Meetup Members</dd>
//               </div>
//               <div className="about-platform-divider" aria-hidden="true"></div>
//               <div className="about-platform">
//                 <dt className="about-platform-num">100</dt>
//                 <dd className="about-platform-name">Email Subscribers</dd>
//               </div>
//               <div className="about-platform-divider" aria-hidden="true"></div>
//               <div className="about-platform">
//                 <dt className="about-platform-num">35</dt>
//                 <dd className="about-platform-name">Guests Per Event — Always</dd>
//               </div>
//             </dl>
//           </div>
//         </section>
 
//         {/* OUR VALUES */}
//         <section className="about-values-section" aria-labelledby="values-heading">
//           <div className="about-values-inner">
//             <span className="about-section-label" aria-hidden="true">What We Stand For</span>
//             <h2 className="playfair about-section-heading centered" id="values-heading">
//               Our Values
//             </h2>
//             <div className="about-gold-rule centered" aria-hidden="true"></div>
 
//             {/* ─── ADA FIX #13: Value cards — numbers are decorative ───────
//                 WCAG 1.3.1 – "01", "02" etc. are purely visual numbering.
//                 Hide them from AT so screen readers don't say "zero one Intentionality" */}
//             <div className="about-values-grid">
//               <article className="about-value-card">
//                 <div className="about-value-number" aria-hidden="true">01</div>
//                 <h3 className="about-value-title">Intentionality</h3>
//                 <p className="about-value-body">
//                   Every event is curated. Every guest is considered. We cap attendance at 35 people not because we can't grow, but because intimacy is the point.
//                 </p>
//               </article>
//               <article className="about-value-card">
//                 <div className="about-value-number" aria-hidden="true">02</div>
//                 <h3 className="about-value-title">Sobriety</h3>
//                 <p className="about-value-body">
//                   Every GFC event is fully alcohol-free and tobacco-free. We believe the best version of you shows up when you're clear-headed, present, and genuinely yourself.
//                 </p>
//               </article>
//               <article className="about-value-card">
//                 <div className="about-value-number" aria-hidden="true">03</div>
//                 <h3 className="about-value-title">Excellence</h3>
//                 <p className="about-value-body">
//                   We are not a meetup. We are not a mixer. We are a premium experience for adults who have earned the right to expect more — and we deliver it every time.
//                 </p>
//               </article>
//               <article className="about-value-card">
//                 <div className="about-value-number" aria-hidden="true">04</div>
//                 <h3 className="about-value-title">Community</h3>
//                 <p className="about-value-body">
//                   We are building something that outlasts any single event. GFC is a network of accomplished Atlanta professionals who choose each other — and keep choosing each other.
//                 </p>
//               </article>
//             </div>
//           </div>
//         </section>
 
//         {/* WHO WE SERVE */}
//         <section className="about-who-section" aria-labelledby="who-heading">
//           <div className="about-who-grid">
//             <div className="about-who-text">
//               <span className="about-section-label" aria-hidden="true">Who We Serve</span>
//               <h2 className="playfair about-section-heading" id="who-heading">
//                 You Belong Here If...
//               </h2>
//               <div className="about-gold-rule" aria-hidden="true"></div>
 
//               {/* ─── ADA FIX #14: List items are correct HTML ───────────────
//                   WCAG 1.3.1 – <ul>/<li> is the right pattern here. Good.
//                   Just ensure CSS doesn't remove list markers without also
//                   adding role="list" (Safari VoiceOver bug fix):            */}
//               <ul className="about-who-list" role="list">
//                 <li>You're 35 or older</li>
//                 <li>You're an entrepreneur, executive, or professional</li>
//                 <li>You earn $80K or more and you've outgrown the nightlife scene</li>
//                 <li>You want to meet people who match your energy — not just your zip code</li>
//                 <li>You're done sitting at home on Saturday nights</li>
//               </ul>
 
//               {/* ─── ADA FIX #15: CTA Link needs descriptive accessible name ─
//                   WCAG 2.4.6 – Headings and Labels / 4.1.2 – Name, Role, Value
//                   "Join the Collective" is already descriptive — good!
//                   Ensure it has a visible :focus style in CSS.              */}
//               <Link to="/membership" className="about-cta-btn">
//                 Join the Collective
//               </Link>
//             </div>
 
//             <div className="about-who-image">
//               {/* ─── ADA FIX #16: Meaningful alt text for second image ──────
//                   Previous alt "GFC community members" is too vague.        */}
//               <img
//                 src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800"
//                 alt="Smiling professionals enjoying conversation at a Grown Folks Collective gathering"
//                 className="about-who-img"
//                 width="800"
//                 height="600"
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </section>
 
//         {/* FOUNDER NOTE */}
//         <section className="about-founder-section" aria-labelledby="founder-heading">
//           <div className="about-founder-inner">
//             <div className="about-founder-content">
//               {/* ─── ADA FIX #17: Section eyebrow as hidden visual label ────
//                   The <span> is decorative context — hide from AT since
//                   the <blockquote> cite will provide attribution.           */}
//               <span className="about-eyebrow-light" aria-hidden="true">
//                 A Word From Our Founder
//               </span>
 
//               {/* ─── ADA FIX #18: blockquote must have a <cite> element ─────
//                   WCAG 1.3.1 – <blockquote> without attribution is incomplete.
//                   Add <cite> inside or use aria-label on the section.       */}
//               <h2 className="sr-only" id="founder-heading">A Word From Our Founder</h2>
//               <figure>
//                 <blockquote className="about-founder-quote">
//                   <p>
//                     "I believe the best life strategies start with a genuine human connection.
//                     Let's stop the scroll and start the conversation."
//                   </p>
//                 </blockquote>
//                 <figcaption className="about-founder-sig">
//                   {/* ─── ADA FIX #19: <cite> wraps the source name ──────────
//                       This makes the attribution semantically correct.      */}
//                   <cite>
//                     <span className="about-founder-name">Vaughn</span>
//                     <span className="about-founder-title">Founder, Grown Folks Collective</span>
//                   </cite>
//                 </figcaption>
//               </figure>
//             </div>
//           </div>
//         </section>
 
//         {/* BOTTOM CTA */}
//         <section className="about-bottom-cta" aria-labelledby="cta-heading">
//           <div className="about-bottom-cta-inner">
//             <h2 className="playfair about-bottom-heading" id="cta-heading">
//               This Is Your Seat at the Table.
//             </h2>
//             <p className="about-bottom-body">
//               Join the collective that's building real community in Atlanta — one intentional Saturday night at a time.
//             </p>
//             <div className="about-cta-row">
//               {/* ─── ADA FIX #20: Buttons need focus styles & descriptive text
//                   Both links are already descriptive — good!
//                   Ensure .about-btn-primary:focus and :focus-visible are
//                   styled in your CSS (see CSS additions below).             */}
//               <Link to="/events" className="about-btn-primary">
//                 View Upcoming Events
//               </Link>
//               <Link to="/membership" className="about-btn-secondary">
//                 Become a Member
//               </Link>
//             </div>
//           </div>
//         </section>
 
//       </main>{/* end #main-content */}
//     </div>
//   );
// };
 
// export default About;

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
 
import '../Styles/About.css';
 
const About = () => {
  return (
    <div className="about-page">
 
      {/* ─── ADA FIX #1: Skip Navigation Link ───────────────────────────────
          WCAG 2.4.1 – Bypass Blocks (Level A)
          Screen-reader & keyboard users must be able to skip repeated nav.
          Add matching CSS: .skip-link { position:absolute; top:-100%; left:0; }
                            .skip-link:focus { top:0; z-index:9999; } */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
 
      {/* Meta Data for SEO */}
      <Helmet>
        <title>About Us | Grown Folks Collective</title>
        {/* ─── ADA FIX #2: Language attribute ──────────────────────────────
            WCAG 3.1.1 – Language of Page (Level A)
            Set lang on <html> in your index.html / root: <html lang="en">
            Noted here as a reminder — can't set it in Helmet on some setups. */}
        <meta
          name="description"
          content="Discover the story of Grown Folks Collective. Built in Atlanta for accomplished individuals, we provide a third space to end social isolation and find joy through genuine, alcohol-free connection."
        />
      </Helmet>
 
      {/* HERO */}
      {/* ─── ADA FIX #3: <header> landmark is correct here, but it must wrap  
          a <main> landmark below for proper document structure.             */}
      <header className="about-hero" role="banner">
        <div className="about-hero-inner">
          {/* ─── ADA FIX #4: Decorative spans should not be in headings ───
              The eyebrow text is fine as-is but needs visible focus styles
              on any interactive children (none here — OK).                 */}
          <span className="about-eyebrow" aria-label="Established January 2026 in Atlanta, Georgia">
            Est. January 2026 · Atlanta, GA
          </span>
          <h1 className="playfair about-hero-title">
            {/* ─── ADA FIX #5: <br> in headings is fine for visual layout,
                but add aria-label if the line break changes meaning.       */}
            Built for the Room That Didn't Exist Yet.
          </h1>
          {/* ─── ADA FIX #6: Decorative dividers must be hidden from AT ──
              WCAG 1.3.1 – Info and Relationships (Level A)                */}
          <div className="about-gold-spacer" aria-hidden="true"></div>
          <p className="about-hero-subhead">
            GFC exists because Atlanta's accomplished professionals, entrepreneurs, & executives deserved better
            than a bar and more than an empty apartment on a Saturday night.
          </p>
        </div>
      </header>
 
      {/* ─── ADA FIX #7: Wrap all page content in <main> ─────────────────
          WCAG 1.3.6 / 2.4.1 – Landmark regions (Level AA)
          Screen readers navigate by landmarks; <main> is required.        */}
      <main id="main-content">
 
        {/* THE STORY */}
        <section className="about-story-section" aria-labelledby="story-heading">
          <div className="about-story-grid">
            <div className="about-story-image-col">
              <div className="about-story-img-wrapper">
                {/* ─── ADA FIX #8: Meaningful alt text ───────────────────
                    WCAG 1.1.1 – Non-text Content (Level A)
                    Previous alt was generic. Describe what's actually in  
                    the image so screen-reader users get equivalent info.   
                    Also: the URL had a malformed query string               
                    (...899.png?resize=...ssl=1auto=format...) — fixed below */}
                <img
                  src="https://i0.wp.com/www.reemployability.com/wp-content/uploads/2023/04/Untitled-design-2023-04-13T151843.899.png?resize=1080%2C675&ssl=1&auto=format&fit=crop&q=80&w=800"
                  alt="A group of professionals gathered around a table engaged in lively conversation at a Grown Folks Collective event"
                  className="about-story-img"
                  /* ─── ADA FIX #9: Add width/height to prevent layout shift (CLS) */
                  width="800"
                  height="500"
                  loading="lazy"
                />
                {/* Decorative corner element — hidden from assistive tech */}
                <div className="about-img-gold-corner" aria-hidden="true"></div>
              </div>
            </div>
 
            <div className="about-story-text-col">
              {/* ─── ADA FIX #10: Section labels used as visual headings ──
                  WCAG 1.3.1 – These decorative labels are fine as <span>,
                  but the actual heading needs an id so aria-labelledby works */}
              <span className="about-section-label" aria-hidden="true">The Story</span>
              <h2 className="playfair about-section-heading" id="story-heading">
                Why We Started
              </h2>
              {/* Decorative rule — hidden from AT */}
              <div className="about-gold-rule" aria-hidden="true"></div>
 
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
                Through word of mouth and absolute necessity, we built a community of over 1,500 people — with zero advertising, zero paid promotion, and zero compromise on our values. Our guests drive from Monroe, Smyrna, Fayetteville, Lawrenceville, and Douglasville to be in our room on a Saturday night. Not because there's nothing else to do. Because this is the only room built for them.
              </p>
            </div>
          </div>
        </section>
 
        {/* BY THE NUMBERS */}
        {/* ─── ADA FIX #11: Section needs aria-labelledby for landmark nav */}
        <section className="about-stats-section" aria-labelledby="stats-heading">
          <div className="about-stats-inner">
            <span className="about-eyebrow-light" aria-hidden="true">By The Numbers</span>
            <h2 className="playfair about-stats-heading" id="stats-heading">
              Zero ad spend. No paid promotions. Just pure organic connection.
            </h2>
 
            {/* ─── ADA FIX #12: Stat cards need semantic meaning for AT ───
                WCAG 1.3.1 – Each stat must be readable as a unit.
                Use <dl> (description list) for key-value stat pairs so
                screen readers announce stats cohesively */}
            <dl className="about-stats-grid">
              <div className="about-stat" role="group" aria-label="Events Hosted">
                <dt className="about-stat-number">7</dt>
                <dd className="about-stat-label">Events Hosted</dd>
                <dd className="about-stat-desc">Since January 2026</dd>
              </div>
              <div className="about-stat" role="group" aria-label="Sold Out Events">
                <dt className="about-stat-number">3</dt>
                <dd className="about-stat-label">Sold-Out Events</dd>
                <dd className="about-stat-desc">Highly Demanded</dd>
              </div>
              <div className="about-stat" role="group" aria-label="Venue Sales Lift">
                <dt className="about-stat-number">250%+</dt>
                <dd className="about-stat-label">Venue Sales Lift</dd>
                <dd className="about-stat-desc">Documented every event night</dd>
              </div>
              <div className="about-stat" role="group" aria-label="Community Members">
                <dt className="about-stat-number">1,500+</dt>
                <dd className="about-stat-label">Community Members</dd>
                <dd className="about-stat-desc">Across all platforms</dd>
              </div>
            </dl>
 
            {/* Platform stats — also use <dl> for semantic key-value pairs */}
            <dl className="about-platform-row">
              <div className="about-platform">
                <dt className="about-platform-num">1,260+</dt>
                <dd className="about-platform-name">TikTok Followers</dd>
              </div>
              {/* Decorative dividers must be hidden from AT */}
              <div className="about-platform-divider" aria-hidden="true"></div>
              <div className="about-platform">
                <dt className="about-platform-num">100+</dt>
                <dd className="about-platform-name">Meetup Members</dd>
              </div>
              <div className="about-platform-divider" aria-hidden="true"></div>
              <div className="about-platform">
                <dt className="about-platform-num">150</dt>
                <dd className="about-platform-name">Email Subscribers</dd>
              </div>
              <div className="about-platform-divider" aria-hidden="true"></div>
              <div className="about-platform">
                <dt className="about-platform-num">35–40</dt>
                <dd className="about-platform-name">Guests Per Event</dd>
              </div>
            </dl>
          </div>
        </section>
 
        {/* OUR VALUES */}
        <section className="about-values-section" aria-labelledby="values-heading">
          <div className="about-values-inner">
            <span className="about-section-label" aria-hidden="true">What We Stand For</span>
            <h2 className="playfair about-section-heading centered" id="values-heading">
              Our Values
            </h2>
            <div className="about-gold-rule centered" aria-hidden="true"></div>
 
            {/* ─── ADA FIX #13: Value cards — numbers are decorative ───────
                WCAG 1.3.1 – "01", "02" etc. are purely visual numbering.
                Hide them from AT so screen readers don't say "zero one Intentionality" */}
            <div className="about-values-grid">
              <article className="about-value-card">
                <div className="about-value-number" aria-hidden="true">01</div>
                <h3 className="about-value-title">Intentionality</h3>
                <p className="about-value-body">
                  Every event is curated. Every guest is considered. We cap attendance at 35 to 40 people not because we can't grow, but because intimacy is the point.
                </p>
              </article>
              <article className="about-value-card">
                <div className="about-value-number" aria-hidden="true">02</div>
                <h3 className="about-value-title">Sobriety</h3>
                <p className="about-value-body">
                  Every GFC event is fully alcohol-free and tobacco-free. We believe the best version of you shows up when you're clear-headed, present, and genuinely yourself.
                </p>
              </article>
              <article className="about-value-card">
                <div className="about-value-number" aria-hidden="true">03</div>
                <h3 className="about-value-title">Excellence</h3>
                <p className="about-value-body">
                  We are not a meetup. We are not a mixer. We are a premium experience for adults who have earned the right to expect more — and we deliver it every time.
                </p>
              </article>
              <article className="about-value-card">
                <div className="about-value-number" aria-hidden="true">04</div>
                <h3 className="about-value-title">Community</h3>
                <p className="about-value-body">
                  We are building something that outlasts any single event. GFC is a network of accomplished Atlanta professionals who choose each other — and keep choosing each other.
                </p>
              </article>
            </div>
          </div>
        </section>
 
        {/* WHO WE SERVE */}
        <section className="about-who-section" aria-labelledby="who-heading">
          <div className="about-who-grid">
            <div className="about-who-text">
              <span className="about-section-label" aria-hidden="true">Who We Serve</span>
              <h2 className="playfair about-section-heading" id="who-heading">
                You Belong Here If...
              </h2>
              <div className="about-gold-rule" aria-hidden="true"></div>
 
              {/* ─── ADA FIX #14: List items are correct HTML ───────────────
                  WCAG 1.3.1 – <ul>/<li> is the right pattern here. Good.
                  Just ensure CSS doesn't remove list markers without also
                  adding role="list" (Safari VoiceOver bug fix):            */}
              <ul className="about-who-list" role="list">
                <li>You're 35 or older</li>
                <li>You're an entrepreneur, executive, or professional</li>
                <li>You earn $80K or more and you've outgrown the nightlife scene</li>
                <li>You want to meet people who match your energy — not just your zip code</li>
                <li>You're done sitting at home on Saturday nights</li>
              </ul>
 
              {/* ─── ADA FIX #15: CTA Link needs descriptive accessible name ─
                  WCAG 2.4.6 – Headings and Labels / 4.1.2 – Name, Role, Value
                  "Join the Collective" is already descriptive — good!
                  Ensure it has a visible :focus style in CSS.              */}
              <Link to="/membership" className="about-cta-btn">
                Join the Collective
              </Link>
            </div>
 
            <div className="about-who-image">
              {/* ─── ADA FIX #16: Meaningful alt text for second image ──────
                  Previous alt "GFC community members" is too vague.        */}
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800"
                alt="Smiling professionals enjoying conversation at a Grown Folks Collective gathering"
                className="about-who-img"
                width="800"
                height="600"
                loading="lazy"
              />
            </div>
          </div>
        </section>
 
        {/* FOUNDER NOTE */}
        <section className="about-founder-section" aria-labelledby="founder-heading">
          <div className="about-founder-inner">
            <div className="about-founder-content">
              {/* ─── ADA FIX #17: Section eyebrow as hidden visual label ────
                  The <span> is decorative context — hide from AT since
                  the <blockquote> cite will provide attribution.           */}
              <span className="about-eyebrow-light" aria-hidden="true">
                A Word From Our Founder
              </span>
 
              {/* ─── ADA FIX #18: blockquote must have a <cite> element ─────
                  WCAG 1.3.1 – <blockquote> without attribution is incomplete.
                  Add <cite> inside or use aria-label on the section.       */}
              <h2 className="sr-only" id="founder-heading">A Word From Our Founder</h2>
              <figure>
                <blockquote className="about-founder-quote">
                  <p>
                    "I believe the best life strategies start with a genuine human connection.
                    Let's stop the scroll and start the conversation."
                  </p>
                </blockquote>
                <figcaption className="about-founder-sig">
                  {/* ─── ADA FIX #19: <cite> wraps the source name ──────────
                      This makes the attribution semantically correct.      */}
                  <cite>
                    <span className="about-founder-name">Vaughn</span>
                    <span className="about-founder-title">Founder, Grown Folks Collective</span>
                  </cite>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
 
        {/* BOTTOM CTA */}
        <section className="about-bottom-cta" aria-labelledby="cta-heading">
          <div className="about-bottom-cta-inner">
            <h2 className="playfair about-bottom-heading" id="cta-heading">
              This Is Your Seat at the Table.
            </h2>
            <p className="about-bottom-body">
              Join the collective that's building real community in Atlanta — one intentional Saturday night at a time.
            </p>
            <div className="about-cta-row">
              {/* ─── ADA FIX #20: Buttons need focus styles & descriptive text
                  Both links are already descriptive — good!
                  Ensure .about-btn-primary:focus and :focus-visible are
                  styled in your CSS (see CSS additions below).             */}
              <Link to="/events" className="about-btn-primary">
                View Upcoming Events
              </Link>
              <Link to="/membership" className="about-btn-secondary">
                Become a Member
              </Link>
            </div>
          </div>
        </section>
 
      </main>{/* end #main-content */}
    </div>
  );
};
 
export default About;
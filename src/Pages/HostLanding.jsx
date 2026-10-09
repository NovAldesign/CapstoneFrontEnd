import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PACKAGES, WEEKEND_EXTRA, perGuest } from '../content/hostingPackages';
import '../Styles/Contact.css';
import '../Styles/GroupBooking.css';
import '../Styles/Host.css';

// ── Search landing pages for Play. Sip. Toast. ──
// Each page targets one thing companies search for. Packages and prices come
// from content/hostingPackages.js, so they always match /host.
const SITE = 'https://www.grownfolkscollective.com';
const PHONE = '470-256-7729';
const PHONE_LINK = 'tel:+14702567729';

const PAGES = {
  teamBuilding: {
    path: '/corporate-team-building-atlanta',
    src: 'seo-teambuilding',
    title: 'Alcohol-Free Corporate Team Building in Atlanta | Grown Folks™ Collective',
    description:
      'Hosted, alcohol-free team building in Atlanta: Spades tournaments, game nights, Karaoke Bingo and a live-action mystery, with a signature mocktail bar and a toast to your team. We come to you.',
    eyebrow: 'Corporate Team Building · Atlanta',
    h1: 'Alcohol-Free Team Building in Atlanta',
    lead:
      "Hosted game nights, Spades tournaments, Karaoke Bingo and a live-action mystery for your team, with a signature mocktail bar and a toast to your team's wins. Everyone's included, and nobody has to drink to have fun.",
    whyTitle: 'Why teams choose Grown Folks™ Collective',
    why: [
      ['Everyone plays', 'Games built so the quiet folks and the loud folks end up on the same team.'],
      ['Real connection', 'We mix departments on purpose. Coworkers leave knowing each other by name.'],
      ['No alcohol, no liability', 'A signature mocktail bar instead of an open bar. Safer, cheaper and inclusive.'],
      ['Wins worth toasting', "We collect your team's wins ahead of time and raise a glass to them live."],
    ],
    bestFor: [
      'New team onboarding',
      'Quarterly offsites and department socials',
      'Client appreciation nights',
      'ERG and culture events',
      'Office holiday parties',
    ],
    faq: [
      ['How many people can you host?', 'Packages cover up to 32–60 guests depending on the game. Bigger group? Add guests in blocks of 20, or ask us about running two games side by side.'],
      ['Where does the event happen?', 'At your office, a clubhouse or a venue you choose anywhere in metro Atlanta. Travel is included within 25 miles of East Atlanta, with a small travel fee beyond that.'],
      ['Is any alcohol served?', 'No. Every event includes a signature mocktail bar, with one drink named after your company. You can add a sparkling Töst toast for $8 per guest.'],
      ['How far ahead should we book?', 'Two to three weeks is ideal. Weekday dates (Monday to Thursday) have the most availability and the best rate.'],
      ['Can we make it a recurring program?', 'Yes. Our Community Series runs monthly, biweekly or weekly, and saves 10–20% per event with a 3-month minimum.'],
    ],
  },

  holiday: {
    path: '/office-holiday-party-atlanta',
    src: 'seo-holiday',
    title: 'Office Holiday Party Ideas in Atlanta: Hosted & Alcohol-Free | Grown Folks™ Collective',
    description:
      'Plan an office holiday party in Atlanta everyone will enjoy: hosted Spades, Karaoke Bingo, game nights or a live-action mystery, with a holiday mocktail bar and a toast to your team’s year.',
    eyebrow: 'Office Holiday Parties · Atlanta',
    h1: 'An Office Holiday Party Everyone Will Actually Enjoy',
    lead:
      "Skip the open bar. Book a hosted, alcohol-free holiday party with games, a signature holiday mocktail and a toast to your team's year. We bring everything and run the whole night.",
    holiday: true,
    ideasTitle: '5 holiday party ideas your team will talk about',
    ideas: [
      ['Holiday Spades Tournament', 'Brackets, trash talk and a trophy for the winning pair. Perfect for competitive teams.'],
      ['Holiday Karaoke Bingo', 'Holiday hits and throwbacks on the bingo cards. Sing it, mark it, win it.'],
      ['The Case of the Missing Toast', 'A live-action mystery: someone stole the holiday toast, and your team has to solve it before the reveal.'],
      ['Game Night with a gift round', 'Spades, dominoes and Uno, plus a gift-swap round between hands.'],
      ['The Year-in-Wins Toast', 'Every package ends here: we raise a glass to the wins your team shared ahead of time.'],
    ],
    whyTitle: 'Why go alcohol-free this year',
    why: [
      ['Nobody gets left out', 'Non-drinkers, sober-curious, expecting and early-morning folks enjoy it as much as everyone else.'],
      ['No liability, no awkward stories', 'Everyone gets home safe, and everyone remembers the night.'],
      ['It costs less', 'A mocktail bar is included. No open-bar tab at the end of the night.'],
      ['Gifts handled', 'Add GFC merch gifts from $10 per guest, like mugs, socks and tumblers.'],
    ],
    faq: [
      ['When should we book?', 'Now. December weekdays fill first. Book a December date by Oct 31 and save $150.'],
      ['Can you host at our office?', 'Yes. We set up in your office, a clubhouse or a venue you choose anywhere in metro Atlanta.'],
      ['How long is the party?', 'Two hours (2.5 for the mystery), and you can add extra hours.'],
      ['Do you bring the drinks?', 'Yes. A signature holiday mocktail bar is included, and you can upgrade to a sparkling Töst toast.'],
      ['Can we add employee gifts?', 'Yes. GFC merch gifts start at $10 per guest and can be ready for the party.'],
    ],
  },
};

const money = (n) => `$${n.toLocaleString('en-US')}`;

const HostLanding = ({ page }) => {
  const p = PAGES[page];
  const bookLink = `/host?type=corporate&src=${p.src}`;
  const showHolidayDeal = new Date() <= new Date('2026-10-31T23:59:59-04:00');

  // Lets Google show the questions and answers right in search results
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.h1,
    serviceType: page === 'holiday' ? 'Office holiday party' : 'Corporate team building',
    areaServed: { '@type': 'City', name: 'Atlanta, GA' },
    provider: {
      '@type': 'LocalBusiness',
      name: 'Grown Folks Collective',
      url: SITE,
      telephone: '+1-470-256-7729',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '8735 Dunwoody Place, Suite R',
        addressLocality: 'Atlanta',
        addressRegion: 'GA',
        postalCode: '30350',
        addressCountry: 'US',
      },
    },
    offers: PACKAGES.map((pkg) => ({
      '@type': 'Offer',
      name: pkg.name,
      price: pkg.corporate,
      priceCurrency: 'USD',
    })),
  };

  return (
    <div className="contact-page group-page host-page">
      <Helmet>
        <title>{p.title}</title>
        <meta name="description" content={p.description} />
        <link rel="canonical" href={`${SITE}${p.path}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      {/* ── HERO ── */}
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-left">
            <span className="contact-eyebrow">{p.eyebrow}</span>
            <h1 className="contact-hero-title host-landing-title">{p.h1}</h1>
            <div className="contact-gold-spacer" aria-hidden="true"></div>
            <p className="contact-hero-lead">{p.lead}</p>
            <div className="host-hero-actions">
              <Link to={bookLink} className="contact-submit-btn host-btn">See Packages &amp; Book</Link>
              <a href={PHONE_LINK} className="host-link">Call or text {PHONE}</a>
            </div>
          </div>

          <div className="group-perks">
            <p className="contact-info-label">Play. Sip. Toast.™ includes</p>
            <ul className="group-perks-list">
              <li>A hosted game, start to finish</li>
              <li>Signature mocktail bar, one drink named after your company</li>
              <li>A live toast to your team's wins</li>
              <li>Setup, breakdown and a branded flyer</li>
              <li>Photos within 48 hours</li>
            </ul>
          </div>
        </div>
      </header>

      {p.holiday && (
        <div className="host-holiday" role="note">
          {showHolidayDeal ? (
            <><strong>Holiday Booking Special:</strong> book a December event by Oct 31 and save $150.</>
          ) : (
            <><strong>December is filling up.</strong> Weekday dates go first, so book early.</>
          )}
        </div>
      )}

      {/* ── IDEAS (holiday page) ── */}
      {p.ideas && (
        <section className="host-section" aria-labelledby="hl-ideas">
          <span className="contact-form-eyebrow">Holiday Party Ideas</span>
          <h2 className="host-h2" id="hl-ideas">{p.ideasTitle}</h2>
          <ol className="host-landing-ideas">
            {p.ideas.map(([name, text]) => (
              <li key={name}>
                <h3>{name}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── WHY ── */}
      <section className={`host-section${p.ideas ? ' host-section-alt' : ''}`} aria-labelledby="hl-why">
        <span className="contact-form-eyebrow">Why Grown Folks™ Collective</span>
        <h2 className="host-h2" id="hl-why">{p.whyTitle}</h2>
        <div className="host-why host-why-4">
          {p.why.map(([title, text]) => (
            <div className="host-why-item" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        {p.bestFor && (
          <p className="host-landing-bestfor">
            <strong>Great for:</strong> {p.bestFor.join(' · ')}
          </p>
        )}
      </section>

      {/* ── PACKAGES ── */}
      <section className={`host-section${p.ideas ? '' : ' host-section-alt'}`} aria-labelledby="hl-packages">
        <span className="contact-form-eyebrow">Packages</span>
        <h2 className="host-h2" id="hl-packages">Corporate packages</h2>
        <div className="host-packages">
          {PACKAGES.map((pkg) => (
            <article className={`host-card${pkg.badge ? ' featured' : ''}`} key={pkg.name}>
              {pkg.badge && <span className="host-card-badge">{pkg.badge}</span>}
              <p className="host-card-eyebrow">Play. Sip. Toast.</p>
              <h3 className="host-card-title">{pkg.short}</h3>
              <p className="host-card-price">
                {money(pkg.corporate)}
                <span> Mon–Thu</span>
              </p>
              <p className="host-card-weekend">{money(pkg.corporate + WEEKEND_EXTRA)} Fri–Sun</p>
              <p className="host-card-guests">
                {pkg.guests}
                <span className="host-card-perguest">from {money(perGuest(pkg.corporate, pkg))}/guest</span>
              </p>
              <p className="host-card-blurb">{pkg.blurb}</p>
              <Link to={bookLink} className="host-card-btn host-card-link">Request this package</Link>
            </article>
          ))}
        </div>
        <p className="host-fine host-landing-fine">
          Serving metro Atlanta. Travel is included within 25 miles of East Atlanta.
          Hosting an apartment community instead? <Link to="/host">See resident pricing</Link>.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="host-section" aria-labelledby="hl-faq">
        <span className="contact-form-eyebrow">Questions</span>
        <h2 className="host-h2" id="hl-faq">Frequently asked questions</h2>
        <div className="host-faq">
          {p.faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="host-section host-section-alt host-landing-cta">
        <h2 className="host-h2">Let's plan something worth toasting.</h2>
        <div className="host-hero-actions host-landing-cta-actions">
          <Link to={bookLink} className="contact-submit-btn host-btn">Book a Call</Link>
          <a href={PHONE_LINK} className="host-link host-link-dark">Call or text {PHONE}</a>
        </div>
      </section>
    </div>
  );
};

export default HostLanding;
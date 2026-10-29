import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../Styles/Partnership.css";
import DonationForm from "../Components/DonationForm.jsx";
import { useSiteStats, plus } from "../Services/siteStats";

// /donate: in-kind donations of products and equipment. GFC is a business, not a
// nonprofit, so donations are not tax-deductible. Donors get their name in the room.
const SITE = "https://www.grownfolkscollective.com";

const FAQ = [
  [
    "Are donations tax-deductible?",
    "No. Grown Folks™ Collective is a business, not a nonprofit, so donations aren't tax-deductible. What you get instead is your name in front of our community: a shout-out at the event, a tag on social media and a mention in our newsletter.",
  ],
  [
    "What kinds of donations do you accept?",
    "Products for gift bags and giveaways, prizes for game nights and Karaoke Bingo, sound and lighting equipment, games, art and coloring supplies, and non-alcoholic drinks.",
  ],
  [
    "Can I choose which event my donation goes to?",
    "Yes. Pick Game Night, Karaoke Bingo, Acoustic & Infused™, Recess Talks™, GFC Select™ or any event on the form.",
  ],
  [
    "How do I get my donation to you?",
    "Drop it off, ship it, or ask us to pick it up in metro Atlanta. Choose what works on the form and we'll confirm the details.",
  ],
  [
    "Can I stay anonymous?",
    "Yes. Just uncheck the recognition box on the form.",
  ],
  [
    "I want more visibility than a shout-out. What are my options?",
    "Sponsor a night. Partnerships start at $150 per event and include your logo on our website, social media shout-outs and newsletter mentions, with bigger packages adding your logo on the flyer, a table at the event and time at the mic.",
  ],
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const Donate = () => {
  const [params] = useSearchParams();
  const stats = useSiteStats();
  const src = params.get("src");

  return (
    <div className="partnership-page">
      <Helmet>
        <title>Donate Products &amp; Prizes to Atlanta Community Events | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Put your business's name in the room with Atlanta adults 30+. Donate gift bag products, game night prizes, sound equipment or non-alcoholic drinks to Grown Folks™ Collective events and get a shout-out at the event, on social media and in our newsletter."
        />
        <link rel="canonical" href={`${SITE}/donate`} />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <header className="partner-hero">
        <div className="mission-narrative">
          <h1 className="location-tag seo-tag-h1">Donate to Atlanta Community Events</h1>
          <p className="playfair luxe-title">
            Put Your Name
            <br />
            in the Room
          </p>
          <div className="gold-spacer-bar"></div>
          <p className="narrative-lead">
            Every gift bag, prize and speaker helps us bring Atlanta's grown folks together, and every one of
            them comes with your name attached.
          </p>
          <p className="narrative-body">
            Grown Folks™ Collective hosts alcohol-free game nights, Karaoke Bingo and live music for a community
            of {plus(stats.communityTotal)} adults 30+ across metro Atlanta. Donate products or equipment and we'll
            thank you where it counts: out loud, in the room, in front of people who love to support local.
          </p>
        </div>
      </header>

      <section className="donate-section" id="donate" aria-labelledby="donate-heading">
        <div className="donate-inner">
          <span className="location-tag">Give to the Collective</span>
          <h2 className="playfair section-title" id="donate-heading">Donate Products or Equipment</h2>
          <div className="donate-cols">
            <div className="donate-card">
              <h3 className="donate-card-title">What we can use</h3>
              <ul>
                <li>Products for gift bags and giveaways</li>
                <li>Prizes for game nights and Karaoke Bingo</li>
                <li>Sound: speakers, mics, a sound board or a karaoke machine</li>
                <li>Lighting and stage decor</li>
                <li>Games: cards, tables and board games</li>
                <li>Art and coloring supplies: easels, canvases, coloring books</li>
                <li>Non-alcoholic drinks</li>
              </ul>
            </div>
            <div className="donate-card donate-card-navy">
              <h3 className="donate-card-title">How we say thank you</h3>
              <ul>
                <li>A shout-out at the event</li>
                <li>A tag on our social media</li>
                <li>A mention in our newsletter</li>
              </ul>
              <p className="donate-card-note">Prefer to stay anonymous? Just uncheck the box on the form.</p>
            </div>
          </div>
          <p className="donate-fine">
            Grown Folks™ Collective is a business, not a nonprofit, so donations aren't tax-deductible.
            Want more visibility? <Link to="/partnerships#levels">Sponsor a night</Link> from $150.
          </p>
          <div className="donate-form-wrap">
            <DonationForm source={src ? `donate?src=${src}` : "donate"} />
          </div>
        </div>
      </section>

      <section className="donate-faq" aria-labelledby="donate-faq-heading">
        <div className="donate-inner">
          <h2 className="playfair section-title" id="donate-faq-heading">Questions</h2>
          {FAQ.map(([q, a]) => (
            <details key={q} className="donate-faq-item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Donate;

import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
import SelectNotify, { useSelectStatus, fmtDoorDate, daysLeft } from "../Components/SelectNotify";
import { GENTLEMEN, LADIES, NIGHT_MEN, NIGHT_WOMEN } from "../Services/selectCopy";
import "../Styles/Select.css";

// /select/gentlemen and /select/ladies: one page per audience
const PAGES = {
  man: {
    slug: "gentlemen",
    title: "GFC Select™ for Gentlemen | Atlanta's Private 30+ Singles Masquerade",
    description:
      "Twenty seats for men. Every woman in the room is 30+, vetted, and there to meet a good man. Private picks, camera-free, confidential. GFC Select™, Atlanta.",
    kicker: "GFC Select™ · For the gentlemen",
    headline: ["20 seats.", "Selected,", "not sold."],
    lead: "A private masquerade night in Atlanta. Twenty women, twenty men, all 30+. No apps, no speed dating, no cameras.",
    hero: "/select-gentlemen-hero.jpg",
    feature: "/select-gentlemen-mask.jpg",
    featureAlt: "A man in a navy suit holding a black and gold masquerade mask",
    numbers: [["20", "Men"], ["20", "Women"], ["30+", "Ages"], ["1", "Night"], ["0", "Cameras"]],
    nightKicker: "The game plan",
    nightTitle: "How the night runs",
    night: NIGHT_MEN,
    answersKicker: "Straight answers",
    answersTitle: "What you're probably wondering",
    answers: GENTLEMEN,
    featureKicker: "Your picks stay private",
    featureTitle: "Nobody ever knows who picked whom.",
    featureText:
      "At the end of the night you privately choose who you'd like to see again. If she chose you too, you'll both hear from us the next morning. If not, nobody knows a thing. No awkward moments, no public rejection.",
    close: "The room doesn't work without you. Twenty seats, filled with the right men.",
    other: { to: "/select/ladies", label: "Looking for the ladies' page?" },
  },
  woman: {
    slug: "ladies",
    title: "GFC Select™ for Ladies | Atlanta's Private 30+ Singles Masquerade",
    description:
      "Every man in the room was chosen. A safe, private masquerade evening for Atlanta singles 30+. Twenty women, twenty men, camera-free and confidential. GFC Select™.",
    kicker: "GFC Select™ · For the ladies",
    headline: ["Every man", "in the room", "was chosen."],
    lead: "A private masquerade evening in Atlanta for singles 30 and over. Twenty women, twenty men, and not a single swipe.",
    hero: "/select-ladies-hero.jpg",
    feature: "/select-ladies-mask.jpg",
    featureAlt: "A woman in an emerald gown holding a black and gold masquerade mask",
    numbers: [["20", "Women"], ["20", "Men"], ["30+", "Ages"], ["1", "Night"], ["0", "Cameras"]],
    nightKicker: "Your evening",
    nightTitle: "How the night unfolds",
    night: NIGHT_WOMEN,
    answersKicker: "Built for you",
    answersTitle: "Twenty seats for women who know their worth.",
    answers: LADIES,
    featureKicker: "No unwanted follow-up",
    featureTitle: "Your information stays yours.",
    featureText:
      "At the end of the night you privately choose who you'd like to see again. Only mutual matches are revealed, the next morning. Your contact information is never shared unless you both choose each other.",
    close: "Come as you are. Leave knowing you were seen.",
    other: { to: "/select/gentlemen", label: "Looking for the gentlemen's page?" },
  },
};

const SelectAudience = ({ gender }) => {
  const p = PAGES[gender];
  const [params] = useSearchParams();
  const status = useSelectStatus();
  const open = status.state === "open";
  const left = daysLeft(status.closesAt);
  const src = params.get("src") || `${p.slug}-page`;

  const doors = (
    <>
      {status.state === "loading" ? (
        <div className="select-hero-placeholder" aria-hidden="true" />
      ) : open ? (
        <>
          <p className="select-doors select-doors-open">
            The doors are open
            {left !== null && (
              <> · <strong>{left === 0 ? "closing today" : `${left} ${left === 1 ? "day" : "days"} left`}</strong></>
            )}
          </p>
          <Link to={`/select/invitation?open=1&g=${gender}&src=${encodeURIComponent(src)}`} className="select-btn">
            Request Your Seat
          </Link>
        </>
      ) : (
        <>
          <p className="select-doors">
            {status.state === "closed"
              ? "The doors are closed for this round. Be the first to know when they open again."
              : status.opensAt
                ? <>The doors open <strong>{fmtDoorDate(status.opensAt)}</strong>, for two weeks only.</>
                : "The doors open soon, for two weeks only. Be the first to know."}
          </p>
          <SelectNotify compact gender={gender} source={src} />
        </>
      )}
    </>
  );

  return (
    <div className={`select-page select-aud select-aud-${p.slug}`}>
      <Helmet>
        <title>{p.title}</title>
        <meta name="description" content={p.description} />
        <link rel="canonical" href={`https://www.grownfolkscollective.com/select/${p.slug}`} />
        <meta property="og:title" content={p.title} />
        <meta property="og:description" content={p.description} />
        <meta property="og:image" content={`https://www.grownfolkscollective.com${p.hero}`} />
      </Helmet>

      <SelectTopbar back={{ to: "/select", label: "GFC Select™" }} />

      {/* HERO */}
      <section className="select-aud-hero" aria-labelledby="aud-title">
        <div className="select-aud-photo" style={{ backgroundImage: `url('${p.hero}')` }} aria-hidden="true" />
        <div className="select-aud-shade" aria-hidden="true" />
        <div className="select-aud-inner">
          <p className="select-eyebrow">{p.kicker}</p>
          <h1 id="aud-title" className="select-aud-title">
            {p.headline.map((line) => <span key={line}>{line}</span>)}
          </h1>
          <p className="select-aud-lead">{p.lead}</p>
          <ul className="select-aud-numbers" aria-label="The room">
            {p.numbers.map(([n, label]) => (
              <li key={label}><strong>{n}</strong><span>{label}</span></li>
            ))}
          </ul>
          <div className="select-aud-doors">{doors}</div>
        </div>
      </section>

      {/* THE NIGHT */}
      <section className="select-section" aria-labelledby="aud-night">
        <p className="select-kicker">{p.nightKicker}</p>
        <h2 id="aud-night" className="select-h2">{p.nightTitle}</h2>
        <ol className="select-aud-night">
          {p.night.map((s) => (
            <li key={s.n}>
              <span className="select-aud-night-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FEATURE: photo + privacy promise */}
      <section className="select-section select-aud-feature" aria-labelledby="aud-feature">
        <figure className="select-aud-feature-photo">
          <img src={p.feature} alt={p.featureAlt} loading="lazy" />
        </figure>
        <div className="select-aud-feature-text">
          <p className="select-kicker">{p.featureKicker}</p>
          <h2 id="aud-feature" className="select-h2">{p.featureTitle}</h2>
          <p className="select-body">{p.featureText}</p>
        </div>
      </section>

      {/* ANSWERS */}
      <section className="select-section" aria-labelledby="aud-answers">
        <p className="select-kicker">{p.answersKicker}</p>
        <h2 id="aud-answers" className="select-h2">{p.answersTitle}</h2>
        <ul className="select-gents-grid">
          {p.answers.map((g) => (
            <li key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CLOSE */}
      <section className="select-section select-aud-close" aria-labelledby="aud-close">
        <h2 id="aud-close" className="select-gents-close">{p.close}</h2>
        <div className="select-aud-close-doors">{doors}</div>
        <p className="select-gents-note">
          <Link to={`/select/invitation?g=${gender}`} className="select-peek">Read the full invitation →</Link>
        </p>
        <p className="select-gents-note">
          {gender === "woman" ? "Know a good man who belongs in the room?" : "Know a great woman who deserves this room?"}{" "}
          <Link to={`/select/nominate?g=${gender === "woman" ? "man" : "woman"}`} className="select-peek">
            {gender === "woman" ? "Nominate him →" : "Nominate her →"}
          </Link>
        </p>
        <p className="select-aud-other"><Link to={p.other.to}>{p.other.label}</Link></p>
      </section>

      <SelectFooter />
    </div>
  );
};

export default SelectAudience;

import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LEGAL, LEGAL_PAGES, LEGAL_FOOTER_LINKS } from "../content/legalContent.js";
import "../Styles/Legal.css";

// Turns email addresses in the text into clickable links
const withEmailLinks = (text) =>
  String(text)
    .split(/([\w.+-]+@[\w-]+\.[\w.]+)/g)
    .map((part, i) =>
      /@/.test(part) ? <a key={i} href={`mailto:${part}`}>{part}</a> : part
    );

// One page component for all legal pages: <Legal page="privacy" />
const Legal = ({ page }) => {
  const content = LEGAL_PAGES[page];
  if (!content) return null;

  return (
    <div className="legal-page">
      <Helmet>
        <title>{`${content.title} | Grown Folks™ Collective`}</title>
        <meta name="description" content={content.description} />
      </Helmet>

      <header className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-eyebrow">Grown Folks™ Collective</p>
          <h1 className="playfair">{content.title}</h1>
          <p className="legal-updated">Effective {LEGAL.effectiveDate}</p>
        </div>
      </header>

      <div className="legal-body">
        <p className="legal-intro">{withEmailLinks(content.intro)}</p>

        {content.sections.map((section) => (
          <section key={section.h} className="legal-section">
            <h2 className="playfair">{section.h}</h2>
            {(section.p || []).map((para, i) => (
              <p key={i}>{withEmailLinks(para)}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, i) => (
                  <li key={i}>{withEmailLinks(item)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <nav className="legal-nav" aria-label="More policies">
          <h2 className="legal-nav-title">More policies</h2>
          <ul>
            {LEGAL_FOOTER_LINKS.filter((l) => l.key !== page).map((l) => (
              <li key={l.key}>
                <Link to={LEGAL_PAGES[l.key].path}>{LEGAL_PAGES[l.key].title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Legal;

import React, { useState, useEffect } from 'react';
import '../Styles/Footer.css';

const SOCIALS = [
  {
    label: 'Instagram',
    url: 'https://instagram.com/grownfolkscollective',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    url: 'https://tiktok.com/@grownfolkscollective',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    url: 'https://facebook.com/grownfolkscollectiveatl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Threads',
    url: 'https://threads.net/@grownfolkscollective',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.027-3.579.877-6.43 2.528-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.594 12c.022 3.086.713 5.496 2.051 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.583-1.3-.881-2.347-.887H12c-.912 0-1.708.283-2.27.801-.386.354-.623.818-.696 1.38l-2.02-.283c.148-1.048.6-1.97 1.328-2.683C9.394 7.57 10.62 7.002 12 7.002h.026c1.527.007 2.793.454 3.765 1.33 1.046.941 1.62 2.31 1.708 4.073.017.344.02.693.007 1.042.462.37.875.794 1.22 1.266 1.02 1.384 1.263 3.318.668 5.01C18.687 21.979 16.35 24 12.186 24zm.28-9.217c-.148 0-.295.005-.44.013-1.017.057-1.818.332-2.315.797-.43.4-.647.919-.618 1.464.056 1.023.97 1.682 2.332 1.607 1.133-.062 1.975-.468 2.502-1.206.41-.571.633-1.38.665-2.397a11.68 11.68 0 0 0-2.126-.278z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    url: 'https://www.youtube.com/@grownfolkscollective',
    icon: (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    url: 'https://linkedin.com/company/grownfolkscollective',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="gfc-footer">

      {/* Back to top */}
      <button
        className={`footer-back-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* Gold top rule */}
      <div className="footer-rule"></div>

      <div className="footer-inner">

        {/* Tagline */}
        <div className="footer-tagline-block">
          <div className="footer-wordmark">GFC</div>
          <p className="footer-tagline">
            Ending the social isolation epidemic —<br />
            one event at a time.
          </p>
          <p className="footer-location">
            Decatur, GA &nbsp;·&nbsp; Serving Metro Atlanta
          </p>
        </div>

        {/* Contact */}
        <div className="footer-contact-block">
          <div className="footer-block-label">Get In Touch</div>
          <a href="mailto:hello@grownfolkscollective.com" className="footer-contact-link">
            hello@grownfolkscollective.com
          </a>
          <a href="tel:+14045550000" className="footer-contact-link">
            (270) 380-8896
          </a>
        </div>

        {/* Social */}
        <div className="footer-social-block">
          <div className="footer-block-label">Follow the Collective</div>
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} Grown Folks Collective. All rights reserved.
        </span>
        <span className="footer-bottom-right">
          Built with intention. Powered by community.
        </span>
      </div>

    </footer>
  );
};

export default Footer;
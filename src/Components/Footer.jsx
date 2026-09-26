// One social icon link
import React, { useState, useEffect } from 'react';
import '../Styles/Footer.css';
import FooterSignupSection from './FooterSignup';

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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V3c1 3 3 5 6 5" />
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    url: 'https://www.youtube.com/@grownfolkscollective',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" />
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
const SocialLink = ({ social }) => {
  const linkProps = {
    href: social.url,
    target: '_blank',
    rel: 'noreferrer',
    className: 'footer-social-icon',
    'aria-label': social.label,
    title: social.label,
  };
  return <a {...linkProps}>{social.icon}</a>;
};

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
        className={showBackToTop ? 'footer-back-top visible' : 'footer-back-top'}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* Gold top rule */}
      <div className="footer-rule"></div>

      {/* Newsletter signup */}
      <FooterSignupSection />

      <div className="footer-inner">

        {/* Tagline */}
        <div className="footer-tagline-block">
          <div className="footer-wordmark">GFC</div>
          <p className="footer-tagline">
            Ending the social isolation epidemic —<br />
            one event at a time.
          </p>
          <p className="footer-location">
            Serving Metro Atlanta
          </p>
        </div>

        {/* Contact */}
        <div className="footer-contact-block">
          <div className="footer-block-label">Get In Touch</div>
          <a href="mailto:hello@grownfolkscollective.com" className="footer-contact-link">
            hello@grownfolkscollective.com
          </a>
          <a href="tel:+12703808896" className="footer-contact-link">
            (270) 380-8896
          </a>
                    <a href="/celebrate" className="footer-contact-link">
            Group &amp; Birthday Bookings
          </a>
        </div>

        {/* Social */}
        <div className="footer-social-block">
          <div className="footer-block-label">Follow the Collective</div>
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <SocialLink key={s.label} social={s} />
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
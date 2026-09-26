// One social icon link
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
            Decatur, GA &nbsp;·&nbsp; Serving Metro Atlanta
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
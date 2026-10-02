import React from "react";
import { Link } from "react-router-dom";

// Quiet header + footer used only on GFC Select™ pages
// (the site's regular navbar, newsletter signup and footer are hidden there).

export const SelectTopbar = ({ back }) => (
  <header className="select-topbar">
    <Link to="/" className="select-topbar-mark" aria-label="Grown Folks Collective home">
      Grown Folks<span aria-hidden="true">™</span> Collective
    </Link>
    {back && (
      <Link to={back.to} className="select-topbar-back">
        {back.label}
      </Link>
    )}
  </header>
);

export const SelectFooter = () => (
  <footer className="select-foot">
    <p className="select-foot-mark">GFC Select<span aria-hidden="true">™</span></p>
    <nav aria-label="Legal">
      <Link to="/privacy">Privacy</Link>
      <Link to="/terms">Terms</Link>
      <Link to="/code-of-conduct">Code of Conduct</Link>
    </nav>
    <p className="select-foot-copy">
      &copy; {new Date().getFullYear()} Grown Folks™ Collective. All rights reserved.
    </p>
  </footer>
);

import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import loginService from "../Services/loginService";
import "../Styles/Navbar.css";
import logo from "../assets/gfc-logo-nav.png";
import { passesLive } from "../Services/shopApi";
import { PERFORM_PAGES } from "./PerformLinks.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const user = loginService.getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Safe first name — won't crash if the name is missing
  const firstName = (user?.name || "").trim().split(" ")[0] || "Account";

  const isAdmin = user?.role === "admin";
  const isMember = user?.role === "member";

  const handleLogout = () => {
    localStorage.removeItem("gfc_user");
    localStorage.removeItem("gfc_token");
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  // While the menu is open on a phone, lock the page behind it so swipes scroll the menu
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  const navClass = ({ isActive }) =>
    isActive ? "btn active" : "btn";

  return (
    <nav className="gfc-navbar">

      {/* LOGO */}
      <div className="nav-left">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} className="nav-logo" alt="Grown Folks Collective home" />
        </Link>
      </div>

      {/* NAV LINKS */}
      <ul className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
        <li><NavLink to="/" end className={navClass} onClick={closeMenu}>Home</NavLink></li>
        <li className="nav-dropdown">
          <NavLink to="/events" className={navClass} onClick={closeMenu} aria-haspopup="true">
            Events <span className="nav-caret" aria-hidden="true">▾</span>
          </NavLink>
          <ul className="nav-submenu" aria-label="Events">
            <li><NavLink to="/events" end className="nav-sublink" onClick={closeMenu}>Upcoming Events</NavLink></li>
            <li><NavLink to="/recess" className="nav-sublink" onClick={closeMenu}>Recess Talks</NavLink></li>
            <li><NavLink to="/select" className="nav-sublink" onClick={closeMenu}>GFC Select™</NavLink></li>
            <li><NavLink to="/gift" className="nav-sublink" onClick={closeMenu}>{passesLive() ? 'Holiday Pass & Gift Cards' : 'Gift Cards'}</NavLink></li>
            <li><NavLink to="/shop" className="nav-sublink" onClick={closeMenu}>Shop</NavLink></li>
          </ul>
        </li>
        <li><NavLink to="/blog" className={navClass} onClick={closeMenu}>Blog</NavLink></li>
        {/* <li><NavLink to="/travel" className={navClass} onClick={closeMenu}>Travel</NavLink></li> */}
        {/* <li><NavLink to="/ic-dinners" className={navClass} onClick={closeMenu}>IC Dinners</NavLink></li>*/}
        <li><NavLink to="/membership" className={navClass} onClick={closeMenu}>Membership</NavLink></li>
        <li className="nav-dropdown">
          <NavLink to="/partnerships" className={navClass} onClick={closeMenu} aria-haspopup="true">
            Partnerships <span className="nav-caret" aria-hidden="true">▾</span>
          </NavLink>
          <ul className="nav-submenu" aria-label="Partnerships">
            <li><NavLink to="/partnerships" end className="nav-sublink" onClick={closeMenu}>Sponsor an Event</NavLink></li>
            <li><NavLink to="/partnerships/perks" className="nav-sublink" onClick={closeMenu}>Offer a Member Perk</NavLink></li>
          </ul>
        </li>
        <li className="nav-dropdown">
          <NavLink to="/perform" className={navClass} onClick={closeMenu} aria-haspopup="true">
            Perform <span className="nav-caret" aria-hidden="true">▾</span>
          </NavLink>
          <ul className="nav-submenu" aria-label="Perform">
            {PERFORM_PAGES.map((p) => (
              <li key={p.to}><NavLink to={p.to} end className="nav-sublink" onClick={closeMenu}>{p.label}</NavLink></li>
            ))}
            <li><NavLink to="/on-our-stage" className="nav-sublink" onClick={closeMenu}>On Our Stage</NavLink></li>
          </ul>
        </li>
        <li className="nav-dropdown">
          <NavLink to="/about" className={navClass} onClick={closeMenu} aria-haspopup="true">
            About <span className="nav-caret" aria-hidden="true">▾</span>
          </NavLink>
          <ul className="nav-submenu" aria-label="About">
            <li><NavLink to="/about" end className="nav-sublink" onClick={closeMenu}>About Us</NavLink></li>
            <li><NavLink to="/contact" className="nav-sublink" onClick={closeMenu}>Contact Us</NavLink></li>
          </ul>
        </li>


        {/* Mobile-only auth */}
        {!user && (
          <li className="nav-mobile-auth">
            <Link to="/login" className="nav-dashboard-btn" onClick={closeMenu}>
              Member Login
            </Link>
          </li>
        )}
        {user && (
          <li className="nav-mobile-auth">
            {isAdmin && (
              <Link to="/admin/dashboard" className="nav-dashboard-btn" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
            {isMember && (
              <Link to="/member/dashboard" className="nav-dashboard-btn" onClick={closeMenu}>
                My Membership
              </Link>
            )}
            <button
              onClick={() => { handleLogout(); closeMenu(); }}
              className="logout-btn-styled"
            >
              Logout ({firstName})
            </button>
          </li>
        )}
      </ul>

      {/* Desktop auth */}
      {!user && (
        <div className="nav-right-section">
          <Link to="/login" className="nav-login-link">Log in</Link>
        </div>
      )}
      {user && (
        <div className="nav-right-section nav-right-auth">
          {isAdmin && (
            <Link to="/admin/dashboard" className="nav-dashboard-btn">
              Dashboard
            </Link>
          )}
          {isMember && (
            <Link to="/member/dashboard" className="nav-dashboard-btn">
              My Membership
            </Link>
          )}
          <button onClick={handleLogout} className="logout-btn-styled">
            LOGOUT ({firstName})
          </button>
        </div>
      )}

      {/* Hamburger */}
      <button
        className={`nav-hamburger ${menuOpen ? "nav-hamburger-open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </nav>
  );
};

export default Navbar;
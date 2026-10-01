import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import loginService from "../Services/loginService";
import "../Styles/Navbar.css";
import logo from "../assets/gfc-logo-nav.png";

const Navbar = () => {
  const navigate = useNavigate();
  const user = loginService.getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Safe first name — won't crash if the name is missing
  const firstName = (user?.name || "").trim().split(" ")[0] || "Account";

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    loginService.logout();
    navigate("/"); // there's no /login page, so send them home
  };

  const closeMenu = () => setMenuOpen(false);

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
        <li><NavLink to="/events" className={navClass} onClick={closeMenu}>Events</NavLink></li>
        <li><NavLink to="/blog" className={navClass} onClick={closeMenu}>Blog</NavLink></li>
        {/* <li><NavLink to="/travel" className={navClass} onClick={closeMenu}>Travel</NavLink></li> */}
        {/* <li><NavLink to="/ic-dinners" className={navClass} onClick={closeMenu}>IC Dinners</NavLink></li>*/}
        <li><NavLink to="/membership" className={navClass} onClick={closeMenu}>Membership</NavLink></li>
        <li><NavLink to="/partnerships" className={navClass} onClick={closeMenu}>Partnerships</NavLink></li>
        <li><NavLink to="/about" className={navClass} onClick={closeMenu}>About Us</NavLink></li>
        <li><NavLink to="/contact" className={navClass} onClick={closeMenu}>Contact Us</NavLink></li>


        {/* Mobile-only auth */}
        {user && (
          <li className="nav-mobile-auth">
            {isAdmin && (
              <Link to="/admin/dashboard" className="nav-dashboard-btn" onClick={closeMenu}>
                Dashboard
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
      {user && (
        <div className="nav-right-section">
          {isAdmin && (
            <Link to="/admin/dashboard" className="nav-dashboard-btn">
              Dashboard
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
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import loginService from "../Services/loginService";
import "../Styles/Navbar.css";
import logo from "../assets/gfcLogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const user = loginService.getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    loginService.logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const navClass = ({ isActive }) =>
    isActive ? "btn active" : "btn";

  return (
    <nav className="gfc-navbar">

      {/* LOGO */}
      <div className="nav-left">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} className="nav-logo" alt="GFC logo" />
        </Link>
      </div>

      {/* NAV LINKS — reordered */}
      <ul className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
        <li><NavLink to="/" end className={navClass} onClick={closeMenu}>Home</NavLink></li>
        <li><NavLink to="/events" className={navClass} onClick={closeMenu}>Events</NavLink></li>
        {/* <li><NavLink to="/travel" className={navClass} onClick={closeMenu}>Travel</NavLink></li> */}
        {/* <li><NavLink to="/ic-dinners" className={navClass} onClick={closeMenu}>IC Dinners</NavLink></li>
        <li><NavLink to="/membership" className={navClass} onClick={closeMenu}>Membership</NavLink></li> */}
        <li><NavLink to="/partnerships" className={navClass} onClick={closeMenu}>Partnerships</NavLink></li>
        <li><NavLink to="/about" className={navClass} onClick={closeMenu}>About Us</NavLink></li>
        <li><NavLink to="/contact" className={navClass} onClick={closeMenu}>Contact Us</NavLink></li>

        {/* {user && user.role === "admin" && (
          <li>
            <NavLink to="/admin/dashboard" className={navClass} onClick={closeMenu}>
              Admin
            </NavLink>
          </li>
        )} */}

        {/* Mobile-only auth */}
        <li className="nav-mobile-auth">
          {user ? (
            <button
              onClick={() => { handleLogout(); closeMenu(); }}
              className="logout-btn-styled"
            >
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <NavLink to="/login" className={navClass} onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </li>
      </ul>

      {/* Desktop auth
      <div className="nav-right-section">
        {user ? (
          <button onClick={handleLogout} className="logout-btn-styled">
            LOGOUT ({user.name.split(" ")[0]})
          </button>
        ) : (
          <NavLink to="/login" className={navClass}>Login</NavLink>
        )}
      </div> */}

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